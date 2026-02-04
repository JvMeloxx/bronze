"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ArtesPage() {
    const [driveLink, setDriveLink] = useState<string | null>(null)
    const [nomeEstudio, setNomeEstudio] = useState<string>("seu studio")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const savedConfig = localStorage.getItem("sunsync_config")
        if (savedConfig) {
            const config = JSON.parse(savedConfig)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDriveLink(config.driveArtesLink || null)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNomeEstudio(config.nomeEstudio || "seu studio")
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false)
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-xl">🎨</span>
                    </div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!driveLink) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-6">
                        <span className="text-white text-4xl">🔒</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Artes para Divulgação</h1>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Esta funcionalidade é exclusiva do <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Plano Profissional</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground mb-8">
                        Entre em contato conosco para upgrade do seu plano e ter acesso a artes personalizadas para seu studio!
                    </p>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        onClick={() => window.open("https://wa.me/5561999999999?text=Olá! Gostaria de fazer upgrade para o Plano Profissional", "_blank")}
                    >
                        ✨ Fazer Upgrade
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold">Artes para Divulgação</h1>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            PRO
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Acesse artes exclusivas personalizadas para {nomeEstudio}
                    </p>
                </div>
            </div>

            {/* Card Principal */}
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <CardHeader className="text-center pb-2">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                        <span className="text-white text-5xl">🎨</span>
                    </div>
                    <CardTitle className="text-2xl">Suas Artes Personalizadas</CardTitle>
                    <CardDescription className="text-base">
                        Preparamos artes exclusivas com a identidade visual do seu studio
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div className="text-center">
                            <div className="text-3xl mb-2">📱</div>
                            <p className="text-sm font-medium">Stories</p>
                            <p className="text-xs text-muted-foreground">Instagram</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">🖼️</div>
                            <p className="text-sm font-medium">Feed</p>
                            <p className="text-xs text-muted-foreground">Posts quadrados</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">📢</div>
                            <p className="text-sm font-medium">Promoções</p>
                            <p className="text-xs text-muted-foreground">Artes especiais</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">✨</div>
                            <p className="text-sm font-medium">Destaques</p>
                            <p className="text-xs text-muted-foreground">Capas personalizadas</p>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 text-lg px-8 py-6"
                        onClick={() => window.open(driveLink, "_blank")}
                    >
                        📂 Acessar Minhas Artes no Google Drive
                    </Button>

                    <p className="text-sm text-muted-foreground">
                        As artes são atualizadas mensalmente com novos templates
                    </p>
                </CardContent>
            </Card>

            {/* Dicas */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="p-4 text-center">
                        <span className="text-2xl block mb-2">💡</span>
                        <p className="text-sm font-medium">Dica 1</p>
                        <p className="text-xs text-muted-foreground">
                            Use as artes de Stories para divulgar horários disponíveis
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="p-4 text-center">
                        <span className="text-2xl block mb-2">📲</span>
                        <p className="text-sm font-medium">Dica 2</p>
                        <p className="text-xs text-muted-foreground">
                            Poste no feed pelo menos 3x por semana para engajamento
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="p-4 text-center">
                        <span className="text-2xl block mb-2">🔄</span>
                        <p className="text-sm font-medium">Dica 3</p>
                        <p className="text-xs text-muted-foreground">
                            Novas artes são adicionadas todo mês, fique de olho!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
