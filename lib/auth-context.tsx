"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface User {
    id: string
    name: string
    email: string
    role: "admin" | "user"
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for testing
const DEMO_USERS = [
    {
        id: "1",
        name: "Admin SunSync",
        email: "admin@sunsync.com",
        password: "admin123",
        role: "admin" as const
    },
    {
        id: "2",
        name: "João Victor",
        email: "joao@sunsync.com",
        password: "123456",
        role: "user" as const
    }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for stored session
        const storedUser = localStorage.getItem("sunsync_user")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch {
                localStorage.removeItem("sunsync_user")
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))

        const foundUser = DEMO_USERS.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser
            setUser(userWithoutPassword)
            localStorage.setItem("sunsync_user", JSON.stringify(userWithoutPassword))
            setIsLoading(false)
            return true
        }

        setIsLoading(false)
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("sunsync_user")
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            isAuthenticated: !!user
        }}>
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
