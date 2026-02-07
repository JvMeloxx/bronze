"use client"

import { useState, useEffect } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getWeatherForecast, getUVColor, getUVDescription, WeatherDay } from "@/lib/weather"

// Tipos auxiliares (Mock)
interface StudioPublicConfig {
    id: string
    nome_estudio: string
    telefone: string
    pix_enabled: boolean
    pix_key: string
    pix_key_type: string
    establishment_name: string
    signal_percentage: number
    payment_policy: string
    notifications_enabled: boolean
    owner_phone: string
}

const MOCK_STUDIO: StudioPublicConfig = {
    id: "demo-studio",
    nome_estudio: "SunSync Demo Studio",
    telefone: "(11) 99999-9999",
    pix_enabled: true,
    pix_key: "demo@sunsync.site",
    pix_key_type: "email",
    establishment_name: "SunSync Demo",
    signal_percentage: 50,
    payment_policy: "Sinal de 50% via PIX para confirmar.",
    notifications_enabled: true,
    owner_phone: "5511999999999"
}

const MOCK_SERVICOS = [
    { id: "1", nome: "Bronzeamento Personal", preco: 70.00, duracao: 60, descricao: "Sessão completa com biquíni de fita." },
    { id: "2", nome: "Bronze Flash", preco: 45.00, duracao: 30, descricao: "Sessão rápida para manutenção." },
    { id: "3", nome: "Pacote 3 Sessões", preco: 180.00, duracao: 60, descricao: "Economize garantindo 3 sessões." },
]

