"use client"

import { useState, useMemo, DragEvent } from "react"
import { mockTickets } from "@/mocks/tickets"
import type { TicketStatus, TicketPriority, TicketCategory, Ticket } from "@/types/ticket"
import {
    ticketPriorityLabels,
    ticketPriorityColors,
    ticketStatusLabels,
    ticketStatusColors,
    ticketCategoryLabels,
    ticketCategoryColors,
} from "@/types/ticket"
import { cn } from "@/lib/utils"
import {
    Layout,
    Filter,
    User,
    Calendar,
    AlertTriangle,
    X,
    ChevronRight,
    LifeBuoy,
    Clock,
    Image as ImageIcon,
} from "lucide-react"
import { buildMediaUrl } from "@/helpers/media"

// Board columns mapping ticket statuses
const COLUMNS: { id: string; title: string; statuses: TicketStatus[]; color: string }[] = [
    { id: "backlog", title: "Backlog", statuses: ["new"], color: "bg-purple-500/10 border-purple-500/30" },
    { id: "todo", title: "To Do", statuses: ["open"], color: "bg-blue-500/10 border-blue-500/30" },
    { id: "in_progress", title: "In Progress", statuses: ["in_progress"], color: "bg-cyan-500/10 border-cyan-500/30" },
    { id: "waiting", title: "Waiting", statuses: ["waiting_customer"], color: "bg-amber-500/10 border-amber-500/30" },
    { id: "done", title: "Done", statuses: ["resolved", "closed"], color: "bg-emerald-500/10 border-emerald-500/30" },
]

// Map column ID to target status
const COLUMN_TO_STATUS: Record<string, TicketStatus> = {
    backlog: "new",
    todo: "open",
    in_progress: "in_progress",
    waiting: "waiting_customer",
    done: "resolved",
}

