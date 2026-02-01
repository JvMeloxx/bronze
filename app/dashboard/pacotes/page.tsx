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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { useServicosDB, Servico } from "@/lib/hooks-supabase"
import { formatarMoeda } from "@/lib/data"

export default function ServicosPage() {
    const { addToast } = useToast()
    const { servicos, isLoading, addServico, updateServico, deleteServico } = useServicosDB()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingServico, setEditingServico] = useState<Servico | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        preco: 0,
        duracao: "30 min",
    })

    const resetForm = () => {
        setFormData({
            nome: "",
            descricao: "",
            preco: 0,
            duracao: "30 min",
        })
        setEditingServico(null)
    }

    const handleOpenDialog = (servico?: Servico) => {
        if (servico) {
            setEditingServico(servico)
            setFormData({
                nome: servico.nome,
                descricao: servico.descricao,
                preco: servico.preco,
                duracao: servico.duracao.toString() + " min",
            })
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.nome || formData.preco <= 0) {
            addToast({ title: "Erro", description: "Preencha nome e preço", variant: "destructive" })
            return
        }

        setIsSaving(true)
        let success = false

        // Converter duração string para numero (minutos)
        const duracaoMinutos = parseInt(formData.duracao.replace(/\D/g, '')) || 30

        if (editingServico) {
            // Atualizar
            success = await updateServico(editingServico.id, {
                nome: formData.nome,
                descricao: formData.descricao,
                preco: formData.preco,
                duracao: duracaoMinutos
            })
            if (success) addToast({ title: "Sucesso!", description: "Serviço atualizado", variant: "success" })
        } else {
            // Criar novo
            const newServico = await addServico({
                nome: formData.nome,
                descricao: formData.descricao,
                preco: formData.preco,
                duracao: duracaoMinutos,
                ativo: true
            })
            if (newServico) {
                success = true
                addToast({ title: "Sucesso!", description: "Serviço criado", variant: "success" })
            }
        }

        setIsSaving(false)

        if (success) {
            setIsDialogOpen(false)
            resetForm()
        } else {
            addToast({ title: "Erro", description: "Falha ao salvar. Tente novamente.", variant: "destructive" })
        }
    }

    const handleToggleAtivo = async (servico: Servico) => {
        const success = await updateServico(servico.id, { ativo: !servico.ativo })
        if (success) addToast({ title: "Status alterado" })
    }

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este serviço?")) {
            const success = await deleteServico(id)
            if (success) addToast({ title: "Serviço excluído" })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-xl">💆</span>
                    </div>
                    <p className="text-muted-foreground">Carregando serviços...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Serviços</h1>
                    <p className="text-muted-foreground">
                        Gerencie os serviços oferecidos pelo seu studio
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            + Novo Serviço
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingServico ? "Editar Serviço" : "Novo Serviço"}
                            </DialogTitle>
                            <DialogDescription>
                                Configure os detalhes do serviço
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Serviço *</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: Bronzeamento Natural"
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição</Label>
                                <Textarea
                                    id="descricao"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    placeholder="Descrição do serviço..."
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="preco">Preço (R$) *</Label>
                                    <Input
                                        id="preco"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.preco}
                                        onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                                        className="border-amber-200 dark:border-amber-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duracao">Duração (apenas números)</Label>
                                    <Input
                                        id="duracao"
                                        value={formData.duracao}
                                        onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                                        placeholder="Ex: 30 min"
                                        className="border-amber-200 dark:border-amber-800"
                                    />
                                </div>
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
                                {isSaving ? "Salvando..." : editingServico ? "Salvar" : "Criar Serviço"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Serviços Grid */}
            {servicos.length === 0 ? (
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="p-12 text-center">
                        <span className="text-6xl block mb-4">💆</span>
                        <h3 className="text-xl font-semibold mb-2">Nenhum serviço cadastrado</h3>
                        <p className="text-muted-foreground mb-4">
                            Crie seu primeiro serviço de bronzeamento
                        </p>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            + Novo Serviço
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicos.map((servico) => (
                        <Card
                            key={servico.id}
                            className={`border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 ${!servico.ativo && "opacity-60"}`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {servico.nome}
                                            {!servico.ativo && (
                                                <Badge variant="secondary" className="text-xs">Inativo</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {servico.descricao}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-amber-600">
                                            {formatarMoeda(servico.preco)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">⏱️ {servico.duracao} min</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleToggleAtivo(servico)}
                                    >
                                        {servico.ativo ? "Desativar" : "Ativar"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenDialog(servico)}
                                    >
                                        ✏️
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(servico.id)}
                                        className="hover:text-red-600"
                                    >
                                        🗑️
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-amber-600">{servicos.length}</p>
                        <p className="text-sm text-muted-foreground">Total de Serviços</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {servicos.filter(s => s.ativo).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Ativos</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {servicos.length > 0 ? formatarMoeda(Math.min(...servicos.map(s => s.preco))) : '-'}
                        </p>
                        <p className="text-sm text-muted-foreground">A partir de</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
