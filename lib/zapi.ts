/**
 * Z-API Integration
 * Documentação: https://docs.z-api.io/
 * 
 * Configure suas credenciais em .env.local:
 * NEXT_PUBLIC_ZAPI_INSTANCE_ID=sua_instancia
 * NEXT_PUBLIC_ZAPI_TOKEN=seu_token
 * NEXT_PUBLIC_ZAPI_CLIENT_TOKEN=seu_client_token (opcional)
 * NEXT_PUBLIC_APP_URL=https://seu-dominio.com
 */

const ZAPI_BASE_URL = "https://api.z-api.io/instances"
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sunsync.site"

interface ZAPIConfig {
    instanceId: string
    token: string
    clientToken?: string
}

interface SendTextOptions {
    phone: string
    message: string
}

interface SendButtonOptions {
    phone: string
    message: string
    buttons: Array<{
        id: string
        label: string
    }>
}

interface ZAPIResponse {
    success: boolean
    messageId?: string
    error?: string
}

// Configuração padrão (será sobrescrita pelas variáveis de ambiente)
const defaultConfig: ZAPIConfig = {
    instanceId: process.env.NEXT_PUBLIC_ZAPI_INSTANCE_ID || "",
    token: process.env.NEXT_PUBLIC_ZAPI_TOKEN || "",
    clientToken: process.env.NEXT_PUBLIC_ZAPI_CLIENT_TOKEN || ""
}

/**
 * Formata número de telefone para o padrão do Z-API
 * Remove caracteres especiais e adiciona código do país
 */
export function formatPhoneNumber(phone: string): string {
    // Remove tudo que não é número
    let cleaned = phone.replace(/\D/g, "")

    // Se começar com 0, remove
    if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1)
    }

    // Se não tiver código do país (55), adiciona
    if (!cleaned.startsWith("55")) {
        cleaned = "55" + cleaned
    }

    return cleaned
}

/**
 * Envia mensagem de texto simples
 */
export async function sendTextMessage(
    options: SendTextOptions,
    config: ZAPIConfig = defaultConfig
): Promise<ZAPIResponse> {
    if (!config.instanceId || !config.token) {
        console.warn("Z-API não configurado. Configure as variáveis de ambiente.")
        return { success: false, error: "Z-API não configurado" }
    }

    const url = `${ZAPI_BASE_URL}/${config.instanceId}/token/${config.token}/send-text`

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(config.clientToken && { "Client-Token": config.clientToken })
            },
            body: JSON.stringify({
                phone: formatPhoneNumber(options.phone),
                message: options.message
            })
        })

        const data = await response.json()

        if (response.ok) {
            return { success: true, messageId: data.messageId }
        } else {
            return { success: false, error: data.message || "Erro ao enviar mensagem" }
        }
    } catch (error) {
        console.error("Erro Z-API:", error)
        return { success: false, error: "Erro de conexão com Z-API" }
    }
}

/**
 * Envia mensagem com botões interativos
 */
export async function sendButtonMessage(
    options: SendButtonOptions,
    config: ZAPIConfig = defaultConfig
): Promise<ZAPIResponse> {
    if (!config.instanceId || !config.token) {
        return { success: false, error: "Z-API não configurado" }
    }

    const url = `${ZAPI_BASE_URL}/${config.instanceId}/token/${config.token}/send-button-list`

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(config.clientToken && { "Client-Token": config.clientToken })
            },
            body: JSON.stringify({
                phone: formatPhoneNumber(options.phone),
                message: options.message,
                buttonList: {
                    buttons: options.buttons.map(btn => ({
                        id: btn.id,
                        label: btn.label
                    }))
                }
            })
        })

        const data = await response.json()

        if (response.ok) {
            return { success: true, messageId: data.messageId }
        } else {
            return { success: false, error: data.message || "Erro ao enviar mensagem" }
        }
    } catch (error) {
        console.error("Erro Z-API:", error)
        return { success: false, error: "Erro de conexão com Z-API" }
    }
}

interface SendImageOptions {
    phone: string
    image: string // URL da imagem ou Base64
    caption?: string
}

/**
 * Envia imagem
 */
export async function sendImageMessage(
    options: SendImageOptions,
    config: ZAPIConfig = defaultConfig
): Promise<ZAPIResponse> {
    if (!config.instanceId || !config.token) {
        return { success: false, error: "Z-API não configurado" }
    }

    const url = `${ZAPI_BASE_URL}/${config.instanceId}/token/${config.token}/send-image`

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(config.clientToken && { "Client-Token": config.clientToken })
            },
            body: JSON.stringify({
                phone: formatPhoneNumber(options.phone),
                image: options.image,
                caption: options.caption
            })
        })

        const data = await response.json()

        if (response.ok) {
            return { success: true, messageId: data.messageId }
        } else {
            return { success: false, error: data.message || "Erro ao enviar imagem" }
        }
    } catch (error) {
        console.error("Erro Z-API:", error)
        return { success: false, error: "Erro de conexão com Z-API" }
    }
}

// ===== Templates de Mensagens para SunSync =====

