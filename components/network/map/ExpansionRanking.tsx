"use client"

import { useCallback } from "react"
import { useSetAtom } from "jotai"
import { mapFocusRequestAtom, roiSimulationAtom } from "@/components/network/map/state/mapAtoms"
import type { ExpansionCell, OpportunityTier } from "@/lib/expansion/types"
import { OPPORTUNITY_TIER_LABELS } from "@/lib/expansion/types"

interface ExpansionRankingProps {
    ranking: ExpansionCell[]
    visible: boolean
    maxItems?: number
}

const TIER_DOT: Record<OpportunityTier, string> = {
    PRIORITY: "bg-teal-400",
    HIGH: "bg-amber-400",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-slate-500",
}

const TIER_BADGE: Record<OpportunityTier, string> = {
    PRIORITY: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    HIGH: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    MEDIUM: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    LOW: "bg-slate-500/15 text-slate-400 border-slate-500/30",
}

export function ExpansionRanking({ ranking, visible, maxItems = 8 }: ExpansionRankingProps) {
    const setFocusRequest = useSetAtom(mapFocusRequestAtom)
    const setRoiSimulation = useSetAtom(roiSimulationAtom)

    const handleZoomToCell = useCallback((cell: ExpansionCell) => {
        if (cell.nearestNodes.length > 0) {
            setFocusRequest({
                token: Date.now(),
                nodeIds: cell.nearestNodes.map((n) => n.nodeId),
            })
        }
    }, [setFocusRequest])

    const handleSimulate = useCallback((cell: ExpansionCell, e: React.MouseEvent) => {
        e.stopPropagation()
        setRoiSimulation(cell)
    }, [setRoiSimulation])

    if (!visible || ranking.length === 0) return null

    const topCells = ranking.slice(0, maxItems)
    const priorityCount = ranking.filter((c) => c.opportunityTier === "PRIORITY").length
    const highCount = ranking.filter((c) => c.opportunityTier === "HIGH").length

    return (
        <div className="pointer-events-auto w-72 rounded-2xl border border-white/8 bg-slate-900/85 shadow-2xl shadow-black/40 backdrop-blur-xl">
            {/* Header */}
            <div className="border-b border-white/8 px-3 py-2.5">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">
                        🚀 Zonas de expansión
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px]">
                        {priorityCount > 0 && (
                            <span className="rounded bg-teal-500/15 px-1.5 py-0.5 font-semibold text-teal-400">
                                {priorityCount} prioritarias
                            </span>
                        )}
                        {highCount > 0 && (
                            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-400">
                                {highCount} altas
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
                {topCells.map((cell, i) => (
                    <div
                        key={cell.h3Index}
                        className="flex w-full items-center gap-2 border-b border-white/5 px-3 py-2 last:border-b-0"
                    >
                        {/* Clickable row for zoom */}
                        <button
                            type="button"
                            onClick={() => handleZoomToCell(cell)}
                            className="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"
                        >
                            {/* Rank number */}
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold text-white/40">
                                {i + 1}
                            </span>

                            {/* Tier dot */}
                            <span className={`h-2 w-2 shrink-0 rounded-full ${TIER_DOT[cell.opportunityTier]}`} />

                            {/* Info */}
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                    <span className={`rounded border px-1 py-px text-[9px] font-bold ${TIER_BADGE[cell.opportunityTier]}`}>
                                        {OPPORTUNITY_TIER_LABELS[cell.opportunityTier]}
                                    </span>
                                    <span className="font-mono text-[11px] font-bold text-white/80">
                                        {cell.opportunityScore}pts
                                    </span>
                                </div>
                                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/45">
                                    <span>{cell.metrics.leadsNoCoverage} leads</span>
                                    <span>·</span>
                                    <span className="text-amber-400/70">${cell.metrics.potentialMRR.toLocaleString()}</span>
                                </div>
                            </div>
                        </button>

                        {/* Simulate ROI button */}
                        <button
                            type="button"
                            onClick={(e) => handleSimulate(cell, e)}
                            className="shrink-0 rounded-md border border-teal-500/20 bg-teal-500/10 px-2 py-1 text-[9px] font-semibold text-teal-400 transition-colors hover:bg-teal-500/20"
                            title="Simular ROI"
                        >
                            📊
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer */}
            {ranking.length > maxItems && (
                <div className="border-t border-white/8 px-3 py-1.5 text-center text-[10px] text-white/35">
                    +{ranking.length - maxItems} zonas más
                </div>
            )}
        </div>
    )
}
