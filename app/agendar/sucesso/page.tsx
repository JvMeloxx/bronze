"use client"

import { Suspense, useState } from "react"
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

    // Dados do agendamento
    const data = searchParams.get("data") || ""
    const horario = searchParams.get("horario") || ""
    const nome = searchParams.get("nome") || ""
    const servico = searchParams.get("servico") || ""
    const preco = parseFloat(searchParams.get("preco") || "0")

    // Dados PIX da URL
    const pixEnabled = searchParams.get("pixEnabled") === "true"
    const pixKey = searchParams.get("pixKey") || ""
    const pixKeyType = searchParams.get("pixKeyType") || "telefone"
    const establishmentName = searchParams.get("establishmentName") || "Studio"
    const signalPercentage = parseInt(searchParams.get("signalPercentage") || "50")
    const ownerPhone = searchParams.get("ownerPhone") || ""

    const [copied, setCopied] = useState(false)
    const [showPolicy, setShowPolicy] = useState(false)

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
        if (pixKey) {
            await navigator.clipboard.writeText(pixKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        }
    }

    // Calcular valor do sinal baseado no preço do serviço
    const signalValue = (preco * signalPercentage) / 100

    // Formatar telefone para WhatsApp (remover caracteres não numéricos)
    const formatPhoneForWhatsApp = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '')
        // Adicionar código do Brasil se não tiver
        if (cleaned.length === 11) {
            return `55${cleaned}`
        }
        return cleaned
    }

    const handleConcluir = () => {
        if (ownerPhone) {
            // Abre WhatsApp com a conversa da dona do studio
            const phoneFormatted = formatPhoneForWhatsApp(ownerPhone)
            window.open(`https://wa.me/${phoneFormatted}`, "_blank")
        } else {
            // Fallback: abre WhatsApp geral
            window.open("https://wa.me/", "_blank")
        }
    }

    // Política de pagamento padrão
    const defaultPolicy = `IMPORTANTE: Para confirmar o seu atendimento, é necessário realizar o pagamento de ${signalPercentage}% do valor como sinal no ato do agendamento.

• Caso o sinal não seja feito, o horário será cancelado pelo sistema.
• O sinal é não reembolsável em caso de desistência ou não comparecimento.
• A cliente tem direito a UMA remarcação, desde que avisado com antecedência.
• Após essa remarcação, caso haja nova necessidade de alterar ou cancelar de última hora, será necessário realizar um novo sinal.

Agradeço a compreensão e o respeito pelo meu trabalho e pela agenda. 🤎`

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
                        {servico && (
                            <p className="text-sm text-muted-foreground mt-2">
                                {servico} • R$ {preco.toFixed(2).replace('.', ',')}
                            </p>
                        )}
                    </div>

                    {/* PIX Payment Section */}
                    {pixEnabled && pixKey && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 space-y-4">
                            {/* Warning Banner */}
                            <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                                    ⚠️ IMPORTANTE
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Para confirmar o agendamento é necessário enviar um sinal de {signalPercentage}%.
                                    Favor enviar o comprovante no WhatsApp.
                                </p>
                            </div>

                            {/* PIX Key */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-center text-green-700 dark:text-green-300">
                                    💳 Chave para pagamento ({getKeyTypeLabel(pixKeyType)}):
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-3 bg-white dark:bg-zinc-800 rounded-lg border-2 border-green-200 dark:border-green-700 font-mono text-lg text-center select-all break-all">
                                        {pixKey}
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
                                <p className="text-sm text-green-700 dark:text-green-300">Valor do sinal ({signalPercentage}%):</p>
                                <p className="text-3xl font-bold text-green-600">
                                    R$ {signalValue.toFixed(2).replace(".", ",")}
                                </p>
                            </div>

                            {/* Disclaimer */}
                            <p className="text-xs text-center text-muted-foreground italic">
                                * Certifique-se de que a chave PIX informada pertence à empresa.
                                A responsabilidade pela veracidade das informações é inteiramente
                                da empresa &ldquo;{establishmentName}&rdquo;.
                            </p>

                            {/* Payment Policy Toggle */}
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
                                        {defaultPolicy}
                                    </div>
                                )}
                            </div>
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

                    {/* Botão Concluir - Abre WhatsApp */}
                    <div className="pt-2">
                        <Button
                            onClick={handleConcluir}
                            size="lg"
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-6"
                        >
                            ✓ Concluir
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Clique para abrir o WhatsApp e enviar o comprovante
                        </p>
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
