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
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStatsDB, useServicosDB } from "@/lib/hooks-supabase"
import { getStatusColor, formatarMoeda } from "@/lib/utils"

// Componente de Skeleton para os cards de estatísticas
function StatCardSkeleton() {
    return (
        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                </CardDescription>
                <Skeleton className="h-9 w-16 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-20" />
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
    const {
        agendamentosHoje,
        clientesAtivos,
        sessoesEstaSemana,
        faturamentoMensal,
        totalClientes,
        proximosAgendamentos,
        isLoading
    } = useDashboardStatsDB()

    const { servicos, isLoading: isLoadingServicos } = useServicosDB()

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
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <span>📅</span> Agendamentos Hoje
                                </CardDescription>
                                <CardTitle className="text-3xl font-bold text-amber-600">
                                    {agendamentosHoje}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {proximosAgendamentos.filter(a => a.status === "confirmado").length} confirmados
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <span>👥</span> Clientes Ativos
                                </CardDescription>
                                <CardTitle className="text-3xl font-bold text-orange-600">
                                    {clientesAtivos}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {totalClientes} total cadastrados
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <span>🌟</span> Sessões Semana
                                </CardDescription>
                                <CardTitle className="text-3xl font-bold text-yellow-600">
                                    {sessoesEstaSemana}
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
                                <p className="text-sm text-muted-foreground">Mês atual</p>
                            </CardContent>
                        </Card>
                    </>
                )}
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
                        {proximosAgendamentos.length === 0 ? (
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
                                {proximosAgendamentos
                                    .sort((a, b) => a.horario.localeCompare(b.horario))
                                    .map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-4 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-mono font-medium text-amber-600 w-14">
                                                    {appointment.horario}
                                                </span>
                                                <div>
                                                    <p className="font-medium">{appointment.cliente_nome}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {appointment.servico_nome}
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
                    <h2 className="text-xl font-bold">Serviços Disponíveis</h2>
                    <Link href="/dashboard/servicos">
                        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                            Gerenciar →
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {servicos.filter(s => s.ativo).slice(0, 4).map((servico) => (
                        <Card key={servico.id} className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{servico.nome}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {servico.descricao}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {formatarMoeda(servico.preco)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {servico.duracao} min
                                        </p>
                                    </div>
                                    <Badge variant="amber">Serviço</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {servicos.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-amber-200">
                            Nenhum serviço cadastrado
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
