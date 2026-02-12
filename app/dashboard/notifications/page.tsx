"use client"

import { useState } from "react"
import { mockNotificationTemplates } from "@/mocks/notificationTemplates"
import { mockNotificationRules } from "@/mocks/notificationRules"
import { mockNotificationLogs } from "@/mocks/notificationLogs"
import type { NotificationChannel } from "@/types/notification"
import {
    notificationChannelLabels,
    notificationChannelColors,
    notificationEventTypeLabels,
    notificationLogStatusLabels,
    notificationLogStatusColors,
} from "@/types/notification"
import { cn } from "@/lib/utils"
import {
    Bell,
    FileText,
    Settings2,
    ClipboardList,
    Mail,
    MessageSquare,
    Smartphone,
    Send,
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight,
} from "lucide-react"
import Link from "next/link"

export default function NotificationsPage() {
    // Summary counts
    const templateCount = mockNotificationTemplates.length
    const enabledTemplates = mockNotificationTemplates.filter((t) => t.enabled).length
    const ruleCount = mockNotificationRules.length
    const enabledRules = mockNotificationRules.filter((r) => r.enabled).length
    const logCount = mockNotificationLogs.length
    const sentCount = mockNotificationLogs.filter((l) => l.status === "sent").length
    const failedCount = mockNotificationLogs.filter((l) => l.status === "failed").length
    const queuedCount = mockNotificationLogs.filter((l) => l.status === "queued").length

    // Recent logs
    const recentLogs = [...mockNotificationLogs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

    // Channel breakdown
    const channelCounts = mockNotificationLogs.reduce((acc, log) => {
        acc[log.channel] = (acc[log.channel] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case "email": return <Mail className="h-5 w-5" />
            case "whatsapp": return <MessageSquare className="h-5 w-5" />
            case "sms": return <Send className="h-5 w-5" />
            case "push": return <Smartphone className="h-5 w-5" />
            default: return <Bell className="h-5 w-5" />
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "sent": return <CheckCircle className="h-4 w-4 text-emerald-400" />
            case "failed": return <XCircle className="h-4 w-4 text-red-400" />
            case "queued": return <Clock className="h-4 w-4 text-amber-400" />
            default: return <Bell className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Notificaciones
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gestiona plantillas, reglas y revisa el historial de notificaciones
                </p>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Link href="/dashboard/notifications/templates" className="glass-card-hover flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <FileText className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Plantillas</p>
                        <p className="text-xl font-bold text-foreground">{templateCount}</p>
                        <p className="text-xs text-muted-foreground">{enabledTemplates} activas</p>
                    </div>
                </Link>
                <Link href="/dashboard/notifications/rules" className="glass-card-hover flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                        <Settings2 className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Reglas</p>
                        <p className="text-xl font-bold text-foreground">{ruleCount}</p>
                        <p className="text-xs text-muted-foreground">{enabledRules} activas</p>
                    </div>
                </Link>
                <Link href="/dashboard/notifications/logs" className="glass-card-hover flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Enviados</p>
                        <p className="text-xl font-bold text-foreground">{sentCount}</p>
                        <p className="text-xs text-muted-foreground">de {logCount} totales</p>
                    </div>
                </Link>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                        <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Fallidos</p>
                        <p className="text-xl font-bold text-red-400">{failedCount}</p>
                        <p className="text-xs text-muted-foreground">{queuedCount} en cola</p>
                    </div>
                </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link href="/dashboard/notifications/templates" className="glass-card-hover p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-400" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Plantillas</p>
                            <p className="text-xs text-muted-foreground">Gestionar templates</p>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link href="/dashboard/notifications/rules" className="glass-card-hover p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings2 className="h-5 w-5 text-cyan-400" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Reglas</p>
                            <p className="text-xs text-muted-foreground">Configurar triggers</p>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link href="/dashboard/notifications/logs" className="glass-card-hover p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-emerald-400" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Historial</p>
                            <p className="text-xs text-muted-foreground">Ver logs</p>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* By channel */}
                <div className="glass-card p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Por canal</h3>
                    <div className="space-y-3">
                        {["email", "whatsapp", "sms", "push"].map((channel) => (
                            <div key={channel} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg",
                                        channel === "email" ? "bg-blue-500/10 text-blue-400" :
                                            channel === "whatsapp" ? "bg-emerald-500/10 text-emerald-400" :
                                                channel === "sms" ? "bg-amber-500/10 text-amber-400" :
                                                    "bg-purple-500/10 text-purple-400"
                                    )}>
                                        {getChannelIcon(channel)}
                                    </div>
                                    <span className="text-sm text-foreground">
                                        {notificationChannelLabels[channel as NotificationChannel]}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    {channelCounts[channel] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent logs */}
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Últimos envíos</h3>
                        <Link href="/dashboard/notifications/logs" className="text-xs text-primary hover:underline">
                            Ver todos
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3">
                                {getStatusIcon(log.status)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-foreground truncate">
                                            {log.customerName}
                                        </span>
                                        <span className={cn(
                                            "inline-flex rounded-full px-1.5 py-0.5 text-xs",
                                            notificationChannelColors[log.channel]
                                        )}>
                                            {notificationChannelLabels[log.channel]}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {log.templateName}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {log.createdAt.split("T")[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
