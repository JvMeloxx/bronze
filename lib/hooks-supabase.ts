"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"

// Tipos
export interface Cliente {
    id: string
    studio_id: string
    nome: string
    telefone: string
    email: string
    observacoes: string
    tipo_pele: string
    created_at: string
}

export interface Servico {
    id: string
    studio_id: string
    nome: string
    descricao: string
    preco: number
    duracao: number
    capacidade: number
    ativo: boolean
    created_at: string
}

export interface Agendamento {
    id: string
    studio_id: string
    cliente_id: string | null
    cliente_nome: string
    telefone: string
    email: string
    data: string
    horario: string
    servico_id: string | null
    servico_nome: string
    status: "pendente" | "confirmado" | "realizado" | "cancelado"
    duracao: number
    preco: number
    observacoes: string
    fonte: string
    created_at: string
}

// Hook para gerenciar Clientes
export function useClientesDB() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { studio } = useAuth()
    const supabase = createClient()

    const fetchClientes = useCallback(async () => {
        if (!studio?.id) return

        setIsLoading(true)
        const { data, error } = await supabase
            .from("clientes")
            .select("*")
            .eq("studio_id", studio.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Erro ao buscar clientes:", error)
        } else {
            setClientes(data || [])
        }
        setIsLoading(false)
    }, [studio, supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchClientes()
    }, [fetchClientes])

    const addCliente = useCallback(async (cliente: Omit<Cliente, "id" | "studio_id" | "created_at">) => {
        if (!studio?.id) return null

        const { data, error } = await supabase
            .from("clientes")
            .insert({ ...cliente, studio_id: studio.id })
            .select()
            .single()

        if (error) {
            console.error("Erro ao adicionar cliente:", error)
            return null
        }

        setClientes(prev => [data, ...prev])
        return data
    }, [studio, supabase])

    const updateCliente = useCallback(async (id: string, updates: Partial<Cliente>) => {
        const { data, error } = await supabase
            .from("clientes")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Erro ao atualizar cliente:", error)
            return false
        }

        setClientes(prev => prev.map(c => c.id === id ? data : c))
        return true
    }, [supabase])

    const deleteCliente = useCallback(async (id: string) => {
        const { error } = await supabase
            .from("clientes")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Erro ao deletar cliente:", error)
            return false
        }

        setClientes(prev => prev.filter(c => c.id !== id))
        return true
    }, [supabase])

    const getCliente = useCallback((id: string) => {
        return clientes.find(c => c.id === id)
    }, [clientes])

    return {
        clientes,
        isLoading,
        addCliente,
        updateCliente,
        deleteCliente,
        getCliente,
        refetch: fetchClientes
    }
}

// Hook para gerenciar Serviços (antigo Pacotes) - com cache
export function useServicosDB() {
    const [servicos, setServicos] = useState<Servico[]>(() => {
        // Inicializar com dados do cache se disponível
        const cached = getCache<Servico[]>(CACHE_KEYS.SERVICOS)
        return cached || []
    })
    const [isLoading, setIsLoading] = useState(true)
    const { studio } = useAuth()
    const supabase = createClient()

    const fetchServicos = useCallback(async () => {
        if (!studio?.id) return

        // Só mostra loading se não tiver cache
        const cached = getCache<Servico[]>(CACHE_KEYS.SERVICOS)
        if (!cached) setIsLoading(true)

        const { data, error } = await supabase
            .from("servicos")
            .select("*")
            .eq("studio_id", studio.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Erro ao buscar serviços:", error)
        } else {
            setServicos(data || [])
            // Salvar no cache por 5 minutos
            setCache(CACHE_KEYS.SERVICOS, data || [], CACHE_TTL.MEDIUM)
        }
        setIsLoading(false)
    }, [studio, supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchServicos()
    }, [fetchServicos])

    const addServico = useCallback(async (servico: Omit<Servico, "id" | "studio_id" | "created_at">) => {
        if (!studio?.id) return null

        const { data, error } = await supabase
            .from("servicos")
            .insert({ ...servico, studio_id: studio.id })
            .select()
            .single()

        if (error) {
            console.error("Erro ao adicionar serviço:", error)
            return null
        }

        setServicos(prev => [data, ...prev])
        return data
    }, [studio, supabase])

    const updateServico = useCallback(async (id: string, updates: Partial<Servico>) => {
        const { data, error } = await supabase
            .from("servicos")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Erro ao atualizar serviço:", error)
            return false
        }

        setServicos(prev => prev.map(s => s.id === id ? data : s))
        return true
    }, [supabase])

    const deleteServico = useCallback(async (id: string) => {
        const { error } = await supabase
            .from("servicos")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Erro ao deletar serviço:", error)
            return false
        }

        setServicos(prev => prev.filter(s => s.id !== id))
        return true
    }, [supabase])

    const getServico = useCallback((id: string) => {
        return servicos.find(s => s.id === id)
    }, [servicos])

    return {
        servicos,
        isLoading,
        addServico,
        updateServico,
        deleteServico,
        getServico,
        refetch: fetchServicos
    }
}

