
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
    endDate: Date,
    category?: "natural" | "artificial" | "all" // Novo parâmetro opcional
): Promise<AvailabilityResult[]> {
    const supabase = createClient()

    // 1. Fetch Studio Settings (Hours & Capacity)
    const { data: studio, error: studioError } = await supabase
        .from("studios")
        .select("horarios_funcionamento, capacidade_natural, capacidade_artificial")
        .eq("id", studioId)
        .single()

    if (studioError || !studio) {
        console.error("Error fetching studio:", studioError)
        return []
    }

    const capNatural = studio.capacidade_natural || 10
    const capArtificial = studio.capacidade_artificial || 5

    // 2. Fetch Active Services (to determine categories)
    const { data: servicos, error: servicosError } = await supabase
        .from("servicos")
        .select("id, capacidade, categoria")
        .eq("studio_id", studioId)
        .eq("ativo", true)

    if (servicosError) {
        console.error("Error fetching services:", servicosError)
        return []
    }

    // Map service ID to category
    // @ts-ignore
    const serviceMap = new Map<string, "natural" | "artificial">(
        // @ts-ignore
        servicos?.map(s => [s.id, s.categoria])
    )

    // 3. Fetch Bookings in Range
    const startStr = format(startDate, "yyyy-MM-dd")
    const endStr = format(endDate, "yyyy-MM-dd")

    const { data: bookings, error: bookingsError } = await supabase
        .from("agendamentos")
        .select("data, horario, servico_id")
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
        const horarios = studio.horarios_funcionamento

        if (Array.isArray(horarios)) {
            slotsForDay = horarios
        } else if (typeof horarios === 'object' && horarios !== null) {
            // @ts-ignore
            slotsForDay = (horarios as Record<string, string[]>)[weekDay] || []
        }

        if (slotsForDay.length > 0) {
            // Calculate availability for each slot
            const daySlots = slotsForDay.map(time => {
                // Bookings for this slot
                // @ts-ignore
                const slotBookings = bookings?.filter(b => b.data === dateStr && b.horario === time) || []

                // Count usage by category
                let usedNatural = 0
                let usedArtificial = 0

                slotBookings.forEach((b: any) => {
                    const cat = serviceMap.get(b.servico_id)
                    // Se não tiver categoria, assume natural
                    if (cat === 'artificial') usedArtificial++
                    else usedNatural++
                })

                const availNatural = Math.max(0, capNatural - usedNatural)
                const availArtificial = Math.max(0, capArtificial - usedArtificial)

                // Determine Total Available based on Filter
                let available = 0

                if (category === 'natural') {
                    available = availNatural
                } else if (category === 'artificial') {
                    available = availArtificial
                } else {
                    // "all" ou undefined -> Soma os dois (Comportamento original)
                    available = availNatural + availArtificial
                }

                return { time, available }
            }).filter(s => s.available > 0)

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
