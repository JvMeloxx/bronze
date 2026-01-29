"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-xl">☀️</span>
                    </div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Header */}
            <header className="border-b border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <span className="text-white text-xl">☀️</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                SunSync
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                Olá, <span className="font-medium text-foreground">{user?.name}</span>
                            </span>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950"
                            >
                                Sair
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Bem-vindo ao Dashboard</h1>
                    <p className="text-muted-foreground">
                        Gerencie seu studio de bronzeamento de forma simples e eficiente.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription>Agendamentos Hoje</CardDescription>
                            <CardTitle className="text-3xl font-bold text-amber-600">12</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">+3 comparado a ontem</p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription>Clientes Ativos</CardDescription>
                            <CardTitle className="text-3xl font-bold text-orange-600">148</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">+12 este mês</p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription>Sessões esta Semana</CardDescription>
                            <CardTitle className="text-3xl font-bold text-yellow-600">67</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Meta: 80 sessões</p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription>Faturamento Mensal</CardDescription>
                            <CardTitle className="text-3xl font-bold text-green-600">R$ 8.450</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">+18% vs mês anterior</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
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

                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
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

                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
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
                </div>

                {/* Today's Schedule */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Agenda de Hoje</h2>
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                        <CardContent className="p-0">
                            <div className="divide-y divide-amber-100 dark:divide-amber-900">
                                {[
                                    { time: "09:00", client: "Maria Silva", type: "Bronzeamento Natural", status: "confirmado" },
                                    { time: "10:30", client: "Ana Costa", type: "Bronzeamento Spray", status: "confirmado" },
                                    { time: "14:00", client: "Paula Santos", type: "Bronzeamento Natural", status: "pendente" },
                                    { time: "15:30", client: "Carla Oliveira", type: "Manutenção", status: "confirmado" },
                                    { time: "17:00", client: "Fernanda Lima", type: "Bronzeamento Spray", status: "confirmado" },
                                ].map((appointment, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-mono font-medium text-amber-600">{appointment.time}</span>
                                            <div>
                                                <p className="font-medium">{appointment.client}</p>
                                                <p className="text-sm text-muted-foreground">{appointment.type}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === "confirmado"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            }`}>
                                            {appointment.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