// Hook para gerenciar Agendamentos
export function useAgendamentosDB() {
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { studio } = useAuth()
    const supabase = createClient()

    const fetchAgendamentos = useCallback(async () => {
        if (!studio?.id) return

        setIsLoading(true)
        const { data, error } = await supabase
            .from("agendamentos")
            .select("*")
            .eq("studio_id", studio.id)
            .order("data", { ascending: true })
            .order("horario", { ascending: true })

        if (error) {
            console.error("Erro ao buscar agendamentos:", error)
        } else {
            setAgendamentos(data || [])
        }
        setIsLoading(false)
    }, [studio, supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAgendamentos()
    }, [fetchAgendamentos])

    const addAgendamento = useCallback(async (agendamento: Omit<Agendamento, "id" | "studio_id" | "created_at">) => {
        if (!studio?.id) return null

        const { data, error } = await supabase
            .from("agendamentos")
            .insert({ ...agendamento, studio_id: studio.id })
            .select()
            .single()

        if (error) {
            console.error("Erro ao adicionar agendamento:", error)
            return null
        }

        setAgendamentos(prev => [...prev, data].sort((a, b) => {
            if (a.data !== b.data) return a.data.localeCompare(b.data)
            return a.horario.localeCompare(b.horario)
        }))
        return data
    }, [studio, supabase])

    const updateAgendamento = useCallback(async (id: string, updates: Partial<Agendamento>) => {
        const { data, error } = await supabase
            .from("agendamentos")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Erro ao atualizar agendamento:", error)
            return false
        }

        setAgendamentos(prev => prev.map(a => a.id === id ? data : a))
        return true
    }, [supabase])

    const deleteAgendamento = useCallback(async (id: string) => {
        const { error } = await supabase
            .from("agendamentos")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Erro ao deletar agendamento:", error)
            return false
        }

        setAgendamentos(prev => prev.filter(a => a.id !== id))
        return true
    }, [supabase])

    const getAgendamentosByData = useCallback((data: string) => {
        return agendamentos.filter(a => a.data === data)
    }, [agendamentos])

    const getAgendamentosByCliente = useCallback((clienteId: string) => {
        return agendamentos.filter(a => a.cliente_id === clienteId)
    }, [agendamentos])

    const getAgendamentosHoje = useCallback(() => {
        const hoje = new Date().toISOString().split("T")[0]
        return agendamentos.filter(a => a.data === hoje)
    }, [agendamentos])

    return {
        agendamentos,
        isLoading,
        addAgendamento,
        updateAgendamento,
        deleteAgendamento,
        getAgendamentosByData,
        getAgendamentosByCliente,
        getAgendamentosHoje,
        refetch: fetchAgendamentos
    }
}

// Hook para estatísticas do Dashboard
// Hook para estatísticas do Dashboard (otimizado)
export function useDashboardStatsDB() {
    const { studio } = useAuth()
    const supabase = createClient()

    const [stats, setStats] = useState({
        agendamentosHoje: 0,
        clientesAtivos: 0,
        sessoesEstaSemana: 0,
        faturamentoMensal: 0,
        totalClientes: 0,
        proximosAgendamentos: [] as Agendamento[]
    })
    const [isLoading, setIsLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        if (!studio?.id) return

        setIsLoading(true)
        const hoje = new Date().toISOString().split("T")[0]

        // Datas para semana
        const inicioSemana = new Date()
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay()) // Domingo
        const fimSemana = new Date(inicioSemana)
        fimSemana.setDate(fimSemana.getDate() + 6) // Sábado

        // Datas para mês
        const primeiroDiaMes = new Date()
        primeiroDiaMes.setDate(1)
        const primeiroDiaMesStr = primeiroDiaMes.toISOString().split("T")[0]

        try {
            // Executar queries em paralelo para maior velocidade
            const [
                agendamentosHojeRes,
                totalClientesRes,
                sessoesSemanaRes,
                faturamentoRes
            ] = await Promise.all([
                // 1. Agendamentos de Hoje (Precisa dos dados para listar)
                supabase
                    .from("agendamentos")
                    .select("*")
                    .eq("studio_id", studio.id)
                    .eq("data", hoje)
                    .order("horario", { ascending: true }),

                // 2. Total Clientes (Só count)
                supabase
                    .from("clientes")
                    .select("*", { count: 'exact', head: true }) // head: true não traz dados, só count
                    .eq("studio_id", studio.id),

                // 3. Sessões da Semana (Só count)
                supabase
                    .from("agendamentos")
                    .select("*", { count: 'exact', head: true })
                    .eq("studio_id", studio.id)
                    .gte("data", inicioSemana.toISOString().split("T")[0])
                    .lte("data", fimSemana.toISOString().split("T")[0]),

                // 4. Faturamento (Precisa somar o preço)
                // Otimização: Trazer apenas a coluna preço, não o objeto todo
                supabase
                    .from("agendamentos")
                    .select("preco")
                    .eq("studio_id", studio.id)
                    .eq("status", "realizado")
                    .gte("data", primeiroDiaMesStr)
            ])

            const faturamentoTotal = faturamentoRes.data?.reduce((acc: number, curr: { preco?: number }) => acc + (curr.preco || 0), 0) || 0

            setStats({
                agendamentosHoje: agendamentosHojeRes.data?.length || 0,
                clientesAtivos: totalClientesRes.count || 0,
                sessoesEstaSemana: sessoesSemanaRes.count || 0,
                faturamentoMensal: faturamentoTotal,
                totalClientes: totalClientesRes.count || 0,
                proximosAgendamentos: agendamentosHojeRes.data || []
            })

        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error)
        } finally {
            setIsLoading(false)
        }
    }, [studio, supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStats()
    }, [fetchStats])

    return { ...stats, isLoading, refetch: fetchStats }
}

// Hook para configurações do Studio
export function useStudioConfig() {
    const { studio, refreshStudio } = useAuth()
    const supabase = createClient()

    const updateConfig = useCallback(async (updates: Record<string, unknown>) => {
        if (!studio?.id) return false

        const { error } = await supabase
            .from("studios")
            .update(updates)
            .eq("id", studio.id)

        if (error) {
            console.error("Erro ao atualizar configurações:", error)
            return false
        }

        await refreshStudio()
        return true
    }, [studio, supabase, refreshStudio])

    return {
        config: studio,
        updateConfig,
        refreshConfig: refreshStudio
    }
}
