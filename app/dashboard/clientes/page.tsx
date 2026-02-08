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
import { useClientesDB, useAgendamentosDB, Cliente } from "@/lib/hooks-supabase"
import { useToast } from "@/components/ui/toast"
import { formatarData, getTipoPeleLabel } from "@/lib/utils"

export default function ClientesPage() {
    const { clientes, addCliente, updateCliente, deleteCliente, isLoading } = useClientesDB()
    const { getAgendamentosByCliente } = useAgendamentosDB()
    const { addToast } = useToast()

    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        tipo_pele: "" as string,
        observacoes: ""
    })

    const filteredClientes = clientes.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.telefone || "").includes(searchTerm)
    )

    const resetForm = () => {
        setFormData({ nome: "", email: "", telefone: "", tipo_pele: "", observacoes: "" })
        setEditingCliente(null)
    }

    const handleOpenDialog = (cliente?: Cliente) => {
        if (cliente) {
            setEditingCliente(cliente)
            setFormData({
                nome: cliente.nome,
                email: cliente.email || "",
                telefone: cliente.telefone || "",
                tipo_pele: cliente.tipo_pele || "clara", // Default fallback
                observacoes: cliente.observacoes || ""
            })
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.nome || !formData.telefone || !formData.tipo_pele) {
            addToast({ title: "Erro", description: "Nome, telefone e tipo de pele são obrigatórios", variant: "destructive" })
            return
        }

        setIsSaving(true)
        try {
            if (editingCliente) {
                await updateCliente(editingCliente.id, {
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone,
                    tipo_pele: formData.tipo_pele,
                    observacoes: formData.observacoes
                })
                addToast({ title: "Sucesso!", description: "Cliente atualizado com sucesso", variant: "success" })
            } else {
                await addCliente({
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone,
                    tipo_pele: formData.tipo_pele,
                    observacoes: formData.observacoes
                })
                addToast({ title: "Sucesso!", description: "Cliente cadastrado com sucesso", variant: "success" })
            }
            setIsDialogOpen(false)
            resetForm()
        } catch (err) {
            console.error(err)
            addToast({ title: "Erro", description: "Falha ao salvar cliente", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este cliente?")) {
            await deleteCliente(id)
            addToast({ title: "Cliente excluído", description: "O cliente foi removido do sistema" })
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Skeleton className="h-9 w-32 mb-2" />
                        <Skeleton className="h-5 w-56" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </div>

                {/* Search Skeleton */}
                <Skeleton className="h-10 w-80" />

                {/* Client Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Skeleton className="h-8 w-8 rounded" />
                                        <Skeleton className="h-8 w-8 rounded" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-6 w-24 rounded-full mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Clientes</h1>
                    <p className="text-muted-foreground">
                        Gerencie seus clientes e histórico de sessões
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            + Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
                            </DialogTitle>
                            <DialogDescription>
                                Preencha os dados do cliente
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome *</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Nome completo"
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone *</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    placeholder="(11) 99999-9999"
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Pele *</Label>
                                <Select value={formData.tipo_pele} onValueChange={(v) => setFormData({ ...formData, tipo_pele: v })}>
                                    <SelectTrigger className="border-amber-200 dark:border-amber-800">
                                        <SelectValue placeholder="Selecione o tipo de pele" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="clara">Pele Clara</SelectItem>
                                        <SelectItem value="media">Pele Média</SelectItem>
                                        <SelectItem value="morena">Pele Morena</SelectItem>
                                        <SelectItem value="negra">Pele Negra</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Textarea
                                    id="observacoes"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    placeholder="Alergias, preferências, etc..."
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
                                {isSaving ? "Salvando..." : editingCliente ? "Salvar" : "Cadastrar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md border-amber-200 dark:border-amber-800"
                />
            </div>

            {/* Cliente Details Modal */}
            <Dialog open={!!selectedCliente} onOpenChange={() => setSelectedCliente(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedCliente && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <span className="text-2xl">👤</span>
                                    {selectedCliente.nome}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{selectedCliente.email || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Telefone</p>
                                        <p className="font-medium">{selectedCliente.telefone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tipo de Pele</p>
                                        <p className="font-medium">{getTipoPeleLabel(selectedCliente.tipo_pele as "clara" | "media" | "morena" | "negra")}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cliente desde</p>
                                        <p className="font-medium">{formatarData(selectedCliente.created_at)}</p>
                                    </div>
                                </div>
                                {selectedCliente.observacoes && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Observações</p>
                                        <p className="font-medium">{selectedCliente.observacoes}</p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-semibold mb-2">Histórico de Agendamentos</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {getAgendamentosByCliente(selectedCliente.id).length === 0 ? (
                                            <p className="text-muted-foreground text-sm">Nenhum agendamento encontrado</p>
                                        ) : (
                                            getAgendamentosByCliente(selectedCliente.id).map(a => (
                                                <div key={a.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                    <span>{formatarData(a.data)} - {a.horario}</span>
                                                    <Badge variant={a.status === "realizado" ? "success" : "secondary"}>
                                                        {a.status}
                                                    </Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Clientes List */}
            {filteredClientes.length === 0 ? (
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="p-12 text-center">
                        <span className="text-6xl block mb-4">👥</span>
                        <h3 className="text-xl font-semibold mb-2">Nenhum cliente encontrado</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? "Tente buscar por outro termo" : "Cadastre seu primeiro cliente"}
                        </p>
                        {!searchTerm && (
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                                + Novo Cliente
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClientes.map((cliente) => (
                        <Card
                            key={cliente.id}
                            className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer"
                            onClick={() => setSelectedCliente(cliente)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                                        <CardDescription>{cliente.email}</CardDescription>
                                    </div>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleOpenDialog(cliente)}
                                        >
                                            ✏️
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(cliente.id)}
                                            className="hover:text-red-600"
                                        >
                                            🗑️
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <Badge variant="secondary">{getTipoPeleLabel(cliente.tipo_pele as "clara" | "media" | "morena" | "negra")}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    📞 {cliente.telefone}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-amber-600">{clientes.length}</p>
                        <p className="text-sm text-muted-foreground">Total de Clientes</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {clientes.filter(c => c.tipo_pele === "clara" || c.tipo_pele === "media").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Pele Clara/Média</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">
                            {clientes.filter(c => {
                                const thirtyDaysAgo = new Date()
                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                                return new Date(c.created_at) >= thirtyDaysAgo
                            }).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Novos (30 dias)</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
