"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Wifi, Download, Upload, DollarSign, Users, FileText } from "lucide-react"
import type { Plan } from "@/types/plan"
import { editSectionContainerClass, embeddedValueClass, IconEditFieldCard } from "@/components/clients/detail-edit-fields"

export interface PlanFormData {
    name: string
    downloadSpeed: number
    uploadSpeed: number
    price: number
    description: string
    isPopular: boolean
    clientCount: number
    scheduledPrice?: number
    scheduledDate?: string
}

interface PlanFormSheetProps {
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
    scheduledPrice: undefined,
    scheduledDate: undefined,
}

export function PlanFormSheet({
    open,
    onOpenChange,
    initialData,
    onSave,
}: PlanFormSheetProps) {
    const isMobile = useIsMobile()
    const [formData, setFormData] = useState<PlanFormData>(defaultData)
    const [scheduleDate, setScheduleDate] = useState<string>("")

    // State for Profeco Warning
    const [showProfecoWarning, setShowProfecoWarning] = useState(false)

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
                    scheduledPrice: initialData.scheduledPrice,
                    scheduledDate: initialData.scheduledDate,
                })
                setScheduleDate(initialData.scheduledDate || "")
            } else {
                setFormData(defaultData)
                setScheduleDate("")
            }
            setShowProfecoWarning(false)
        }
    }, [open, initialData])

    const checkAndSave = () => {
        // If we are editing an existing plan
        if (initialData) {
            const isEnterprise = initialData.name.toLowerCase().includes("empresarial")
            const priceChanged = initialData.price !== formData.price
            const hasClients = initialData.clientCount > 0

            // Profeco Rule: If price changed and there are active clients, show warning (Applies to Non-Enterprise)
            if (priceChanged && hasClients && !isEnterprise) {
                setShowProfecoWarning(true)
                return // Stop the flow
            }
        }

        // Otherwise, or if it's a new plan, save normally
        executeSave()
    }

    const handleScheduleSave = () => {
        if (!scheduleDate) {
            alert("Por favor selecciona una fecha válida para programar el cambio.")
            return
        }

        onSave({
            ...formData,
            price: initialData!.price, // Keep current price
            scheduledPrice: formData.price, // Store the new intended price
            scheduledDate: scheduleDate
        })
        setShowProfecoWarning(false)
        onOpenChange(false)
    }

    const executeSave = () => {
        onSave(formData)
        setShowProfecoWarning(false)
        onOpenChange(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        checkAndSave()
    }

    const FormContent = (
        <form id="plan-form" onSubmit={handleSubmit} className="space-y-4">
            <div className={editSectionContainerClass}>
                <IconEditFieldCard label="Nombre del plan" required icon={<Wifi size={16} />}>
                    <input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej. Básico, Plus..."
                        required
                        autoFocus
                        className={embeddedValueClass()}
                    />
                </IconEditFieldCard>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <IconEditFieldCard label="Tasa Bajada (Mbps)" required icon={<Download size={16} />}>
                        <input
                            id="download"
                            type="number"
                            min="0"
                            value={formData.downloadSpeed}
                            onChange={(e) => setFormData({ ...formData, downloadSpeed: Number(e.target.value) })}
                            required
                            className={embeddedValueClass()}
                        />
                    </IconEditFieldCard>

                    <IconEditFieldCard label="Tasa Subida (Mbps)" required icon={<Upload size={16} />}>
                        <input
                            id="upload"
                            type="number"
                            min="0"
                            value={formData.uploadSpeed}
                            onChange={(e) => setFormData({ ...formData, uploadSpeed: Number(e.target.value) })}
                            required
                            className={embeddedValueClass()}
                        />
                    </IconEditFieldCard>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <IconEditFieldCard label="Precio mensual ($)" required icon={<DollarSign size={16} />}>
                        <input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            required
                            className={embeddedValueClass()}
                        />
                    </IconEditFieldCard>

                    <IconEditFieldCard label="N° Clientes (Lectura)" icon={<Users size={16} />}>
                        <input
                            id="clients"
                            type="number"
                            disabled
                            value={formData.clientCount}
                            className={embeddedValueClass("text-zinc-500")}
                            title="Los clientes se calculan automáticamente"
                        />
                    </IconEditFieldCard>
                </div>

                <IconEditFieldCard label="Descripción" icon={<FileText size={16} />}>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Breve resumen de para quién es el plan..."
                        rows={3}
                        className={cn(embeddedValueClass("resize-none min-h-[64px] leading-6"))}
                    />
                </IconEditFieldCard>
            </div>

            <div className="rounded-xl border border-white/10 bg-gradient-to-b from-[#1a1a1f] to-[#050505] p-4 shadow-inner">
                <label htmlFor="popular" className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                    <Checkbox
                        id="popular"
                        checked={formData.isPopular}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked === true })}
                    />
                    Marcar como Destacado/Popular
                </label>
            </div>
        </form>
    )

    const actionText = initialData ? "Guardar Cambios" : "Crear Plan"

    // ── Profeco Alert Dialog ──
    const profecoDialog = (
        <AlertDialog open={showProfecoWarning} onOpenChange={setShowProfecoWarning}>
            <AlertDialogContent className="bg-zinc-950 border-orange-500/30 text-slate-200">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-orange-400">
                        <AlertTriangle className="h-5 w-5" />
                        Programar Cambio de Precio (Profeco)
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400 mt-2 space-y-2">
                        <span className="block">
                            Estás modificando el precio del plan <strong>{initialData?.name}</strong> de <strong>${initialData?.price} a ${formData.price}</strong>.
                            Actualmente este plan tiene <strong>{initialData?.clientCount} clientes activos</strong>.
                        </span>
                        <span className="block text-orange-300/80 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20 text-xs leading-relaxed">
                            Según los reglamentos de Profeco, cualquier modificación en la tarifa fijada debe ser notificada a los consumidores con al menos <strong>30 días de anticipación</strong>.
                        </span>
                        <span className="block mt-4">
                            <Label htmlFor="schedule-date" className="text-white mb-2 block">Selecciona la fecha de aplicación:</Label>
                            <Input
                                id="schedule-date"
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="bg-zinc-900 border-zinc-700 text-white w-[200px]"
                            />
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white">
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Prevent default Radix behavior closing it instantly
                            handleScheduleSave();
                        }}
                        disabled={!scheduleDate}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-[0_0_15px_-3px_rgba(234,88,12,0.4)] disabled:opacity-50 disabled:shadow-none"
                    >
                        Programar Cambio
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )

    if (isMobile) {
        return (
            <>
                <Drawer open={open} onOpenChange={onOpenChange}>
                    <DrawerContent className="bg-gradient-to-b from-zinc-900 to-black border-t border-zinc-800/80 text-zinc-100">
                        <DrawerHeader className="text-left border-b border-zinc-800/50 p-6 pb-4">
                            <DrawerTitle className="text-xl font-bold text-white">
                                {initialData ? "Editar Plan" : "Nuevo Plan"}
                            </DrawerTitle>
                            <DrawerDescription className="sr-only">
                                Formulario para configurar los parámetros, precios y descripción de un plan de internet.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-6 pb-6 pt-4 overflow-y-auto max-h-[70vh] panel-scrollbar">
                            {FormContent}
                        </div>
                        <DrawerFooter className="border-t border-zinc-800/50 bg-black/20 p-6 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="w-full border-[#222] bg-[#1a1a1a] text-zinc-400 hover:border-zinc-700 hover:bg-[#222] hover:text-white"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="plan-form"
                                className="w-full bg-white text-black hover:bg-zinc-200"
                            >
                                {actionText}
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
                {profecoDialog}
            </>
        )
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="w-[420px] sm:w-[560px] border-l border-zinc-800/80 bg-gradient-to-b from-zinc-900 to-black p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b border-zinc-800/50 text-left">
                        <SheetTitle className="text-xl md:text-2xl font-bold tracking-tight text-white">
                            {initialData ? "Editar Plan" : "Añadir Nuevo Plan"}
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                            Formulario para configurar los parámetros, precios y descripción de un plan de internet en el sistema.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 panel-scrollbar">
                        {FormContent}
                    </div>

                    <SheetFooter className="p-6 border-t border-zinc-800/50 bg-black/20 flex flex-row gap-3 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-[#222] bg-[#1a1a1a] text-zinc-400 hover:border-zinc-700 hover:bg-[#222] hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" form="plan-form" className="bg-white px-8 text-black hover:bg-zinc-200">
                            {actionText}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            {profecoDialog}
        </>
    )
}
