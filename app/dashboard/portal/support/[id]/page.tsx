"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { mockTickets } from "@/mocks/tickets"
import { getVisibleMessages } from "@/mocks/ticketMessages"
import type { TicketMessage } from "@/types/ticket"
import {
    ticketPriorityLabels,
    ticketPriorityColors,
    ticketStatusLabels,
    ticketStatusColors,
    ticketCategoryLabels,
    ticketChannelLabels,
} from "@/types/ticket"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    Calendar,
    MessageSquare,
    Phone,
    Mail,
    Paperclip,
    AlertTriangle,
    Send,
    LifeBuoy,
} from "lucide-react"

export default function ClientTicketDetailPage() {
    const params = useParams()
    const ticketId = params.id as string

    const ticket = mockTickets.find((t) => t.id === ticketId)
    // Client can only see non-internal messages
    const messages = getVisibleMessages(ticketId, false)

    if (!ticket) {
        return (
            <div className="space-y-6">
                <Link href="/dashboard/portal/support" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a mis solicitudes
                </Link>
                <div className="glass-card p-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">Solicitud no encontrada</p>
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/portal/support" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a mis solicitudes
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main content - Messages */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Description */}
                    <div className="glass-card p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Tu solicitud</h3>
                        <p className="text-sm text-foreground">{ticket.description}</p>
                    </div>

                    {/* Messages */}
                    <div className="glass-card p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Conversación</h3>

                        {messages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Aún no hay mensajes. Pronto te responderemos.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "rounded-lg p-3",
                                            message.sender === "customer"
                                                ? "bg-primary/10 border border-primary/20 ml-8"
                                                : "bg-secondary/50 mr-8"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="text-sm font-medium text-foreground">
                                                {message.sender === "customer" ? "Tú" : message.senderName || "Soporte"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {message.createdAt.replace("T", " ").slice(0, 16)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">{message.body}</p>

                                        {/* Attachments */}
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {message.attachments.map((att) => (
                                                    <div key={att.id} className="inline-flex items-center gap-1 rounded bg-secondary/50 px-2 py-1 text-xs text-muted-foreground">
                                                        <Paperclip className="h-3 w-3" />
                                                        {att.filename}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reply composer */}
                    {ticket.status !== "closed" && ticket.status !== "resolved" && (
                        <div className="glass-card p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">Agregar mensaje</h3>
                            <textarea
                                placeholder="Escribe tu mensaje..."
                                className="w-full min-h-24 rounded-lg border border-border bg-secondary/50 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                            <div className="mt-3 flex items-center justify-between">
                                <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                                    <Paperclip className="h-4 w-4" />
                                    Adjuntar archivo
                                </button>
                                <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                    <Send className="h-4 w-4" />
                                    Enviar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Closed ticket message */}
                    {(ticket.status === "closed" || ticket.status === "resolved") && (
                        <div className="glass-card p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Esta solicitud ha sido {ticket.status === "resolved" ? "resuelta" : "cerrada"}.
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Si necesitas más ayuda, crea una nueva solicitud.
                            </p>
                        </div>
                    )}
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
                                <span className="text-xs text-foreground">{ticketCategoryLabels[ticket.category]}</span>
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

                    {/* Assigned agent */}
                    {ticket.assignedToName && (
                        <div className="glass-card p-4 space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">Tu agente</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                    <LifeBuoy className="h-5 w-5 text-emerald-400" />
                                </div>
                                <p className="text-sm font-medium text-foreground">{ticket.assignedToName}</p>
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="glass-card p-4 space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Fechas</h3>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Creado</span>
                                <span className="text-foreground">{ticket.createdAt.replace("T", " ").slice(0, 16)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Última actualización</span>
                                <span className="text-foreground">{ticket.updatedAt.replace("T", " ").slice(0, 16)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status explanation */}
                    <div className="glass-card p-4 space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">¿Qué significa el estado?</h3>
                        <div className="text-xs text-muted-foreground space-y-1">
                            {ticket.status === "new" && (
                                <p>Tu solicitud está en cola y pronto será atendida.</p>
                            )}
                            {ticket.status === "open" && (
                                <p>Tu solicitud ha sido recibida y está siendo revisada.</p>
                            )}
                            {ticket.status === "in_progress" && (
                                <p>Un agente está trabajando en tu solicitud.</p>
                            )}
                            {ticket.status === "waiting_customer" && (
                                <p className="text-amber-400">Estamos esperando tu respuesta para continuar.</p>
                            )}
                            {ticket.status === "resolved" && (
                                <p className="text-emerald-400">Tu solicitud ha sido resuelta exitosamente.</p>
                            )}
                            {ticket.status === "closed" && (
                                <p>Esta solicitud ha sido cerrada.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
