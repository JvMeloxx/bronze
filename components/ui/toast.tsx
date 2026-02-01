"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface Toast {
    id: string
    title?: string
    description?: string
    variant?: "default" | "success" | "destructive"
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, "id">) => void
    removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts(prev => [...prev, { ...toast, id }])

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}

function ToastContainer() {
    const context = React.useContext(ToastContext)
    if (!context) return null

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            {context.toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
                        toast.variant === "destructive" && "border-red-500 bg-red-50 dark:bg-red-950",
                        toast.variant === "success" && "border-green-500 bg-green-50 dark:bg-green-950",
                        (!toast.variant || toast.variant === "default") && "border-amber-200 bg-white dark:bg-zinc-900"
                    )}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            {toast.title && (
                                <p className={cn(
                                    "font-semibold text-sm",
                                    toast.variant === "destructive" && "text-red-700 dark:text-red-400",
                                    toast.variant === "success" && "text-green-700 dark:text-green-400"
                                )}>
                                    {toast.title}
                                </p>
                            )}
                            {toast.description && (
                                <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => context.removeToast(toast.id)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export { ToastContainer }
