"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface NavItem {
    label: string
    href: string
    icon: string
    isPro?: boolean
}

const baseNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Agendamentos", href: "/dashboard/agendamentos", icon: "📅" },
    { label: "Clientes", href: "/dashboard/clientes", icon: "👥" },
    { label: "Serviços", href: "/dashboard/servicos", icon: "💆" },
    { label: "Artes", href: "/dashboard/artes", icon: "🎨", isPro: true },
    { label: "Relatórios", href: "/dashboard/relatorios", icon: "📈" },
    { label: "Configurações", href: "/dashboard/configuracoes", icon: "⚙️" },
]


export function Sidebar() {
    const pathname = usePathname()
    const { studio } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Usar dados do banco (studio) ou fallback para localStorage para compatibilidade
    const driveLink = studio?.drive_artes_link || null
    const isPro = studio?.plano === "profissional" || !!driveLink

    // Filtra a aba Artes se não tiver acesso PRO
    const navItems = baseNavItems.filter(item => {
        if (item.isPro && !isPro) return false
        return true
    })

    if (!mounted) return null

    return (
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
            <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-zinc-900 overflow-y-auto border-r border-amber-200 dark:border-amber-800">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0 px-4 mb-6">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <span className="text-white text-xl">☀️</span>
                    </div>
                    <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        SunSync
                    </span>
                    {isPro && (
                        <span className="ml-2 text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                            PRO
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 border-l-4 border-amber-500"
                                        : "text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600",
                                    item.isPro && "relative"
                                )}
                            >
                                <span className="mr-3 text-xl">{item.icon}</span>
                                {item.label}
                                {item.isPro && (
                                    <span className="ml-auto text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full">
                                        PRO
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-amber-100 dark:border-amber-900">
                    <p className="text-xs text-muted-foreground text-center">
                        © 2026 SunSync
                    </p>
                </div>
            </div>
        </aside>
    )
}

// Mobile navigation
export function MobileNav() {
    const pathname = usePathname()
    const { studio } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isPro = studio?.plano === "profissional" || !!studio?.drive_artes_link

    const navItems = baseNavItems.filter(item => {
        if (item.isPro && !isPro) return false
        return true
    }).slice(0, 5)

    if (!mounted) return null

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-amber-200 dark:border-amber-800 z-50">
            <div className="flex justify-around py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center py-2 px-3 text-xs transition-colors",
                                isActive
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                            )}
                        >
                            <span className="text-xl mb-1">{item.icon}</span>
                            <span className="truncate">{item.label.split(" ")[0]}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
