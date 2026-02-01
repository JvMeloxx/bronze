"use client"

import { Suspense, useState, useEffect } from "react"
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

interface PixConfig {
    pixEnabled: boolean
    pixKey: string
    pixKeyType: "telefone" | "cpf" | "email" | "aleatoria"
    establishmentName: string
    signalPercentage: number
    sessionBaseValue: number
    paymentPolicy: string
}

function SucessoContent() {
    const searchParams = useSearchParams()
    const data = searchParams.get("data") || ""
    const horario = searchParams.get("horario") || ""
    const nome = searchParams.get("nome") || ""

    const [pixConfig, setPixConfig] = useState<PixConfig | null>(null)
    const [copied, setCopied] = useState(false)
    const [showPolicy, setShowPolicy] = useState(false)

    // Carregar configurações PIX do localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem("sunsync_config")
        if (savedConfig) {
            const config = JSON.parse(savedConfig)
            if (config.pixEnabled && config.pixKey) {
                setPixConfig({
                    pixEnabled: config.pixEnabled,
                    pixKey: config.pixKey,
                    pixKeyType: config.pixKeyType || "telefone",
                    establishmentName: config.establishmentName || "Studio",
                    signalPercentage: config.signalPercentage || 50,
                    sessionBaseValue: config.sessionBaseValue || 120,
                    paymentPolicy: config.paymentPolicy || "",
                })
            }
        }
    }, [])

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

    const getKeyTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            telefone: "Telefone",
            cpf: "CPF",
            email: "Email",
            aleatoria: "Chave Aleatória"
        }
        return labels[type] || type
    }

    const handleCopyPix = async () => {
        if (pixConfig?.pixKey) {
            await navigator.clipboard.writeText(pixConfig.pixKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        }
    }

    const signalValue = pixConfig
        ? (pixConfig.sessionBaseValue * pixConfig.signalPercentage) / 100
        : 0

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

                    {/* PIX Payment Section */}
                    {pixConfig && pixConfig.pixEnabled && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 space-y-4">
                            {/* Warning Banner */}
                            <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                                    ⚠️ IMPORTANTE
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Para confirmar o agendamento é necessário enviar um sinal de {pixConfig.signalPercentage}%.
                                    Favor enviar o comprovante no WhatsApp.
                                </p>
                            </div>

                            {/* PIX Key */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-center text-green-700 dark:text-green-300">
                                    💳 Chave para pagamento ({getKeyTypeLabel(pixConfig.pixKeyType)}):
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-3 bg-white dark:bg-zinc-800 rounded-lg border-2 border-green-200 dark:border-green-700 font-mono text-lg text-center select-all">
                                        {pixConfig.pixKey}
                                    </div>
                                    <Button
                                        onClick={handleCopyPix}
                                        className={`px-4 ${copied
                                            ? "bg-green-600 hover:bg-green-600"
                                            : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                            } text-white`}
                                    >
                                        {copied ? "✓ Copiado!" : "📋 Copiar"}
                                    </Button>
                                </div>
                            </div>

                            {/* Signal Value */}
                            <div className="text-center bg-green-100 dark:bg-green-900/50 rounded-lg p-3">
                                <p className="text-sm text-green-700 dark:text-green-300">Valor da antecipação:</p>
                                <p className="text-3xl font-bold text-green-600">
                                    R$ {signalValue.toFixed(2).replace(".", ",")}
                                </p>
                            </div>

                            {/* Disclaimer */}
                            <p className="text-xs text-center text-muted-foreground italic">
                                * Certifique-se de que a chave PIX informada pertence à empresa.
                                A responsabilidade pela veracidade das informações é inteiramente
                                da empresa &ldquo;{pixConfig.establishmentName}&rdquo;.
                            </p>

                            {/* Payment Policy Toggle */}
                            {pixConfig.paymentPolicy && (
                                <div className="border-t border-green-200 dark:border-green-700 pt-3">
                                    <button
                                        onClick={() => setShowPolicy(!showPolicy)}
                                        className="w-full text-sm text-green-600 hover:text-green-700 flex items-center justify-center gap-2"
                                    >
                                        <span>{showPolicy ? "▼" : "▶"}</span>
                                        Política de Pagamento e Cancelamento
                                    </button>
                                    {showPolicy && (
                                        <div className="mt-3 p-3 bg-white/50 dark:bg-zinc-800/50 rounded-lg text-xs text-muted-foreground whitespace-pre-wrap">
                                            {pixConfig.paymentPolicy}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

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
