"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

function SucessoContent() {
    const searchParams = useSearchParams()
    const data = searchParams.get("data") || ""
    const horario = searchParams.get("horario") || ""
    const nome = searchParams.get("nome") || ""

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ""
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        })
    }

    // Gerar link de compartilhamento
    const shareLink = typeof window !== "undefined"
        ? `${window.location.origin}/agendar`
        : ""

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Agende seu bronzeamento!",
                    text: "Agende seu horário no SunSync - Studio de Bronzeamento",
                    url: shareLink,
                })
            } catch {
                // User cancelled sharing
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareLink)
            alert("Link copiado para a área de transferência!")
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm animate-in zoom-in-95 duration-500">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                            <span className="text-4xl">✓</span>
                        </div>
                    </div>
                    <CardTitle className="text-3xl text-green-600">
                        Agendamento Confirmado!
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {nome && `Obrigado, ${nome.split(" ")[0]}!`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Appointment Details */}
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Seu horário</p>
                        <p className="text-3xl font-bold font-mono text-amber-600 mb-2">{horario}</p>
                        <p className="font-medium">{formatDate(data)}</p>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                            <span>📱</span>
                            Você receberá uma confirmação por WhatsApp
                        </p>
                        <p className="flex items-center gap-2">
                            <span>⏰</span>
                            Chegue com 10 minutos de antecedência
                        </p>
                        <p className="flex items-center gap-2">
                            <span>☀️</span>
                            Evite usar cremes ou perfumes antes da sessão
                        </p>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 text-center">
                        <p className="text-sm font-medium mb-2">Compartilhe com amigos!</p>
                        <div className="bg-white p-4 rounded-lg inline-block mb-2">
                            {/* Simple QR Code placeholder - you can use a library like qrcode.react */}
                            <div className="w-32 h-32 mx-auto flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                                <div className="text-center">
                                    <span className="text-3xl block mb-1">📲</span>
                                    <span className="text-xs text-amber-700">Scan QR</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Escaneie para agendar
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleShare}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            📤 Compartilhar Link
                        </Button>
                        <Link href="/" className="w-full">
                            <Button variant="outline" className="w-full">
                                ← Voltar ao Início
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SucessoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="animate-pulse text-center">
                    <span className="text-4xl">☀️</span>
                    <p className="mt-2 text-muted-foreground">Carregando...</p>
                </div>
            </div>
        }>
            <SucessoContent />
        </Suspense>
    )
}
