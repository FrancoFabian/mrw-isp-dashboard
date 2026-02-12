"use client"

import { useState } from "react"
import { mockWorkOrders } from "@/mocks/workOrders"
import { WorkOrdersTable } from "@/components/work-orders/WorkOrdersTable"
import { WorkOrderPriorityBadge } from "@/components/work-orders/WorkOrderPriorityBadge"
import type { InstallationStatus } from "@/types/installation"
import {
    Filter,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    UserCheck,
    AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const statusFilters: { label: string; value: InstallationStatus | "all" }[] = [
    { label: "Todas", value: "all" },
    { label: "Pendientes", value: "pending" },
    { label: "Confirmadas", value: "confirmed" },
    { label: "En curso", value: "en_route" },
    { label: "Completadas", value: "installed" },
    { label: "Problemas", value: "requires_reschedule" },
]

export default function WorkOrdersPage() {
    const [statusFilter, setStatusFilter] = useState<InstallationStatus | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Calculate summary stats
    const pendingCount = mockWorkOrders.filter(o => o.status === "pending" || o.status === "confirmed").length
    const assignedCount = mockWorkOrders.filter(o => o.assignedTechnicianId).length
    const inProgressCount = mockWorkOrders.filter(o => o.status === "en_route").length
    const completedCount = mockWorkOrders.filter(o => o.status === "installed").length
    const urgentCount = mockWorkOrders.filter(o => o.priority === "urgent" || o.priority === "high").length

    // Filter logic
    const filteredOrders = mockWorkOrders.filter(order => {
        // Status filter
        if (statusFilter !== "all" && order.status !== statusFilter) return false

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                order.clientName.toLowerCase().includes(query) ||
                order.id.toLowerCase().includes(query) ||
                order.address.toLowerCase().includes(query) ||
                (order.assignedTechnicianName && order.assignedTechnicianName.toLowerCase().includes(query))
            )
        }

        return true
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Gestión de Instalaciones
                    </h1>
                    <p className="text-muted-foreground">
                        Administra órdenes de trabajo, asignaciones y seguimiento de técnicos.
                    </p>
                </div>
                <Link
                    href="/dashboard/work-orders/new"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Orden
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                            <p className="text-xs text-muted-foreground">Pendientes</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <UserCheck className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{assignedCount}</p>
                            <p className="text-xs text-muted-foreground">Asignadas</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                            <p className="text-xs text-muted-foreground">Completadas</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{urgentCount}</p>
                            <p className="text-xs text-muted-foreground">Prioridad alta/urgente</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex gap-2">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={cn(
                                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                                    statusFilter === filter.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, ID..."
                        className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table */}
            <WorkOrdersTable data={filteredOrders} />
        </div>
    )
}
