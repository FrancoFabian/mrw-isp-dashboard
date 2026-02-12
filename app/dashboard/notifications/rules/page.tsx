"use client"

import { useState } from "react"
import Link from "next/link"
import { mockNotificationRules } from "@/mocks/notificationRules"
import { mockNotificationTemplates } from "@/mocks/notificationTemplates"
import type { NotificationChannel, NotificationEventType } from "@/types/notification"
import {
    notificationChannelLabels,
    notificationChannelColors,
    notificationEventTypeLabels,
} from "@/types/notification"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    Plus,
    Settings2,
    Mail,
    MessageSquare,
    Smartphone,
    Send,
    Search,
    ToggleLeft,
    ToggleRight,
    Zap,
    FileText,
    ChevronRight,
} from "lucide-react"

export default function NotificationRulesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [enabledFilter, setEnabledFilter] = useState<"all" | "enabled" | "disabled">("all")

    const filteredRules = mockNotificationRules.filter((r) => {
        if (enabledFilter === "enabled" && !r.enabled) return false
        if (enabledFilter === "disabled" && r.enabled) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            if (
                !r.name.toLowerCase().includes(q) &&
                !notificationEventTypeLabels[r.eventType].toLowerCase().includes(q)
            ) {
                return false
            }
        }
        return true
    })

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case "email": return <Mail className="h-4 w-4" />
            case "whatsapp": return <MessageSquare className="h-4 w-4" />
            case "sms": return <Send className="h-4 w-4" />
            case "push": return <Smartphone className="h-4 w-4" />
            default: return <Settings2 className="h-4 w-4" />
        }
    }

    const getTemplate = (templateId: string) =>
        mockNotificationTemplates.find((t) => t.id === templateId)

    // Group rules by event type
    const rulesByEvent = filteredRules.reduce((acc, rule) => {
        if (!acc[rule.eventType]) {
            acc[rule.eventType] = []
        }
        acc[rule.eventType].push(rule)
        return acc
    }, {} as Record<string, typeof filteredRules>)

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
                        Reglas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configura qué notificaciones se envían para cada evento
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Nueva regla
                </button>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o evento..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {[
                        { label: "Todas", value: "all" as const },
                        { label: "Activas", value: "enabled" as const },
                        { label: "Inactivas", value: "disabled" as const },
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setEnabledFilter(filter.value)}
                            className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                enabledFilter === filter.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rules by event type */}
            <div className="space-y-6">
                {Object.entries(rulesByEvent).map(([eventType, rules]) => (
                    <div key={eventType} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-400" />
                            <h3 className="text-sm font-medium text-foreground">
                                {notificationEventTypeLabels[eventType as NotificationEventType]}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                ({rules.length} {rules.length === 1 ? "regla" : "reglas"})
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {rules.map((rule) => {
                                const template = getTemplate(rule.templateId)
                                return (
                                    <div
                                        key={rule.id}
                                        className={cn(
                                            "glass-card p-4 transition-all",
                                            !rule.enabled && "opacity-60"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                                        notificationChannelColors[rule.channel]
                                                    )}>
                                                        {getChannelIcon(rule.channel)}
                                                        {notificationChannelLabels[rule.channel]}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-medium text-foreground">
                                                    {rule.name}
                                                </h4>
                                            </div>
                                            <button type="button" className="text-muted-foreground hover:text-foreground">
                                                {rule.enabled ? (
                                                    <ToggleRight className="h-5 w-5 text-emerald-400" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Template link */}
                                        {template && (
                                            <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/30 px-2 py-1.5">
                                                <FileText className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">
                                                    {template.name}
                                                </span>
                                                <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                                            </div>
                                        )}

                                        {/* Conditions */}
                                        {rule.conditions && rule.conditions.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-muted-foreground">
                                                    Condiciones:
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {rule.conditions.map((c, i) => (
                                                        <span key={i} className="inline-flex rounded bg-secondary/50 px-1.5 py-0.5 text-xs text-muted-foreground">
                                                            {c.field} {c.operator} {c.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