export const MessageTemplates = {
    /**
     * Notificação para dona do studio quando cliente agenda
     */
    novoAgendamentoParaDona: (
        clienteNome: string,
        clienteTelefone: string,
        data: string,
        horario: string,
        tipo: string,
        observacoes?: string
    ) =>
        `🔔 *NOVO AGENDAMENTO!*

👤 *Cliente:* ${clienteNome}
📱 *Telefone:* ${clienteTelefone}
📅 *Data:* ${data}
⏰ *Horário:* ${horario}
💆 *Serviço:* ${tipo}${observacoes ? `\n📝 *Obs:* ${observacoes}` : ""}

Acesse o dashboard para mais detalhes.`,

    /**
     * Lembrete para cliente 1 dia antes com cuidados e alerta de clima
     */
    lembretePreSessao: (clienteNome: string, horario: string, telefoneStudio: string) =>
        `☀️ *Olá ${clienteNome}!*

Sua sessão de bronzeamento é *AMANHÃ* às *${horario}*!

📋 *CUIDADOS PRÉ-BRONZEAMENTO:*
• Faça esfoliação leve na véspera
• Hidrate bem a pele hoje à noite
• Evite cremes/óleos no dia da sessão
• Depilação: faça pelo menos 24h antes
• Vista roupas confortáveis e escuras
• Chegue 10 minutos antes

⚠️ *ATENÇÃO:* Caso o clima esteja *CHUVOSO*, entre em contato imediatamente para reagendar! Bronzeamento natural com chuva pode comprometer o resultado.

Qualquer dúvida, falar direto com o studio ${telefoneStudio}

Até amanhã! ✨`,

    /**
     * Lembrete de agendamento (envia 1 dia antes)
     */
    agendamentoLembrete: (clienteNome: string, data: string, horario: string, tipo: string) =>
        `☀️ *SunSync - Lembrete de Agendamento*

Olá ${clienteNome}! 👋

Passando para lembrar que você tem uma sessão de *${tipo}* agendada para amanhã.

📅 *Data:* ${data}
⏰ *Horário:* ${horario}

Confirma sua presença? Responda SIM ou NÃO.

Qualquer dúvida, estamos à disposição! ✨`,

    /**
     * Confirmação de agendamento (envia após agendar)
     */
    agendamentoConfirmado: (clienteNome: string, data: string, horario: string, tipo: string, agendamentoId: string, slug: string, telefoneEstudio: string, nomeEstudio: string, locationUrl?: string) =>
        `☀️ *${nomeEstudio.toUpperCase()} - Agendamento Confirmado!*

Olá ${clienteNome}! 🎉

Seu agendamento foi confirmado com sucesso!

📅 *Data:* ${data}
⏰ *Horário:* ${horario}
💆 *Serviço:* ${tipo}
${locationUrl ? `\n📍 *Localização:* ${locationUrl}\n` : ""}
📅 *Precisa remarcar?*
Acesse: ${APP_BASE_URL}/${slug}/remarcar/${agendamentoId}

📱 *Dúvidas ou cancelamento?*
Fale direto com o estúdio: ${telefoneEstudio}

Dicas para sua sessão:
• Hidrate bem a pele no dia anterior
• Evite usar cremes ou óleos antes da sessão
• Chegue 10 minutos antes

👇 *IMPORTANTE:*
Para garantir que você receba nossos lembretes e localização, por favor *responda essa mensagem* com um "OK" ou um emoji! 🌸

Até lá! ✨`,

    /**
     * Notificação Reagendamento (Dona)
     */
    agendamentoReagendadoDona: (
        clienteNome: string,
        clienteTelefone: string,
        antigaData: string,
        antigoHorario: string,
        novaData: string,
        novoHorario: string,
        tipo: string
    ) =>
        `🔄 *AGENDAMENTO ALTERADO!*

👤 *Cliente:* ${clienteNome}
📱 *Telefone:* ${clienteTelefone}

❌ *De:* ${antigaData} às ${antigoHorario}
✅ *Para:* ${novaData} às ${novoHorario}

💆 *Serviço:* ${tipo}

Acesse o dashboard para mais detalhes.`,

    /**
     * Confirmação Reagendamento (Cliente)
     */
    agendamentoReagendadoCliente: (clienteNome: string, data: string, horario: string, tipo: string, nomeEstudio: string) =>
        `☀️ *${nomeEstudio.toUpperCase()} - Agendamento Alterado!*

Olá ${clienteNome}!

Confirmamos a alteração do seu horário.

📅 *Nova Data:* ${data}
⏰ *Novo Horário:* ${horario}
💆 *Serviço:* ${tipo}

Agradecemos a preferência! ✨`,

    /**
     * Cancelamento de agendamento
     */
    agendamentoCancelado: (clienteNome: string, data: string, horario: string) =>
        `☀️ *SunSync*

Olá ${clienteNome},

Seu agendamento do dia ${data} às ${horario} foi cancelado.

Para reagendar, acesse nosso sistema ou entre em contato.

Sentiremos sua falta! 💛`,

    /**
     * Boas-vindas para novo cliente
     */
    boasVindas: (clienteNome: string) =>
        `☀️ *Bem-vindo(a) ao SunSync!* ✨

Olá ${clienteNome}! 👋

Ficamos muito felizes em ter você conosco! 

Agora você pode agendar suas sessões de bronzeamento de forma prática e rápida.

Qualquer dúvida, é só nos chamar por aqui!

Até breve! 🌟`,

    /**
     * Pós-sessão (feedback)
     */
    posSessao: (clienteNome: string) =>
        `☀️ *SunSync*

Olá ${clienteNome}! 

Esperamos que tenha adorado sua sessão de hoje! 🌟

Lembre-se:
• Hidrate bem a pele
• Evite banhos muito quentes nas próximas horas
• Use protetor solar ao sair

Temos novos pacotes promocionais! Quer saber mais?

Avalie sua experiência de 1 a 5 ⭐`
}


