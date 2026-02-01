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
import { usePacotes } from "@/lib/hooks"
import { useToast } from "@/components/ui/toast"
import { Pacote, formatarMoeda } from "@/lib/data"

export default function PacotesPage() {
    const { pacotes, addPacote, updatePacote, deletePacote, isLoading } = usePacotes()
    const { addToast } = useToast()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPacote, setEditingPacote] = useState<Pacote | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        sessoes: 10,
        preco: 0,
        validadeDias: 90,
        tipo: "" as Pacote["tipo"] | "",
        ativo: true
    })

    const resetForm = () => {
        setFormData({
            nome: "",
            descricao: "",
            sessoes: 10,
            preco: 0,
            validadeDias: 90,
            tipo: "",
            ativo: true
        })
        setEditingPacote(null)
    }

    const handleOpenDialog = (pacote?: Pacote) => {
        if (pacote) {
            setEditingPacote(pacote)
            setFormData({
                nome: pacote.nome,
                descricao: pacote.descricao,
                sessoes: pacote.sessoes,
                preco: pacote.preco,
                validadeDias: pacote.validadeDias,
                tipo: pacote.tipo,
                ativo: pacote.ativo
            })
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = () => {
        if (!formData.nome || !formData.tipo || formData.preco <= 0) {
            addToast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" })
            return
        }

        if (editingPacote) {
            updatePacote(editingPacote.id, formData as Pacote)
            addToast({ title: "Sucesso!", description: "Pacote atualizado", variant: "success" })
        } else {
            addPacote(formData as Omit<Pacote, "id">)
            addToast({ title: "Sucesso!", description: "Pacote criado", variant: "success" })
        }

        setIsDialogOpen(false)
        resetForm()
    }

    const handleToggleAtivo = (id: string, ativo: boolean) => {
        updatePacote(id, { ativo: !ativo })
        addToast({
            title: ativo ? "Pacote desativado" : "Pacote ativado",
            description: ativo ? "O pacote não será mais exibido" : "O pacote está disponível novamente"
        })
    }

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este pacote?")) {
            deletePacote(id)
            addToast({ title: "Pacote excluído" })
        }
    }

    const getTipoColor = (tipo: Pacote["tipo"]) => {
        const colors = {
            natural: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            spray: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            misto: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        }
        return colors[tipo]
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-xl">📦</span>
                    </div>
                    <p className="text-muted-foreground">Carregando pacotes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Pacotes</h1>
                    <p className="text-muted-foreground">
                        Gerencie os pacotes e planos do seu studio
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            + Novo Pacote
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingPacote ? "Editar Pacote" : "Novo Pacote"}
                            </DialogTitle>
                            <DialogDescription>
                                Configure os detalhes do pacote
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Pacote *</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: Pacote Bronze"
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição</Label>
                                <Textarea
                                    id="descricao"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    placeholder="Descrição do pacote..."
                                    className="border-amber-200 dark:border-amber-800"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sessoes">Nº de Sessões *</Label>
                                    <Input
                                        id="sessoes"
                                        type="number"
                                        min="1"
                                        value={formData.sessoes}
                                        onChange={(e) => setFormData({ ...formData, sessoes: parseInt(e.target.value) || 1 })}
                                        className="border-amber-200 dark:border-amber-800"
                                    />
                                </div>
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
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Serviço *</Label>
                                    <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v as Pacote["tipo"] })}>
                                        <SelectTrigger className="border-amber-200 dark:border-amber-800">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="natural">Natural</SelectItem>
                                            <SelectItem value="spray">Spray</SelectItem>
                                            <SelectItem value="misto">Misto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validade">Validade (dias)</Label>
                                    <Input
                                        id="validade"
                                        type="number"
                                        min="1"
                                        value={formData.validadeDias}
                                        onChange={(e) => setFormData({ ...formData, validadeDias: parseInt(e.target.value) || 30 })}
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
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                                {editingPacote ? "Salvar" : "Criar Pacote"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Pacotes Grid */}
            {pacotes.length === 0 ? (
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="p-12 text-center">
                        <span className="text-6xl block mb-4">📦</span>
                        <h3 className="text-xl font-semibold mb-2">Nenhum pacote cadastrado</h3>
                        <p className="text-muted-foreground mb-4">
                            Crie seu primeiro pacote de bronzeamento
                        </p>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            + Novo Pacote
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pacotes.map((pacote) => (
                        <Card
                            key={pacote.id}
                            className={`border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 ${!pacote.ativo && "opacity-60"}`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {pacote.nome}
                                            {!pacote.ativo && (
                                                <Badge variant="secondary" className="text-xs">Inativo</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {pacote.descricao}
                                        </CardDescription>
                                    </div>
                                    <Badge className={getTipoColor(pacote.tipo)}>{pacote.tipo}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-amber-600">
                                            {formatarMoeda(pacote.preco)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {(pacote.preco / pacote.sessoes).toFixed(2)} por sessão
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{pacote.sessoes}</p>
                                        <p className="text-sm text-muted-foreground">sessões</p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-amber-100 dark:border-amber-900">
                                    <p className="text-sm text-muted-foreground">
                                        ⏱️ Validade: {pacote.validadeDias} dias
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleToggleAtivo(pacote.id, pacote.ativo)}
                                    >
                                        {pacote.ativo ? "Desativar" : "Ativar"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenDialog(pacote)}
                                    >
                                        ✏️
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(pacote.id)}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-amber-600">{pacotes.length}</p>
                        <p className="text-sm text-muted-foreground">Total de Pacotes</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {pacotes.filter(p => p.ativo).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Ativos</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {formatarMoeda(Math.min(...pacotes.map(p => p.preco)))}
                        </p>
                        <p className="text-sm text-muted-foreground">A partir de</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">
                            {Math.max(...pacotes.map(p => p.sessoes))}
                        </p>
                        <p className="text-sm text-muted-foreground">Máx. Sessões</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
