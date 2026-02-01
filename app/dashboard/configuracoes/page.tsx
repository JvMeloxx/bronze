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

// Tipos para configurações
interface StudioConfig {
    nomeEstudio: string
    ownerPhone: string
    notificationsEnabled: boolean
    sendToOwnerOnBooking: boolean
    sendToClientOnBooking: boolean
    sendReminderToClient: boolean
    // PIX Config
    pixEnabled: boolean
    pixKey: string
    pixKeyType: "telefone" | "cpf" | "email" | "aleatoria"
    establishmentName: string
    signalPercentage: number
    sessionBaseValue: number
    paymentPolicy: string

}

const defaultPaymentPolicy = `IMPORTANTE: Para confirmar o seu atendimento, é necessário realizar o pagamento de 50% do valor como sinal no ato do agendamento.

• Caso o sinal não seja feito, o horário será cancelado pelo sistema.
• O sinal é não reembolsável em caso de desistência ou não comparecimento.
• A cliente tem direito a UMA remarcação, desde que avisado com antecedência.
• Após essa remarcação, caso haja nova necessidade de alterar ou cancelar de última hora, será necessário realizar um novo sinal.

Agradeço a compreensão e o respeito pelo meu trabalho e pela agenda. 🤎`

const defaultConfig: StudioConfig = {
    nomeEstudio: "",
    ownerPhone: "",
    notificationsEnabled: true,
    sendToOwnerOnBooking: true,
    sendToClientOnBooking: true,
    sendReminderToClient: true,
    // PIX Config
    pixEnabled: true,
    pixKey: "",
    pixKeyType: "telefone",
    establishmentName: "",
    signalPercentage: 50,
    sessionBaseValue: 120,
    paymentPolicy: defaultPaymentPolicy,

}

