"use client"

import { useState } from "react"
import type { WorkOrderExtended } from "@/types/workOrder"
import { installationStatusLabels, installationStatusColors } from "@/types/installation"
import { ChecklistEditor } from "./ChecklistEditor"
import { EvidenceGallery } from "./EvidenceGallery"
import { WorkOrderTimeline } from "./WorkOrderTimeline"
import { InternalNotesSection } from "./InternalNotesSection"
import { WorkOrderPriorityBadge } from "./WorkOrderPriorityBadge"
import {
    User,
    MapPin,
    Calendar,
    Phone,
    Server,
    Box,
    Wifi,
    ClipboardList,
    Image as ImageIcon,
    History,
    MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface WorkOrderDetailPanelProps {
    workOrder: WorkOrderExtended
    onUpdateStatus?: (status: string) => void
}

type TabValue = "summary" | "checklist" | "evidence" | "timeline" | "notes"

const tabs: { label: string; value: TabValue; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Resumen", value: "summary", icon: User },
    { label: "Checklist", value: "checklist", icon: ClipboardList },
    { label: "Evidencia", value: "evidence", icon: ImageIcon },
    { label: "Historial", value: "timeline", icon: History },
    { label: "Notas", value: "notes", icon: MessageSquare },
]

export function WorkOrderDetailPanel({ workOrder }: WorkOrderDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<TabValue>("summary")

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="glass-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {workOrder.clientName}
                            </h1>
                            <span className="font-mono text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                {workOrder.id}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {workOrder.address}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                {workOrder.clientPhone}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <WorkOrderPriorityBadge priority={workOrder.priority || "normal"} />
                        <span
                            className={cn(
                                "rounded-full px-3 py-1 text-sm font-medium",
                                installationStatusColors[workOrder.status]
                            )}
                        >
                            {installationStatusLabels[workOrder.status]}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={cn(
                                "flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                                activeTab === tab.value
                                    ? "border-primary bg-secondary/30 text-primary"
                                    : "border-transparent text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === "summary" && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Col */}
                        <div className="space-y-6">
                            {/* Technical Info */}
                            <div className="glass-card p-5 space-y-4">
                                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                                    Detalles Técnicos
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Plan contratado</p>
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <Wifi className="h-4 w-4 text-primary" />
                                            {workOrder.planName}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Tipo instalación</p>
                                        <p className="font-medium text-foreground">
                                            {workOrder.checklistTemplateId?.includes("FTTH") ? "Fibra Óptica (FTTH)" : "Inalámbrico"}
                                        </p>
                                    </div>

                                    {workOrder.napName && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">NAP Asignado</p>
                                            <div className="flex items-center gap-2 font-medium text-foreground">
                                                <Box className="h-4 w-4 text-amber-500" />
                                                {workOrder.napName}
                                            </div>
                                        </div>
                                    )}

                                    {workOrder.onuSerial && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Serial ONU</p>
                                            <div className="flex items-center gap-2 font-medium text-foreground">
                                                <Server className="h-4 w-4 text-emerald-500" />
                                                {workOrder.onuSerial}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Schedule Info */}
                            <div className="glass-card p-5 space-y-4">
                                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                                    Programación
                                </h3>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {format(new Date(workOrder.date), "EEEE d 'de' MMMM", { locale: es })}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{workOrder.timeSlot}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Técnico: <span className="text-foreground font-medium">{workOrder.assignedTechnicianName || "Sin asignar"}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col */}
                        <div className="space-y-6">
                            {/* Notes */}
                            {workOrder.notes && (
                                <div className="glass-card p-5 space-y-3 border-l-4 border-l-amber-500">
                                    <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                                        Notas del Cliente
                                    </h3>
                                    <p className="text-sm text-muted-foreground italic">
                                        "{workOrder.notes}"
                                    </p>
                                </div>
                            )}

                            {/* Internal Notes Preview */}
                            <div className="glass-card p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                                        Notas Internas Recientes
                                    </h3>
                                </div>
                                {workOrder.internalNotes && workOrder.internalNotes.length > 0 ? (
                                    <div className="space-y-3">
                                        {workOrder.internalNotes.slice(0, 2).map((note) => (
                                            <div key={note.id} className="text-sm bg-secondary/30 p-3 rounded-lg">
                                                <p className="text-foreground">{note.content}</p>
                                                <p className="text-xs text-muted-foreground mt-1 text-right">
                                                    - {note.createdByName}
                                                </p>
                                            </div>
                                        ))}
                                        {workOrder.internalNotes.length > 2 && (
                                            <button
                                                onClick={() => setActiveTab("notes")}
                                                className="text-xs text-primary hover:underline w-full text-center"
                                            >
                                                Ver todas ({workOrder.internalNotes.length})
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay notas internas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "checklist" && (
                    <div className="max-w-3xl">
                        <ChecklistEditor items={workOrder.checklistItems || []} />
                    </div>
                )}

                {activeTab === "evidence" && (
                    <EvidenceGallery evidence={workOrder.evidence || []} />
                )}

                {activeTab === "timeline" && (
                    <div className="max-w-2xl">
                        <WorkOrderTimeline events={workOrder.timeline || []} />
                    </div>
                )}

                {activeTab === "notes" && (
                    <div className="max-w-2xl">
                        <InternalNotesSection notes={workOrder.internalNotes || []} />
                    </div>
                )}
            </div>
        </div>
    )
}
