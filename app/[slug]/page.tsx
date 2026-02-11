"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getWeatherForecast, getUVColor, getUVDescription, WeatherDay } from "@/lib/weather"
import { enviarNotificacaoNovoPedido, enviarConfirmacaoAgendamento, enviarBoasVindas } from "@/lib/zapi"
import { createClient } from "@/lib/supabase"
import { Servico, Cliente } from "@/lib/hooks-supabase"

// Tipos auxiliares
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
    horarios_funcionamento: string[] | Record<string, string[]> // Horários que o estúdio atende
    location_url?: string
    // Flag interna para saber se deve enviar msg
    send_to_owner: boolean
    send_to_client: boolean
    latitude?: number
    longitude?: number
}

export default function AgendarPage() {
    const params = useParams()
    const slug = params.slug as string
    const supabase = createClient()
    const [step, setStep] = useState(1)
    const [weather, setWeather] = useState<WeatherDay[]>([])
    const [loadingWeather, setLoadingWeather] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [viewMode, setViewMode] = useState<"weather" | "calendar">("weather")
    const [currentMonth, setCurrentMonth] = useState(new Date())

    // Dados do Banco
    const [studio, setStudio] = useState<StudioPublicConfig | null>(null)
    const [servicos, setServicos] = useState<Servico[]>([])

    // Form state
    const [selectedCategory, setSelectedCategory] = useState<"natural" | "artificial" | null>(null)
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedHorario, setSelectedHorario] = useState("")
    const [selectedTipo, setSelectedTipo] = useState("")
    const [formData, setFormData] = useState({
        nome: "",
        telefone: "",
        email: "",
        observacoes: "",
    })

    // Disponibilidade por horário: { "09:00": 2, "10:00": 0, ... }
    const [bookingsPerSlot, setBookingsPerSlot] = useState<Record<string, number>>({})
    const [loadingAvailability, setLoadingAvailability] = useState(false)

    // ... (useEffect loadAll remains same) ...
    // NOTE: Re-inserting the useEffect hooks here is redundant if I can just target the state block
    // But replace_file_content replaces a contiguous block. I need to be careful not to delete useEffects if I don't include them.
    // The previous block ended at line 83.
    // I will target lines 70-83 to add user state.
    // Then I will target getHorariosDisponiveis separately.

    // Let's split this into two replacements if possible, or one big one if they are close.
    // They are separated by ~120 lines (useEffect blocks).
    // I'll do state first.


    // Carregar dados: Studio primeiro, depois Clima
    useEffect(() => {
        if (!slug) return

        async function loadAll() {
            setLoadingData(true)
            setLoadingWeather(true)

            try {
                // 1. Buscar Studio
                const { data: currentStudio, error: studioError } = await supabase
                    .from("studios")
                    .select("*")
                    .eq("slug", slug)
                    .eq("ativo", true)
                    .single()

                if (studioError || !currentStudio) {
                    console.error("Erro ao buscar studio:", studioError)
                    setStudio(null)
                    setLoadingData(false)
                    setLoadingWeather(false)
                    return
                }

                // Definir dados do Studio
                setStudio({
                    id: currentStudio.id,
                    nome_estudio: currentStudio.nome_estudio,
                    telefone: currentStudio.telefone,
                    pix_enabled: currentStudio.pix_enabled ?? false,
                    pix_key: currentStudio.pix_key || "",
                    pix_key_type: currentStudio.pix_key_type || "telefone",
                    establishment_name: currentStudio.establishment_name || "SunSync Studio",
                    signal_percentage: currentStudio.signal_percentage || 50,
                    payment_policy: currentStudio.payment_policy || "",
                    notifications_enabled: currentStudio.notifications_enabled ?? false,
                    owner_phone: currentStudio.owner_phone || "",
                    horarios_funcionamento: currentStudio.horarios_funcionamento || [
                        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
                        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
                    ],
                    location_url: currentStudio.location_url,
                    send_to_owner: true,
                    send_to_client: true,
                    latitude: currentStudio.latitude,
                    longitude: currentStudio.longitude
                })

                // 2. Buscar Clima usando a localização do Studio (se houver)
                // Se não tiver lat/long, usa o padrão da função (SP)
                const lat = currentStudio.latitude
                const lng = currentStudio.longitude

                // Dispara busca do clima (sem await para não travar UI se não quiser, mas aqui queremos esperar para mostrar skeleton junto?)
                // Vamos esperar para garantir consistência
                const forecastResult = await getWeatherForecast(lat, lng)
                setWeather(forecastResult)
                setLoadingWeather(false)

                // 3. Buscar serviços em paralelo com Clima (poderia ser, mas vamos sequencial para simplificar o fluxo de dados do studio)
                const { data: servicosData, error: servicosError } = await supabase
                    .from("servicos")
                    .select("*")
                    .eq("studio_id", currentStudio.id)
                    .eq("ativo", true)

                if (!servicosError && servicosData) {
                    setServicos(servicosData)
                }
            } catch (error) {
                console.error("Erro geral:", error)
            } finally {
                setLoadingData(false)
                // setLoadingWeather já foi setado antes
            }
        }
        loadAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug])

    // 3. Carregar disponibilidade quando mudar data ou serviço
    useEffect(() => {
        async function loadAvailability() {
            if (!selectedDate || !selectedTipo || !studio) {
                setBookingsPerSlot({})
                return
            }

            setLoadingAvailability(true)
            try {
                const { data: bookings, error } = await supabase
                    .from("agendamentos")
                    .select("horario")
                    .eq("studio_id", studio.id)
                    .eq("data", selectedDate)
                    .eq("servico_id", selectedTipo)
                    .neq("status", "cancelado")

                if (!error && bookings) {
                    const counts: Record<string, number> = {}
                    bookings.forEach((b: { horario: string }) => {
                        counts[b.horario] = (counts[b.horario] || 0) + 1
                    })
                    setBookingsPerSlot(counts)
                }
            } catch (err) {
                console.error("Erro ao verificar disponibilidade:", err)
            } finally {
                setLoadingAvailability(false)
            }
        }
        loadAvailability()
        // Limpar horário selecionado ao mudar serviço/data
        setSelectedHorario("")
    }, [selectedDate, selectedTipo, studio, supabase])

    // Calcular horários disponíveis com base no dia da semana
    const getHorariosDisponiveis = () => {
        if (!studio?.horarios_funcionamento) return []
        if (!selectedDate) return []

        // Descobrir dia da semana: 0=Domingo, 1=Segunda...
        const date = new Date(selectedDate + "T00:00:00")
        const dayOfWeek = date.getDay()

        const mapDays = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
        const key = mapDays[dayOfWeek]

        // 1. Verificar se o serviço selecionado tem horário específico
        if (selectedTipo) {
            const servico = servicos.find(s => s.id === selectedTipo)
            if (servico?.horarios && servico.horarios[key]) {
                const horariosServico = servico.horarios[key]
                if (Array.isArray(horariosServico) && horariosServico.length > 0) {
                    return horariosServico.sort()
                }
                // Se array vazio, serviço não atende nesse dia. Retorna vazio.
                if (Array.isArray(horariosServico) && horariosServico.length === 0) {
                    return []
                }
            }
        }

        // 2. Fallback: Horário geral do estúdio
        // Se for array simples (legado), retorna ele mesmo
        if (Array.isArray(studio.horarios_funcionamento)) {
            return studio.horarios_funcionamento
        }

        return studio.horarios_funcionamento[key] || []
    }

    const horarios = getHorariosDisponiveis()

    // Verificar se um horário está lotado
    const servicoSelecionadoObj = servicos.find(s => s.id === selectedTipo)
    const capacidadeServico = servicoSelecionadoObj?.capacidade ?? 1

    const isSlotFull = (horario: string) => {
        if (capacidadeServico === 0) return false // 0 = sem limite
        const count = bookingsPerSlot[horario] || 0
        return count >= capacidadeServico
    }

    const getVagasRestantes = (horario: string) => {
        if (capacidadeServico === 0) return null // sem limite
        const count = bookingsPerSlot[horario] || 0
        return Math.max(0, capacidadeServico - count)
    }

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

    const handleSubmit = async () => {
        if (!selectedDate || !selectedHorario || !selectedTipo || !formData.nome || !formData.telefone || !studio) {
            return
        }

        setSubmitting(true)

        try {
            const servicoSelecionado = servicos.find(s => s.id === selectedTipo)
            const servicoNome = servicoSelecionado?.nome || "Serviço"
            const dataFormatada = formatDateBR(selectedDate)
            const telefoneLimpo = formData.telefone.replace(/\D/g, '')

            // 1. Verificar/Criar Cliente
            let clienteId: string

            // Buscar se já existe pelo telefone no mesmo studio
            const { data: existingClients } = await supabase
                .from("clientes")
                .select("id")
                .eq("studio_id", studio.id)
                // Implementação simples de busca, idealmente seria search ou exact match no banco
                // Mas phones podem ter formatações diferentes. Para MVP, vamos tentar match exato ou criar novo.
                // O ideal seria normalizar no banco.
                .textSearch('telefone', telefoneLimpo, { type: 'plain', config: 'english' })
            // A busca acima pode falhar se não tiver índice fulltext. Vamos simplificar:
            // Tenta achar com o número exato digitado

            let existingId = null

            // Tentativa simples de busca
            const { data: searchResult } = await supabase
                .from("clientes")
                .select("id, telefone")
                .eq("studio_id", studio.id)

            // Busca manual no array (não performático para muitos dados, mas ok para MVP)
            if (searchResult) {
                const found = searchResult.find((c: { id: string; telefone: string }) => c.telefone.replace(/\D/g, '') === telefoneLimpo)
                if (found) existingId = found.id
            }

            let isNewClient = false
            if (existingId) {
                clienteId = existingId
            } else {
                // Criar novo cliente
                isNewClient = true
                const { data: newClient, error: createError } = await supabase
                    .from("clientes")
                    .insert({
                        studio_id: studio.id,
                        nome: formData.nome,
                        telefone: formData.telefone,
                        email: formData.email,
                        tipo_pele: "media"
                    })
                    .select()
                    .single()

                if (createError) {
                    throw new Error("Erro ao criar cadastro: " + createError.message)
                }
                clienteId = newClient.id
            }

            // 2. Criar Agendamento
            const { data: booking, error: bookingError } = await supabase
                .from("agendamentos")
                .insert({
                    studio_id: studio.id,
                    cliente_id: clienteId,
                    cliente_nome: formData.nome,
                    telefone: formData.telefone,
                    email: formData.email,
                    data: selectedDate,
                    horario: selectedHorario,
                    servico_id: selectedTipo,
                    servico_nome: servicoNome,
                    status: "pendente",
                    observacoes: formData.observacoes,
                    fonte: "website"
                })
                .select()
                .single()

            if (bookingError) {
                throw new Error("Erro ao criar agendamento: " + bookingError.message)
            }

            // 3. Notificações WhatsApp (Z-API)
            if (studio.notifications_enabled) {
                // Notificar dona
                if (studio.owner_phone) {
                    await enviarNotificacaoNovoPedido(
                        studio.owner_phone,
                        formData.nome,
                        formData.telefone,
                        dataFormatada,
                        selectedHorario,
                        servicoNome,
                        booking.id, // ID para botões de confirmação
                        formData.observacoes
                    ).catch(console.error)
                }

                // Notificar cliente
                await enviarConfirmacaoAgendamento(
                    formData.telefone,
                    formData.nome,
                    dataFormatada,
                    selectedHorario,
                    servicoNome,
                    booking.id, // Passando ID para link de reagendamento
                    slug,
                    studio.telefone, // WhatsApp do estúdio para contato direto
                    studio.nome_estudio, // Nome do estúdio para identificação
                    studio.location_url // Link de localização
                ).catch(console.error)

                // Boas-vindas para cliente novo
                if (isNewClient) {
                    await enviarBoasVindas(
                        formData.telefone,
                        formData.nome
                    ).catch(console.error)
                }
            }

            // 4. Redirecionar Sucesso com Params PIX
            const precoServico = servicoSelecionado?.preco || 0

            let successUrl = `/${slug}/sucesso?data=${selectedDate}&horario=${selectedHorario}&nome=${encodeURIComponent(formData.nome)}&servico=${encodeURIComponent(servicoNome)}&preco=${precoServico}`

            if (studio.pix_enabled && studio.pix_key) {
                successUrl += `&pixEnabled=true`
                successUrl += `&pixKey=${encodeURIComponent(studio.pix_key)}`
                successUrl += `&pixKeyType=${studio.pix_key_type}`
                successUrl += `&establishmentName=${encodeURIComponent(studio.establishment_name)}`
                successUrl += `&signalPercentage=${studio.signal_percentage}`
                successUrl += `&ownerPhone=${encodeURIComponent(studio.owner_phone)}`
            }

            window.location.href = successUrl

        } catch (error) {
            console.error("Erro no processamento:", error)
            alert("Ocorreu um erro ao realizar o agendamento. Por favor, tente novamente.")
        } finally {
            setSubmitting(false)
        }
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
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                                        : "bg-gray-200 dark:bg-zinc-700 text-gray-500"
                                        }`}
                                >
                                    {step > s ? "✓" : s}
                                </div>
                                {s < 4 && (
                                    <div
                                        className={`w-8 sm:w-12 h-1 mx-1 ${step > s ? "bg-amber-500" : "bg-gray-200 dark:bg-zinc-700"
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
                            <h1 className="text-3xl font-bold mb-2">Qual seu objetivo? 🎯</h1>
                            <p className="text-muted-foreground">Escolha o tipo de bronzeamento ideal para você</p>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Escolha a Data 📅</h1>
                            <p className="text-muted-foreground">Veja a previsão e disponibilidade</p>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Escolha o Horário 🕐</h1>
                            <p className="text-muted-foreground">Selecione o serviço e horário desejado</p>
                        </>
                    )}
                    {step === 4 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Seus Dados 📝</h1>
                            <p className="text-muted-foreground">Preencha suas informações para confirmar</p>
                        </>
                    )}
                </div>

                {loadingData && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Weekly Calendar Skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))}
                        </div>

                        {/* Selected Date/Card Skeleton */}
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                )}

                {!loadingData && !studio && (
                    <div className="text-center py-12 bg-red-50 rounded-lg">
                        <p className="text-red-600 font-medium">Não foi possível carregar as informações do studio.</p>
                        <p className="text-sm text-red-500 mt-2">Tente recarregar a página.</p>
                    </div>
                )}

                {!loadingData && studio && (
                    <>
                        {/* Step 1: Select Category */}
                        {step === 1 && (
                            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
                                <button
                                    onClick={() => {
                                        setSelectedCategory("natural")
                                        setStep(2)
                                    }}
                                    className="group relative overflow-hidden rounded-2xl border-2 border-amber-100 dark:border-amber-900 bg-white dark:bg-zinc-900 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-8 text-center"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="h-24 w-24 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-6xl">☀️</span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 text-foreground">Bronze Natural</h3>
                                        <p className="text-muted-foreground">
                                            Realizado com exposição solar, proporcionando um bronzeado dourado e natural.
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedCategory("artificial")
                                        setStep(2)
                                    }}
                                    className="group relative overflow-hidden rounded-2xl border-2 border-amber-100 dark:border-amber-900 bg-white dark:bg-zinc-900 hover:border-violet-500 dark:hover:border-violet-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-8 text-center"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="h-24 w-24 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-6xl">💡</span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 text-foreground">Bronze na Cabine</h3>
                                        <p className="text-muted-foreground">
                                            Bronzeamento artificial em máquina, ideal para dias nublados ou para quem busca praticidade.
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Step 2: Select Date */}
                        {step === 2 && (
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
                                    <div>
                                        <div className="flex justify-center mb-6">
                                            <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg inline-flex">
                                                <button
                                                    onClick={() => setViewMode("weather")}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "weather"
                                                        ? "bg-white dark:bg-zinc-700 shadow text-amber-600"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    ☀️ Previsão (5 dias)
                                                </button>
                                                <button
                                                    onClick={() => setViewMode("calendar")}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "calendar"
                                                        ? "bg-white dark:bg-zinc-700 shadow text-amber-600"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    📅 Calendário Mensal
                                                </button>
                                            </div>
                                        </div>

                                        {viewMode === "weather" ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
                                        ) : (
                                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                                <div className="flex items-center justify-between mb-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newDate = new Date(currentMonth)
                                                            newDate.setMonth(newDate.getMonth() - 1)
                                                            setCurrentMonth(newDate)
                                                        }}
                                                    >
                                                        ←
                                                    </Button>
                                                    <span className="font-bold text-lg capitalize">
                                                        {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newDate = new Date(currentMonth)
                                                            newDate.setMonth(newDate.getMonth() + 1)
                                                            setCurrentMonth(newDate)
                                                        }}
                                                    >
                                                        →
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                                    {["D", "S", "T", "Q", "Q", "S", "S"].map(d => (
                                                        <div key={d} className="text-xs font-bold text-muted-foreground">{d}</div>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {/* Empty slots for start of month */}
                                                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                                                        <div key={`empty-${i}`} />
                                                    ))}
                                                    {/* Days */}
                                                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                        const day = i + 1
                                                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                                                        const dateStr = date.toISOString().split("T")[0]
                                                        const isSelected = selectedDate === dateStr
                                                        const isToday = dateStr === new Date().toISOString().split("T")[0]
                                                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

                                                        return (
                                                            <button
                                                                key={day}
                                                                disabled={isPast}
                                                                onClick={() => setSelectedDate(dateStr)}
                                                                className={`
                                                                h-10 w-full rounded-md flex items-center justify-center text-sm transition-colors
                                                                ${isSelected
                                                                        ? "bg-amber-500 text-white font-bold"
                                                                        : isToday
                                                                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300"
                                                                            : isPast
                                                                                ? "text-gray-300 dark:text-zinc-600 cursor-not-allowed"
                                                                                : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                                    }
                                                            `}
                                                            >
                                                                {day}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
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

                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setStep(1)}>
                                        ← Voltar
                                    </Button>
                                    <Button
                                        size="lg"
                                        disabled={!selectedDate}
                                        onClick={() => setStep(3)}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                    >
                                        Continuar →
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Select Service & Time */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Selected Date Summary */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <span className="text-3xl">{selectedWeather ? selectedWeather.icon : "📅"}</span>
                                    <div>
                                        <p className="font-medium">{formatDate(selectedDate)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedWeather
                                                ? `${selectedWeather.description} • ${selectedWeather.tempMax}°C`
                                                : "Data selecionada"}
                                        </p>
                                    </div>
                                </div>

                                {/* Services */}
                                <div>
                                    <Label className="text-lg mb-3 block">Tipo de Serviço</Label>
                                    {servicos.filter(s => s.categoria === selectedCategory).length > 0 ? (
                                        <div className="grid gap-3">
                                            {servicos
                                                .filter(s => s.categoria === selectedCategory)
                                                .map((servico) => (
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
                                    ) : (
                                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
                                            Nenhum serviço disponível nesta categoria.
                                        </div>
                                    )}
                                </div>

                                {/* Time Slots */}
                                <div>
                                    <Label className="text-lg mb-3 block">Horário</Label>
                                    {loadingAvailability ? (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <div key={i} className="py-3 px-4 rounded-lg bg-gray-100 dark:bg-zinc-800 animate-pulse h-12" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                            {horarios.length > 0 ? (
                                                horarios.map((h) => {
                                                    const full = isSlotFull(h)
                                                    const vagas = getVagasRestantes(h)
                                                    return (
                                                        <button
                                                            key={h}
                                                            onClick={() => !full && setSelectedHorario(h)}
                                                            disabled={full}
                                                            className={`py-3 px-4 rounded-lg font-mono font-medium transition-all relative ${full
                                                                ? "bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 opacity-50 cursor-not-allowed line-through"
                                                                : selectedHorario === h
                                                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                                                                    : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-amber-300"
                                                                }`}
                                                        >
                                                            {h}
                                                            {full && (
                                                                <span className="block text-[10px] text-red-500 font-sans font-normal no-underline" style={{ textDecoration: 'none' }}>Lotado</span>
                                                            )}
                                                            {!full && vagas !== null && capacidadeServico > 1 && (
                                                                <span className={`block text-[10px] font-sans font-normal ${selectedHorario === h ? 'text-white/80' : 'text-green-600 dark:text-green-400'
                                                                    }`}>
                                                                    {vagas} vaga{vagas !== 1 ? 's' : ''}
                                                                </span>
                                                            )}
                                                        </button>
                                                    )
                                                })
                                            ) : (
                                                <p className="text-muted-foreground col-span-full">
                                                    Nenhum horário disponível para esta data{selectedTipo ? " e serviço" : ""}.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setStep(2)}>
                                        ← Voltar
                                    </Button>
                                    <Button
                                        size="lg"
                                        disabled={!selectedTipo || !selectedHorario}
                                        onClick={() => setStep(4)}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                    >
                                        Continuar →
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Personal Info */}
                        {step === 4 && (
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
                                    <Button variant="outline" onClick={() => setStep(3)}>
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
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 mt-8 border-t border-amber-200 dark:border-amber-800 text-center">
                <p className="text-sm text-muted-foreground">
                    © 2026 SunSync. Todos os direitos reservados.
                </p>
            </footer>
        </div >
    )
}
