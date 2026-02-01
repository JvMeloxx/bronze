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
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
    const router = useRouter()
    const { signIn, signUp, isLoading: authLoading } = useAuth()

    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)

        if (!email || !password) {
            setError("Preencha todos os campos")
            setLoading(false)
            return
        }

        if (!isLogin && password !== confirmPassword) {
            setError("As senhas não coincidem")
            setLoading(false)
            return
        }

        if (!isLogin && password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres")
            setLoading(false)
            return
        }

        try {
            if (isLogin) {
                const { error } = await signIn(email, password)
                if (error) {
                    if (error.message.includes("Invalid login")) {
                        setError("Email ou senha incorretos")
                    } else {
                        setError(error.message)
                    }
                } else {
                    router.push("/dashboard")
                }
            } else {
                const { error } = await signUp(email, password)
                if (error) {
                    if (error.message.includes("already registered")) {
                        setError("Este email já está cadastrado")
                    } else {
                        setError(error.message)
                    }
                } else {
                    setSuccess("Conta criada! Verifique seu email para confirmar.")
                }
            }
        } catch {
            setError("Erro ao processar. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
            <Card className="w-full max-w-md border-amber-200 dark:border-amber-800 shadow-xl">
                <CardHeader className="text-center">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <span className="text-white text-2xl">☀️</span>
                        </div>
                    </Link>
                    <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {isLogin ? "Entrar no SunSync" : "Criar Conta"}
                    </CardTitle>
                    <CardDescription>
                        {isLogin
                            ? "Acesse o painel do seu studio"
                            : "Crie sua conta para começar"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                                ❌ {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm">
                                ✅ {success}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-amber-200 dark:border-amber-800"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-amber-200 dark:border-amber-800"
                                disabled={loading}
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="border-amber-200 dark:border-amber-800"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            disabled={loading}
                        >
                            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError("")
                                setSuccess("")
                            }}
                            className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
                        >
                            {isLogin
                                ? "Não tem conta? Criar agora"
                                : "Já tem conta? Fazer login"}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <Link
                            href="/"
                            className="text-sm text-muted-foreground hover:text-amber-600"
                        >
                            ← Voltar para o site
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