export default function KanbanBoardPage() {
    const [tickets, setTickets] = useState(mockTickets)
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all")
    const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all")
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [previewMediaPath, setPreviewMediaPath] = useState<string | null>(null)

    // Filter tickets
    const filteredTickets = useMemo(() => {
        return tickets.filter((t) => {
            if (priorityFilter !== "all" && t.priority !== priorityFilter) return false
            if (categoryFilter !== "all" && t.category !== categoryFilter) return false
            // Exclude closed from default view to keep board manageable
            if (t.status === "closed") return false
            return true
        })
    }, [tickets, priorityFilter, categoryFilter])

    // Group tickets by column
    const ticketsByColumn = useMemo(() => {
        const grouped: Record<string, typeof filteredTickets> = {}
        for (const col of COLUMNS) {
            grouped[col.id] = filteredTickets.filter((t) => col.statuses.includes(t.status))
        }
        return grouped
    }, [filteredTickets])

    // Drag handlers
    const handleDragStart = (e: DragEvent<HTMLDivElement>, ticketId: string) => {
        e.dataTransfer.setData("ticketId", ticketId)
        setDraggingId(ticketId)
    }

    const handleDragEnd = () => {
        setDraggingId(null)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>, columnId: string) => {
        e.preventDefault()
        const ticketId = e.dataTransfer.getData("ticketId")
        const newStatus = COLUMN_TO_STATUS[columnId]

        if (!newStatus) return

        // Update ticket status
        setTickets((prev) =>
            prev.map((t) =>
                t.id === ticketId
                    ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
                    : t
            )
        )
        setDraggingId(null)
    }

    const handleRemoveVisualAttachment = (ticketId: string, attachmentId: string) => {
        setTickets((prev) =>
            prev.map((ticket) =>
                ticket.id === ticketId
                    ? {
                        ...ticket,
                        visualAttachments: (ticket.visualAttachments ?? []).filter((att) => att.id !== attachmentId),
                    }
                    : ticket
            )
        )
        setSelectedTicket((prev) =>
            prev && prev.id === ticketId
                ? {
                    ...prev,
                    visualAttachments: (prev.visualAttachments ?? []).filter((att) => att.id !== attachmentId),
                }
                : prev
        )
    }

    // SLA check
    const getSLAStatus = (ticket: Ticket) => {
        if (ticket.status === "resolved" || ticket.status === "closed") return null
        if (ticket.slaBreachedAt) return "breached"

        const created = new Date(ticket.createdAt).getTime()
        const now = Date.now()
        const hoursElapsed = (now - created) / (1000 * 60 * 60)

        const thresholds = { critical: 2, high: 4, medium: 24, low: 48 }
        const threshold = thresholds[ticket.priority]

        if (hoursElapsed > threshold) return "breached"
        if (hoursElapsed > threshold * 0.75) return "warning"
        return "ok"
    }

    return (
        <div className="space-y-4 h-full">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <Layout className="h-6 w-6 text-primary" />
                        Kanban Board
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Arrastra los tickets entre columnas para cambiar su estado
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Prioridad:</span>
                    {(["all", "critical", "high", "medium", "low"] as const).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPriorityFilter(p)}
                            className={cn(
                                "rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                                priorityFilter === p
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {p === "all" ? "Todas" : ticketPriorityLabels[p]}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Categoría:</span>
                    {(["all", "technical", "billing", "installation", "general"] as const).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setCategoryFilter(c)}
                            className={cn(
                                "rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                                categoryFilter === c
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {c === "all" ? "Todas" : ticketCategoryLabels[c]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Board */}
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
                {COLUMNS.map((column) => (
                    <div
                        key={column.id}
                        className={cn(
                            "flex-shrink-0 w-72 rounded-lg border p-3",
                            column.color
                        )}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        {/* Column header */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-foreground">
                                {column.title}
                            </h3>
                            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                                {ticketsByColumn[column.id]?.length || 0}
                            </span>
                        </div>

                        {/* Cards */}
                        <div className="space-y-2 min-h-[200px]">
                            {ticketsByColumn[column.id]?.map((ticket) => {
                                const slaStatus = getSLAStatus(ticket)
                                return (
                                    <div
                                        key={ticket.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={cn(
                                            "glass-card p-3 cursor-grab active:cursor-grabbing transition-all",
                                            draggingId === ticket.id && "opacity-50 scale-95",
                                            "hover:border-primary/40"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="text-xs font-mono text-muted-foreground">
                                                {ticket.id}
                                            </span>
                                            <div className="flex gap-1">
                                                {slaStatus === "warning" && (
                                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                                                )}
                                                {slaStatus === "breached" && (
                                                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                                )}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-2">
                                            {ticket.subject}
                                        </h4>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            <span className={cn(
                                                "inline-flex rounded px-1.5 py-0.5 text-xs",
                                                ticketPriorityColors[ticket.priority]
                                            )}>
                                                {ticketPriorityLabels[ticket.priority]}
                                            </span>
                                            <span className={cn(
                                                "inline-flex rounded px-1.5 py-0.5 text-xs",
                                                ticketCategoryColors[ticket.category]
                                            )}>
                                                {ticketCategoryLabels[ticket.category]}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                <span className="truncate max-w-20">{ticket.clientName.split(" ")[0]}</span>
                                            </div>
                                            {ticket.assignedToName && (
                                                <div className="flex items-center gap-1">
                                                    <LifeBuoy className="h-3 w-3" />
                                                    <span className="truncate max-w-16">{ticket.assignedToName.split(" ")[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ticket detail drawer */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSelectedTicket(null)}
                    />

                    {/* Drawer */}
                    <div className="relative w-full max-w-md bg-background border-l border-border p-6 overflow-y-auto animate-in slide-in-from-right">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-mono text-muted-foreground">
                                {selectedTicket.id}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedTicket(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-foreground mb-2">
                            {selectedTicket.subject}
                        </h2>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                ticketStatusColors[selectedTicket.status]
                            )}>
                                {ticketStatusLabels[selectedTicket.status]}
                            </span>
                            <span className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                ticketPriorityColors[selectedTicket.priority]
                            )}>
                                {ticketPriorityLabels[selectedTicket.priority]}
                            </span>
                            <span className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                ticketCategoryColors[selectedTicket.category]
                            )}>
                                {ticketCategoryLabels[selectedTicket.category]}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                    Descripción
                                </h4>
                                <p className="text-sm text-foreground">{selectedTicket.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                        Cliente
                                    </h4>
                                    <p className="text-sm text-foreground">{selectedTicket.clientName}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                        Asignado a
                                    </h4>
                                    <p className="text-sm text-foreground">
                                        {selectedTicket.assignedToName || "Sin asignar"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                        Creado
                                    </h4>
                                    <p className="text-sm text-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {selectedTicket.createdAt.split("T")[0]}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                        Actualizado
                                    </h4>
                                    <p className="text-sm text-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {selectedTicket.updatedAt.split("T")[0]}
                                    </p>
                                </div>
                            </div>

                            {/* SLA warning */}
                            {getSLAStatus(selectedTicket) === "breached" && (
                                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span className="text-sm text-red-400">SLA vencido</span>
                                </div>
                            )}
                            {getSLAStatus(selectedTicket) === "warning" && (
                                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                                    <span className="text-sm text-amber-400">SLA en riesgo</span>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                    <ImageIcon className="h-3 w-3" />
                                    Referencias visuales
                                </h4>
                                {(selectedTicket.visualAttachments ?? []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Sin referencias visuales.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {(selectedTicket.visualAttachments ?? []).map((attachment) => (
                                            <div key={attachment.id} className="space-y-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewMediaPath(attachment.mediaPath)}
                                                    className="block overflow-hidden rounded border border-border/60"
                                                >
                                                    <img
                                                        src={buildMediaUrl(attachment.mediaPath)}
                                                        alt="Referencia visual"
                                                        className="h-20 w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveVisualAttachment(selectedTicket.id, attachment.id)
                                                    }
                                                    className="text-[10px] text-destructive hover:underline"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 space-y-2">
                            <a
                                href={`/dashboard/support/${selectedTicket.id}`}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Ver detalle completo
                                <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {previewMediaPath && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
                    <button
                        type="button"
                        onClick={() => setPreviewMediaPath(null)}
                        className="absolute right-4 top-4 rounded-full bg-background p-2 text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <img
                        src={buildMediaUrl(previewMediaPath)}
                        alt="Vista previa"
                        className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
                    />
                </div>
            )}
        </div>
    )
}
