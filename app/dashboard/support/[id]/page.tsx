"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { mockTickets } from "@/mocks/tickets"
import { getMessagesByTicket } from "@/mocks/ticketMessages"
import { getEventsByTicket } from "@/mocks/ticketEvents"
import { mockStaff } from "@/mocks/staff"
import type { TicketMessage, TicketEvent } from "@/types/ticket"
import {
    ticketPriorityLabels,
    ticketPriorityColors,
    ticketStatusLabels,
    ticketStatusColors,
    ticketCategoryLabels,
    ticketCategoryColors,
    ticketChannelLabels,
    ticketEventTypeLabels,
} from "@/types/ticket"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    User,
    Calendar,
    Clock,
    MessageSquare,
    Phone,
    Mail,
    Paperclip,
    AlertTriangle,
    CheckCircle,
    UserPlus,
    Tag,
    FileText,
    Send,
    StickyNote,
    LifeBuoy,
} from "lucide-react"

type TimelineItem =
    | { type: "message"; data: TicketMessage; timestamp: string }
    | { type: "event"; data: TicketEvent; timestamp: string }

export default function TicketDetailPage() {
    const params = useParams()
    const ticketId = params.id as string

    const ticket = mockTickets.find((t) => t.id === ticketId)
    const messages = getMessagesByTicket(ticketId)
    const events = getEventsByTicket(ticketId)
    const supportAgents = mockStaff.filter((s) => s.role === "support" || s.role === "admin")

    // Combine messages and events into unified timeline
    const timeline = useMemo<TimelineItem[]>(() => {
        const items: TimelineItem[] = [
            ...messages.map((m) => ({ type: "message" as const, data: m, timestamp: m.createdAt })),
            ...events.map((e) => ({ type: "event" as const, data: e, timestamp: e.createdAt })),
        ]
        return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }, [messages, events])

    if (!ticket) {
        return (
            <div className="space-y-6">
                <Link href="/dashboard/support" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a tickets
                </Link>
                <div className="glass-card p-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">Ticket no encontrado</p>
                </div>
            </div>
        )
    }

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case "whatsapp": return <MessageSquare className="h-4 w-4" />
            case "phone": return <Phone className="h-4 w-4" />
            default: return <Mail className="h-4 w-4" />
        }
    }

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case "created": return <FileText className="h-4 w-4 text-blue-400" />
            case "status_changed": return <Tag className="h-4 w-4 text-cyan-400" />
            case "assigned": return <UserPlus className="h-4 w-4 text-purple-400" />
            case "priority_changed": return <AlertTriangle className="h-4 w-4 text-amber-400" />
            case "sla_warning": return <Clock className="h-4 w-4 text-amber-400" />
            case "sla_breached": return <AlertTriangle className="h-4 w-4 text-red-400" />
            case "note_added": return <StickyNote className="h-4 w-4 text-emerald-400" />
            case "attachment_added": return <Paperclip className="h-4 w-4 text-slate-400" />
            default: return <CheckCircle className="h-4 w-4 text-slate-400" />
        }
    }

    const formatEventPayload = (event: TicketEvent) => {
        switch (event.type) {
            case "status_changed":
                return `${ticketStatusLabels[event.payload.from as keyof typeof ticketStatusLabels] || event.payload.from} → ${ticketStatusLabels[event.payload.to as keyof typeof ticketStatusLabels] || event.payload.to}`
            case "assigned":
                return `Asignado a ${event.payload.assignedTo}`
            case "priority_changed":
                return `${event.payload.from} → ${event.payload.to}`
            case "sla_warning":
                return `${event.payload.minutesRemaining} minutos restantes`
            case "sla_breached":
                return `Después de ${event.payload.breachedAfterMinutes} minutos`
            case "note_added":
                return event.payload.note
            case "attachment_added":
                return event.payload.filename
            case "created":
                return `Vía ${ticketChannelLabels[event.payload.channel as keyof typeof ticketChannelLabels] || event.payload.channel}`
            default:
                return JSON.stringify(event.payload)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Link href="/dashboard/support" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver a tickets
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            {ticket.id}
                        </h1>
                        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", ticketStatusColors[ticket.status])}>
                            {ticketStatusLabels[ticket.status]}
                        </span>
                    </div>
                    <h2 className="mt-1 text-lg text-foreground">{ticket.subject}</h2>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {(ticket.status === "new" || ticket.status === "open") && !ticket.assignedToId && (
                        <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                            Tomar ticket
                        </button>
                    )}
                    {ticket.status === "in_progress" && (
                        <button type="button" className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
                            Marcar resuelto
                        </button>
                    )}
                    {ticket.status === "waiting_customer" && (
                        <button type="button" className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                            Reabrir
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main content - Timeline */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Description */}
                    <div className="glass-card p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h3>
                        <p className="text-sm text-foreground">{ticket.description}</p>
                    </div>

                    {/* Timeline */}
                    <div className="glass-card p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Timeline</h3>
                        <div className="space-y-4">
                            {timeline.map((item, index) => (
                                <div key={`${item.type}-${item.type === "message" ? item.data.id : item.data.id}`} className="relative pl-6">
                                    {/* Connector line */}
                                    {index < timeline.length - 1 && (
                                        <div className="absolute left-2 top-6 h-full w-px bg-border" />
                                    )}

                                    {item.type === "message" ? (
                                        <div className={cn(
                                            "relative rounded-lg p-3",
                                            item.data.isInternal
                                                ? "bg-amber-500/10 border border-amber-500/20"
                                                : item.data.sender === "customer"
                                                    ? "bg-secondary/50"
                                                    : "bg-primary/10 border border-primary/20"
                                        )}>
                                            {/* Dot */}
                                            <div className={cn(
                                                "absolute -left-4 top-3 h-4 w-4 rounded-full border-2 border-background",
                                                item.data.isInternal
                                                    ? "bg-amber-500"
                                                    : item.data.sender === "customer"
                                                        ? "bg-slate-500"
                                                        : "bg-primary"
                                            )} />

                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {item.data.senderName || (item.data.sender === "customer" ? "Cliente" : "Agente")}
                                                    </span>
                                                    {item.data.isInternal && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                                                            <StickyNote className="h-3 w-3" />
                                                            Nota interna
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.data.createdAt.replace("T", " ").slice(0, 16)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground whitespace-pre-wrap">{item.data.body}</p>

                                            {/* Attachments */}
                                            {item.data.attachments && item.data.attachments.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {item.data.attachments.map((att) => (
                                                        <div key={att.id} className="inline-flex items-center gap-1 rounded bg-secondary/50 px-2 py-1 text-xs text-muted-foreground">
                                                            <Paperclip className="h-3 w-3" />
                                                            {att.filename}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative flex items-start gap-3 py-2">
                                            {/* Dot */}
                                            <div className="absolute -left-4 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-secondary">
                                                {getEventIcon(item.data.type)}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {ticketEventTypeLabels[item.data.type]}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground/70">
                                                        {item.data.createdAt.replace("T", " ").slice(0, 16)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-foreground/80">{formatEventPayload(item.data)}</p>
                                                {item.data.actorName && (
                                                    <p className="text-xs text-muted-foreground/70">por {item.data.actorName}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reply composer */}
                    <div className="glass-card p-4">
                        <div className="flex gap-2 mb-3">
                            <button type="button" className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                                Respuesta
                            </button>
                            <button type="button" className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                                Nota interna
                            </button>
                        </div>
                        <textarea
                            placeholder="Escribe tu respuesta..."
                            className="w-full min-h-24 rounded-lg border border-border bg-secondary/50 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                                <Paperclip className="h-4 w-4" />
                                Adjuntar
                            </button>
                            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                <Send className="h-4 w-4" />
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Details */}
                    <div className="glass-card p-4 space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Detalles</h3>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Estado</span>
                                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", ticketStatusColors[ticket.status])}>
                                    {ticketStatusLabels[ticket.status]}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Prioridad</span>
                                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", ticketPriorityColors[ticket.priority])}>
                                    {ticketPriorityLabels[ticket.priority]}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Categoría</span>
                                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", ticketCategoryColors[ticket.category])}>
                                    {ticketCategoryLabels[ticket.category]}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Canal</span>
                                <span className="inline-flex items-center gap-1 text-xs text-foreground">
                                    {getChannelIcon(ticket.channel)}
                                    {ticketChannelLabels[ticket.channel]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Client */}
                    <div className="glass-card p-4 space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Cliente</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">{ticket.clientName}</p>
                                <p className="text-xs text-muted-foreground">{ticket.clientId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className="glass-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Asignado a</h3>
                            <button type="button" className="text-xs text-primary hover:underline">
                                Cambiar
                            </button>
                        </div>
                        {ticket.assignedToName ? (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                    <LifeBuoy className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{ticket.assignedToName}</p>
                                    <p className="text-xs text-muted-foreground">{ticket.assignedToId}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">Sin asignar</div>
                        )}

                        {/* Quick assign */}
                        {!ticket.assignedToId && (
                            <div className="pt-2 border-t border-border space-y-2">
                                <p className="text-xs text-muted-foreground">Asignar a:</p>
                                <div className="flex flex-wrap gap-2">
                                    {supportAgents.slice(0, 3).map((agent) => (
                                        <button
                                            key={agent.id}
                                            type="button"
                                            className="rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                                        >
                                            {agent.firstName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="glass-card p-4 space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Fechas</h3>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Creado</span>
                                <span className="text-foreground">{ticket.createdAt.replace("T", " ").slice(0, 16)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Actualizado</span>
                                <span className="text-foreground">{ticket.updatedAt.replace("T", " ").slice(0, 16)}</span>
                            </div>
                            {ticket.lastCustomerReplyAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Última resp. cliente</span>
                                    <span className="text-foreground">{ticket.lastCustomerReplyAt.replace("T", " ").slice(0, 16)}</span>
                                </div>
                            )}
                            {ticket.lastAgentReplyAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Última resp. agente</span>
                                    <span className="text-foreground">{ticket.lastAgentReplyAt.replace("T", " ").slice(0, 16)}</span>
                                </div>
                            )}
                            {ticket.slaBreachedAt && (
                                <div className="flex items-center justify-between text-red-400">
                                    <span>SLA vencido</span>
                                    <span>{ticket.slaBreachedAt.replace("T", " ").slice(0, 16)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
