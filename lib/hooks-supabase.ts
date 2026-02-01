"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

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
    }, [studio?.id, supabase])

    useEffect(() => {
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
    }, [studio?.id, supabase])

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

// Hook para gerenciar Serviços (antigo Pacotes)
export function useServicosDB() {
    const [servicos, setServicos] = useState<Servico[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { studio } = useAuth()
    const supabase = createClient()

    const fetchServicos = useCallback(async () => {
        if (!studio?.id) return

        setIsLoading(true)
        const { data, error } = await supabase
            .from("servicos")
            .select("*")
            .eq("studio_id", studio.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Erro ao buscar serviços:", error)
        } else {
            setServicos(data || [])
        }
        setIsLoading(false)
    }, [studio?.id, supabase])

    useEffect(() => {
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
    }, [studio?.id, supabase])

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
    }, [studio?.id, supabase])

    useEffect(() => {
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
    }, [studio?.id, supabase])

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
export function useDashboardStatsDB() {
    const { agendamentos } = useAgendamentosDB()
    const { clientes } = useClientesDB()

    const hoje = new Date().toISOString().split("T")[0]
    const primeiroDiaMes = new Date()
    primeiroDiaMes.setDate(1)
    const primeiroDiaMesStr = primeiroDiaMes.toISOString().split("T")[0]

    const agendamentosHoje = agendamentos.filter(a => a.data === hoje)

    // Sessões esta semana
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(fimSemana.getDate() + 6)

    const sessoesEstaSemana = agendamentos.filter(a => {
        const dataAgendamento = new Date(a.data)
        return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana
    })

    // Faturamento simulado (média de R$70 por sessão)
    const sessoesRealizadasMes = agendamentos.filter(
        a => a.data >= primeiroDiaMesStr && a.status === "realizado"
    ).length
    const faturamentoMensal = sessoesRealizadasMes * 70

    return {
        agendamentosHoje: agendamentosHoje.length,
        clientesAtivos: clientes.length,
        sessoesEstaSemana: sessoesEstaSemana.length,
        faturamentoMensal,
        totalClientes: clientes.length,
        proximosAgendamentos: agendamentosHoje.slice(0, 5)
    }
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
    }, [studio?.id, supabase, refreshStudio])

    return {
        config: studio,
        updateConfig,
        refreshConfig: refreshStudio
    }
}
