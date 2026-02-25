"use client"

import { useState, useCallback } from "react"
import { useSetAtom } from "jotai"
import { mapFocusRequestAtom, roiSimulationAtom } from "@/components/network/map/state/mapAtoms"
import type { ExpansionCell, OpportunityTier } from "@/lib/expansion/types"
import { OPPORTUNITY_TIER_LABELS } from "@/lib/expansion/types"
import { Rocket, BarChart3, Users } from "lucide-react"

/* ══════════════════════════════════════════════════════════
   Tier → style config
   ══════════════════════════════════════════════════════════ */

const TIER_CONFIG: Record<
    OpportunityTier,
    {
        badgeBg: string; badgeBorder: string; badgeText: string
        dot: string; scoreText: string
    }
> = {
    PRIORITY: {
        badgeBg: "bg-emerald-500/5", badgeBorder: "border-emerald-500/20", badgeText: "text-emerald-400",
        dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]", scoreText: "text-emerald-100",
    },
    HIGH: {
        badgeBg: "bg-amber-500/5", badgeBorder: "border-amber-500/20", badgeText: "text-amber-400",
        dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]", scoreText: "text-amber-100",
    },
    MEDIUM: {
        badgeBg: "bg-zinc-800/40", badgeBorder: "border-white/5", badgeText: "text-zinc-300",
        dot: "bg-zinc-400", scoreText: "text-zinc-200",
    },
    LOW: {
        badgeBg: "bg-transparent", badgeBorder: "border-white/5", badgeText: "text-zinc-500",
        dot: "bg-zinc-700", scoreText: "text-zinc-500",
    },
}

/* ══════════════════════════════════════════════════════════
   SummaryPill — header badges
   ══════════════════════════════════════════════════════════ */

function SummaryPill({
    count,
    label,
    type,
}: {
    count: number
    label: string
    type: "priority" | "high"
}) {
    const isPriority = type === "priority"
    return (
        <div
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 ${isPriority
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    : "border-amber-500/20 bg-amber-500/5 text-amber-400"
                }`}
        >
            <span className="text-xs font-black tracking-tighter">{count}</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.1em] opacity-80">
                {label}
            </span>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   ZoneItem — single ranked zone card
   ══════════════════════════════════════════════════════════ */

function ZoneItem({
    index,
    cell,
    onZoom,
    onSimulate,
}: {
    index: number
    cell: ExpansionCell
    onZoom: () => void
    onSimulate: (e: React.MouseEvent) => void
}) {
    const config = TIER_CONFIG[cell.opportunityTier]

    return (
        <div
            onClick={onZoom}
            className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-white/5 bg-black/20 p-2.5 transition-all hover:bg-white/10"
        >
            {/* Rank + dot */}
            <div className="relative z-10 flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/5 bg-[#111] text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300">
                    {index}
                </div>
                <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            </div>

            {/* Info */}
            <div className="relative z-10 flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
                        >
                            {OPPORTUNITY_TIER_LABELS[cell.opportunityTier]}
                        </span>
                        <span className={`text-[11px] font-bold ${config.scoreText}`}>
                            {cell.opportunityScore}
                            <span className="ml-0.5 text-[9px] font-medium text-zinc-500">pts</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1 text-zinc-500">
                        <Users size={10} />
                        <span>{cell.metrics.leadsNoCoverage} leads</span>
                    </div>
                    <div className="flex items-center gap-0.5 font-medium text-zinc-300">
                        <span className="text-amber-500/70">$</span>
                        <span>{cell.metrics.potentialMRR.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Simulate button */}
            <button
                type="button"
                onClick={onSimulate}
                className="relative z-10 flex h-7 w-7 items-center justify-center text-zinc-600 transition-all group-hover:text-zinc-400"
                title="Simular ROI"
            >
                <BarChart3 className="h-full w-full p-1" />
            </button>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   Premium Pagination
   ══════════════════════════════════════════════════════════ */

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number
    totalPages: number
    onPageChange: (p: number) => void
}) {
    return (
        <div className="flex w-full items-center justify-center gap-1.5">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl bg-[#111] px-3 py-1.5 text-[10px] font-bold text-zinc-400 transition-colors hover:bg-[#1a1a1a] disabled:opacity-30"
            >
                Prev
            </button>
            <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onPageChange(i + 1)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${currentPage === i + 1
                                ? "bg-zinc-100 text-black"
                                : "bg-[#111] text-zinc-400 hover:bg-[#1a1a1a]"
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl bg-[#111] px-3 py-1.5 text-[10px] font-bold text-zinc-400 transition-colors hover:bg-[#1a1a1a] disabled:opacity-30"
            >
                Next
            </button>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

interface ExpansionRankingProps {
    ranking: ExpansionCell[]
    visible: boolean
    maxItems?: number
}

const ITEMS_PER_PAGE = 3

export function ExpansionRanking({ ranking, visible }: ExpansionRankingProps) {
    const setFocusRequest = useSetAtom(mapFocusRequestAtom)
    const setRoiSimulation = useSetAtom(roiSimulationAtom)
    const [currentPage, setCurrentPage] = useState(1)

    const handleZoomToCell = useCallback(
        (cell: ExpansionCell) => {
            if (cell.nearestNodes.length > 0) {
                setFocusRequest({
                    token: Date.now(),
                    nodeIds: cell.nearestNodes.map((n) => n.nodeId),
                })
            }
        },
        [setFocusRequest],
    )

    const handleSimulate = useCallback(
        (cell: ExpansionCell, e: React.MouseEvent) => {
            e.stopPropagation()
            setRoiSimulation(cell)
        },
        [setRoiSimulation],
    )

    if (!visible || ranking.length === 0) return null

    const totalPages = Math.max(1, Math.ceil(ranking.length / ITEMS_PER_PAGE))
    const safePage = Math.min(currentPage, totalPages)
    const currentZones = ranking.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

    const priorityCount = ranking.filter((c) => c.opportunityTier === "PRIORITY").length
    const highCount = ranking.filter((c) => c.opportunityTier === "HIGH").length

    return (
        <div className="pointer-events-auto flex w-[320px] flex-col overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/70 via-[#0a0a0c]/95 to-black/95 shadow-2xl backdrop-blur-xl">
            {/* ── Header ── */}
            <div className="border-b border-white/5 bg-black/20 p-3.5">
                <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-400">
                        <Rocket size={14} />
                    </div>
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">
                        Zonas de Expansión
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    {priorityCount > 0 && (
                        <SummaryPill count={priorityCount} label="Prioritarias" type="priority" />
                    )}
                    {highCount > 0 && (
                        <SummaryPill count={highCount} label="Altas" type="high" />
                    )}
                </div>
            </div>

            {/* ── Zone list ── */}
            <div className="relative z-10 min-h-[180px] flex-1 space-y-1.5 p-2">
                {currentZones.map((cell, idx) => (
                    <ZoneItem
                        key={cell.h3Index}
                        index={(safePage - 1) * ITEMS_PER_PAGE + idx + 1}
                        cell={cell}
                        onZoom={() => handleZoomToCell(cell)}
                        onSimulate={(e) => handleSimulate(cell, e)}
                    />
                ))}
            </div>

            {/* ── Footer pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center border-t border-white/5 bg-black/30 p-3.5">
                    <Pagination
                        currentPage={safePage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    )
}
