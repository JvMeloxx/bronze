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
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getWeatherForecast, getUVColor, getUVDescription, WeatherDay } from "@/lib/weather"
import { enviarNotificacaoNovoPedido, enviarConfirmacaoAgendamento } from "@/lib/zapi"

// Tipos para configurações
interface StudioConfig {
    ownerPhone: string
    notificationsEnabled: boolean
    sendToOwnerOnBooking: boolean
    sendToClientOnBooking: boolean
    sendReminderToClient: boolean
    // PIX
    pixEnabled: boolean
    pixKey: string
    pixKeyType: string
    establishmentName: string
    signalPercentage: number
    sessionBaseValue: number
    paymentPolicy: string
}

// Interface para serviços
interface Servico {
    id: string
    nome: string
    descricao: string
    preco: number
    duracao: string
    ativo: boolean
}

export default function AgendarPage() {
    const [step, setStep] = useState(1)
    const [weather, setWeather] = useState<WeatherDay[]>([])
    const [loadingWeather, setLoadingWeather] = useState(true)
    const [submitting, setSubmitting] = useState(false)

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

    // Fetch weather on mount
    useEffect(() => {
        async function loadWeather() {
            setLoadingWeather(true)
            const forecast = await getWeatherForecast()
            setWeather(forecast)
            setLoadingWeather(false)
        }
        loadWeather()
    }, [])

    // Horários disponíveis (9h às 17h)
    const horarios = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
    ]

    // Serviços - carregar do localStorage ou usar padrão
    const [servicos, setServicos] = useState<Servico[]>([
        { id: "natural", nome: "Bronzeamento Natural", descricao: "", preco: 60, duracao: "30-45 min", ativo: true },
        { id: "cabine", nome: "Bronze na Cabine", descricao: "", preco: 80, duracao: "20-30 min", ativo: true },
    ])

    // Carregar serviços do localStorage
    useEffect(() => {
        const savedServicos = localStorage.getItem("sunsync_servicos")
        if (savedServicos) {
            const parsed = JSON.parse(savedServicos)
            const ativos = parsed.filter((s: Servico) => s.ativo)
            if (ativos.length > 0) {
                setServicos(ativos)
            }
        }
    }, [])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
    }

    const formatDateBR = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR")
    }

    const handleSubmit = async () => {
        if (!selectedDate || !selectedHorario || !selectedTipo || !formData.nome || !formData.telefone) {
            return
        }

        setSubmitting(true)

        // Buscar configurações do localStorage
        const savedConfig = localStorage.getItem("sunsync_config")
        const config: StudioConfig | null = savedConfig ? JSON.parse(savedConfig) : null

        // Obter nome do serviço
        const servicoNome = servicos.find(s => s.id === selectedTipo)?.nome || selectedTipo
        const dataFormatada = formatDateBR(selectedDate)

        // Salvar no localStorage para simular persistência
        const agendamento = {
            id: Date.now().toString(),
            clienteId: "public-" + Date.now(),
            clienteNome: formData.nome,
            telefone: formData.telefone,
            email: formData.email,
            data: selectedDate,
            horario: selectedHorario,
            tipo: selectedTipo,
            status: "pendente",
            duracao: 30,
            observacoes: formData.observacoes,
            fonte: "website"
        }

        // Salvar no localStorage (ou enviar para API)
        const existingData = localStorage.getItem("sunsync_agendamentos")
        const agendamentos = existingData ? JSON.parse(existingData) : []
        agendamentos.push(agendamento)
        localStorage.setItem("sunsync_agendamentos", JSON.stringify(agendamentos))

        // Enviar notificações WhatsApp
        if (config?.notificationsEnabled) {
            try {
                // Notificar a dona do studio
                if (config.sendToOwnerOnBooking && config.ownerPhone) {
                    await enviarNotificacaoNovoPedido(
                        config.ownerPhone,
                        formData.nome,
                        formData.telefone,
                        dataFormatada,
                        selectedHorario,
                        servicoNome,
                        formData.observacoes || undefined
                    )
                }

                // Confirmar para o cliente
                if (config.sendToClientOnBooking) {
                    await enviarConfirmacaoAgendamento(
                        formData.telefone,
                        formData.nome,
                        dataFormatada,
                        selectedHorario,
                        servicoNome
                    )
                }
            } catch (error) {
                console.error("Erro ao enviar notificação WhatsApp:", error)
                // Não bloquear o fluxo se falhar
            }
        }

        setSubmitting(false)

        // Obter preço do serviço selecionado
        const servicoSelecionado = servicos.find(s => s.id === selectedTipo)
        const precoServico = servicoSelecionado?.preco || 0

        // Construir URL com dados PIX se habilitado
        let successUrl = `/agendar/sucesso?data=${selectedDate}&horario=${selectedHorario}&nome=${encodeURIComponent(formData.nome)}&servico=${encodeURIComponent(servicoSelecionado?.nome || '')}&preco=${precoServico}`

        // Adicionar dados PIX se configurado
        if (config?.pixEnabled && config?.pixKey) {
            successUrl += `&pixEnabled=true`
            successUrl += `&pixKey=${encodeURIComponent(config.pixKey)}`
            successUrl += `&pixKeyType=${config.pixKeyType}`
            successUrl += `&establishmentName=${encodeURIComponent(config.establishmentName || 'Studio')}`
            successUrl += `&signalPercentage=${config.signalPercentage || 50}`
            successUrl += `&ownerPhone=${encodeURIComponent(config.ownerPhone || '')}`
        }

        // Redirecionar para página de sucesso
        window.location.href = successUrl
    }


    const selectedWeather = weather.find(w => w.date === selectedDate)

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
                            SunSync
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

                {/* Step Headers */}
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

                {/* Step 1: Select Date */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {loadingWeather ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-32 rounded-xl bg-gray-100 dark:bg-zinc-800 animate-pulse"
                                    />
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

                        {/* Weather Details */}
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

                        {/* Services */}
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
                                                    ⏱️ {servico.duracao}
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

                {/* Step 3: Personal Info */}
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
                                            {servicos.find(s => s.id === selectedTipo)?.nome}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold font-mono text-amber-600">{selectedHorario}</p>
                                        <p className="text-sm font-medium">R$ {(servicos.find(s => s.id === selectedTipo)?.preco || 0).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form */}
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome Completo *</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Seu nome"
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
                                        placeholder="(11) 99999-9999"
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
                                        placeholder="seu@email.com"
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
                                        Agendando...
                                    </>
                                ) : (
                                    "Confirmar Agendamento ✓"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 mt-8 border-t border-amber-200 dark:border-amber-800 text-center">
                <p className="text-sm text-muted-foreground">
                    © 2026 SunSync. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    )
}
