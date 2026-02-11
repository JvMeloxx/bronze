"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
import { getWeatherForecast, getUVColor, getUVDescription, WeatherDay } from "@/lib/weather"
import { enviarNotificacaoReagendamentoDona, enviarConfirmacaoReagendamentoCliente } from "@/lib/zapi"
import { createClient } from "@/lib/supabase"
import { Servico, Agendamento } from "@/lib/hooks-supabase"

// Tipos auxiliares (reusados da página principal por enquanto, idealmente estariam num types.ts)

interface StudioPublicConfig {
    id: string
    nome_estudio: string
    telefone: string
    notifications_enabled: boolean
    owner_phone: string
    horarios_funcionamento: string[] | Record<string, string[]>
}

export default function RemarcarPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Dados do Agendamento Atual
    const [originalAgendamento, setOriginalAgendamento] = useState<Agendamento | null>(null)
    const [studio, setStudio] = useState<StudioPublicConfig | null>(null)
    const [servicoDetalhes, setServicoDetalhes] = useState<Servico | null>(null)

    // Novo Agendamento State
    const [step, setStep] = useState(1)
    const [weather, setWeather] = useState<WeatherDay[]>([])
    const [loadingWeather, setLoadingWeather] = useState(true)
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedHorario, setSelectedHorario] = useState("")
    const [availability, setAvailability] = useState<string[]>([])

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ""
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
    }

    const formatDateBR = (dateStr: string) => {
        if (!dateStr) return ""
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR")
    }

    // 1. Carregar Dados Iniciais
    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                // Carregar Clima
                const forecast = await getWeatherForecast()
                setWeather(forecast)
                setLoadingWeather(false)

                // Carregar Agendamento
                const { data: agendamento, error: agendamentoError } = await supabase
                    .from("agendamentos")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (agendamentoError || !agendamento) {
                    setError("Agendamento não encontrado.")
                    setLoading(false)
                    return
                }

                setOriginalAgendamento(agendamento)

                // Carregar Studio
                const { data: studioData, error: studioError } = await supabase
                    .from("studios")
                    .select("*") // Pegar tudo para ter horarios_funcionamento
                    .eq("id", agendamento.studio_id)
                    .single()

                if (!studioError && studioData) {
                    setStudio(studioData)
                }

                // Carregar Serviço (se tiver ID)
                if (agendamento.servico_id) {
                    const { data: servicoData } = await supabase
                        .from("servicos")
                        .select("*")
                        .eq("id", agendamento.servico_id)
                        .single()

                    if (servicoData) setServicoDetalhes(servicoData)
                }

            } catch (err) {
                console.error("Erro ao carregar dados:", err)
                setError("Erro ao carregar informações.")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            loadData()
        }
    }, [id, supabase])

    // Calcular horários disponíveis quando data/serviço/studio mudam
    useEffect(() => {
        if (!selectedDate || !studio) return

        const getHorarios = () => {
            // Descobrir dia da semana
            const date = new Date(selectedDate + "T00:00:00")
            const dayOfWeek = date.getDay()
            const mapDays = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
            const key = mapDays[dayOfWeek]

            // 1. Verificar se o serviço tem horário específico
            if (servicoDetalhes?.horarios && servicoDetalhes.horarios[key]) {
                const horariosServico = servicoDetalhes.horarios[key]
                if (Array.isArray(horariosServico)) {
                    return horariosServico.sort()
                }
            }

            // 2. Fallback: Horário geral do estúdio
            if (studio.horarios_funcionamento) {
                if (Array.isArray(studio.horarios_funcionamento)) {
                    return studio.horarios_funcionamento
                }
                // Se for objeto
                const horariosStudio = (studio.horarios_funcionamento as Record<string, string[]>)[key]
                return horariosStudio || []
            }

            return []
        }

        const horariosDisponiveis = getHorarios()
        setAvailability(horariosDisponiveis)
        setSelectedHorario("") // Limpar seleção anterior

    }, [selectedDate, studio, servicoDetalhes])

    const handleReschedule = async () => {
        if (!originalAgendamento || !studio || !selectedDate || !selectedHorario) return

        setSubmitting(true)

        try {
            const novaDataFormatada = formatDateBR(selectedDate)
            const antigaDataFormatada = formatDateBR(originalAgendamento.data)

            // 1. Atualizar no Banco
            const { error: updateError } = await supabase
                .from("agendamentos")
                .update({
                    data: selectedDate,
                    horario: selectedHorario,
                    status: "confirmado" // Assume confirmado ao reagendar
                })
                .eq("id", id)

            if (updateError) throw updateError

            // 2. Notificações WhatsApp
            if (studio.notifications_enabled) {
                // Notificar Dona (NOVO)
                if (studio.owner_phone) {
                    await enviarNotificacaoReagendamentoDona(
                        studio.owner_phone,
                        originalAgendamento.cliente_nome,
                        originalAgendamento.telefone,
                        antigaDataFormatada,
                        originalAgendamento.horario,
                        novaDataFormatada,
                        selectedHorario,
                        originalAgendamento.servico_nome
                    ).catch(console.error)
                }

                // Notificar Cliente (Confirmação)
                await enviarConfirmacaoReagendamentoCliente(
                    originalAgendamento.telefone,
                    originalAgendamento.cliente_nome,
                    novaDataFormatada,
                    selectedHorario,
                    originalAgendamento.servico_nome,
                    studio.nome_estudio // Nome do estúdio para identificação
                ).catch(console.error)
            }

            // 3. Sucesso UI
            alert("Agendamento reagendado com sucesso!")
            router.push("/")

        } catch (err) {
            console.error("Erro ao reagendar:", err)
            alert("Erro ao realizar o reagendamento. Tente novamente.")
        } finally {
            setSubmitting(false)
        }
    }

    const selectedWeather = weather.find(w => w.date === selectedDate)

    // Preço Dinâmico
    const getPrecoDisplay = () => {
        if (!servicoDetalhes || !selectedDate) return null

        let preco = servicoDetalhes.preco

        // Verificar preço por dia
        if (servicoDetalhes.precos_por_dia) {
            const date = new Date(selectedDate + "T00:00:00")
            const mapDays = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
            const key = mapDays[date.getDay()]
            if (servicoDetalhes.precos_por_dia[key]) {
                preco = servicoDetalhes.precos_por_dia[key]
            }
        }

        return preco
    }

    const precoAtual = getPrecoDisplay()
    const diffPreco = precoAtual !== null && servicoDetalhes && precoAtual !== servicoDetalhes.preco

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="h-10 w-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
            </div>
        )
    }

    if (error || !originalAgendamento) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-red-500 text-xl font-bold mb-2">Opz!</div>
                <p className="text-gray-600">{error || "Agendamento inválido."}</p>
                <Link href="/">
                    <Button variant="link" className="mt-4">Voltar para Início</Button>
                </Link>
            </div>
        )
    }

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

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Reagendar Horário 🔄</h1>
                    <p className="text-muted-foreground">
                        Atual: <strong>{formatDateBR(originalAgendamento.data)}</strong> às <strong>{originalAgendamento.horario}</strong>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{originalAgendamento.servico_nome}</p>
                </div>

                {/* Step 1: Select Date */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h2 className="text-xl font-semibold mb-4">1. Escolha a Nova Data</h2>

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

                        {selectedDate && (
                            <div className="flex justify-end mt-4">
                                <Button
                                    onClick={() => setStep(2)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    Escolher Horário →
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Select Time & Confirm */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h2 className="text-xl font-semibold mb-4">2. Escolha o Novo Horário</h2>

                        {/* Weather & Price Summary */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6">
                            <span className="text-3xl">{selectedWeather ? selectedWeather.icon : "📅"}</span>
                            <div className="flex-1">
                                <p className="font-medium">{formatDate(selectedDate)}</p>
                                {selectedWeather && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedWeather.description} • {selectedWeather.tempMax}°C
                                    </p>
                                )}
                            </div>
                            {precoAtual !== null && (
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Valor Estimado</p>
                                    <p className="font-bold text-amber-600">R$ {precoAtual.toFixed(2).replace('.', ',')}</p>
                                    {diffPreco && (
                                        <p className="text-[10px] text-orange-600">Preço diferenciado!</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {availability.length > 0 ? (
                                availability.map((h) => (
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
                                ))
                            ) : (
                                <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg text-gray-500">
                                    Não há horários disponíveis para esta data.
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between mt-8">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                ← Voltar
                            </Button>
                            <Button
                                size="lg"
                                disabled={!selectedHorario || submitting}
                                onClick={handleReschedule}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            >
                                {submitting ? "Reagendando..." : "Confirmar Reagendamento ✓"}
                            </Button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}
