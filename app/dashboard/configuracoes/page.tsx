"use client"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStudioConfig } from "@/lib/hooks-supabase"
import { useToast } from "@/components/ui/toast"

export default function ConfiguracoesPage() {
    const { config, updateConfig, refreshConfig } = useStudioConfig()
    const { addToast } = useToast()

    const [saved, setSaved] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<"success" | "error" | null>(null)

    // Local state for form fields to handle inputs before saving
    // Initialized with empty/default, will populate via useEffect when config loads
    // Lista de todos os horários possíveis
    const ALL_HOURS = [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00'
    ]

    const DAYS_OF_WEEK = [
        { key: 'segunda', label: 'Segunda' },
        { key: 'terca', label: 'Terça' },
        { key: 'quarta', label: 'Quarta' },
        { key: 'quinta', label: 'Quinta' },
        { key: 'sexta', label: 'Sexta' },
        { key: 'sabado', label: 'Sábado' },
        { key: 'domingo', label: 'Domingo' },
    ]

    const [formData, setFormData] = useState({
        owner_phone: "",
        notifications_enabled: true,
        pix_enabled: true,
        pix_key: "",
        pix_key_type: "telefone" as "telefone" | "cpf" | "cnpj" | "email" | "aleatoria",

        establishment_name: "",
        signal_percentage: 50,
        payment_policy: "",
        slug: "",
        horarios_funcionamento: {} as Record<string, string[]>, // Agora é um objeto
        location_url: "",
    })

    // Populate form data when config is loaded
    useEffect(() => {
        if (config) {
            let horarios = {} as Record<string, string[]>

            // Migração: Se vier array (formato antigo), converte para objeto (todos os dias iguais)
            if (Array.isArray(config.horarios_funcionamento)) {
                DAYS_OF_WEEK.forEach(day => {
                    horarios[day.key] = config.horarios_funcionamento as unknown as string[] || []
                })
            } else {
                horarios = config.horarios_funcionamento || {}
            }

            // Garantir que todas as chaves existam
            DAYS_OF_WEEK.forEach(day => {
                if (!horarios[day.key]) horarios[day.key] = []
            })

            setFormData({
                owner_phone: config.owner_phone || "",
                notifications_enabled: config.notifications_enabled ?? true,
                pix_enabled: config.pix_enabled ?? true,
                pix_key: config.pix_key || "",
                pix_key_type: (config.pix_key_type as string as "telefone" | "cpf" | "cnpj" | "email" | "aleatoria") || "telefone",
                establishment_name: config.establishment_name || "",
                signal_percentage: config.signal_percentage || 50,
                payment_policy: config.payment_policy || "",
                slug: config.slug || "",
                horarios_funcionamento: horarios,
                location_url: config.location_url || "",
            })
        }
    }, [config])

    // Salvar configurações
    const handleSave = async () => {
        if (!updateConfig) return

        const success = await updateConfig({
            owner_phone: formData.owner_phone,
            notifications_enabled: formData.notifications_enabled,
            pix_enabled: formData.pix_enabled,
            pix_key: formData.pix_key,
            pix_key_type: formData.pix_key_type,
            establishment_name: formData.establishment_name,
            signal_percentage: formData.signal_percentage,
            payment_policy: formData.payment_policy,
            slug: formData.slug,
            horarios_funcionamento: formData.horarios_funcionamento,
            location_url: formData.location_url
        })

        if (success) {
            setSaved(true)
            addToast({ title: "Configurações salvas!" })
            setTimeout(() => setSaved(false), 3000)
            refreshConfig()
        } else {
            addToast({ title: "Erro ao salvar", variant: "destructive" })
        }
    }

    // Testar conexão Z-API
    const handleTestConnection = async () => {
        if (!formData.owner_phone) {
            alert("Digite um número de telefone primeiro!")
            return
        }

        setTesting(true)
        setTestResult(null)

        try {
            const instanceId = process.env.NEXT_PUBLIC_ZAPI_INSTANCE_ID
            const token = process.env.NEXT_PUBLIC_ZAPI_TOKEN

            if (!instanceId || !token) {
                setTestResult("error")
                return
            }

            const response = await fetch(
                `https://api.z-api.io/instances/${instanceId}/token/${token}/status`
            )

            if (response.ok) {
                const data = await response.json()
                setTestResult(data.connected ? "success" : "error")
            } else {
                setTestResult("error")
            }
        } catch {
            setTestResult("error")
        } finally {
            setTesting(false)
        }
    }

    // Formatar telefone
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "")
        if (numbers.length <= 2) return numbers
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }

    const toggleHour = (dayKey: string, hour: string) => {
        setFormData(prev => {
            const currentHours = prev.horarios_funcionamento[dayKey] || []
            const newHours = currentHours.includes(hour)
                ? currentHours.filter(h => h !== hour)
                : [...currentHours, hour].sort()

            return {
                ...prev,
                horarios_funcionamento: {
                    ...prev.horarios_funcionamento,
                    [dayKey]: newHours
                }
            }
        })
    }

    const copyToAllDays = (sourceDayKey: string) => {
        const sourceHours = formData.horarios_funcionamento[sourceDayKey] || []
        const newHorarios = { ...formData.horarios_funcionamento }

        DAYS_OF_WEEK.forEach(day => {
            newHorarios[day.key] = [...sourceHours]
        })

        setFormData(prev => ({ ...prev, horarios_funcionamento: newHorarios }))
        addToast({ title: "Horários copiados para todos os dias!" })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">⚙️ Configurações</h1>
                <p className="text-muted-foreground">
                    Configure as notificações WhatsApp e pagamentos do seu studio
                </p>
            </div>

            {/* Status de Salvamento */}
            {saved && (
                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 animate-in fade-in duration-300">
                    ✅ Configurações salvas com sucesso!
                </div>
            )}

            {/* Card Link de Agendamento */}
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🔗</span>
                        Link de Agendamento
                    </CardTitle>
                    <CardDescription>
                        Compartilhe este link com suas clientes ou coloque na bio do Instagram
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Link Display e Edição */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="slug">Seu Link Personalizado</Label>
                            <div className="flex gap-2 items-center">
                                <span className="text-muted-foreground text-sm font-mono whitespace-nowrap">
                                    {typeof window !== "undefined" ? window.location.origin : "sunsync.app"}/
                                </span>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => {
                                        // Apenas letras minúsculas, números e hífens
                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                                        setFormData({ ...formData, slug: val })
                                    }}
                                    className="font-mono bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-700"
                                    placeholder="seu-studio"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Use apenas letras, números e hífens. Ex: maria-bronze
                            </p>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                onClick={() => {
                                    const link = typeof window !== "undefined"
                                        ? `${window.location.origin}/${formData.slug}`
                                        : `https://sunsync.app/${formData.slug}`
                                    navigator.clipboard.writeText(link)
                                    addToast({ title: "Link copiado! 📋" })
                                }}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                📋 Copiar Link
                            </Button>
                        </div>
                    </div>

                    {/* Dicas de uso */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded-lg bg-white/60 dark:bg-zinc-800/60 text-center">
                            <span className="text-2xl block mb-1">📱</span>
                            <p className="text-sm font-medium">Bio do Instagram</p>
                            <p className="text-xs text-muted-foreground">Cole o link na sua bio</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/60 dark:bg-zinc-800/60 text-center">
                            <span className="text-2xl block mb-1">💬</span>
                            <p className="text-sm font-medium">WhatsApp</p>
                            <p className="text-xs text-muted-foreground">Envie para clientes</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/60 dark:bg-zinc-800/60 text-center">
                            <span className="text-2xl block mb-1">📲</span>
                            <p className="text-sm font-medium">Stories</p>
                            <p className="text-xs text-muted-foreground">Use o link nos stories</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card Localização */}
            <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">📍</span>
                        Localização
                    </CardTitle>
                    <CardDescription>
                        Configure o link do Google Maps para enviar na confirmação
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="locationUrl">Link do Google Maps</Label>
                        <Input
                            id="locationUrl"
                            value={formData.location_url}
                            onChange={(e) =>
                                setFormData({ ...formData, location_url: e.target.value })
                            }
                            placeholder="https://maps.app.goo.gl/..."
                            className="border-amber-200 dark:border-amber-800"
                        />
                        <p className="text-xs text-muted-foreground">
                            Este link será enviado no WhatsApp de confirmação para o cliente
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                        💾 Salvar Localização
                    </Button>
                </CardContent>
            </Card>
            {/* Card Horários de Funcionamento */}
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🕐</span>
                        Horários de Funcionamento
                    </CardTitle>
                    <CardDescription>
                        Configure seus horários de atendimento para cada dia da semana.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs defaultValue="segunda" className="w-full">
                        <TabsList className="w-full grid grid-cols-4 lg:grid-cols-7 mb-4 bg-white/50 dark:bg-zinc-900/50">
                            {DAYS_OF_WEEK.map(day => (
                                <TabsTrigger key={day.key} value={day.key} className="text-xs sm:text-sm">
                                    {day.label.slice(0, 3)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {DAYS_OF_WEEK.map(day => (
                            <TabsContent key={day.key} value={day.key} className="space-y-4">
                                <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 p-3 rounded-lg">
                                    <h3 className="font-semibold">{day.label}</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToAllDays(day.key)}
                                        className="text-xs"
                                    >
                                        Copiar para todos os dias
                                    </Button>
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                    {ALL_HOURS.map((hora) => {
                                        const isActive = (formData.horarios_funcionamento[day.key] || []).includes(hora)
                                        return (
                                            <button
                                                key={hora}
                                                type="button"
                                                onClick={() => toggleHour(day.key, hora)}
                                                className={`
                                                    px-2 py-2 rounded-lg text-sm font-medium transition-all
                                                    ${isActive
                                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                                        : 'bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400'
                                                    }
                                                `}
                                            >
                                                {hora}
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
                                    <span>
                                        {(formData.horarios_funcionamento[day.key] || []).length} horários selecionados
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            horarios_funcionamento: {
                                                ...prev.horarios_funcionamento,
                                                [day.key]: []
                                            }
                                        }))}
                                    >
                                        Limpar dia
                                    </Button>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Botão Salvar */}
                    <div className="pt-4">
                        <Button
                            size="lg"
                            onClick={handleSave}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        >
                            💾 Salvar Horários
                        </Button>
                    </div>
                </CardContent>
            </Card >

            {/* Card Principal */}
            < Card className="border-amber-200 dark:border-amber-800" >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">📱</span>
                        WhatsApp Notificações
                    </CardTitle>
                    <CardDescription>
                        Configure o número que receberá as notificações de novos agendamentos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Toggle Master */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <div>
                            <p className="font-medium">Ativar Notificações</p>
                            <p className="text-sm text-muted-foreground">
                                Liga/desliga todas as notificações WhatsApp
                            </p>
                        </div>
                        <Switch
                            checked={formData.notifications_enabled}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, notifications_enabled: checked })
                            }
                        />
                    </div>

                    {/* Telefone da Dona */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-lg">
                            Seu Número WhatsApp
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="phone"
                                type="tel"
                                value={formatPhone(formData.owner_phone)}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        owner_phone: e.target.value.replace(/\D/g, ""),
                                    })
                                }
                                placeholder="(11) 99999-9999"
                                className="text-lg border-amber-200 dark:border-amber-800"
                            />
                            <Button
                                variant="outline"
                                onClick={handleTestConnection}
                                disabled={testing || !formData.owner_phone}
                            >
                                {testing ? "⏳" : "🔗"} Testar
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Este número receberá notificações quando clientes agendarem
                        </p>
                        {testResult === "success" && (
                            <p className="text-sm text-green-600">✅ Conexão Z-API OK!</p>
                        )}
                        {testResult === "error" && (
                            <p className="text-sm text-red-600">
                                ❌ Erro na conexão. Verifique se o Z-API está conectado e as variáveis de ambiente estão corretas.
                            </p>
                        )}
                    </div>

                    {/* Botão Salvar */}
                    <Button
                        size="lg"
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                        💾 Salvar Configurações
                    </Button>
                </CardContent>
            </Card >

            {/* Card Pagamento PIX */}
            < Card className="border-green-200 dark:border-green-800" >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">💳</span>
                        Configurações de Pagamento PIX
                    </CardTitle>
                    <CardDescription>
                        Configure o sinal de 50% para confirmação de agendamentos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Toggle PIX */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div>
                            <p className="font-medium">Exigir Sinal PIX</p>
                            <p className="text-sm text-muted-foreground">
                                Mostrar instruções de pagamento na confirmação
                            </p>
                        </div>
                        <Switch
                            checked={formData.pix_enabled}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, pix_enabled: checked })
                            }
                        />
                    </div>

                    {/* Nome do Estabelecimento */}
                    <div className="space-y-2">
                        <Label htmlFor="establishmentName">Nome do Estabelecimento</Label>
                        <Input
                            id="establishmentName"
                            value={formData.establishment_name}
                            onChange={(e) => {
                                const newName = e.target.value
                                // Gera slug automaticamente: converte para minúsculas, remove acentos e substitui espaços/símbolos por hífens
                                const newSlug = newName
                                    .toLowerCase()
                                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
                                    .replace(/[^a-z0-9]/g, "-") // Substitui não alfanuméricos por hífen
                                    .replace(/-+/g, "-") // Remove hífens duplicados
                                    .replace(/^-|-$/g, "") // Remove hífen do início/fim

                                setFormData({
                                    ...formData,
                                    establishment_name: newName,
                                    slug: newSlug
                                })
                            }}
                            placeholder="Ex: Studio Sol e Bronze"
                            className="border-green-200 dark:border-green-800"
                            disabled={!formData.pix_enabled}
                        />
                    </div>

                    {/* Tipo de Chave PIX */}
                    <div className="space-y-2">
                        <Label>Tipo de Chave PIX</Label>
                        <Select
                            value={formData.pix_key_type}
                            onValueChange={(value) =>
                                setFormData({ ...formData, pix_key_type: value as "telefone" | "cpf" | "email" | "aleatoria" })
                            }
                        >
                            <SelectTrigger className="border-green-200 dark:border-green-800">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="telefone">📱 Telefone</SelectItem>
                                <SelectItem value="cpf">🪪 CPF</SelectItem>
                                <SelectItem value="cnpj">🏢 CNPJ</SelectItem>
                                <SelectItem value="email">📧 Email</SelectItem>
                                <SelectItem value="aleatoria">🔑 Chave Aleatória</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Chave PIX */}
                    <div className="space-y-2">
                        <Label htmlFor="pixKey">Chave PIX</Label>
                        <Input
                            id="pixKey"
                            value={formData.pix_key}
                            onChange={(e) =>
                                setFormData({ ...formData, pix_key: e.target.value })
                            }
                            placeholder={
                                formData.pix_key_type === "telefone" ? "(61) 99999-9999" :
                                    formData.pix_key_type === "cpf" ? "000.000.000-00" :
                                        formData.pix_key_type === "cnpj" ? "00.000.000/0000-00" :
                                            formData.pix_key_type === "email" ? "email@exemplo.com" :
                                                "sua-chave-aleatoria"
                            }
                            className="border-green-200 dark:border-green-800"
                            disabled={!formData.pix_enabled}
                        />
                    </div>

                    {/* Porcentagem do Sinal */}
                    <div className="space-y-2">
                        <Label htmlFor="signalPercent">Porcentagem do Sinal (%)</Label>
                        <Input
                            id="signalPercent"
                            type="number"
                            value={formData.signal_percentage}
                            onChange={(e) =>
                                setFormData({ ...formData, signal_percentage: Number(e.target.value) })
                            }
                            placeholder="50"
                            className="border-green-200 dark:border-green-800"
                            disabled={!formData.pix_enabled}
                        />
                        <p className="text-xs text-muted-foreground">
                            O valor do sinal será calculado com base no preço do serviço selecionado pelo cliente
                        </p>
                    </div>

                    {/* Política de Pagamento */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentPolicy">Política de Pagamento/Cancelamento</Label>
                        <Textarea
                            id="paymentPolicy"
                            value={formData.payment_policy}
                            onChange={(e) =>
                                setFormData({ ...formData, payment_policy: e.target.value })
                            }
                            rows={8}
                            className="border-green-200 dark:border-green-800 text-sm"
                            disabled={!formData.pix_enabled}
                        />
                        <p className="text-xs text-muted-foreground">
                            Este texto será exibido para as clientes na página de confirmação
                        </p>
                    </div>

                    {/* Botão Salvar */}
                    <Button
                        size="lg"
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                        💾 Salvar Configurações de Pagamento
                    </Button>
                </CardContent>
            </Card >


        </div >
    )
}
