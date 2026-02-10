"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase"

interface Studio {
    id: string
    user_id: string
    email: string
    nome_estudio: string
    telefone: string
    plano: "basico" | "profissional"
    ativo: boolean
    drive_artes_link: string
    latitude?: number
    longitude?: number
    created_at: string
}

export default function AdminPage() {
    const router = useRouter()
    const { user, isLoading: authLoading, isAdmin } = useAuth()
    const supabase = createClient()

    const [studios, setStudios] = useState<Studio[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingStudio, setEditingStudio] = useState<Studio | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Verificar se é admin
    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            router.push("/login")
        }
    }, [user, isAdmin, authLoading, router])

    // Buscar todos os studios
    const fetchStudios = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from("studios")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Erro ao buscar studios:", error)
        } else {
            setStudios(data || [])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (isAdmin) {
            fetchStudios()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin])

    // Atualizar studio
    const handleUpdateStudio = async () => {
        if (!editingStudio) return

        setSaving(true)
        const { data, error } = await supabase
            .from("studios")
            .update({
                nome_estudio: editingStudio.nome_estudio,
                telefone: editingStudio.telefone,
                plano: editingStudio.plano,
                ativo: editingStudio.ativo,
                drive_artes_link: editingStudio.drive_artes_link,
                latitude: editingStudio.latitude,
                longitude: editingStudio.longitude,
            })
            .eq("id", editingStudio.id)
            .select()

        if (error) {
            console.error("Erro ao atualizar studio:", error)
            alert("Erro ao salvar: " + error.message)
        } else if (!data || data.length === 0) {
            console.error("Update retornou 0 linhas - provável bloqueio de RLS")
            alert("Erro: Sem permissão para editar este studio. Verifique as políticas RLS no Supabase.")
        } else {
            await fetchStudios()
            setDialogOpen(false)
            setEditingStudio(null)
        }
        setSaving(false)
    }

    // Toggle ativo
    const toggleAtivo = async (studio: Studio) => {
        const { data, error } = await supabase
            .from("studios")
            .update({ ativo: !studio.ativo })
            .eq("id", studio.id)
            .select()

        if (error) {
            console.error("Erro ao toggle ativo:", error)
            alert("Erro: " + error.message)
        } else if (!data || data.length === 0) {
            alert("Erro: Sem permissão para alterar este studio.")
        } else {
            setStudios(prev =>
                prev.map(s => s.id === studio.id ? { ...s, ativo: !s.ativo } : s)
            )
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-xl">👑</span>
                    </div>
                    <p className="text-zinc-400">Carregando admin...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <span className="text-white text-2xl">👑</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Admin SunSync</h1>
                            <p className="text-zinc-400">Gerenciar Studios</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        ← Voltar ao Dashboard
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-zinc-800/50 border-zinc-700">
                        <CardContent className="p-4">
                            <p className="text-zinc-400 text-sm">Total Studios</p>
                            <p className="text-3xl font-bold text-white">{studios.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-800/50 border-zinc-700">
                        <CardContent className="p-4">
                            <p className="text-zinc-400 text-sm">Ativos</p>
                            <p className="text-3xl font-bold text-green-400">
                                {studios.filter(s => s.ativo).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-800/50 border-zinc-700">
                        <CardContent className="p-4">
                            <p className="text-zinc-400 text-sm">Plano Básico</p>
                            <p className="text-3xl font-bold text-amber-400">
                                {studios.filter(s => s.plano === "basico").length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-800/50 border-zinc-700">
                        <CardContent className="p-4">
                            <p className="text-zinc-400 text-sm">Plano Profissional</p>
                            <p className="text-3xl font-bold text-purple-400">
                                {studios.filter(s => s.plano === "profissional").length}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabela */}
                <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardHeader>
                        <CardTitle className="text-white">Studios Cadastrados</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Gerencie os studios que usam o SunSync
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-700">
                                    <TableHead className="text-zinc-400">Email</TableHead>
                                    <TableHead className="text-zinc-400">Nome</TableHead>
                                    <TableHead className="text-zinc-400">Plano</TableHead>
                                    <TableHead className="text-zinc-400">Drive PRO</TableHead>
                                    <TableHead className="text-zinc-400">Status</TableHead>
                                    <TableHead className="text-zinc-400">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studios.map((studio) => (
                                    <TableRow key={studio.id} className="border-zinc-700">
                                        <TableCell className="text-white font-medium">
                                            {studio.email}
                                        </TableCell>
                                        <TableCell className="text-zinc-300">
                                            {studio.nome_estudio || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    studio.plano === "profissional"
                                                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                                        : "bg-amber-500"
                                                }
                                            >
                                                {studio.plano === "profissional" ? "PRO" : "Básico"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-300">
                                            {studio.drive_artes_link ? (
                                                <span className="text-green-400">✓ Configurado</span>
                                            ) : (
                                                <span className="text-zinc-500">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={studio.ativo}
                                                onCheckedChange={() => toggleAtivo(studio)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Dialog open={dialogOpen && editingStudio?.id === studio.id} onOpenChange={(open) => {
                                                setDialogOpen(open)
                                                if (!open) setEditingStudio(null)
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                                                        onClick={() => {
                                                            setEditingStudio(studio)
                                                            setDialogOpen(true)
                                                        }}
                                                    >
                                                        ✏️ Editar
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
                                                    <DialogHeader>
                                                        <DialogTitle>Editar Studio</DialogTitle>
                                                        <DialogDescription className="text-zinc-400">
                                                            {editingStudio?.email}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label>Nome do Estúdio</Label>
                                                            <Input
                                                                value={editingStudio?.nome_estudio || ""}
                                                                onChange={(e) =>
                                                                    setEditingStudio(prev =>
                                                                        prev ? { ...prev, nome_estudio: e.target.value } : null
                                                                    )
                                                                }
                                                                className="bg-zinc-800 border-zinc-700"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Telefone</Label>
                                                            <Input
                                                                value={editingStudio?.telefone || ""}
                                                                onChange={(e) =>
                                                                    setEditingStudio(prev =>
                                                                        prev ? { ...prev, telefone: e.target.value } : null
                                                                    )
                                                                }
                                                                className="bg-zinc-800 border-zinc-700"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Plano</Label>
                                                            <Select
                                                                value={editingStudio?.plano}
                                                                onValueChange={(value) =>
                                                                    setEditingStudio(prev =>
                                                                        prev ? { ...prev, plano: value as "basico" | "profissional" } : null
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                                                    <SelectItem value="basico">Básico</SelectItem>
                                                                    <SelectItem value="profissional">Profissional</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Link do Google Drive (PRO)</Label>
                                                            <Input
                                                                value={editingStudio?.drive_artes_link || ""}
                                                                onChange={(e) =>
                                                                    setEditingStudio(prev =>
                                                                        prev ? { ...prev, drive_artes_link: e.target.value } : null
                                                                    )
                                                                }
                                                                placeholder="https://drive.google.com/..."
                                                                className="bg-zinc-800 border-zinc-700"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Label>Studio Ativo</Label>
                                                            <Switch
                                                                checked={editingStudio?.ativo}
                                                                onCheckedChange={(checked) =>
                                                                    setEditingStudio(prev =>
                                                                        prev ? { ...prev, ativo: checked } : null
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-zinc-700"
                                                            onClick={() => {
                                                                setDialogOpen(false)
                                                                setEditingStudio(null)
                                                            }}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500"
                                                            onClick={handleUpdateStudio}
                                                            disabled={saving}
                                                        >
                                                            {saving ? "Salvando..." : "Salvar"}
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {studios.length === 0 && (
                            <div className="text-center py-8 text-zinc-400">
                                Nenhum studio cadastrado ainda
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
