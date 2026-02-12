"use client"

import { useState } from "react"
import Link from "next/link"
import { mockNotificationTemplates } from "@/mocks/notificationTemplates"
import type { NotificationChannel } from "@/types/notification"
import {
    notificationChannelLabels,
    notificationChannelColors,
} from "@/types/notification"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    Plus,
    FileText,
    Mail,
    MessageSquare,
    Smartphone,
    Send,
    Search,
    Eye,
    Edit,
    ToggleLeft,
    ToggleRight,
} from "lucide-react"

const channelFilters: { label: string; value: NotificationChannel | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Email", value: "email" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "SMS", value: "sms" },
    { label: "Push", value: "push" },
]

export default function NotificationTemplatesPage() {
    const [channelFilter, setChannelFilter] = useState<NotificationChannel | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

    const filteredTemplates = mockNotificationTemplates.filter((t) => {
        if (channelFilter !== "all" && t.channel !== channelFilter) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            if (!t.name.toLowerCase().includes(q) && !t.body.toLowerCase().includes(q)) {
                return false
            }
        }
        return true
    })

    const activeTemplate = selectedTemplate
        ? mockNotificationTemplates.find((t) => t.id === selectedTemplate)
        : null

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case "email": return <Mail className="h-4 w-4" />
            case "whatsapp": return <MessageSquare className="h-4 w-4" />
            case "sms": return <Send className="h-4 w-4" />
            case "push": return <Smartphone className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link href="/dashboard/notifications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        Notificaciones
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Plantillas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona las plantillas de notificaciones
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Nueva plantilla
                </button>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o contenido..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
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
                {/* Template list */}
                <div className="lg:col-span-2 space-y-3">
                    {filteredTemplates.map((template) => (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => setSelectedTemplate(template.id)}
                            className={cn(
                                "glass-card-hover w-full p-4 text-left transition-all",
                                selectedTemplate === template.id && "border-primary/40"
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                            notificationChannelColors[template.channel]
                                        )}>
                                            {getChannelIcon(template.channel)}
                                            {notificationChannelLabels[template.channel]}
                                        </span>
                                        {template.enabled ? (
                                            <span className="text-xs text-emerald-400">Activa</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Inactiva</span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {template.name}
                                    </h3>
                                    {template.subject && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Asunto: {template.subject}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                        {template.body.slice(0, 100)}...
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {template.variables.slice(0, 4).map((v) => (
                                    <span key={v} className="inline-flex rounded bg-secondary/50 px-1.5 py-0.5 text-xs text-muted-foreground">
                                        {`{{${v}}}`}
                                    </span>
                                ))}
                                {template.variables.length > 4 && (
                                    <span className="text-xs text-muted-foreground">
                                        +{template.variables.length - 4} más
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Template preview */}
                <div className="lg:col-span-1">
                    {activeTemplate ? (
                        <div className="glass-card sticky top-20 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-muted-foreground">
                                    {activeTemplate.id}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button type="button" className="text-muted-foreground hover:text-foreground">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button type="button" className="text-muted-foreground hover:text-foreground">
                                        {activeTemplate.enabled ? (
                                            <ToggleRight className="h-5 w-5 text-emerald-400" />
                                        ) : (
                                            <ToggleLeft className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <span className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                    notificationChannelColors[activeTemplate.channel]
                                )}>
                                    {getChannelIcon(activeTemplate.channel)}
                                    {notificationChannelLabels[activeTemplate.channel]}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {activeTemplate.name}
                                </h3>
                            </div>

                            {activeTemplate.subject && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Asunto
                                    </h4>
                                    <p className="text-sm text-foreground bg-secondary/30 rounded-lg px-3 py-2">
                                        {activeTemplate.subject}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Contenido
                                </h4>
                                <div className="text-sm text-foreground bg-secondary/30 rounded-lg px-3 py-2 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {activeTemplate.body}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Variables disponibles
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {activeTemplate.variables.map((v) => (
                                        <span key={v} className="inline-flex rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                                            {`{{${v}}}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-8 text-center">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-2 text-muted-foreground">
                                Selecciona una plantilla para ver detalles
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
