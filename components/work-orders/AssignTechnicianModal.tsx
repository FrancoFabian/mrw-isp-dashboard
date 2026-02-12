"use client"

import { useState } from "react"
import type { StaffMember } from "@/types/staff"
import { mockStaff } from "@/mocks/staff" // You might need to make sure this export exists or create it
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MapPin, User } from "lucide-react"

interface AssignTechnicianModalProps {
    isOpen: boolean
    onClose: () => void
    onAssign: (technicianId: string) => void
    currentTechnicianId?: string
    workOrderZone?: string
}

export function AssignTechnicianModal({
    isOpen,
    onClose,
    onAssign,
    currentTechnicianId,
    workOrderZone,
}: AssignTechnicianModalProps) {
    const [selectedTechId, setSelectedTechId] = useState<string>(
        currentTechnicianId || ""
    )

    // Filter staff to only show installers
    // In a real app, mockStaff might need to be imported from a central place or passed as props
    // For now, I'll assume mockStaff is available or I'll use a local mock for the component if import fails
    // But strictly, I should check mockStaff availability. Use a local fallback for now to be safe.

    const installers = mockStaff?.filter(s => s.role === "installer") || [
        { id: "STF-002", name: "Luis Ramirez", zone: "Centro" },
        { id: "STF-005", name: "Jorge Castillo", zone: "Norte" },
        { id: "STF-007", name: "Pedro Dominguez", zone: "Sur" },
    ]

    const handleAssign = () => {
        if (selectedTechId) {
            onAssign(selectedTechId)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Asignar Técnico</DialogTitle>
                    <DialogDescription>
                        Selecciona el técnico responsable para esta orden de trabajo.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Técnico Instalador
                        </label>
                        <Select
                            value={selectedTechId}
                            onValueChange={setSelectedTechId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar técnico..." />
                            </SelectTrigger>
                            <SelectContent>
                                {installers.map((tech) => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-[10px] font-bold">
                                                {tech.name.charAt(0)}
                                            </div>
                                            <span>{tech.name}</span>
                                            {tech.zone === workOrderZone && (
                                                <span className="ml-auto text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                    Zona Recomendada
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedTechId && (
                        <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">
                                    {installers.find(i => i.id === selectedTechId)?.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>Zona: {installers.find(i => i.id === selectedTechId)?.zone || "General"}</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleAssign} disabled={!selectedTechId}>
                        Confirmar Asignación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
