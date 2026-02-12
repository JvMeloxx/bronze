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

            const messageText = (message.text?.message || message.body || "").toLowerCase()

            // Palavras-chave para confirmação
            const confirmKeywords = ["sim", "confirm", "confirmo", "ok", "pode", "estarei"]
            const isConfirmation = confirmKeywords.some(keyword => messageText.includes(keyword))

            // Lógica de Matching Robusta:
            // O Z-API manda ex: 5561992415188
            // O Banco pode ter: (61) 99241-5188
            // Vamos buscar pelos últimos 8 dígitos para garantir
            const cleanPhone = phone.replace(/\D/g, "")
            const last8 = cleanPhone.slice(-8)

            // 1. Se for confirmação, buscar agendamentos PENDENTES para confirmar
            if (isConfirmation) {
                const { data: agendamentosPendentes } = await supabase
                    .from("agendamentos")
                    .select("id, studio_id")
                    .eq("status", "pendente")
                    .gte("data", new Date().toISOString().split('T')[0]) // Agendamentos hoje ou futuro
                    .ilike("telefone", `%${last8}`) // Busca pelos últimos 8 dígitos (flexível)
                    .order("data", { ascending: true }) // O mais próximo primeiro
                    .limit(1)

                if (agendamentosPendentes && agendamentosPendentes.length > 0) {
                    const agendamento = agendamentosPendentes[0]

                    // Atualizar para CONFIRMADO
                    await supabase
                        .from("agendamentos")
                        .update({ status: "confirmado" })
                        .eq("id", agendamento.id)

                    console.log(`Agendamento ${agendamento.id} confirmado via texto por ${phone}`)

                    // Buscar card para enviar
                    const { data: studio } = await supabase
                        .from("studios")
                        .select("card_url")
                        .eq("id", agendamento.studio_id)
                        .single()

                    if (studio?.card_url) {
                        await sendImageMessage({
                            phone,
                            image: studio.card_url,
                            caption: "✨ Agendamento confirmado! Aqui está seu cartão de acesso."
                        })
                        return NextResponse.json({ status: "confirmed_and_card_sent" })
                    }

                    await sendTextMessage({ phone, message: "✅ Agendamento confirmado com sucesso!" })
                    return NextResponse.json({ status: "confirmed" })
                }
            }

            // 2. Se não confirmou pendente, verifica se cliente tem agendamento JÁ CONFIRMADO (para reenvio de card ou info)
            // Útil caso a pessoa pergunte algo e já tenha confirmado antes
            const { data: agendamentosConfirmados } = await supabase
                .from("agendamentos")
                .select("id, studio_id, data, telefone")
                .eq("status", "confirmado")
                .gte("data", new Date().toISOString().split('T')[0])
                .ilike("telefone", `%${last8}`)
                .order("created_at", { ascending: false })
                .limit(1)

            if (agendamentosConfirmados && agendamentosConfirmados.length > 0) {
                // Lógica opcional: Se a pessoa mandar "Card" ou algo assim, reenvia. 
                // Por enquanto, não vamos reenviar sempre para não ficar chato, a menos que seja explicitamente pedido ou na primeira confirmação.
                // O código original reenviava o card. Vamos manter apenas se não tiver enviado recentemente (difícil saber sem log)
                // VAMOS MANTER O COMPORTAMENTO ORIGINAL APENAS SE A MENSAGEM CONTIVER 'CARD' ou 'ENDEREÇO' ou 'LOCAL'
                const infoKeywords = ["card", "cartão", "endereço", "local", "confirmado"]
                if (infoKeywords.some(k => messageText.includes(k))) {
                    const agendamento = agendamentosConfirmados[0]
                    const { data: studio } = await supabase
                        .from("studios")
                        .select("card_url")
                        .eq("id", agendamento.studio_id)
                        .single()

                    if (studio?.card_url) {
                        console.log(`Reenviando card para ${phone}`)
                        await sendImageMessage({
                            phone,
                            image: studio.card_url,
                            caption: "✨ Aqui está seu cartão de acesso."
                        })
                        return NextResponse.json({ status: "card_resent" })
                    }
                }
            }
        }

        return NextResponse.json({ status: "ignored" })

    } catch (error) {
        console.error("Erro no webhook:", error)
        return NextResponse.json({ status: "error" }, { status: 500 })
    }
}
