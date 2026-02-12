"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { mockNotificationLogs } from "@/mocks/notificationLogs"
import type { NotificationChannel, NotificationLogStatus } from "@/types/notification"
import {
    notificationChannelLabels,
    notificationChannelColors,
    notificationEventTypeLabels,
    notificationLogStatusLabels,
    notificationLogStatusColors,
} from "@/types/notification"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    ClipboardList,
    Mail,
    MessageSquare,
    Smartphone,
    Send,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Eye,
    User,
    Calendar,
} from "lucide-react"

const statusFilters: { label: string; value: NotificationLogStatus | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Enviados", value: "sent" },
    { label: "Fallidos", value: "failed" },
    { label: "En cola", value: "queued" },
]

const channelFilters: { label: string; value: NotificationChannel | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Email", value: "email" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "SMS", value: "sms" },
    { label: "Push", value: "push" },
]

export default function NotificationLogsPage() {
    const [statusFilter, setStatusFilter] = useState<NotificationLogStatus | "all">("all")
    const [channelFilter, setChannelFilter] = useState<NotificationChannel | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedLog, setSelectedLog] = useState<string | null>(null)

    const filteredLogs = useMemo(() => {
        return mockNotificationLogs
            .filter((l) => {
                if (statusFilter !== "all" && l.status !== statusFilter) return false
                if (channelFilter !== "all" && l.channel !== channelFilter) return false
                if (searchQuery) {
                    const q = searchQuery.toLowerCase()
                    if (
                        !l.customerName.toLowerCase().includes(q) &&
                        !l.customerId.toLowerCase().includes(q) &&
                        !l.templateName.toLowerCase().includes(q)
                    ) {
                        return false
                    }
                }
                return true
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }, [statusFilter, channelFilter, searchQuery])

    const activeLog = selectedLog
        ? mockNotificationLogs.find((l) => l.id === selectedLog)
        : null

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case "email": return <Mail className="h-4 w-4" />
            case "whatsapp": return <MessageSquare className="h-4 w-4" />
            case "sms": return <Send className="h-4 w-4" />
            case "push": return <Smartphone className="h-4 w-4" />
            default: return <ClipboardList className="h-4 w-4" />
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "sent": return <CheckCircle className="h-4 w-4 text-emerald-400" />
            case "failed": return <XCircle className="h-4 w-4 text-red-400" />
            case "queued": return <Clock className="h-4 w-4 text-amber-400" />
            default: return <ClipboardList className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/notifications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Notificaciones
                </Link>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Historial de Notificaciones
                </h1>
                <p className="text-sm text-muted-foreground">
                    Revisa el historial de notificaciones enviadas
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass-card flex items-center gap-3 p-4">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                    <div>
                        <p className="text-xs text-muted-foreground">Enviados</p>
                        <p className="text-xl font-bold text-foreground">
                            {mockNotificationLogs.filter((l) => l.status === "sent").length}
                        </p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <XCircle className="h-8 w-8 text-red-400" />
                    <div>
                        <p className="text-xs text-muted-foreground">Fallidos</p>
                        <p className="text-xl font-bold text-red-400">
                            {mockNotificationLogs.filter((l) => l.status === "failed").length}
                        </p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <Clock className="h-8 w-8 text-amber-400" />
                    <div>
                        <p className="text-xs text-muted-foreground">En cola</p>
                        <p className="text-xl font-bold text-amber-400">
                            {mockNotificationLogs.filter((l) => l.status === "queued").length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o plantilla..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Estado:</span>
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
                <div className="flex flex-wrap items-center gap-2">
                    <span className="ml-6 text-xs text-muted-foreground">Canal:</span>
                    {channelFilters.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setChannelFilter(filter.value)}
                            className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                channelFilter === filter.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Log list */}
                <div className="lg:col-span-2 space-y-2">
                    {filteredLogs.map((log) => (
                        <button
                            key={log.id}
                            type="button"
                            onClick={() => setSelectedLog(log.id)}
                            className={cn(
                                "glass-card-hover w-full p-3 text-left transition-all",
                                selectedLog === log.id && "border-primary/40"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                {getStatusIcon(log.status)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-foreground truncate">
                                            {log.customerName}
                                        </span>
                                        <span className={cn(
                                            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs",
                                            notificationChannelColors[log.channel]
                                        )}>
                                            {getChannelIcon(log.channel)}
                                            {notificationChannelLabels[log.channel]}
                                        </span>
                                        <span className={cn(
                                            "inline-flex rounded-full px-1.5 py-0.5 text-xs",
                                            notificationLogStatusColors[log.status]
                                        )}>
                                            {notificationLogStatusLabels[log.status]}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {log.templateName}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                                        {log.renderedPreview}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-muted-foreground">
                                        {log.createdAt.split("T")[0]}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70">
                                        {log.createdAt.split("T")[1]?.slice(0, 5)}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}

                    {filteredLogs.length === 0 && (
                        <div className="glass-card p-8 text-center">
                            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-2 text-muted-foreground">No hay logs que coincidan</p>
                        </div>
                    )}
                </div>

                {/* Log detail */}
                <div className="lg:col-span-1">
                    {activeLog ? (
                        <div className="glass-card sticky top-20 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-muted-foreground">
                                    {activeLog.id}
                                </span>
                                <span className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                    notificationLogStatusColors[activeLog.status]
                                )}>
                                    {getStatusIcon(activeLog.status)}
                                    {notificationLogStatusLabels[activeLog.status]}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{activeLog.customerName}</p>
                                        <p className="text-xs text-muted-foreground">{activeLog.customerId}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {getChannelIcon(activeLog.channel)}
                                    <span className="text-sm text-foreground">
                                        {notificationChannelLabels[activeLog.channel]}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-foreground">
                                        {activeLog.createdAt.replace("T", " ").slice(0, 16)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Evento
                                </h4>
                                <p className="text-sm text-foreground">
                                    {notificationEventTypeLabels[activeLog.eventType]}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Plantilla
                                </h4>
                                <p className="text-sm text-foreground">{activeLog.templateName}</p>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Preview
                                </h4>
                                <div className="text-sm text-foreground bg-secondary/30 rounded-lg px-3 py-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {activeLog.renderedPreview}
                                </div>
                            </div>

                            {activeLog.sentAt && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Enviado
                                    </h4>
                                    <p className="text-sm text-emerald-400">
                                        {activeLog.sentAt.replace("T", " ").slice(0, 19)}
                                    </p>
                                </div>
                            )}

                            {activeLog.error && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Error
                                    </h4>
                                    <p className="text-sm text-red-400">{activeLog.error}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card p-8 text-center">
                            <Eye className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-2 text-muted-foreground">
                                Selecciona un log para ver detalles
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Results count */}
            <div className="text-center text-xs text-muted-foreground">
                Mostrando {filteredLogs.length} de {mockNotificationLogs.length} registros
            </div>
        </div>
    )
}
