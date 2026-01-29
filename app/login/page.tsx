"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        if (!email || !password) {
            setError("Preencha todos os campos")
            setIsSubmitting(false)
            return
        }

        const success = await login(email, password)

        if (success) {
            router.push("/dashboard")
        } else {
            setError("Email ou senha inválidos")
        }

        setIsSubmitting(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
            <Card className="w-full max-w-sm border-amber-200 dark:border-amber-800 shadow-lg shadow-amber-500/10">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <span className="text-white text-sm">☀️</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                SunSync
                            </span>
                        </div>
                        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
                        <CardDescription>
                            Digite seu email e senha para acessar o sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">Demo:</p>
                            <p>Email: <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">admin@sunsync.com</code></p>
                            <p>Senha: <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">admin123</code></p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Entrando..." : "Acessar"}
                        </Button>
                        <Link href="/" className="text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                            ← Voltar para o início
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
