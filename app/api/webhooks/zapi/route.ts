import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { enviarConfirmacaoAgendamento, sendTextMessage, sendImageMessage } from "@/lib/zapi"

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

                // 2. Tentar enviar imagem do card se existir
                try {
                    // Buscar studio_id do agendamento
                    const { data: agendamento } = await supabase
                        .from("agendamentos")
                        .select("studio_id")
                        .eq("id", agendamentoId)
                        .single()

                    if (agendamento) {
                        const { data: studio } = await supabase
                            .from("studios")
                            .select("card_url")
                            .eq("id", agendamento.studio_id)
                            .single()

                        if (studio?.card_url) {
                            await sendImageMessage({
                                phone,
                                image: studio.card_url,
                                caption: "✨ Aqui está seu cartão de confirmação!"
                            })
                        }
                    }
                } catch (err) {
                    console.error("Erro ao enviar card:", err)
                }

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

        // Logica de Resposta de Texto (Cliente confirmando leitura)
        // Se a mensagem não for de botão e for de texto
        if (message?.text?.message || message?.messageType === "text") {
            const phone = message.phone
            if (!phone) return NextResponse.json({ status: "ignored_no_phone" })

            // Verificar se cliente tem agendamento recente CONFIRMADO (últimas 24h)
            // e se ainda não recebeu o card (opcional, pode ser complexo controlar o estado "card_entregue")
            // Simplificação: Se tiver agendamento futuro confirmado, manda o card.

            // Buscar agendamento futuro confirmado deste telefone
            const { data: agendamentos } = await supabase
                .from("agendamentos")
                .select("id, studio_id, data")
                .eq("telefone", phone) // Telefone do cliente
                .eq("status", "confirmado")
                .gte("data", new Date().toISOString().split('T')[0]) // Agendamentos hoje ou futuro
                .order("created_at", { ascending: false })
                .limit(1)

            if (agendamentos && agendamentos.length > 0) {
                const agendamento = agendamentos[0]

                // Buscar card do estúdio
                const { data: studio } = await supabase
                    .from("studios")
                    .select("card_url")
                    .eq("id", agendamento.studio_id)
                    .single()

                if (studio?.card_url) {
                    // Enviar Card
                    console.log(`Enviando card para ${phone} referente ao agendamento ${agendamento.id}`)
                    await sendImageMessage({
                        phone,
                        image: studio.card_url,
                        caption: "✨ Obrigado por confirmar! Aqui está seu cartão de acesso com todas as informações."
                    })
                    return NextResponse.json({ status: "card_sent" })
                }
            }
        }

        return NextResponse.json({ status: "ignored" })

    } catch (error) {
        console.error("Erro no webhook:", error)
        return NextResponse.json({ status: "error" }, { status: 500 })
    }
}
