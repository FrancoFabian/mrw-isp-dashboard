"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useNetwork } from "@/stores/network-context"
import type { NetworkAlert, AlertSeverity } from "@/types/network"
import { alertTypeLabels } from "@/types/network"
import { AlertBadge } from "./AlertBadge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Check, ExternalLink, Filter } from "lucide-react"
import Link from "next/link"

interface AlertsTableProps {
    limit?: number
    showFilters?: boolean
    entityType?: NetworkAlert["entityType"]
    entityId?: string
    className?: string
}

export function AlertsTable({
    limit,
    showFilters = false,
    entityType,
    entityId,
    className,
}: AlertsTableProps) {
    const { alerts, acknowledgeAlert, getOltById, getNapById, getOnuById } = useNetwork()
    const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all")

    const filteredAlerts = useMemo(() => {
        let result = alerts.filter(a => !a.resolvedAt)

        if (entityType && entityId) {
            result = result.filter(a => a.entityType === entityType && a.entityId === entityId)
        }

        if (severityFilter !== "all") {
            result = result.filter(a => a.severity === severityFilter)
        }

        // Sort by severity (critical first) then by date
        result.sort((a, b) => {
            const severityOrder = { critical: 0, warning: 1, info: 2 }
            const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
            if (severityDiff !== 0) return severityDiff
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

        if (limit) {
            result = result.slice(0, limit)
        }

        return result
    }, [alerts, entityType, entityId, severityFilter, limit])

    const getEntityName = (alert: NetworkAlert): string => {
        switch (alert.entityType) {
            case "olt":
                return getOltById(alert.entityId)?.name ?? alert.entityId
            case "nap":
                return getNapById(alert.entityId)?.name ?? alert.entityId
            case "onu":
                return getOnuById(alert.entityId)?.serial ?? alert.entityId
            default:
                return alert.entityId
        }
    }

    const getEntityLink = (alert: NetworkAlert): string => {
        switch (alert.entityType) {
            case "olt":
                return `/dashboard/network/olts/${alert.entityId}`
            case "nap":
                return `/dashboard/network/naps/${alert.entityId}`
            case "onu":
                return `/dashboard/network/onus/${alert.entityId}`
            default:
                return "#"
        }
    }

    if (filteredAlerts.length === 0) {
        return (
            <div className={cn("glass-card p-6 text-center", className)}>
                <p className="text-muted-foreground">No hay alertas activas</p>
            </div>
        )
    }

    return (
        <div className={cn("space-y-3", className)}>
            {showFilters && (
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <div className="flex gap-1">
                        {(["all", "critical", "warning", "info"] as const).map((sev) => (
                            <button
                                key={sev}
                                type="button"
                                onClick={() => setSeverityFilter(sev)}
                                className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                    severityFilter === sev
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {sev === "all" ? "Todas" : sev === "critical" ? "Críticas" : sev === "warning" ? "Advertencias" : "Info"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Severidad</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Tipo</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Entidad</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Mensaje</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Tiempo</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredAlerts.map((alert) => (
                                <tr key={alert.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <AlertBadge severity={alert.severity} size="sm" />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground">
                                        {alertTypeLabels[alert.type]}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={getEntityLink(alert)}
                                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                        >
                                            {getEntityName(alert)}
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                                        {alert.message}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })}
                                    </td>
                                    <td className="px-4 py-3">
                                        {!alert.acknowledgedAt ? (
                                            <button
                                                type="button"
                                                onClick={() => acknowledgeAlert(alert.id, "USR-001")}
                                                className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                                            >
                                                <Check className="h-3 w-3" />
                                                ACK
                                            </button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Reconocida</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
