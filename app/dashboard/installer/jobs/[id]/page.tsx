"use client"

import { use } from "react"
import { useState } from "react"
import { mockWorkOrders } from "@/mocks/workOrders"
import { ArrowLeft, CheckCircle, Navigation, Camera, X } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChecklistEditor } from "@/components/work-orders/ChecklistEditor"
import { EvidenceGallery } from "@/components/work-orders/EvidenceGallery"
import { installationStatusLabels, installationStatusColors } from "@/types/installation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PageProps {
    params: Promise<{ id: string }>
}

type Tab = "info" | "checklist" | "evidence"

export default function InstallerJobDetailPage({ params }: PageProps) {
    const { id } = use(params)
    // Cast to WorkOrderExtended implicitly by using the mock which is typed
    const workOrder = mockWorkOrders.find((w) => w.id === id)
    const [activeTab, setActiveTab] = useState<Tab>("info")

    if (!workOrder) {
        notFound()
    }

    // Simplified actions for installer
    const nextAction = workOrder.status === "pending"
        ? { label: "Confirmar Cita", icon: CheckCircle, color: "bg-primary" }
        : workOrder.status === "confirmed"
            ? { label: "Iniciar Viaje", icon: Navigation, color: "bg-cyan-600" }
            : workOrder.status === "en_route"
                ? { label: "Llegué al Sitio", icon: MapPin, color: "bg-blue-600" }
                : null

    return (
        <div className="space-y-4 pb-20"> {/* pb-20 for mobile floating action */}
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/installer"
                    className="rounded-full bg-secondary p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-lg font-bold text-foreground">
                        {workOrder.clientName}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {workOrder.id} • {workOrder.address}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary/30 p-1">
                <button
                    onClick={() => setActiveTab("info")}
                    className={cn(
                        "rounded-md py-1.5 text-xs font-medium transition-all",
                        activeTab === "info"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Info
                </button>
                <button
                    onClick={() => setActiveTab("checklist")}
                    className={cn(
                        "rounded-md py-1.5 text-xs font-medium transition-all",
                        activeTab === "checklist"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Checklist
                </button>
                <button
                    onClick={() => setActiveTab("evidence")}
                    className={cn(
                        "rounded-md py-1.5 text-xs font-medium transition-all",
                        activeTab === "evidence"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Evidencia
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[60vh]">
                {activeTab === "info" && (
                    <div className="space-y-4">
                        <div className="glass-card p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Estado Actual</span>
                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", installationStatusColors[workOrder.status])}>
                                    {installationStatusLabels[workOrder.status]}
                                </span>
                            </div>

                            <div className="pt-2 border-t border-border space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fecha</p>
                                        <p className="font-medium">{format(new Date(workOrder.date), "dd/MM/yyyy")}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Hora</p>
                                        <p className="font-medium">{workOrder.timeSlot}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Plan</p>
                                    <p className="font-medium text-emerald-400">{workOrder.planName}</p>
                                </div>
                                {workOrder.notes && (
                                    <div className="bg-amber-500/10 p-2 rounded text-xs text-amber-200 border border-amber-500/20">
                                        <p className="font-bold mb-0.5">Nota:</p>
                                        {workOrder.notes}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-4">
                            <h3 className="text-sm font-medium mb-2">Google Maps</h3>
                            <div className="aspect-video w-full rounded-lg bg-secondary/50 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center">
                                    <MapPin className="h-8 w-8 text-primary mb-2" />
                                    <p className="text-xs text-muted-foreground">Mapa Interactivo Placeholder</p>
                                </div>
                            </div>
                            <button className="w-full mt-3 py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5">
                                Abrir en Waze / Maps
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "checklist" && (
                    <div className="glass-card p-4">
                        <ChecklistEditor
                            items={workOrder.checklistItems || []}
                            editable={true} // Installer can edit checklist
                        />
                    </div>
                )}

                {activeTab === "evidence" && (
                    <div className="glass-card p-4">
                        <EvidenceGallery
                            evidence={workOrder.evidence || []}
                            canUpload={true} // Installer can upload
                        />
                    </div>
                )}
            </div>

            {/* Floating Action Bar (Mobile Sticky) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border bg-background/80 backdrop-blur-lg z-10 lg:pl-64">
                {nextAction ? (
                    <button className={cn("w-full h-12 rounded-lg flex items-center justify-center gap-2 font-bold text-white shadow-lg shadow-black/20 hover:brightness-110 active:scale-[0.98] transition-all", nextAction.color)}>
                        <nextAction.icon className="h-5 w-5" />
                        {nextAction.label}
                    </button>
                ) : (
                    <div className="text-center text-sm text-muted-foreground">
                        Orden completada o requiere atención de soporte.
                    </div>
                )}
            </div>
        </div>
    )
}

// Missing imports fix - need MapPin
import { MapPin } from "lucide-react" 