export default function ConfiguracoesPage() {
    const [config, setConfig] = useState<StudioConfig>(defaultConfig)
    const [saved, setSaved] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<"success" | "error" | null>(null)

    // Carregar configurações do localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem("sunsync_config")
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig))
        }
    }, [])

    // Salvar configurações
    const handleSave = () => {
        localStorage.setItem("sunsync_config", JSON.stringify(config))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    // Testar conexão Z-API
    const handleTestConnection = async () => {
        if (!config.ownerPhone) {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">⚙️ Configurações</h1>
                <p className="text-muted-foreground">
                    Configure as notificações WhatsApp do seu studio
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
                    {/* Link Display */}
                    <div className="flex gap-2">
                        <Input
                            readOnly
                            value={typeof window !== "undefined" ? `${window.location.origin}/agendar` : "https://seusite.com/agendar"}
                            className="text-lg font-mono bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-700"
                        />
                        <Button
                            onClick={() => {
                                const link = typeof window !== "undefined"
                                    ? `${window.location.origin}/agendar`
                                    : "https://seusite.com/agendar"
                                navigator.clipboard.writeText(link)
                                alert("Link copiado! 📋")
                            }}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6"
                        >
                            📋 Copiar
                        </Button>
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

                    {/* Share buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const link = typeof window !== "undefined"
                                    ? `${window.location.origin}/agendar`
                                    : ""
                                const text = "Agende seu bronzeamento! ☀️"
                                window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + link)}`, "_blank")
                            }}
                            className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                            💚 Compartilhar no WhatsApp
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: "Agende seu bronzeamento!",
                                        text: "Agende seu horário no SunSync ☀️",
                                        url: typeof window !== "undefined" ? `${window.location.origin}/agendar` : ""
                                    })
                                }
                            }}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                            📤 Compartilhar
                        </Button>
                    </div>
                </CardContent>
            </Card>


            {/* Card Principal */}
            <Card className="border-amber-200 dark:border-amber-800">
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
                            checked={config.notificationsEnabled}
                            onCheckedChange={(checked) =>
                                setConfig({ ...config, notificationsEnabled: checked })
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
                                value={formatPhone(config.ownerPhone)}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        ownerPhone: e.target.value.replace(/\D/g, ""),
                                    })
                                }
                                placeholder="(11) 99999-9999"
                                className="text-lg border-amber-200 dark:border-amber-800"
                            />
                            <Button
                                variant="outline"
                                onClick={handleTestConnection}
                                disabled={testing || !config.ownerPhone}
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
                                ❌ Erro na conexão. Verifique se o Z-API está conectado.
                            </p>
                        )}
                    </div>

                    {/* Opções de Notificação */}
                    <div className="space-y-4 pt-4 border-t border-amber-100 dark:border-amber-900">
                        <h3 className="font-medium">Quando enviar notificações:</h3>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Novo agendamento (para você)</p>
                                <p className="text-sm text-muted-foreground">
                                    Receba quando um cliente agendar
                                </p>
                            </div>
                            <Switch
                                checked={config.sendToOwnerOnBooking}
                                onCheckedChange={(checked) =>
                                    setConfig({ ...config, sendToOwnerOnBooking: checked })
                                }
                                disabled={!config.notificationsEnabled}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Confirmação (para cliente)</p>
                                <p className="text-sm text-muted-foreground">
                                    Enviar confirmação ao cliente após agendar
                                </p>
                            </div>
                            <Switch
                                checked={config.sendToClientOnBooking}
                                onCheckedChange={(checked) =>
                                    setConfig({ ...config, sendToClientOnBooking: checked })
                                }
                                disabled={!config.notificationsEnabled}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Lembrete 1 dia antes</p>
                                <p className="text-sm text-muted-foreground">
                                    Lembrar cliente com cuidados pré-sessão
                                </p>
                            </div>
                            <Switch
                                checked={config.sendReminderToClient}
                                onCheckedChange={(checked) =>
                                    setConfig({ ...config, sendReminderToClient: checked })
                                }
                                disabled={!config.notificationsEnabled}
                            />
                        </div>
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
            </Card>

            {/* Card Pagamento PIX */}
            <Card className="border-green-200 dark:border-green-800">
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
                            checked={config.pixEnabled}
                            onCheckedChange={(checked) =>
                                setConfig({ ...config, pixEnabled: checked })
                            }
                        />
                    </div>

                    {/* Nome do Estabelecimento */}
                    <div className="space-y-2">
                        <Label htmlFor="establishmentName">Nome do Estabelecimento</Label>
                        <Input
                            id="establishmentName"
                            value={config.establishmentName}
                            onChange={(e) =>
                                setConfig({ ...config, establishmentName: e.target.value })
                            }
                            placeholder="Ex: Studio Sol e Bronze"
                            className="border-green-200 dark:border-green-800"
                            disabled={!config.pixEnabled}
                        />
                    </div>

                    {/* Tipo de Chave PIX */}
                    <div className="space-y-2">
                        <Label>Tipo de Chave PIX</Label>
                        <Select
                            value={config.pixKeyType}
                            onValueChange={(value) =>
                                setConfig({ ...config, pixKeyType: value as "telefone" | "cpf" | "email" | "aleatoria" })
                            }
                        >
                            <SelectTrigger className="border-green-200 dark:border-green-800">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="telefone">📱 Telefone</SelectItem>
                                <SelectItem value="cpf">🪪 CPF</SelectItem>
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
                            value={config.pixKey}
                            onChange={(e) =>
                                setConfig({ ...config, pixKey: e.target.value })
                            }
                            placeholder={
                                config.pixKeyType === "telefone" ? "(61) 99999-9999" :
                                    config.pixKeyType === "cpf" ? "000.000.000-00" :
                                        config.pixKeyType === "email" ? "email@exemplo.com" :
                                            "sua-chave-aleatoria"
                            }
                            className="border-green-200 dark:border-green-800"
                            disabled={!config.pixEnabled}
                        />
                    </div>

                    {/* Porcentagem do Sinal */}
                    <div className="space-y-2">
                        <Label htmlFor="signalPercent">Porcentagem do Sinal (%)</Label>
                        <Input
                            id="signalPercent"
                            type="number"
                            value={config.signalPercentage}
                            onChange={(e) =>
                                setConfig({ ...config, signalPercentage: Number(e.target.value) })
                            }
                            placeholder="50"
                            className="border-green-200 dark:border-green-800"
                            disabled={!config.pixEnabled}
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
                            value={config.paymentPolicy}
                            onChange={(e) =>
                                setConfig({ ...config, paymentPolicy: e.target.value })
                            }
                            rows={8}
                            className="border-green-200 dark:border-green-800 text-sm"
                            disabled={!config.pixEnabled}
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
            </Card>



            {/* Preview de Mensagens */}
            <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">💬</span>
                        Preview das Mensagens
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Mensagem para Dona */}
                    <div>
                        <p className="font-medium mb-2">📩 Quando cliente agenda (para você):</p>
                        <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-sm font-mono whitespace-pre-wrap">
                            {`🔔 *NOVO AGENDAMENTO!*

👤 *Cliente:* Maria Silva
📱 *Telefone:* (11) 99999-9999
📅 *Data:* 05/02/2026
⏰ *Horário:* 14:00
💆 *Serviço:* Bronzeamento Natural

Acesse o dashboard para mais detalhes.`}
                        </div>
                    </div>

                    {/* Lembrete para Cliente */}
                    <div>
                        <p className="font-medium mb-2">⏰ Lembrete 1 dia antes (para cliente):</p>
                        <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-sm font-mono whitespace-pre-wrap">
                            {`☀️ *Olá Maria!*

Sua sessão de bronzeamento é *AMANHÃ* às *14:00*!

📋 *CUIDADOS PRÉ-BRONZEAMENTO:*
• Faça esfoliação leve na véspera
• Hidrate bem a pele
• Evite cremes/óleos no dia
• Depilação: faça 24h antes

⚠️ *ATENÇÃO:* Caso o clima esteja *CHUVOSO*, entre em contato imediatamente para reagendar!

Até amanhã! ✨`}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
