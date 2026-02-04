
export interface Cliente {
    id: string
    nome: string
    telefone?: string
    email?: string
    dataCadastro: string
    sessoesRestantes?: number
}

export interface Agendamento {
    id: string
    clienteId: string
    clienteNome: string
    data: string
    horario: string
    tipo: "natural" | "spray" | "manutencao"
    status: "pendente" | "confirmado" | "realizado" | "cancelado"
    observacoes?: string
    valor?: number
}

export interface Pacote {
    id: string
    nome: string
    sessoes: number
    preco: number
    ativo: boolean
    descricao?: string
}

export const clientesIniciais: Cliente[] = []
export const agendamentosIniciais: Agendamento[] = []
export const pacotesIniciais: Pacote[] = []

export function formatarData(data: string) {
    if (!data) return ""
    const [ano, mes, dia] = data.split("-")
    return `${dia}/${mes}/${ano}`
}

export function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor)
}

export function getTipoLabel(tipo: string) {
    const labels: Record<string, string> = {
        natural: "Bronze Natural",
        spray: "Bronze a Jato",
        manutencao: "Manutenção"
    }
    return labels[tipo] || tipo
}

export function getStatusColor(status: string) {
    switch (status) {
        case "confirmado":
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        case "realizado":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        case "cancelado":
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        default:
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    }
}
