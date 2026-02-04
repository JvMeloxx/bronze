import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Helper functions (moved from data.ts)
export function formatarData(data: string): string {
    if (!data) return ""
    const date = new Date(data + "T00:00:00")
    if (isNaN(date.getTime())) return data // Fallback se já estiver formatado ou inválido
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

export function getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
        natural: "Bronzeamento Natural",
        spray: "Bronzeamento Spray",
        manutencao: "Manutenção",
        misto: "Misto"
    }
    return labels[tipo] || tipo
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pendente: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        confirmado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        realizado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        cancelado: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    }
    return colors[status] || "bg-gray-100 text-gray-700"
}

export function getTipoPeleLabel(tipo: string): string {
    const labels: Record<string, string> = {
        clara: "Pele Clara",
        media: "Pele Média",
        morena: "Pele Morena",
        negra: "Pele Negra"
    }
    return labels[tipo] || tipo
}
