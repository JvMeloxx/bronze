// Types for the SunSync application

export interface Cliente {
    id: string
    nome: string
    email: string
    telefone: string
    tipoPele: "clara" | "media" | "morena" | "negra"
    observacoes?: string
    dataCadastro: string
    pacoteId?: string
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
    duracao: number // em minutos
    observacoes?: string
}

export interface Pacote {
    id: string
    nome: string
    descricao: string
    sessoes: number
    preco: number
    validadeDias: number
    tipo: "natural" | "spray" | "misto"
    ativo: boolean
}

export interface Relatorio {
    periodo: string
    faturamento: number
    sessoes: number
    novosClientes: number
    taxaOcupacao: number
}

// Initial mock data
export const clientesIniciais: Cliente[] = [
    {
        id: "1",
        nome: "Maria Silva",
        email: "maria@email.com",
        telefone: "(11) 99999-1111",
        tipoPele: "media",
        dataCadastro: "2026-01-15",
        pacoteId: "1",
        sessoesRestantes: 8
    },
    {
        id: "2",
        nome: "Ana Costa",
        email: "ana@email.com",
        telefone: "(11) 99999-2222",
        tipoPele: "clara",
        dataCadastro: "2026-01-10",
        sessoesRestantes: 0
    },
    {
        id: "3",
        nome: "Paula Santos",
        email: "paula@email.com",
        telefone: "(11) 99999-3333",
        tipoPele: "morena",
        observacoes: "Alérgica a certos produtos",
        dataCadastro: "2026-01-20",
        pacoteId: "2",
        sessoesRestantes: 4
    },
    {
        id: "4",
        nome: "Carla Oliveira",
        email: "carla@email.com",
        telefone: "(11) 99999-4444",
        tipoPele: "negra",
        dataCadastro: "2026-01-05"
    },
    {
        id: "5",
        nome: "Fernanda Lima",
        email: "fernanda@email.com",
        telefone: "(11) 99999-5555",
        tipoPele: "media",
        dataCadastro: "2025-12-28",
        pacoteId: "1",
        sessoesRestantes: 2
    }
]

export const agendamentosIniciais: Agendamento[] = [
    {
        id: "1",
        clienteId: "1",
        clienteNome: "Maria Silva",
        data: "2026-01-30",
        horario: "09:00",
        tipo: "natural",
        status: "confirmado",
        duracao: 30
    },
    {
        id: "2",
        clienteId: "2",
        clienteNome: "Ana Costa",
        data: "2026-01-30",
        horario: "10:30",
        tipo: "spray",
        status: "confirmado",
        duracao: 45
    },
    {
        id: "3",
        clienteId: "3",
        clienteNome: "Paula Santos",
        data: "2026-01-30",
        horario: "14:00",
        tipo: "natural",
        status: "pendente",
        duracao: 30
    },
    {
        id: "4",
        clienteId: "4",
        clienteNome: "Carla Oliveira",
        data: "2026-01-30",
        horario: "15:30",
        tipo: "manutencao",
        status: "confirmado",
        duracao: 20
    },
    {
        id: "5",
        clienteId: "5",
        clienteNome: "Fernanda Lima",
        data: "2026-01-30",
        horario: "17:00",
        tipo: "spray",
        status: "confirmado",
        duracao: 45
    },
    {
        id: "6",
        clienteId: "1",
        clienteNome: "Maria Silva",
        data: "2026-01-31",
        horario: "10:00",
        tipo: "natural",
        status: "pendente",
        duracao: 30
    },
    {
        id: "7",
        clienteId: "3",
        clienteNome: "Paula Santos",
        data: "2026-02-01",
        horario: "11:00",
        tipo: "spray",
        status: "confirmado",
        duracao: 45
    }
]

export const pacotesIniciais: Pacote[] = [
    {
        id: "1",
        nome: "Pacote Bronze",
        descricao: "10 sessões de bronzeamento natural",
        sessoes: 10,
        preco: 450,
        validadeDias: 90,
        tipo: "natural",
        ativo: true
    },
    {
        id: "2",
        nome: "Pacote Gold",
        descricao: "5 sessões de bronzeamento spray",
        sessoes: 5,
        preco: 350,
        validadeDias: 60,
        tipo: "spray",
        ativo: true
    },
    {
        id: "3",
        nome: "Pacote Premium",
        descricao: "15 sessões mistas (natural ou spray)",
        sessoes: 15,
        preco: 680,
        validadeDias: 120,
        tipo: "misto",
        ativo: true
    },
    {
        id: "4",
        nome: "Pacote Básico",
        descricao: "3 sessões de bronzeamento natural",
        sessoes: 3,
        preco: 150,
        validadeDias: 30,
        tipo: "natural",
        ativo: true
    }
]

// Helper functions
export function formatarData(data: string): string {
    const date = new Date(data + "T00:00:00")
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
}

export function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })
}

export function getTipoLabel(tipo: Agendamento["tipo"]): string {
    const labels = {
        natural: "Bronzeamento Natural",
        spray: "Bronzeamento Spray",
        manutencao: "Manutenção"
    }
    return labels[tipo]
}

export function getStatusColor(status: Agendamento["status"]): string {
    const colors = {
        pendente: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        confirmado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        realizado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        cancelado: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    }
    return colors[status]
}

export function getTipoPeleLabel(tipo: Cliente["tipoPele"]): string {
    const labels = {
        clara: "Pele Clara",
        media: "Pele Média",
        morena: "Pele Morena",
        negra: "Pele Negra"
    }
    return labels[tipo]
}