/**
 * Funções de envio com templates
 */
export async function enviarLembreteAgendamento(
    telefone: string,
    clienteNome: string,
    data: string,
    horario: string,
    tipo: string
): Promise<ZAPIResponse> {
    return sendTextMessage({
        phone: telefone,
        message: MessageTemplates.agendamentoLembrete(clienteNome, data, horario, tipo)
    })
}

export async function enviarConfirmacaoAgendamento(
    telefone: string,
    clienteNome: string,
    data: string,
    horario: string,
    tipo: string,
    agendamentoId: string,
    slug: string,
    telefoneEstudio: string,
    nomeEstudio: string,
    locationUrl?: string
): Promise<ZAPIResponse> {
    return sendTextMessage({
        phone: telefone,
        message: MessageTemplates.agendamentoConfirmado(clienteNome, data, horario, tipo, agendamentoId, slug, telefoneEstudio, nomeEstudio, locationUrl)
    })
}

export async function enviarBoasVindas(
    telefone: string,
    clienteNome: string
): Promise<ZAPIResponse> {
    return sendTextMessage({
        phone: telefone,
        message: MessageTemplates.boasVindas(clienteNome)
    })
}

/**
 * Notifica a dona do studio sobre novo agendamento
 */
/**
 * Notifica a dona do studio sobre novo agendamento com botões de confirmação
 */
export async function enviarNotificacaoNovoPedido(
    telefoneDona: string,
    clienteNome: string,
    clienteTelefone: string,
    data: string,
    horario: string,
    tipo: string,
    agendamentoId: string,
    observacoes?: string
): Promise<ZAPIResponse> {
    return sendButtonMessage({
        phone: telefoneDona,
        message: MessageTemplates.novoAgendamentoParaDona(
            clienteNome,
            clienteTelefone,
            data,
            horario,
            tipo,
            observacoes
        ),
        buttons: [
            {
                id: `confirm_payment_${agendamentoId}`,
                label: "✅ Confirmar Pagamento"
            },
            {
                id: `deny_payment_${agendamentoId}`,
                label: "❌ Não Pago"
            }
        ]
    })
}

/**
 * Envia notificação de reagendamento para a dona
 */
export async function enviarNotificacaoReagendamentoDona(
    telefoneDona: string,
    clienteNome: string,
    clienteTelefone: string,
    antigaData: string,
    antigoHorario: string,
    novaData: string,
    novoHorario: string,
    tipo: string
): Promise<ZAPIResponse> {
    return sendTextMessage({
        phone: telefoneDona,
        message: MessageTemplates.agendamentoReagendadoDona(
            clienteNome,
            clienteTelefone,
            antigaData,
            antigoHorario,
            novaData,
            novoHorario,
            tipo
        )
    })
}

/**
 * Envia confirmação de reagendamento para o cliente
 */
export async function enviarConfirmacaoReagendamentoCliente(
    telefone: string,
    clienteNome: string,
    data: string,
    horario: string,
    tipo: string,
    nomeEstudio: string
): Promise<ZAPIResponse> {
    return sendTextMessage({
        phone: telefone,
        message: MessageTemplates.agendamentoReagendadoCliente(clienteNome, data, horario, tipo, nomeEstudio)
    })
}

/**
 * Envia lembrete para cliente 1 dia antes com cuidados e alerta de chuva
 */
export async function enviarLembretePreSessao(
    telefone: string,
    clienteNome: string,
    horario: string,
    telefoneStudio: string
): Promise<ZAPIResponse> {
    return sendTextMessage({
        phone: telefone,
        message: MessageTemplates.lembretePreSessao(clienteNome, horario, telefoneStudio)
    })
}


/**
 * Verifica o status da conexão Z-API
 */
export async function verificarStatusZAPI(
    config: ZAPIConfig = defaultConfig
): Promise<{ connected: boolean; phone?: string }> {
    if (!config.instanceId || !config.token) {
        return { connected: false }
    }

    const url = `${ZAPI_BASE_URL}/${config.instanceId}/token/${config.token}/status`

    try {
        const response = await fetch(url, {
            headers: config.clientToken ? { "Client-Token": config.clientToken } : {}
        })
        const data = await response.json()

        return {
            connected: data.connected === true,
            phone: data.phone
        }
    } catch {
        return { connected: false }
    }
}
