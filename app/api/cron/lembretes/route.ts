import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { enviarLembretePreSessao } from "@/lib/zapi"

// Usar chave de serviço para bypass de RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
    // Verificar token de segurança (opcional, mas recomendado)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    try {
        // Calcular data de amanhã
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split("T")[0] // YYYY-MM-DD

        // Buscar agendamentos de amanhã que estão confirmados ou pendentes
        // Buscar agendamentos de amanhã que estão confirmados ou pendentes
        const { data: agendamentos, error } = await supabaseAdmin
            .from("agendamentos")
            .select(`
                id,
                cliente_nome,
                telefone,
                horario,
                servico_nome,
                status,
                studio_id,
                studios (
                    notifications_enabled,
                    telefone
                )
            `)
            .eq("data", tomorrowStr)
            .in("status", ["pendente", "confirmado"])

        if (error) {
            console.error("Erro ao buscar agendamentos:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!agendamentos || agendamentos.length === 0) {
            return NextResponse.json({
                success: true,
                message: "Nenhum agendamento para amanhã",
                date: tomorrowStr
            })
        }

        // Enviar lembretes
        const results = []
        for (const agendamento of agendamentos) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const studioData = agendamento.studios as any
            const notificationsEnabled = studioData?.notifications_enabled ?? false
            const studioTelefone = studioData?.telefone || "(61) 98402-9860" // Fallback para número padrão se não tiver

            // Só enviar se notificações estiverem habilitadas e tiver telefone
            if (notificationsEnabled && agendamento.telefone) {
                try {
                    const result = await enviarLembretePreSessao(
                        agendamento.telefone,
                        agendamento.cliente_nome,
                        agendamento.horario,
                        studioTelefone
                    )
                    results.push({
                        id: agendamento.id,
                        cliente: agendamento.cliente_nome,
                        success: result.success,
                        error: result.error
                    })
                } catch (err) {
                    results.push({
                        id: agendamento.id,
                        cliente: agendamento.cliente_nome,
                        success: false,
                        error: String(err)
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            date: tomorrowStr,
            totalAgendamentos: agendamentos.length,
            lembretesSent: results.filter(r => r.success).length,
            results
        })

    } catch (error) {
        console.error("Erro no cron de lembretes:", error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