export default function DemoPage() {
    const [step, setStep] = useState(1)
    const [weather, setWeather] = useState<WeatherDay[]>([])
    const [loadingWeather, setLoadingWeather] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [loadingData, setLoadingData] = useState(true)

    // Dados Mockados
    const studio = MOCK_STUDIO
    const servicos = MOCK_SERVICOS

    // Form state
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedHorario, setSelectedHorario] = useState("")
    const [selectedTipo, setSelectedTipo] = useState("")
    const [formData, setFormData] = useState({
        nome: "",
        telefone: "",
        email: "",
        observacoes: "",
    })

    // 1. Carregar Previsão
    useEffect(() => {
        async function loadWeather() {
            setLoadingWeather(true)
            const forecast = await getWeatherForecast()
            setWeather(forecast)
            setLoadingWeather(false)
            setLoadingData(false) // Demo carrega rápido
        }
        loadWeather()
    }, [])

    // Horários disponíveis (Mock)
    const horarios = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
    ]

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ""
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
    }

    const handleSubmit = async () => {
        if (!selectedDate || !selectedHorario || !selectedTipo || !formData.nome || !formData.telefone) {
            return
        }

        setSubmitting(true)

        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 2000))

        setSubmitting(false)

        // Sucesso Demo alert
        alert("🎉 Agendamento de DEMONSTRAÇÃO realizado com sucesso!\n\nNo sistema real, você seria redirecionado para o pagamento Pix e receberia a confirmação no WhatsApp.")

        // Reset
        setStep(1)
        setFormData({ nome: "", telefone: "", email: "", observacoes: "" })
        setSelectedDate("")
        setSelectedHorario("")
        setSelectedTipo("")
    }

    const selectedWeather = weather.find(w => w.date === selectedDate)
    const servicoSelecionado = servicos.find(s => s.id === selectedTipo)

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover:animate-pulse transition-all">
                            <span className="text-white text-xl">☀️</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            SunSync <span className="text-xs ml-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">Demo</span>
                        </span>
                    </Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                                        : "bg-gray-200 dark:bg-zinc-700 text-gray-500"
                                        }`}
                                >
                                    {step > s ? "✓" : s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`w-12 h-1 mx-1 ${step > s ? "bg-amber-500" : "bg-gray-200 dark:bg-zinc-700"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Headers - Same as main page */}
                <div className="text-center mb-8">
                    {step === 1 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Escolha a Data ☀️</h1>
                            <p className="text-muted-foreground">Veja a previsão do tempo e escolha o melhor dia</p>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Escolha o Horário 🕐</h1>
                            <p className="text-muted-foreground">Selecione o serviço e horário desejado</p>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Seus Dados 📝</h1>
                            <p className="text-muted-foreground">Preencha suas informações para confirmar</p>
                        </>
                    )}
                </div>

                {/* Content Logic - Simplified for Demo */}

                {/* Step 1: Select Date */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {loadingWeather ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {weather.slice(0, 14).map((day) => (
                                    <button
                                        key={day.date}
                                        onClick={() => setSelectedDate(day.date)}
                                        className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${selectedDate === day.date
                                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                                            : day.isSunny
                                                ? "bg-white dark:bg-zinc-800 border-2 border-amber-300 dark:border-amber-600 hover:border-amber-500"
                                                : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 opacity-80"
                                            }`}
                                    >
                                        <span className="text-xs uppercase block mb-1">
                                            {formatDate(day.date).split(",")[0]}
                                        </span>
                                        <span className="text-4xl block mb-1">{day.icon}</span>
                                        <span className="text-lg font-bold block">
                                            {new Date(day.date + "T00:00:00").getDate()}
                                        </span>
                                        <span className="text-sm block">
                                            {day.tempMax}°/{day.tempMin}°
                                        </span>
                                        {day.isSunny && (
                                            <Badge variant="amber" className="text-xs mt-1">
                                                ☀️ Sol
                                            </Badge>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Weather Details Card - Same as production */}
                        {selectedDate && selectedWeather && (
                            <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="text-3xl">{selectedWeather.icon}</span>
                                        {formatDate(selectedDate)}
                                    </CardTitle>
                                    <CardDescription>{selectedWeather.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold">{selectedWeather.tempMax}°C</p>
                                            <p className="text-xs text-muted-foreground">Máxima</p>
                                        </div>
                                        <div>
                                            <p className={`text-2xl font-bold ${getUVColor(selectedWeather.uvIndex)}`}>
                                                UV {selectedWeather.uvIndex}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {getUVDescription(selectedWeather.uvIndex)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{selectedWeather.precipitation}mm</p>
                                            <p className="text-xs text-muted-foreground">Chuva</p>
                                        </div>
                                    </div>
                                    {selectedWeather.isSunny && (
                                        <div className="mt-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-center">
                                            <span className="text-amber-700 dark:text-amber-300 font-medium">
                                                ☀️ Dia perfeito para bronzeamento natural!
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-end">
                            <Button
                                size="lg"
                                disabled={!selectedDate}
                                onClick={() => setStep(2)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                                Continuar →
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Service & Time */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Selected Date Summary */}
                        {selectedWeather && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <span className="text-3xl">{selectedWeather.icon}</span>
                                <div>
                                    <p className="font-medium">{formatDate(selectedDate)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedWeather.description} • {selectedWeather.tempMax}°C
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Services List */}
                        <div>
                            <Label className="text-lg mb-3 block">Tipo de Serviço</Label>
                            <div className="grid gap-3">
                                {servicos.map((servico) => (
                                    <button
                                        key={servico.id}
                                        onClick={() => setSelectedTipo(servico.id)}
                                        className={`p-4 rounded-xl text-left transition-all ${selectedTipo === servico.id
                                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                                            : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-amber-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-lg">{servico.nome}</p>
                                                <p className={`text-sm ${selectedTipo === servico.id ? "text-white/80" : "text-muted-foreground"}`}>
                                                    ⏱️ {servico.duracao} min
                                                </p>
                                            </div>
                                            <p className="text-xl font-bold">R$ {servico.preco.toFixed(2).replace('.', ',')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div>
                            <Label className="text-lg mb-3 block">Horário</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {horarios.map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => setSelectedHorario(h)}
                                        className={`py-3 px-4 rounded-lg font-mono font-medium transition-all ${selectedHorario === h
                                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                                            : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-amber-300"
                                            }`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                ← Voltar
                            </Button>
                            <Button
                                size="lg"
                                disabled={!selectedTipo || !selectedHorario}
                                onClick={() => setStep(3)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                                Continuar →
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Form */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Summary */}
                        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{selectedWeather?.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-medium">{formatDate(selectedDate)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {servicoSelecionado?.nome}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold font-mono text-amber-600">{selectedHorario}</p>
                                        <p className="text-sm font-medium">R$ {servicoSelecionado?.preco.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Fields */}
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome Completo *</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Nome para simulação"
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="telefone">WhatsApp *</Label>
                                    <Input
                                        id="telefone"
                                        type="tel"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        placeholder="(99) 99999-9999"
                                        className="border-amber-200 dark:border-amber-800"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@exemplo.com"
                                        className="border-amber-200 dark:border-amber-800"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="obs">Observações</Label>
                                <Textarea
                                    id="obs"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    placeholder="Alguma observação especial?"
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                ← Voltar
                            </Button>
                            <Button
                                size="lg"
                                disabled={!formData.nome || !formData.telefone || submitting}
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                                {submitting ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Processando Demo...
                                    </>
                                ) : (
                                    "Confirmar Agendamento (Demo) ✓"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}
