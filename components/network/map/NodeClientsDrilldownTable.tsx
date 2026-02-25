"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { MapNodeStatus } from "@/types/network/mapProjection"
import type { ClientImpactConfig, ClientImpactFilter, ClientNodeLink } from "@/lib/impact/types"
import { classifyClientAgainstNode } from "@/lib/impact/computeClientImpact"

interface NodeClientsDrilldownTableProps {
    nodeStatus: MapNodeStatus
    clients: ClientNodeLink[]
    filter: ClientImpactFilter
    onFilterChange: (filter: ClientImpactFilter) => void
    config: ClientImpactConfig
    loading?: boolean
}

const ROW_HEIGHT = 44
const OVERSCAN = 8
const VIEWPORT_HEIGHT = 280

function statusClass(status: MapNodeStatus): string {
    if (status === "ONLINE") return "border border-emerald-500/30 bg-emerald-500/12 text-emerald-300"
    if (status === "DEGRADED") return "border border-amber-500/35 bg-amber-500/12 text-amber-300"
    if (status === "OFFLINE") return "border border-red-500/35 bg-red-500/12 text-red-300"
    return "border border-slate-500/35 bg-slate-500/12 text-slate-300"
}

function formatSeen(value?: string): string {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

export function NodeClientsDrilldownTable({
    nodeStatus,
    clients,
    filter,
    onFilterChange,
    config,
    loading = false,
}: NodeClientsDrilldownTableProps) {
    const [scrollTop, setScrollTop] = useState(0)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            if (filter === "all") return true

            const classification = classifyClientAgainstNode(nodeStatus, client.status, config.unknownPolicy)
            if (filter === "affected") return classification.isAffected
            return classification.isDegraded
        })
    }, [clients, config.unknownPolicy, filter, nodeStatus])

    const totalRows = filteredClients.length
    const startIndex = Math.max(Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN, 0)
    const maxVisibleRows = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2
    const endIndex = Math.min(startIndex + maxVisibleRows, totalRows)
    const visibleRows = filteredClients.slice(startIndex, endIndex)
    const offsetY = startIndex * ROW_HEIGHT
    const totalHeight = totalRows * ROW_HEIGHT

    useEffect(() => {
        setScrollTop(0)
        if (containerRef.current) containerRef.current.scrollTop = 0
    }, [filter])

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5">
                <FilterButton active={filter === "affected"} onClick={() => onFilterChange("affected")} label="Solo afectados" />
                <FilterButton active={filter === "degraded"} onClick={() => onFilterChange("degraded")} label="Solo degradados" />
                <FilterButton active={filter === "all"} onClick={() => onFilterChange("all")} label="Todos" />
            </div>

            <div className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr_1fr_0.9fr] gap-2 border-b border-white/8 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                <span>Cliente</span>
                <span>Estado</span>
                <span>IP</span>
                <span>Plan</span>
                <span>Último seen</span>
                <span className="text-right">Ingreso</span>
            </div>

            {loading ? (
                <div className="space-y-1.5 py-1">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="h-7 animate-pulse rounded-md bg-zinc-800/55" />
                    ))}
                </div>
            ) : totalRows === 0 ? (
                <div className="rounded-lg border border-white/8 bg-black/35 px-3 py-5 text-center text-xs text-zinc-500">
                    No hay clientes para este filtro.
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="overflow-y-auto rounded-lg border border-white/8 bg-black/30 [scrollbar-color:#334155_transparent] [scrollbar-width:thin]"
                    style={{ height: VIEWPORT_HEIGHT }}
                    onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
                >
                    <div style={{ height: totalHeight, position: "relative" }}>
                        <div style={{ transform: `translateY(${offsetY}px)` }}>
                            {visibleRows.map((client) => (
                                <div
                                    key={client.clientId}
                                    className="grid h-[44px] grid-cols-[1.2fr_0.8fr_1fr_0.8fr_1fr_0.9fr] items-center gap-2 overflow-hidden border-b border-white/8 px-2 text-[11px] text-zinc-300/85"
                                >
                                    <span className="min-w-0 truncate whitespace-nowrap font-medium text-white/90">{client.clientName || client.clientId}</span>
                                    <span className={`w-fit rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusClass(client.status)}`}>{client.status}</span>
                                    <span className="min-w-0 truncate whitespace-nowrap font-mono text-[10px] text-white/65">{client.ip || "-"}</span>
                                    <span className="min-w-0 truncate whitespace-nowrap">{client.plan || "-"}</span>
                                    <span className="min-w-0 truncate whitespace-nowrap text-[10px] text-white/60">{formatSeen(client.lastSeenAt)}</span>
                                    <span className="truncate whitespace-nowrap text-right font-medium text-amber-300">
                                        ${(client.monthlyRevenue ?? config.defaultArpu).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                    ? "border-zinc-700 bg-[#18181b] text-zinc-100"
                    : "border-white/10 bg-black/35 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
            }`}
        >
            {label}
        </button>
    )
}
