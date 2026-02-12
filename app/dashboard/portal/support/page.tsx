"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { mockTickets } from "@/mocks/tickets"
import type { TicketStatus } from "@/types/ticket"
import {
    ticketPriorityLabels,
    ticketPriorityColors,
    ticketStatusLabels,
    ticketStatusColors,
    ticketCategoryLabels,
} from "@/types/ticket"
import { cn } from "@/lib/utils"
import {
    LifeBuoy,
    Plus,
    AlertCircle,
    Clock,
    CheckCircle,
    ExternalLink,
    Calendar,
    HelpCircle,
} from "lucide-react"

// Mock current client ID
const CURRENT_CLIENT_ID = "CLT-003"

const statusFilters: { label: string; value: TicketStatus | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Abiertos", value: "open" },
    { label: "En progreso", value: "in_progress" },
    { label: "Resueltos", value: "resolved" },
]

export default function ClientSupportPage() {
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")

    const clientTickets = useMemo(() => {
        return mockTickets.filter((t) => t.clientId === CURRENT_CLIENT_ID)
    }, [])

    const filteredTickets = useMemo(() => {
        if (statusFilter === "all") return clientTickets
        return clientTickets.filter((t) => t.status === statusFilter)
    }, [clientTickets, statusFilter])

    const openCount = clientTickets.filter((t) => t.status === "open" || t.status === "new").length
    const inProgressCount = clientTickets.filter((t) => t.status === "in_progress" || t.status === "waiting_customer").length
    const resolvedCount = clientTickets.filter((t) => t.status === "resolved" || t.status === "closed").length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Mis Solicitudes
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Revisa el estado de tus tickets de soporte
                    </p>
                </div>
                <Link
                    href="/dashboard/portal/support/new"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Nueva solicitud
                </Link>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Abiertos</p>
                        <p className="text-xl font-bold text-foreground">{openCount}</p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                        <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">En proceso</p>
                        <p className="text-xl font-bold text-foreground">{inProgressCount}</p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Resueltos</p>
                        <p className="text-xl font-bold text-foreground">{resolvedCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => setStatusFilter(filter.value)}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                            statusFilter === filter.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Ticket list */}
            <div className="space-y-3">
                {filteredTickets.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-2 text-muted-foreground">No tienes solicitudes</p>
                        <Link
                            href="/dashboard/portal/support/new"
                            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            <Plus className="h-4 w-4" />
                            Crear nueva solicitud
                        </Link>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            href={`/dashboard/portal/support/${ticket.id}`}
                            className="glass-card-hover block p-4 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {ticket.id}
                                        </span>
                                        <span
                                            className={cn(
                                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                                ticketPriorityColors[ticket.priority]
                                            )}
                                        >
                                            {ticketPriorityLabels[ticket.priority]}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {ticket.subject}
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                        {ticket.description}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span
                                        className={cn(
                                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            ticketStatusColors[ticket.status]
                                        )}
                                    >
                                        {ticketStatusLabels[ticket.status]}
                                    </span>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <LifeBuoy className="h-3 w-3" />
                                    <span>{ticketCategoryLabels[ticket.category]}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{ticket.createdAt.split("T")[0]}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
