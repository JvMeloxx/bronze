"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Sidebar, MobileNav } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { ToastProvider } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"

function DashboardContent({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, studio, isLoading, signOut } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

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

    if (!user) {
        return null
    }

    const handleLogout = async () => {
        await signOut()
        router.push("/")
    }

    return (
        <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <Sidebar />

                {/* Main content */}
                <div className="md:pl-64 flex flex-col min-h-screen">
                    {/* Top Header */}
                    <header className="sticky top-0 z-20 border-b border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                        <div className="flex items-center justify-between px-4 py-3 md:px-6">
                            {/* Mobile logo */}
                            <div className="md:hidden flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                    <span className="text-white text-sm">☀️</span>
                                </div>
                                <span className="font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    SunSync
                                </span>
                                {studio?.plano === "profissional" && (
                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px]">
                                        PRO
                                    </Badge>
                                )}
                            </div>

                            {/* Spacer for desktop */}
                            <div className="hidden md:block" />

                            {/* User section */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground hidden sm:block">
                                    Olá, <span className="font-medium text-foreground">
                                        {studio?.nome_estudio || user?.email?.split("@")[0] || "Usuário"}
                                    </span>
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950"
                                >
                                    Sair
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
                        {children}
                    </main>
                </div>

                <MobileNav />
            </div>
        </ToastProvider>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <DashboardContent>{children}</DashboardContent>
        </AuthProvider>
    )
}
