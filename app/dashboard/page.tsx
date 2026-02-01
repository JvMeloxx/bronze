"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAgendamentos, useClientes, usePacotes } from "@/lib/hooks"
import { getStatusColor, getTipoLabel, formatarMoeda } from "@/lib/data"

export default function DashboardPage() {
    const { agendamentos, isLoading: loadingAgendamentos } = useAgendamentos()
    const { clientes, isLoading: loadingClientes } = useClientes()
    const { pacotes, isLoading: loadingPacotes } = usePacotes()

    // Estatísticas
    const hoje = new Date().toISOString().split("T")[0]
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje)
    const clientesAtivos = clientes.filter(c => c.sessoesRestantes && c.sessoesRestantes > 0)

    // Sessões esta semana
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(fimSemana.getDate() + 6)

    const sessoesEstaSemana = agendamentos.filter(a => {
        const dataAgendamento = new Date(a.data + "T00:00:00")
        return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana
    })

    // Faturamento (média de R$70 por sessão realizada)
    const primeiroDiaMes = new Date()
    primeiroDiaMes.setDate(1)
    const primeiroDiaMesStr = primeiroDiaMes.toISOString().split("T")[0]

    const sessoesRealizadasMes = agendamentos.filter(
        a => a.data >= primeiroDiaMesStr && a.status === "realizado"
    ).length
    const faturamentoMensal = sessoesRealizadasMes * 70 + 8450 // Base + realizadas

    const isLoading = loadingAgendamentos || loadingClientes || loadingPacotes

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-xl">☀️</span>
                    </div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral do seu studio de bronzeamento
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <span>📅</span> Agendamentos Hoje
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-amber-600">
                            {agendamentosHoje.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {agendamentosHoje.filter(a => a.status === "confirmado").length} confirmados
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <span>👥</span> Clientes Ativos
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-orange-600">
                            {clientesAtivos.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {clientes.length} total cadastrados
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <span>🌟</span> Sessões Semana
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-yellow-600">
                            {sessoesEstaSemana.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Meta: 80 sessões</p>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <span>💰</span> Faturamento
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-green-600">
                            {formatarMoeda(faturamentoMensal)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">+18% vs mês anterior</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/agendamentos">
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
                                <span className="text-2xl">📅</span>
                            </div>
                            <CardTitle>Novo Agendamento</CardTitle>
                            <CardDescription>
                                Agende uma nova sessão de bronzeamento
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                                Agendar
                            </Button>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/clientes">
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-2">
                                <span className="text-2xl">👥</span>
                            </div>
                            <CardTitle>Novo Cliente</CardTitle>
                            <CardDescription>
                                Cadastre um novo cliente no sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950">
                                Cadastrar
                            </Button>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/relatorios">
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-2">
                                <span className="text-2xl">📊</span>
                            </div>
                            <CardTitle>Relatórios</CardTitle>
                            <CardDescription>
                                Visualize relatórios e métricas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950">
                                Ver Relatórios
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Today's Schedule */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Agenda de Hoje</h2>
                    <Link href="/dashboard/agendamentos">
                        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                            Ver todos →
                        </Button>
                    </Link>
                </div>
                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                    <CardContent className="p-0">
                        {agendamentosHoje.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <span className="text-4xl mb-4 block">📅</span>
                                <p>Nenhum agendamento para hoje</p>
                                <Link href="/dashboard/agendamentos">
                                    <Button className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                                        Criar Agendamento
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-amber-100 dark:divide-amber-900">
                                {agendamentosHoje
                                    .sort((a, b) => a.horario.localeCompare(b.horario))
                                    .map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-4 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-mono font-medium text-amber-600 w-14">
                                                    {appointment.horario}
                                                </span>
                                                <div>
                                                    <p className="font-medium">{appointment.clienteNome}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {getTipoLabel(appointment.tipo)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(appointment.status)}>
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Pacotes Populares */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Pacotes Disponíveis</h2>
                    <Link href="/dashboard/pacotes">
                        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                            Gerenciar →
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pacotes.filter(p => p.ativo).slice(0, 4).map((pacote) => (
                        <Card key={pacote.id} className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{pacote.nome}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {pacote.descricao}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {formatarMoeda(pacote.preco)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {pacote.sessoes} sessões
                                        </p>
                                    </div>
                                    <Badge variant="amber">{pacote.tipo}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
