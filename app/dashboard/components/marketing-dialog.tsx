
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getAvailabilityForRange } from "@/lib/availability"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/toast"
import { Loader2, Copy, Share2 } from "lucide-react"

export function MarketingDialog() {
    const { studio } = useAuth()
    const { addToast } = useToast()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)

    // Date Selection
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
        from: new Date(),
        to: addDays(new Date(), 1) // Default: Today and Tomorrow
    })

    // Generating State
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedText, setGeneratedText] = useState("")

    const handleGenerate = async () => {
        if (!studio?.id || !dateRange?.from) return

        setIsGenerating(true)
        try {
            const endDate = dateRange.to || dateRange.from
            const results = await getAvailabilityForRange(studio.id, dateRange.from, endDate)

            // Format Text
            const lines = []
            lines.push(`✨ *HORÁRIOS DISPONÍVEIS* ✨`)
            lines.push("")

            if (results.length === 0) {
                setGeneratedText("Nenhum horário disponível encontrado para este período.")
                setStep(2)
                return
            }

            results.forEach(day => {
                const dateObj = new Date(day.date + "T00:00:00")
                const dateFormatted = format(dateObj, "dd/MM (EEEE)", { locale: ptBR })

                lines.push(`📅 *${dateFormatted}*:`)

                // Group by Period (Morning/Afternoon) could be nice, but simple list is safer
                const times = day.slots.map(s => {
                    if (s.available === 1) return `${s.time} (Última vaga!)`
                    return `${s.time}`
                })

                lines.push(`👉 ${times.join(", ")}`)
                lines.push("")
            })

            lines.push("------------------------------")
            lines.push("Agende agora pelo link:")
            lines.push(`https://sunsync.site/${studio.slug}`)

            setGeneratedText(lines.join("\n"))
            setStep(2)

        } catch (error) {
            console.error(error)
            addToast({ title: "Erro", description: "Falha ao gerar horários", variant: "destructive" })
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedText)
        addToast({ title: "Copiado!", description: "Texto pronto para colar no Instagram/WhatsApp" })
    }

    const openWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(generatedText)}`
        window.open(url, '_blank')
    }

    const reset = () => {
        setStep(1)
        setGeneratedText("")
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) reset() }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 hover:from-pink-600 hover:to-rose-600">
                    📢 Divulgar Horários
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gerador de Marketing</DialogTitle>
                    <DialogDescription>
                        Gere uma lista formatada dos seus horários livres para postar nas redes sociais.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Selecione o período</Label>
                            <div className="border rounded-md p-4 flex justify-center">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range: any) => setDateRange(range)}
                                    className="rounded-md border shadow"
                                    locale={ptBR}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Selecione um dia único ou arraste para escolher um intervalo.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Texto Gerado</Label>
                            <Textarea
                                value={generatedText}
                                readOnly
                                className="h-[300px] font-mono text-sm bg-muted/50"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="flex gap-2 sm:justify-between">
                    {step === 1 ? (
                        <div className="flex w-full justify-end">
                            <Button onClick={handleGenerate} disabled={!dateRange?.from || isGenerating} className="w-full sm:w-auto">
                                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</> : "Gerar Texto ✨"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button variant="ghost" onClick={reset}>
                                ← Voltar
                            </Button>
                            <div className="flex gap-2 flex-1 justify-end">
                                <Button variant="outline" onClick={openWhatsApp}>
                                    <Share2 className="mr-2 h-4 w-4" /> WhatsApp
                                </Button>
                                <Button onClick={copyToClipboard}>
                                    <Copy className="mr-2 h-4 w-4" /> Copiar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
