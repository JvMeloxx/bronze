
import { createClient } from "@/lib/supabase"
import { addDays, format, isSameDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AvailabilityResult {
    date: string
    slots: {
        time: string
        available: number
    }[]
}

export async function getAvailabilityForRange(
    studioId: string,
    startDate: Date,
    endDate: Date
): Promise<AvailabilityResult[]> {
    const supabase = createClient()

    // 1. Fetch Studio Settings (Hours)
    const { data: studio, error: studioError } = await supabase
        .from("studios")
        .select("horarios_funcionamento")
        .eq("id", studioId)
        .single()

    if (studioError || !studio) {
        console.error("Error fetching studio:", studioError)
        return []
    }

    // 2. Fetch Active Services (to determine Max Capacity)
    const { data: servicos, error: servicosError } = await supabase
        .from("servicos")
        .select("capacidade")
        .eq("studio_id", studioId)
        .eq("ativo", true)

    if (servicosError) {
        console.error("Error fetching services:", servicosError)
        return []
    }

    // Determine max capacity of the studio (highest capacity among usage)
    // Default to 1 if no services found
    const maxCapacity = servicos?.reduce((max: number, s: any) => Math.max(max, s.capacidade || 1), 0) || 1

    // 3. Fetch Bookings in Range
    const startStr = format(startDate, "yyyy-MM-dd")
    const endStr = format(endDate, "yyyy-MM-dd")

    const { data: bookings, error: bookingsError } = await supabase
        .from("agendamentos")
        .select("data, horario")
        .eq("studio_id", studioId)
        .gte("data", startStr)
        .lte("data", endStr)
        .neq("status", "cancelado")

    if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError)
        return []
    }

    // 4. Process Each Day
    const results: AvailabilityResult[] = []
    const mapDays = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]

    let current = startDate
    while (current <= endDate) {
        const dateStr = format(current, "yyyy-MM-dd")
        const weekDay = mapDays[current.getDay()]

        // Get slots for this day of week
        let slotsForDay: string[] = []

        // Handle different formats of horarios_funcionamento
        // It can be an array ["08:00", "09:00"] (legacy) or object { "segunda": [...], "terca": [...], ... }
        const horarios = studio.horarios_funcionamento

        if (Array.isArray(horarios)) {
            // Legacy format: same hours every day? Or maybe invalid. 
            // Usually legacy was just list of strings. Let's assume valid.
            slotsForDay = horarios
        } else if (typeof horarios === 'object' && horarios !== null) {
            // Object format
            // @ts-ignore
            slotsForDay = (horarios as Record<string, string[]>)[weekDay] || []
        }

        if (slotsForDay.length > 0) {
            // Calculate availability for each slot
            const daySlots = slotsForDay.map(time => {
                // Count bookings for this date and time
                const count = bookings?.filter((b: any) => b.data === dateStr && b.horario === time).length || 0
                const available = Math.max(0, maxCapacity - count)

                return { time, available }
            }).filter((s: { available: number }) => s.available > 0) // Only return available slots

            if (daySlots.length > 0) {
                results.push({
                    date: dateStr,
                    slots: daySlots
                })
            }
        }

        current = addDays(current, 1)
    }

    return results
}
