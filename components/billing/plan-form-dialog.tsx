"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Plan } from "@/types/plan"

export interface PlanFormData {
    name: string
    downloadSpeed: number
    uploadSpeed: number
    price: number
    description: string
    isPopular: boolean
    clientCount: number
}

interface PlanFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: Plan | null
    onSave: (data: PlanFormData) => void
}

const defaultData: PlanFormData = {
    name: "",
    downloadSpeed: 10,
    uploadSpeed: 5,
    price: 0,
    description: "",
    isPopular: false,
    clientCount: 0,
}

export function PlanFormDialog({
    open,
    onOpenChange,
    initialData,
    onSave,
}: PlanFormDialogProps) {
    const [formData, setFormData] = useState<PlanFormData>(defaultData)

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    downloadSpeed: initialData.downloadSpeed,
                    uploadSpeed: initialData.uploadSpeed,
                    price: initialData.price,
                    description: initialData.description,
                    isPopular: initialData.isPopular,
                    clientCount: initialData.clientCount,
                })
            } else {
                setFormData(defaultData)
            }
        }
    }, [open, initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] border-border/50 bg-zinc-950 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        {initialData ? "Editar Plan" : "Nuevo Plan"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-muted-foreground">Nombre del plan</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej. Básico, Plus..."
                            required
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="download" className="text-muted-foreground">Tasa Bajada (Mbps)</Label>
                            <Input
                                id="download"
                                type="number"
                                min="0"
                                value={formData.downloadSpeed}
                                onChange={(e) => setFormData({ ...formData, downloadSpeed: Number(e.target.value) })}
                                required
                                className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="upload" className="text-muted-foreground">Tasa Subida (Mbps)</Label>
                            <Input
                                id="upload"
                                type="number"
                                min="0"
                                value={formData.uploadSpeed}
                                onChange={(e) => setFormData({ ...formData, uploadSpeed: Number(e.target.value) })}
                                required
                                className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-muted-foreground">Precio mensual ($)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                                className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clients" className="text-muted-foreground">N° Clientes</Label>
                            <Input
                                id="clients"
                                type="number"
                                min="0"
                                value={formData.clientCount}
                                onChange={(e) => setFormData({ ...formData, clientCount: Number(e.target.value) })}
                                className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-muted-foreground">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Breve resumen de para quién es el plan..."
                            className="resize-none bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50 h-20"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="popular"
                            checked={formData.isPopular}
                            onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked === true })}
                        />
                        <Label htmlFor="popular" className="font-medium cursor-pointer">
                            Marcar como Destacado/Popular
                        </Label>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-zinc-800 hover:bg-zinc-800 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {initialData ? "Guardar Cambios" : "Crear Plan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
