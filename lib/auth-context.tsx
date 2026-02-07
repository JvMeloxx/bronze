"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import { User, Session } from "@supabase/supabase-js"

interface Studio {
    id: string
    email: string
    nome_estudio: string
    telefone: string
    plano: "basico" | "profissional"
    ativo: boolean
    drive_artes_link: string
    pix_enabled: boolean
    pix_key: string
    pix_key_type: string
    establishment_name: string
    signal_percentage: number
    payment_policy: string
    notifications_enabled: boolean
    owner_phone: string
    slug: string
}

interface AuthContextType {
    user: User | null
    session: Session | null
    studio: Studio | null
    isLoading: boolean
    isAdmin: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error: Error | null }>
    updatePassword: (password: string) => Promise<{ error: Error | null }>
    refreshStudio: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [studio, setStudio] = useState<Studio | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "oojoaovictoroo76@gmail.com")
        .split(",")
        .map(email => email.trim())

    const isAdmin = user?.email ? adminEmails.includes(user.email) : false

    // Buscar dados do studio
    const fetchStudio = async (userId: string) => {
        const { data, error } = await supabase
            .from("studios")
            .select("*")
            .eq("user_id", userId)
            .single()

        if (error) {
            console.error("Erro ao buscar studio:", error)
            return null
        }
        return data as Studio
    }

    const refreshStudio = async () => {
        if (user) {
            const studioData = await fetchStudio(user.id)
            setStudio(studioData)
        }
    }

    useEffect(() => {
        // Verificar sessão atual
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) {
                    const [studioData] = await Promise.all([
                        fetchStudio(session.user.id)
                    ])

                    setSession(session)
                    setUser(session.user)
                    setStudio(studioData)
                } else {
                    setSession(null)
                    setUser(null)
                    setStudio(null)
                }
            } catch (error) {
                console.error("Erro na inicialização da auth:", error)
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()

        // Listener para mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    const studioData = await fetchStudio(session.user.id)
                    setStudio(studioData)
                } else {
                    setStudio(null)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { error }
    }

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })
        return { error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setStudio(null)
    }

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login/redefinir-senha`,
        })
        return { error }
    }

    const updatePassword = async (password: string) => {
        const { error } = await supabase.auth.updateUser({ password })
        return { error }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                studio,
                isLoading,
                isAdmin,
                signIn,
                signUp,
                signOut,
                resetPassword,
                updatePassword,
                refreshStudio,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
