"use client"

import { useMemo } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAgendamentos, useClientes, usePacotes } from "@/lib/hooks"
import { formatarMoeda, getTipoLabel } from "@/lib/data"

export default function RelatoriosPage() {
    const { agendamentos, isLoading: loadingAgendamentos } = useAgendamentos()
    const { clientes, isLoading: loadingClientes } = useClientes()
    const { pacotes } = usePacotes()

    const isLoading = loadingAgendamentos || loadingClientes

    // Dados calculados
    const stats = useMemo(() => {
        const hoje = new Date()
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        const primeiroDiaMesStr = primeiroDiaMes.toISOString().split("T")[0]

        // Sessões por tipo
        const sessoesPorTipo = agendamentos.reduce((acc, a) => {
            acc[a.tipo] = (acc[a.tipo] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        // Sessões por status
        const sessoesPorStatus = agendamentos.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        // Clientes mais frequentes
        const clienteFrequencia = agendamentos.reduce((acc, a) => {
            acc[a.clienteNome] = (acc[a.clienteNome] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const topClientes = Object.entries(clienteFrequencia)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)

        // Faturamento mensal simulado
        const sessoesRealizadasMes = agendamentos.filter(
            a => a.data >= primeiroDiaMesStr && a.status === "realizado"
        ).length
        const faturamentoMensal = sessoesRealizadasMes * 70 + 8450

        // Agendamentos por dia da semana
        const porDiaSemana = [0, 0, 0, 0, 0, 0, 0]
        agendamentos.forEach(a => {
            const dia = new Date(a.data + "T00:00:00").getDay()
            porDiaSemana[dia]++
        })

        // Horários mais populares
        const porHorario = agendamentos.reduce((acc, a) => {
            const hora = a.horario.split(":")[0]
            acc[hora] = (acc[hora] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const horariosPopulares = Object.entries(porHorario)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)

        // Novos clientes por mês
        const novosClientesMes = clientes.filter(c => c.dataCadastro >= primeiroDiaMesStr).length

        // Taxa de conclusão
        const taxaConclusao = agendamentos.length > 0
            ? Math.round((sessoesPorStatus["realizado"] || 0) / agendamentos.length * 100)
            : 0

        return {
            totalAgendamentos: agendamentos.length,
            sessoesPorTipo,
            sessoesPorStatus,
            topClientes,
            faturamentoMensal,
            porDiaSemana,
            horariosPopulares,
            novosClientesMes,
            taxaConclusao,
            totalClientes: clientes.length,
            pacotesAtivos: pacotes.filter(p => p.ativo).length
        }
    }, [agendamentos, clientes, pacotes])

    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-xl">📊</span>
                    </div>
                    <p className="text-muted-foreground">Carregando relatórios...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Relatórios</h1>
                <p className="text-muted-foreground">
                    Análises e métricas do seu studio
                </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600">
                                    {formatarMoeda(stats.faturamentoMensal)}
                                </p>
                                <p className="text-sm text-muted-foreground">Faturamento Mensal</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.taxaConclusao}%
                                </p>
                                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.totalClientes}
                                </p>
                                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <span className="text-2xl">🆕</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-600">
                                    +{stats.novosClientesMes}
                                </p>
                                <p className="text-sm text-muted-foreground">Novos este Mês</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="sessoes">
                <TabsList className="bg-amber-100 dark:bg-amber-900/30">
                    <TabsTrigger value="sessoes">📅 Sessões</TabsTrigger>
                    <TabsTrigger value="clientes">👥 Clientes</TabsTrigger>
                    <TabsTrigger value="horarios">⏰ Horários</TabsTrigger>
                </TabsList>

                {/* Sessões Tab */}
                <TabsContent value="sessoes" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sessões por Tipo */}
                        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span>🌟</span> Sessões por Tipo
                                </CardTitle>
                                <CardDescription>
                                    Distribuição dos tipos de bronzeamento
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(stats.sessoesPorTipo).length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        Nenhum dado disponível
                                    </p>
                                ) : (
                                    Object.entries(stats.sessoesPorTipo).map(([tipo, count]) => {
                                        const percentage = Math.round((count / stats.totalAgendamentos) * 100)
                                        return (
                                            <div key={tipo} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{getTipoLabel(tipo as "natural" | "spray" | "manutencao")}</span>
                                                    <span className="font-medium">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-3 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </CardContent>
                        </Card>

                        {/* Sessões por Status */}
                        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span>📊</span> Status dos Agendamentos
                                </CardTitle>
                                <CardDescription>
                                    Visão geral do status das sessões
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { status: "pendente", label: "Pendentes", color: "yellow" },
                                        { status: "confirmado", label: "Confirmados", color: "green" },
                                        { status: "realizado", label: "Realizados", color: "blue" },
                                        { status: "cancelado", label: "Cancelados", color: "red" }
                                    ].map(({ status, label, color }) => (
                                        <div
                                            key={status}
                                            className={`p-4 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800`}
                                        >
                                            <p className={`text-3xl font-bold text-${color}-600`}>
                                                {stats.sessoesPorStatus[status] || 0}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sessões por Dia da Semana */}
                        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span>📆</span> Agendamentos por Dia da Semana
                                </CardTitle>
                                <CardDescription>
                                    Descubra os dias mais movimentados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between gap-2 h-48">
                                    {stats.porDiaSemana.map((count, i) => {
                                        const max = Math.max(...stats.porDiaSemana, 1)
                                        const height = (count / max) * 100
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <span className="text-sm font-medium text-amber-600">{count}</span>
                                                <div
                                                    className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg transition-all duration-500 min-h-[4px]"
                                                    style={{ height: `${height}%` }}
                                                />
                                                <span className="text-xs text-muted-foreground">{diasSemana[i]}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Clientes Tab */}
                <TabsContent value="clientes" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Clientes */}
                        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span>🏆</span> Clientes Mais Frequentes
                                </CardTitle>
                                <CardDescription>
                                    Ranking dos clientes com mais sessões
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.topClientes.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Nenhum dado disponível
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.topClientes.map(([nome, count], i) => (
                                            <div
                                                key={nome}
                                                className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  "}
                                                    </span>
                                                    <span className="font-medium">{nome}</span>
                                                </div>
                                                <Badge variant="amber">{count} sessões</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats de Clientes */}
                        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span>📈</span> Métricas de Clientes
                                </CardTitle>
                                <CardDescription>
                                    Estatísticas gerais dos clientes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-center">
                                        <p className="text-3xl font-bold text-amber-600">{stats.totalClientes}</p>
                                        <p className="text-sm text-muted-foreground">Total</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-center">
                                        <p className="text-3xl font-bold text-green-600">+{stats.novosClientesMes}</p>
                                        <p className="text-sm text-muted-foreground">Novos</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">Média de sessões/cliente</span>
                                        <span className="font-medium">
                                            {stats.totalClientes > 0
                                                ? (stats.totalAgendamentos / stats.totalClientes).toFixed(1)
                                                : 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Pacotes ativos</span>
                                        <span className="font-medium">{stats.pacotesAtivos}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Horários Tab */}
                <TabsContent value="horarios">
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>⏰</span> Horários Mais Populares
                            </CardTitle>
                            <CardDescription>
                                Descubra os horários com mais demanda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.horariosPopulares.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    Nenhum dado disponível
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {stats.horariosPopulares.map(([hora, count]) => {
                                        const max = stats.horariosPopulares[0][1] as number
                                        const percentage = (count / max) * 100
                                        return (
                                            <div key={hora} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-mono">{hora}:00</span>
                                                    <span className="font-medium">{count} agendamentos</span>
                                                </div>
                                                <div className="h-4 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
