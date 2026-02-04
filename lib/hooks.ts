"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Cliente,
    Agendamento,
    Pacote,
    clientesIniciais,
    agendamentosIniciais,
    pacotesIniciais
} from "./data"

// Hook para gerenciar Clientes
export function useClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem("sunsync_clientes")
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClientes(JSON.parse(stored))
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClientes(clientesIniciais)
            localStorage.setItem("sunsync_clientes", JSON.stringify(clientesIniciais))
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false)
    }, [])

    const saveClientes = useCallback((newClientes: Cliente[]) => {
        setClientes(newClientes)
        localStorage.setItem("sunsync_clientes", JSON.stringify(newClientes))
    }, [])

    const addCliente = useCallback((cliente: Omit<Cliente, "id" | "dataCadastro">) => {
        const newCliente: Cliente = {
            ...cliente,
            id: Math.random().toString(36).substring(2, 9),
            dataCadastro: new Date().toISOString().split("T")[0]
        }
        const updated = [...clientes, newCliente]
        saveClientes(updated)
        return newCliente
    }, [clientes, saveClientes])

    const updateCliente = useCallback((id: string, data: Partial<Cliente>) => {
        const updated = clientes.map(c => c.id === id ? { ...c, ...data } : c)
        saveClientes(updated)
    }, [clientes, saveClientes])

    const deleteCliente = useCallback((id: string) => {
        const updated = clientes.filter(c => c.id !== id)
        saveClientes(updated)
    }, [clientes, saveClientes])

    const getCliente = useCallback((id: string) => {
        return clientes.find(c => c.id === id)
    }, [clientes])

    return {
        clientes,
        isLoading,
        addCliente,
        updateCliente,
        deleteCliente,
        getCliente
    }
}

// Hook para gerenciar Agendamentos
export function useAgendamentos() {
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem("sunsync_agendamentos")
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAgendamentos(JSON.parse(stored))
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAgendamentos(agendamentosIniciais)
            localStorage.setItem("sunsync_agendamentos", JSON.stringify(agendamentosIniciais))
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false)
    }, [])

    const saveAgendamentos = useCallback((newAgendamentos: Agendamento[]) => {
        setAgendamentos(newAgendamentos)
        localStorage.setItem("sunsync_agendamentos", JSON.stringify(newAgendamentos))
    }, [])

    const addAgendamento = useCallback((agendamento: Omit<Agendamento, "id">) => {
        const newAgendamento: Agendamento = {
            ...agendamento,
            id: Math.random().toString(36).substring(2, 9)
        }
        const updated = [...agendamentos, newAgendamento]
        saveAgendamentos(updated)
        return newAgendamento
    }, [agendamentos, saveAgendamentos])

    const updateAgendamento = useCallback((id: string, data: Partial<Agendamento>) => {
        const updated = agendamentos.map(a => a.id === id ? { ...a, ...data } : a)
        saveAgendamentos(updated)
    }, [agendamentos, saveAgendamentos])

    const deleteAgendamento = useCallback((id: string) => {
        const updated = agendamentos.filter(a => a.id !== id)
        saveAgendamentos(updated)
    }, [agendamentos, saveAgendamentos])

    const getAgendamentosByData = useCallback((data: string) => {
        return agendamentos.filter(a => a.data === data)
    }, [agendamentos])

    const getAgendamentosByCliente = useCallback((clienteId: string) => {
        return agendamentos.filter(a => a.clienteId === clienteId)
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
        getAgendamentosHoje
    }
}

// Hook para gerenciar Pacotes
export function usePacotes() {
    const [pacotes, setPacotes] = useState<Pacote[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem("sunsync_pacotes")
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPacotes(JSON.parse(stored))
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPacotes(pacotesIniciais)
            localStorage.setItem("sunsync_pacotes", JSON.stringify(pacotesIniciais))
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false)
    }, [])

    const savePacotes = useCallback((newPacotes: Pacote[]) => {
        setPacotes(newPacotes)
        localStorage.setItem("sunsync_pacotes", JSON.stringify(newPacotes))
    }, [])

    const addPacote = useCallback((pacote: Omit<Pacote, "id">) => {
        const newPacote: Pacote = {
            ...pacote,
            id: Math.random().toString(36).substring(2, 9)
        }
        const updated = [...pacotes, newPacote]
        savePacotes(updated)
        return newPacote
    }, [pacotes, savePacotes])

    const updatePacote = useCallback((id: string, data: Partial<Pacote>) => {
        const updated = pacotes.map(p => p.id === id ? { ...p, ...data } : p)
        savePacotes(updated)
    }, [pacotes, savePacotes])

    const deletePacote = useCallback((id: string) => {
        const updated = pacotes.filter(p => p.id !== id)
        savePacotes(updated)
    }, [pacotes, savePacotes])

    const getPacote = useCallback((id: string) => {
        return pacotes.find(p => p.id === id)
    }, [pacotes])

    return {
        pacotes,
        isLoading,
        addPacote,
        updatePacote,
        deletePacote,
        getPacote
    }
}

// Hook para estatísticas do Dashboard
export function useDashboardStats() {
    const { agendamentos } = useAgendamentos()
    const { clientes } = useClientes()

    const hoje = new Date().toISOString().split("T")[0]
    const primeiroDiaMes = new Date()
    primeiroDiaMes.setDate(1)
    const primeiroDiaMesStr = primeiroDiaMes.toISOString().split("T")[0]

    const agendamentosHoje = agendamentos.filter(a => a.data === hoje)
    const clientesAtivos = clientes.filter(c => c.sessoesRestantes && c.sessoesRestantes > 0)

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
        clientesAtivos: clientesAtivos.length,
        sessoesEstaSemana: sessoesEstaSemana.length,
        faturamentoMensal,
        totalClientes: clientes.length,
        proximosAgendamentos: agendamentosHoje.slice(0, 5)
    }
}
