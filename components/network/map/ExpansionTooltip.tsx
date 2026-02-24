"use client"

import { useSetAtom } from "jotai"
import { roiSimulationAtom } from "@/components/network/map/state/mapAtoms"
import type { ExpansionCell, OpportunityTier } from "@/lib/expansion/types"
import { OPPORTUNITY_TIER_LABELS } from "@/lib/expansion/types"

interface ExpansionTooltipProps {
    cell: ExpansionCell | null
    position: { x: number; y: number } | null
}

const TIER_COLORS: Record<OpportunityTier, string> = {
    PRIORITY: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    HIGH: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    LOW: "bg-slate-500/20 text-slate-400 border-slate-500/40",
}

export function ExpansionTooltip({ cell, position }: ExpansionTooltipProps) {
    const setRoiSimulation = useSetAtom(roiSimulationAtom)

    if (!cell || !position) return null

    const formatDist = (m: number) =>
        m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`

    return (
        <div
            className="pointer-events-none absolute z-600"
            style={{ left: position.x + 14, top: position.y - 10 }}
        >
            <div className="pointer-events-auto w-64 rounded-xl border border-white/10 bg-slate-900/92 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
                {/* Tier badge + score */}
                <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${TIER_COLORS[cell.opportunityTier]}`}>
                        {OPPORTUNITY_TIER_LABELS[cell.opportunityTier]}
                    </span>
                    <span className="font-mono text-sm font-bold text-white/90">
                        {cell.opportunityScore}/100
                    </span>
                </div>

                {/* Metrics */}
                <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-white/60">
                        <span>Leads sin cobertura</span>
                        <span className="font-semibold text-teal-400">{cell.metrics.leadsNoCoverage}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                        <span>Nodo más cercano</span>
                        <span className="font-semibold text-white/80">{formatDist(cell.metrics.nearestNodeDistanceM)}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                        <span>MRR potencial</span>
                        <span className="font-semibold text-amber-400">${cell.metrics.potentialMRR.toLocaleString()}</span>
                    </div>
                </div>

                {/* Factors */}
                <div className="mt-2 border-t border-white/8 pt-2">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/35">Factores</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-white/50">
                        <div className="flex justify-between">
                            <span>Demanda</span>
                            <span className="font-mono text-white/70">{(cell.normalized.demandFactor * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Distancia</span>
                            <span className="font-mono text-white/70">{(cell.normalized.distanceFactor * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Revenue</span>
                            <span className="font-mono text-white/70">{(cell.normalized.revenueFactor * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Capacidad</span>
                            <span className="font-mono text-white/70">{(cell.normalized.capacityFactor * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                {/* Nearest nodes */}
                {cell.nearestNodes.length > 0 && (
                    <div className="mt-2 border-t border-white/8 pt-2">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/35">Nodos cercanos</div>
                        <div className="space-y-0.5">
                            {cell.nearestNodes.map((n) => (
                                <div key={n.nodeId} className="flex justify-between text-[10px]">
                                    <span className="truncate text-white/55">{n.label}</span>
                                    <span className="ml-2 font-mono text-white/40">{formatDist(n.distanceM)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Simulate ROI action */}
                <button
                    type="button"
                    onClick={() => setRoiSimulation(cell)}
                    className="mt-2.5 w-full rounded-lg border border-teal-500/30 bg-teal-500/10 py-1.5 text-[11px] font-semibold text-teal-300 transition-colors hover:bg-teal-500/20"
                >
                    📊 Simular ROI aquí
                </button>
            </div>
        </div>
    )
}
