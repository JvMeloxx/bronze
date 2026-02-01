"use client"

import { useState } from "react"
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
import { useAgendamentos, useClientes } from "@/lib/hooks"
import { useToast } from "@/components/ui/toast"
import { Agendamento, formatarData, getTipoLabel, getStatusColor } from "@/lib/data"
import { enviarConfirmacaoAgendamento, enviarLembreteAgendamento } from "@/lib/zapi"

export default function AgendamentosPage() {
    const { agendamentos, addAgendamento, updateAgendamento, deleteAgendamento, isLoading } = useAgendamentos()
    const { clientes } = useClientes()
    const { addToast } = useToast()
    const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null)


    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null)
    const [activeTab, setActiveTab] = useState("dia")

    // Form state
    const [formData, setFormData] = useState({
        clienteId: "",
        data: new Date().toISOString().split("T")[0],
        horario: "",
        tipo: "" as Agendamento["tipo"] | "",
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

    // Próximos 7 dias
    const proximosDias = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return date.toISOString().split("T")[0]
    })

    const agendamentosDoDia = agendamentos
        .filter(a => a.data === selectedDate)
        .sort((a, b) => a.horario.localeCompare(b.horario))

    const resetForm = () => {
        setFormData({
            clienteId: "",
            data: selectedDate,
            horario: "",
            tipo: "",
            duracao: 30,
            observacoes: ""
        })
        setEditingAgendamento(null)
    }

    const handleOpenDialog = (agendamento?: Agendamento) => {
        if (agendamento) {
            setEditingAgendamento(agendamento)
            setFormData({
                clienteId: agendamento.clienteId,
                data: agendamento.data,
                horario: agendamento.horario,
                tipo: agendamento.tipo,
                duracao: agendamento.duracao,
                observacoes: agendamento.observacoes || ""
            })
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = () => {
        if (!formData.clienteId || !formData.data || !formData.horario || !formData.tipo) {
            addToast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" })
            return
        }

        const cliente = clientes.find(c => c.id === formData.clienteId)
        if (!cliente) {
            addToast({ title: "Erro", description: "Cliente não encontrado", variant: "destructive" })
            return
        }

        if (editingAgendamento) {
            updateAgendamento(editingAgendamento.id, {
                clienteId: formData.clienteId,
                clienteNome: cliente.nome,
                data: formData.data,
                horario: formData.horario,
                tipo: formData.tipo as Agendamento["tipo"],
                duracao: formData.duracao,
                observacoes: formData.observacoes
            })
            addToast({ title: "Sucesso!", description: "Agendamento atualizado", variant: "success" })
        } else {
            addAgendamento({
                clienteId: formData.clienteId,
                clienteNome: cliente.nome,
                data: formData.data,
                horario: formData.horario,
                tipo: formData.tipo as Agendamento["tipo"],
                status: "pendente",
                duracao: formData.duracao,
                observacoes: formData.observacoes
            })
            addToast({ title: "Sucesso!", description: "Agendamento criado", variant: "success" })
        }

        setIsDialogOpen(false)
        resetForm()
    }

    const handleStatusChange = (id: string, newStatus: Agendamento["status"]) => {
        updateAgendamento(id, { status: newStatus })
        addToast({
            title: "Status atualizado",
            description: `Agendamento marcado como ${newStatus}`,
            variant: newStatus === "realizado" ? "success" : "default"
        })
    }

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este agendamento?")) {
            deleteAgendamento(id)
            addToast({ title: "Agendamento excluído" })
        }
    }

    const handleEnviarWhatsApp = async (agendamento: Agendamento, tipo: "lembrete" | "confirmacao") => {
        const cliente = clientes.find(c => c.id === agendamento.clienteId)
        if (!cliente?.telefone) {
            addToast({
                title: "Erro",
                description: "Cliente não tem telefone cadastrado",
                variant: "destructive"
            })
            return
        }

        setSendingWhatsApp(agendamento.id)

        try {
            const tipoServico = getTipoLabel(agendamento.tipo)
            const dataFormatada = formatarData(agendamento.data)

            const result = tipo === "lembrete"
                ? await enviarLembreteAgendamento(cliente.telefone, cliente.nome, dataFormatada, agendamento.horario, tipoServico)
                : await enviarConfirmacaoAgendamento(cliente.telefone, cliente.nome, dataFormatada, agendamento.horario, tipoServico)

            if (result.success) {
                addToast({
                    title: "WhatsApp enviado! ✅",
                    description: `${tipo === "lembrete" ? "Lembrete" : "Confirmação"} enviado para ${cliente.nome}`,
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
        const date = new Date(dateStr + "T00:00:00")
        return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
    }

    const getDayNumber = (dateStr: string) => {
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-xl">📅</span>
                    </div>
                    <p className="text-muted-foreground">Carregando agendamentos...</p>
                </div>
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
                                <Select value={formData.clienteId} onValueChange={(v) => setFormData({ ...formData, clienteId: v })}>
                                    <SelectTrigger className="border-amber-200 dark:border-amber-800">
                                        <SelectValue placeholder="Selecione o cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                                        ))}
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
                                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v as Agendamento["tipo"] })}>
                                    <SelectTrigger className="border-amber-200 dark:border-amber-800">
                                        <SelectValue placeholder="Selecione o serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="natural">Bronzeamento Natural</SelectItem>
                                        <SelectItem value="spray">Bronzeamento Spray</SelectItem>
                                        <SelectItem value="manutencao">Manutenção</SelectItem>
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
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                                {editingAgendamento ? "Salvar" : "Agendar"}
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
                                                    <p className="font-medium">{ag.clienteNome}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {getTipoLabel(ag.tipo)}
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
                                                        <p className="font-medium truncate">{ag.clienteNome}</p>
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
                                                        <p className="font-medium">{ag.clienteNome}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {getTipoLabel(ag.tipo)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(ag.status)}>
                                                    {ag.status}
                                                </Badge>
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
