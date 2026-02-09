import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { enviarConfirmacaoAgendamento, sendTextMessage } from "@/lib/zapi"

// Segredo para validar se necessário (opcional por enquanto)
// const WEBHOOK_SECRET = process.env.ZAPI_WEBHOOK_SECRET

export async function POST(request: Request) {
    try {
        const payload = await request.json()

        // Usar cliente admin para poder editar qualquer agendamento (bypass RLS)
        const supabase = createAdminClient()

        console.log("Webhook Z-API received:", JSON.stringify(payload, null, 2))

        // Verifica se é uma resposta de botão
        // A estrutura pode variar, mas geralmente vem em 'messages'
        // Z-API envia events.

        // Estrutura comum Z-API para resposta de botão:
        // payload.type === "message"
        // payload.messageType === "buttonReplyMessage"
        // payload.buttonReply.id === "ID_DO_BOTAO"

        const message = payload

        if (message?.messageType === "buttonReplyMessage" || message?.type === "button-reply") {
            const buttonId = message.buttonReply?.id || message.buttonReply?.selectedId

            if (!buttonId) return NextResponse.json({ status: "ignored" })

            console.log("Botão clicado:", buttonId)

            // Extrair ID do agendamento
            // Formato: confirm_payment_UUID ou deny_payment_UUID

            let agendamentoId = ""
            let action = ""

            if (buttonId.startsWith("confirm_payment_")) {
                agendamentoId = buttonId.replace("confirm_payment_", "")
                action = "confirm"
            } else if (buttonId.startsWith("deny_payment_")) {
                agendamentoId = buttonId.replace("deny_payment_", "")
                action = "deny"
            } else {
                return NextResponse.json({ status: "ignored_unknown_button" })
            }

            if (!agendamentoId) return NextResponse.json({ status: "error_no_id" })

            const phone = message.phone // Quem clicou (Dona)

            if (action === "confirm") {
                // 1. Atualizar no banco
                const { error } = await supabase
                    .from("agendamentos")
                    .update({ status: "confirmado" })
                    .eq("id", agendamentoId)

                if (error) {
                    console.error("Erro ao atualizar agendamento:", error)
                    await sendTextMessage({ phone, message: "❌ Erro ao confirmar agendamento no sistema." })
                    return NextResponse.json({ status: "error_db" })
                }

                // 2. Feedback para Dona
                // await enviarTextMessage(phone, "✅ Pagamento confirmado e agendamento atualizado!") 
                // (Opcional, Z-API as vezes já mostra o clique)

            } else if (action === "deny") {
                // Opcional: Cancelar ou apenas marcar como pendente c/ obs?
                // Vamos manter simples: Cancelar
                const { error } = await supabase
                    .from("agendamentos")
                    .update({ status: "cancelado" })
                    .eq("id", agendamentoId)

                if (error) {
                    console.error("Erro ao cancelar agendamento:", error)
                    return NextResponse.json({ status: "error_db" })
                }

                // await enviarTextMessage(phone, "❌ Agendamento marcado como não pago/cancelado.")
            }

            return NextResponse.json({ status: "success", action })
        }

        return NextResponse.json({ status: "ignored" })

    } catch (error) {
        console.error("Erro no webhook:", error)
        return NextResponse.json({ status: "error" }, { status: 500 })
    }
}
