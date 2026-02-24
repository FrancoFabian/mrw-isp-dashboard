"use client"

import type { TerritoryCell } from "@/lib/territory/types"
import type { ImpactTier } from "@/lib/impact/types"
import { HEATMAP_MODE_UNITS } from "@/lib/territory/types"
import type { HeatmapMode } from "@/lib/territory/types"

interface HexTooltipProps {
    cell: TerritoryCell | null
    position: { x: number; y: number } | null
    mode: HeatmapMode
    onViewNodes?: (cellId: string) => void
}

const TIER_COLORS: Record<ImpactTier, string> = {
    CRITICAL: "text-red-400",
    HIGH: "text-orange-400",
    MEDIUM: "text-yellow-400",
    LOW: "text-slate-400",
}

const TIER_LABELS: Record<ImpactTier, string> = {
    CRITICAL: "Crítico",
    HIGH: "Alto",
    MEDIUM: "Medio",
    LOW: "Bajo",
}

export function HexTooltip({ cell, position, mode, onViewNodes }: HexTooltipProps) {
    if (!cell || !position) return null

    const unit = HEATMAP_MODE_UNITS[mode]

    return (
        <div
            className="pointer-events-auto absolute z-600 w-56 rounded-xl border border-white/10 bg-slate-900/92 p-3 shadow-xl shadow-black/40 backdrop-blur-xl"
            style={{
                left: position.x + 12,
                top: position.y - 8,
                // Keep tooltip on screen
                transform: position.x > window.innerWidth - 280 ? "translateX(-110%)" : undefined,
            }}
        >
            {/* Header: Tier badge */}
            <div className="mb-2 flex items-center justify-between">
                <span className={`text-xs font-semibold ${TIER_COLORS[cell.tier]}`}>
                    {TIER_LABELS[cell.tier]}
                </span>
                <span className="text-[10px] text-white/30">
                    {cell.metrics.nodeCount} nodo{cell.metrics.nodeCount !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Metrics grid */}
            <div className="space-y-1 text-[11px] text-white/65">
                <div className="flex justify-between">
                    <span>Impacto total</span>
                    <span className="font-medium text-white/80">{cell.metrics.impactSum.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Impacto máx.</span>
                    <span className="font-medium text-white/80">{cell.metrics.impactMax}</span>
                </div>
                <div className="flex justify-between">
                    <span>Clientes</span>
                    <span className="font-medium text-white/80">{cell.metrics.affectedClients.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>MRR en riesgo</span>
                    <span className="font-medium text-amber-400/90">${cell.metrics.affectedMRR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tickets</span>
                    <span className="font-medium text-white/80">{cell.metrics.openTickets}</span>
                </div>
            </div>

            {/* Top contributors */}
            {cell.topContributors.length > 0 && (
                <div className="mt-2 border-t border-white/8 pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                        Top nodos
                    </span>
                    <div className="mt-1 space-y-0.5">
                        {cell.topContributors.map((c) => (
                            <div key={c.nodeId} className="flex justify-between text-[10px]">
                                <span className="truncate text-white/55">{c.label}</span>
                                <span className="ml-2 font-mono text-white/70">{c.impactScore}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action button */}
            {onViewNodes && (
                <button
                    type="button"
                    onClick={() => onViewNodes(cell.id)}
                    className="mt-2 w-full rounded-lg border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-300 transition-colors hover:bg-sky-500/20"
                >
                    Ver nodos en esta zona
                </button>
            )}
        </div>
    )
}
