"use client"

import { useState } from "react"
import { useSetAtom } from "jotai"
import { roiSimulationAtom } from "@/components/network/map/state/mapAtoms"
import type { ExpansionCell, OpportunityTier } from "@/lib/expansion/types"
import { OPPORTUNITY_TIER_LABELS } from "@/lib/expansion/types"
import {
    Target,
    MapPin,
    DollarSign,
    BarChart3,
    Wifi,
    Zap,
    Server,
    ChevronRight,
} from "lucide-react"

/* ══════════════════════════════════════════════════════════
   Tier → color mapping for the pulsing dot
   ══════════════════════════════════════════════════════════ */

const TIER_DOT_CLASSES: Record<OpportunityTier, string> = {
    PRIORITY: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    HIGH: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
    MEDIUM: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]",
    LOW: "bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.8)]",
}

const TIER_GLOW_CLASSES: Record<OpportunityTier, string> = {
    PRIORITY: "bg-emerald-500",
    HIGH: "bg-amber-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-zinc-500",
}

/* ══════════════════════════════════════════════════════════
   ScoreCircle — animated SVG radial gauge
   ══════════════════════════════════════════════════════════ */

function ScoreCircle({ score }: { score: number }) {
    const radius = 14
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="relative flex h-8 w-8 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="16" cy="16" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-zinc-800" />
                <circle cx="16" cy="16" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-amber-500 transition-all duration-1000 ease-out drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            </svg>
            <span className="text-[11px] font-bold leading-none text-white">{score}</span>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   SectionTitle – tiny icon + uppercase label
   ══════════════════════════════════════════════════════════ */

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="mb-1.5 flex items-center gap-1.5">
            <Icon size={10} className="text-zinc-500" />
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">{title}</h3>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   FactorBar – neon gradient bar with glow
   ══════════════════════════════════════════════════════════ */

function FactorBar({
    label,
    percentage,
    gradientClass,
}: {
    label: string
    percentage: number
    gradientClass: string
}) {
    return (
        <div className="flex flex-col gap-1 py-0.5">
            <div className="flex items-center justify-between text-[9px]">
                <span className="text-zinc-400">{label}</span>
                <span className="font-medium text-zinc-300">{percentage}%</span>
            </div>
            <div className="relative h-[2px] w-full rounded-full bg-black/60">
                <div
                    className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r transition-all duration-500 ${gradientClass}`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className={`absolute inset-0 bg-gradient-to-r opacity-70 blur-[3px] ${gradientClass}`} />
                </div>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   NodeItem – premium node row
   ══════════════════════════════════════════════════════════ */

function NodeItem({
    name,
    distance,
    isClosest,
}: {
    name: string
    distance: string
    isClosest: boolean
}) {
    return (
        <div
            className={`flex cursor-pointer items-center justify-between rounded-lg border p-1.5 transition-all ${isClosest
                    ? "border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20"
                    : "border-white/5 bg-black/20 hover:bg-white/5"
                }`}
        >
            <div className="flex items-center gap-2">
                <div className={`rounded-md p-1 ${isClosest ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}>
                    {isClosest ? <Zap size={10} /> : <Server size={10} />}
                </div>
                <span className={`text-[11px] font-medium ${isClosest ? "text-emerald-100" : "text-zinc-300"}`}>
                    {name}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <span className={`font-mono text-[9px] ${isClosest ? "text-emerald-400" : "text-zinc-500"}`}>
                    {distance}
                </span>
                <ChevronRight size={10} className="text-zinc-600" />
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   Helper – factor percentage → gradient class
   ══════════════════════════════════════════════════════════ */

function factorGradient(pct: number): string {
    if (pct >= 60) return "from-emerald-600 to-emerald-400"
    if (pct >= 35) return "from-zinc-600 to-zinc-400"
    return "from-amber-600 to-amber-400"
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

interface ExpansionTooltipProps {
    cell: ExpansionCell | null
    position: { x: number; y: number } | null
}

export function ExpansionTooltip({ cell, position }: ExpansionTooltipProps) {
    const setRoiSimulation = useSetAtom(roiSimulationAtom)
    const [currentPage, setCurrentPage] = useState(1)

    if (!cell || !position) return null

    const formatDist = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`)

    /* Node pagination */
    const itemsPerPage = 2
    const totalPages = Math.max(1, Math.ceil(cell.nearestNodes.length / itemsPerPage))
    const visibleNodes = cell.nearestNodes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    )

    /* Factor percentages */
    const demandPct = Math.round(cell.normalized.demandFactor * 100)
    const distancePct = Math.round(cell.normalized.distanceFactor * 100)
    const revenuePct = Math.round(cell.normalized.revenueFactor * 100)
    const capacityPct = Math.round(cell.normalized.capacityFactor * 100)

    return (
        <div
            className="pointer-events-none absolute z-[600]"
            style={{ left: position.x + 14, top: position.y - 10 }}
        >
            {/* Main container – matches examplesimularroitool visual language */}
            <div className="pointer-events-auto relative w-[320px] overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/60 via-[#0a0a0c]/90 to-black/95 text-zinc-300 shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.05)] backdrop-blur-xl">
                {/* Ambient glow */}
                <div className={`pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-15 blur-3xl ${TIER_GLOW_CLASSES[cell.opportunityTier]}`} />

                {/* ── HEADER ── */}
                <div className="relative flex items-center justify-between border-b border-white/5 bg-black/20 p-2.5 pb-2">
                    <div className="flex items-center gap-2.5">
                        <ScoreCircle score={cell.opportunityScore} />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-100">
                                    Zona {OPPORTUNITY_TIER_LABELS[cell.opportunityTier]}
                                </span>
                                <div className={`h-1.5 w-1.5 animate-pulse rounded-full ${TIER_DOT_CLASSES[cell.opportunityTier]}`} />
                            </div>
                            <span className="text-[9px] font-medium text-zinc-500">
                                Calificación de cobertura
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="space-y-2.5 p-2.5">
                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                        <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/30 px-1 py-1.5">
                            <span className="mb-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                                <Target size={8} /> LEADS
                            </span>
                            <span className="text-xs font-bold text-emerald-400">
                                {cell.metrics.leadsNoCoverage}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/30 px-1 py-1.5">
                            <span className="mb-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                                <MapPin size={8} /> CERCANO
                            </span>
                            <span className="text-xs font-bold text-zinc-200">
                                {formatDist(cell.metrics.nearestNodeDistanceM)}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/10 bg-black/30 px-1 py-1.5">
                            <span className="mb-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-amber-500/70">
                                <DollarSign size={8} /> MRR
                            </span>
                            <span className="text-xs font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                                ${cell.metrics.potentialMRR.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Factors */}
                    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-black/30 p-2">
                        <SectionTitle icon={BarChart3} title="Factores de Score" />
                        <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                            <FactorBar label="Demanda" percentage={demandPct} gradientClass={factorGradient(demandPct)} />
                            <FactorBar label="Distancia" percentage={distancePct} gradientClass={factorGradient(distancePct)} />
                            <FactorBar label="Revenue" percentage={revenuePct} gradientClass={factorGradient(revenuePct)} />
                            <FactorBar label="Capacidad" percentage={capacityPct} gradientClass={factorGradient(capacityPct)} />
                        </div>
                    </div>

                    {/* Nearest nodes + pagination */}
                    {cell.nearestNodes.length > 0 && (
                        <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                            <SectionTitle icon={Wifi} title="Nodos Cercanos" />

                            <div className="flex min-h-[56px] flex-col gap-1">
                                {visibleNodes.map((n, idx) => (
                                    <NodeItem
                                        key={n.nodeId}
                                        name={n.label}
                                        distance={formatDist(n.distanceM)}
                                        isClosest={currentPage === 1 && idx === 0}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold text-zinc-400 transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Prev
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${currentPage === i + 1
                                                        ? "bg-[#e5e5e5] text-black shadow-sm"
                                                        : "bg-[#111111] text-zinc-400 hover:bg-[#1a1a1a]"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold text-zinc-400 transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CTA – Simular ROI */}
                    <button
                        type="button"
                        onClick={() => setRoiSimulation(cell)}
                        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 p-[1px] transition-all hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                    >
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="relative flex h-full w-full items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0c] px-3 py-2 transition-all hover:bg-zinc-900/80">
                            <BarChart3 size={12} className="text-emerald-400" />
                            <span className="text-[11px] font-semibold text-zinc-200 transition-colors group-hover:text-white">
                                Simular ROI de conexión
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
