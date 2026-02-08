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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAgendamentosDB, useClientesDB, useServicosDB, useStudioConfig, Agendamento } from "@/lib/hooks-supabase"
import { useToast } from "@/components/ui/toast"
import { formatarData, getStatusColor } from "@/lib/utils"
import { enviarConfirmacaoAgendamento, enviarLembreteAgendamento } from "@/lib/zapi"

export default function AgendamentosPage() {
    const {
        agendamentos,
        addAgendamento,
        updateAgendamento,
        deleteAgendamento,
        isLoading
    } = useAgendamentosDB()

    const { clientes } = useClientesDB()
    const { servicos } = useServicosDB()
    const { config } = useStudioConfig()

    const { addToast } = useToast()
    const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null)


    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null)
    const [activeTab, setActiveTab] = useState("dia")
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        cliente_id: "",
        data: new Date().toISOString().split("T")[0],
        horario: "",
        servico_id: "",
        duracao: 30,
        observacoes: ""
    })

    const hoje = new Date().toISOString().split("T")[0]

    // Agrupar agendamentos por data
    const agendamentosPorData = agendamentos.reduce((acc, a) => {
        if (!acc[a.data]) acc[a.data] = []
        acc[a.data].push(a)
        return acc
    }, {} as Record<string, Agendamento[]>)

    // Próximos 30 dias (expandido)
    const proximosDias = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return date.toISOString().split("T")[0]
    })

    const agendamentosDoDia = agendamentos
        .filter(a => a.data === selectedDate)
        .sort((a, b) => a.horario.localeCompare(b.horario))

    const resetForm = () => {
        setFormData({
            cliente_id: "",
            data: selectedDate,
            horario: "",
            servico_id: "",
            duracao: 30,
            observacoes: ""
        })
        setEditingAgendamento(null)
    }

    const handleOpenDialog = (agendamento?: Agendamento) => {
        if (agendamento) {
            setEditingAgendamento(agendamento)
            // Tentar encontrar o serviço correspondente pelo ID ou Nome
            let servicoId = agendamento.servico_id || ""
            if (!servicoId) {
                // Tenta achar pelo nome se não tiver ID
                const s = servicos.find(s => s.nome === agendamento.servico_nome)
                if (s) servicoId = s.id
            }

            setFormData({
                cliente_id: agendamento.cliente_id || "",
                data: agendamento.data,
                horario: agendamento.horario,
                servico_id: servicoId,
                duracao: agendamento.duracao || 30,
                observacoes: agendamento.observacoes || ""
            })
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.cliente_id || !formData.data || !formData.horario || !formData.servico_id) {
            addToast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" })
            return
        }

        const cliente = clientes.find(c => c.id === formData.cliente_id)
        if (!cliente) {
            addToast({ title: "Erro", description: "Cliente não encontrado", variant: "destructive" })
            return
        }

        const servico = servicos.find(s => s.id === formData.servico_id)
        const servicoNome = servico?.nome || "Serviço"

        setIsSaving(true)

        try {
            if (editingAgendamento) {
                await updateAgendamento(editingAgendamento.id, {
                    cliente_id: formData.cliente_id,
                    cliente_nome: cliente.nome,
                    data: formData.data,
                    horario: formData.horario,
                    servico_id: formData.servico_id,
                    servico_nome: servicoNome,
                    duracao: formData.duracao,
                    observacoes: formData.observacoes
                })
                addToast({ title: "Sucesso!", description: "Agendamento atualizado", variant: "success" })
            } else {
                await addAgendamento({
                    cliente_id: formData.cliente_id,
                    cliente_nome: cliente.nome,
                    telefone: cliente.telefone,
                    email: cliente.email,
                    data: formData.data,
                    horario: formData.horario,
                    servico_id: formData.servico_id,
                    servico_nome: servicoNome,
                    status: "pendente",
                    duracao: formData.duracao,
                    preco: servico?.preco || 0,
                    observacoes: formData.observacoes,
                    fonte: "dashboard"
                })
                addToast({ title: "Sucesso!", description: "Agendamento criado", variant: "success" })
            }
            setIsDialogOpen(false)
            resetForm()
        } catch (err) {
            console.error(err)
            addToast({ title: "Erro", description: "Falha ao salvar", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    const handleStatusChange = async (id: string, newStatus: Agendamento["status"]) => {
        await updateAgendamento(id, { status: newStatus })
        addToast({
            title: "Status atualizado",
            description: `Agendamento marcado como ${newStatus}`,
            variant: newStatus === "realizado" ? "success" : "default"
        })
    }

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este agendamento?")) {
            await deleteAgendamento(id)
            addToast({ title: "Agendamento excluído" })
        }
    }

    const handleEnviarWhatsApp = async (agendamento: Agendamento, tipo: "lembrete" | "confirmacao") => {
        // Busca do telefone: primeiro no agendamento, depois tenta buscar cliente se não tiver
        let telefone = agendamento.telefone
        let nome = agendamento.cliente_nome

        if (!telefone && agendamento.cliente_id) {
            const cliente = clientes.find(c => c.id === agendamento.cliente_id)
            if (cliente) {
                telefone = cliente.telefone
                nome = cliente.nome
            }
        }

        if (!telefone) {
            addToast({
                title: "Erro",
                description: "Telefone não encontrado para este agendamento",
                variant: "destructive"
            })
            return
        }

        setSendingWhatsApp(agendamento.id)

        try {
            const dataFormatada = formatarData(agendamento.data)

            const result = tipo === "lembrete"
                ? await enviarLembreteAgendamento(telefone, nome, dataFormatada, agendamento.horario, agendamento.servico_nome)
                : await enviarConfirmacaoAgendamento(telefone, nome, dataFormatada, agendamento.horario, agendamento.servico_nome, agendamento.id, config?.slug || "")

            if (result.success) {
                addToast({
                    title: "WhatsApp enviado! ✅",
                    description: `${tipo === "lembrete" ? "Lembrete" : "Confirmação"} enviado para ${nome}`,
                    variant: "success"
                })
            } else {
                addToast({
                    title: "Erro ao enviar",
                    description: result.error || "Verifique as configurações do Z-API",
                    variant: "destructive"
                })
            }
        } catch {
            addToast({
                title: "Erro",
                description: "Falha na conexão com Z-API",
                variant: "destructive"
            })
        } finally {
            setSendingWhatsApp(null)
        }
    }


    const getDayName = (dateStr: string) => {
        if (!dateStr) return ""
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
    }

    const getDayNumber = (dateStr: string) => {
        if (!dateStr) return ""
        return new Date(dateStr + "T00:00:00").getDate()
    }

    // Horários disponíveis (9h às 20h, intervalos de 30min)
    const horarios = Array.from({ length: 23 }, (_, i) => {
        const hour = Math.floor(i / 2) + 9
        const min = (i % 2) * 30
        return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
    })

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Skeleton className="h-9 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>

                {/* Tabs Skeleton */}
                <Skeleton className="h-10 w-64" />

                {/* Date Selector Skeleton */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-16 rounded-lg flex-shrink-0" />
                    ))}
                </div>

                {/* Appointments Card Skeleton */}
                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                                <Skeleton className="h-12 w-12 rounded" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Agendamentos</h1>
                    <p className="text-muted-foreground">
                        Gerencie os agendamentos do seu studio
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            + Novo Agendamento
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingAgendamento ? "Editar Agendamento" : "Novo Agendamento"}
                            </DialogTitle>
                            <DialogDescription>
                                Preencha os dados do agendamento
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Cliente *</Label>
                                <Select value={formData.cliente_id} onValueChange={(v) => setFormData({ ...formData, cliente_id: v })}>
                                    <SelectTrigger className="border-amber-200 dark:border-amber-800">
                                        <SelectValue placeholder="Selecione o cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                                        ))}
                                        {clientes.length === 0 && (
                                            <div className="p-2 text-sm text-center text-muted-foreground">
                                                Nenhum cliente cadastrado
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data">Data *</Label>
                                    <Input
                                        id="data"
                                        type="date"
                                        value={formData.data}
                                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                        className="border-amber-200 dark:border-amber-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Horário *</Label>
                                    <Select value={formData.horario} onValueChange={(v) => setFormData({ ...formData, horario: v })}>
                                        <SelectTrigger className="border-amber-200 dark:border-amber-800">
                                            <SelectValue placeholder="Horário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {horarios.map(h => (
                                                <SelectItem key={h} value={h}>{h}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Serviço *</Label>
                                <Select value={formData.servico_id} onValueChange={(v) => {
                                    const s = servicos.find(serv => serv.id === v)
                                    setFormData({
                                        ...formData,
                                        servico_id: v,
                                        duracao: s?.duracao || 30
                                    })
                                }}>
                                    <SelectTrigger className="border-amber-200 dark:border-amber-800">
                                        <SelectValue placeholder="Selecione o serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {servicos.filter(s => s.ativo).map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.nome} ({s.duracao} min)</SelectItem>
                                        ))}
                                        {servicos.length === 0 && (
                                            <div className="p-2 text-sm text-center text-muted-foreground">
                                                Nenhum serviço cadastrado. Vá em Serviços.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duracao">Duração (minutos)</Label>
                                <Input
                                    id="duracao"
                                    type="number"
                                    value={formData.duracao}
                                    onChange={(e) => setFormData({ ...formData, duracao: parseInt(e.target.value) || 30 })}
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Textarea
                                    id="observacoes"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    placeholder="Observações adicionais..."
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                                {isSaving ? "Salvando..." : editingAgendamento ? "Salvar" : "Agendar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-amber-100 dark:bg-amber-900/30">
                    <TabsTrigger value="dia">📅 Dia</TabsTrigger>
                    <TabsTrigger value="semana">📆 Semana</TabsTrigger>
                    <TabsTrigger value="todos">📋 Todos</TabsTrigger>
                </TabsList>

                {/* Day View */}
                <TabsContent value="dia" className="space-y-4">
                    {/* Date Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {proximosDias.map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`flex flex-col items-center p-3 rounded-lg min-w-[64px] transition-all ${selectedDate === date
                                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg"
                                    : "bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                                    }`}
                            >
                                <span className="text-xs uppercase">{getDayName(date)}</span>
                                <span className="text-xl font-bold">{getDayNumber(date)}</span>
                                {agendamentosPorData[date]?.length > 0 && (
                                    <span className={`text-xs ${selectedDate === date ? "text-white/80" : "text-amber-600"}`}>
                                        {agendamentosPorData[date].length} ag.
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Day Schedule */}
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📅 {formatarData(selectedDate)}
                                {selectedDate === hoje && <Badge variant="amber">Hoje</Badge>}
                            </CardTitle>
                            <CardDescription>
                                {agendamentosDoDia.length} agendamento(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {agendamentosDoDia.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <span className="text-4xl mb-2 block">📅</span>
                                    <p>Nenhum agendamento para este dia</p>
                                    <Button
                                        className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                        onClick={() => {
                                            setFormData(f => ({ ...f, data: selectedDate }))
                                            handleOpenDialog()
                                        }}
                                    >
                                        + Agendar
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-amber-100 dark:divide-amber-900">
                                    {agendamentosDoDia.map((ag) => (
                                        <div key={ag.id} className="flex items-center justify-between p-4 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="text-center">
                                                    <span className="text-lg font-mono font-bold text-amber-600 block">
                                                        {ag.horario}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {ag.duracao}min
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{ag.cliente_nome}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {ag.servico_nome}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select value={ag.status} onValueChange={(v) => handleStatusChange(ag.id, v as Agendamento["status"])}>
                                                    <SelectTrigger className={`w-32 text-xs ${getStatusColor(ag.status)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pendente">Pendente</SelectItem>
                                                        <SelectItem value="confirmado">Confirmado</SelectItem>
                                                        <SelectItem value="realizado">Realizado</SelectItem>
                                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEnviarWhatsApp(ag, ag.status === "pendente" ? "confirmacao" : "lembrete")}
                                                    disabled={sendingWhatsApp === ag.id}
                                                    className="hover:text-green-600"
                                                    title="Enviar WhatsApp"
                                                >
                                                    {sendingWhatsApp === ag.id ? "⏳" : "📱"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog(ag)}
                                                >
                                                    ✏️
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(ag.id)}
                                                    className="hover:text-red-600"
                                                    title="Excluir"
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Week View */}
                <TabsContent value="semana">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {proximosDias.map(date => (
                            <Card key={date} className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {getDayName(date)} {getDayNumber(date)}
                                        {date === hoje && <Badge variant="amber" className="text-xs">Hoje</Badge>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                    {!agendamentosPorData[date] || agendamentosPorData[date].length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Sem agendamentos
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {agendamentosPorData[date]
                                                .sort((a, b) => a.horario.localeCompare(b.horario))
                                                .slice(0, 4)
                                                .map(ag => (
                                                    <div
                                                        key={ag.id}
                                                        className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-sm cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                                        onClick={() => {
                                                            setSelectedDate(date)
                                                            setActiveTab("dia")
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-mono font-medium text-amber-600">{ag.horario}</span>
                                                            <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(ag.status)}`}>
                                                                {ag.status}
                                                            </span>
                                                        </div>
                                                        <p className="font-medium truncate">{ag.cliente_nome}</p>
                                                    </div>
                                                ))}
                                            {agendamentosPorData[date].length > 4 && (
                                                <p className="text-xs text-center text-muted-foreground">
                                                    +{agendamentosPorData[date].length - 4} mais
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* All View */}
                <TabsContent value="todos">
                    <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                        <CardContent className="p-0">
                            {agendamentos.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <span className="text-4xl mb-2 block">📅</span>
                                    <p>Nenhum agendamento cadastrado</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-amber-100 dark:divide-amber-900">
                                    {agendamentos
                                        .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`))
                                        .map((ag) => (
                                            <div key={ag.id} className="flex items-center justify-between p-4 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="text-center min-w-[80px]">
                                                        <span className="text-sm text-muted-foreground block">
                                                            {formatarData(ag.data)}
                                                        </span>
                                                        <span className="text-lg font-mono font-bold text-amber-600">
                                                            {ag.horario}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{ag.cliente_nome}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {ag.servico_nome}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(ag.status)}>
                                                        {ag.status}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(ag.id)}
                                                        className="hover:text-red-600"
                                                        title="Excluir"
                                                    >
                                                        🗑️
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-amber-600">{agendamentos.length}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-yellow-500/10 to-amber-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-yellow-600">
                            {agendamentos.filter(a => a.status === "pendente").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Pendentes</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {agendamentos.filter(a => a.status === "confirmado").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Confirmados</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {agendamentos.filter(a => a.status === "realizado").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Realizados</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
