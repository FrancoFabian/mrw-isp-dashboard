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
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { TablePagination } from "@/components/ui/table-pagination"

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
    const [page, setPage] = useState(1)
    const ITEMS_PER_PAGE = 20

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

    const pagedAlerts = useMemo(() => {
        if (limit) return filteredAlerts
        const start = (page - 1) * ITEMS_PER_PAGE
        return filteredAlerts.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredAlerts, limit, page])

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

    const columns: ColumnDef<NetworkAlert>[] = [
        {
            id: "severity",
            header: "Severidad",
            cell: (row) => <AlertBadge severity={row.severity} size="sm" />,
        },
        {
            id: "type",
            header: "Tipo",
            cell: (row) => <span className="text-sm font-medium text-zinc-200">{alertTypeLabels[row.type]}</span>,
        },
        {
            id: "entity",
            header: "Entidad",
            cell: (row) => (
                <Link
                    href={getEntityLink(row)}
                    className="inline-flex items-center gap-1 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    {getEntityName(row)}
                    <ExternalLink className="h-3 w-3" />
                </Link>
            ),
        },
        {
            id: "message",
            header: "Mensaje",
            cell: (row) => (
                <span className="text-[13px] text-zinc-500 max-w-xs truncate block" title={row.message}>
                    {row.message}
                </span>
            ),
        },
        {
            id: "time",
            header: "Tiempo",
            cell: (row) => (
                <span className="text-[13px] text-zinc-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true, locale: es })}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Acciones",
            headerAlign: "right",
            cell: (row) => (
                <div className="flex justify-end">
                    {!row.acknowledgedAt ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                acknowledgeAlert(row.id, "USR-001");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                        >
                            <Check className="h-3 w-3" />
                            ACK
                        </button>
                    ) : (
                        <span className="text-xs text-muted-foreground">Reconocida</span>
                    )}
                </div>
            ),
        },
    ]

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
                                onClick={() => { setSeverityFilter(sev); setPage(1); }}
                                className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                    severityFilter === sev
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                                )}
                            >
                                {sev === "all" ? "Todas" : sev === "critical" ? "Críticas" : sev === "warning" ? "Advertencias" : "Info"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <DataTable
                data={pagedAlerts}
                columns={columns}
                getRowId={(item) => item.id}
                emptyMessage="No hay alertas registradas"
                footer={
                    !limit && (
                        <TablePagination
                            totalItems={alerts.length}
                            filteredItems={filteredAlerts.length}
                            currentPage={page}
                            totalPages={Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE)}
                            onPageChange={setPage}
                            itemName="alertas"
                        />
                    )
                }
            />
        </div>
    )
}
