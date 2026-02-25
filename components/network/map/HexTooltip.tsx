"use client"

import type { TerritoryCell } from "@/lib/territory/types"
import type { ImpactTier } from "@/lib/impact/types"
import { HEATMAP_MODE_UNITS } from "@/lib/territory/types"
import type { HeatmapMode } from "@/lib/territory/types"
import {
    Activity,
    AlertTriangle,
    Users,
    DollarSign,
    Ticket,
    Server,
    Zap,
    ChevronRight,
    Eye,
} from "lucide-react"

/* ══════════════════════════════════════════════════════════
   Tier → style config
   ══════════════════════════════════════════════════════════ */

const TIER_CONFIG: Record<
    ImpactTier,
    { label: string; dot: string; glow: string; badgeBg: string; badgeBorder: string; badgeText: string }
> = {
    CRITICAL: {
        label: "Crítico", dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
        glow: "bg-rose-500", badgeBg: "bg-rose-500/5", badgeBorder: "border-rose-500/20", badgeText: "text-rose-400",
    },
    HIGH: {
        label: "Alto", dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
        glow: "bg-amber-500", badgeBg: "bg-amber-500/5", badgeBorder: "border-amber-500/20", badgeText: "text-amber-400",
    },
    MEDIUM: {
        label: "Medio", dot: "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]",
        glow: "bg-yellow-500", badgeBg: "bg-zinc-800/40", badgeBorder: "border-white/5", badgeText: "text-zinc-300",
    },
    LOW: {
        label: "Bajo", dot: "bg-zinc-500",
        glow: "bg-zinc-500", badgeBg: "bg-transparent", badgeBorder: "border-white/5", badgeText: "text-zinc-500",
    },
}

/* ══════════════════════════════════════════════════════════
   SectionTitle
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
   ContributorItem — premium node row (like NodeItem)
   ══════════════════════════════════════════════════════════ */

function ContributorItem({
    label,
    impactScore,
    isTop,
}: {
    label: string
    impactScore: number
    isTop: boolean
}) {
    return (
        <div
            className={`flex items-center justify-between rounded-lg border p-1.5 transition-all ${isTop
                    ? "border-rose-500/20 bg-rose-500/10"
                    : "border-white/5 bg-black/20"
                }`}
        >
            <div className="flex items-center gap-2">
                <div className={`rounded-md p-1 ${isTop ? "bg-rose-500/20 text-rose-400" : "bg-zinc-800 text-zinc-400"}`}>
                    {isTop ? <Zap size={10} /> : <Server size={10} />}
                </div>
                <span className={`truncate text-[11px] font-medium ${isTop ? "text-rose-100" : "text-zinc-300"}`}>
                    {label}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <span className={`font-mono text-[9px] ${isTop ? "text-rose-400" : "text-zinc-500"}`}>
                    {impactScore}
                </span>
                <ChevronRight size={10} className="text-zinc-600" />
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

interface HexTooltipProps {
    cell: TerritoryCell | null
    position: { x: number; y: number } | null
    mode: HeatmapMode
    onViewNodes?: (cellId: string) => void
}

export function HexTooltip({ cell, position, mode, onViewNodes }: HexTooltipProps) {
    if (!cell || !position) return null

    const config = TIER_CONFIG[cell.tier]

    return (
        <div
            className="pointer-events-none absolute z-[600]"
            style={{
                left: position.x + 12,
                top: position.y - 8,
                transform: position.x > window.innerWidth - 340 ? "translateX(-110%)" : undefined,
            }}
        >
            <div className="pointer-events-auto relative w-[280px] overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/60 via-[#0a0a0c]/90 to-black/95 text-zinc-300 shadow-[0_12px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                {/* Ambient glow */}
                <div className={`pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full opacity-15 blur-3xl ${config.glow}`} />

                {/* ── HEADER ── */}
                <div className="relative flex items-center justify-between border-b border-white/5 bg-black/20 p-2.5 pb-2">
                    <div className="flex items-center gap-2.5">
                        <div className={`h-1.5 w-1.5 animate-pulse rounded-full ${config.dot}`} />
                        <div className="flex items-center gap-2">
                            <span
                                className={`rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
                            >
                                {config.label}
                            </span>
                            <span className="text-[9px] font-medium text-zinc-500">
                                {cell.metrics.nodeCount} nodo{cell.metrics.nodeCount !== 1 ? "s" : ""}
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
                                <Activity size={8} /> IMPACTO
                            </span>
                            <span className="text-xs font-bold text-zinc-200">
                                {cell.metrics.impactSum.toFixed(0)}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/30 px-1 py-1.5">
                            <span className="mb-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                                <Users size={8} /> CLIENTES
                            </span>
                            <span className="text-xs font-bold text-zinc-200">
                                {cell.metrics.affectedClients.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/10 bg-black/30 px-1 py-1.5">
                            <span className="mb-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-amber-500/70">
                                <DollarSign size={8} /> MRR
                            </span>
                            <span className="text-xs font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                                ${cell.metrics.affectedMRR.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Secondary metrics */}
                    <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="flex items-center gap-1 text-zinc-500">
                                    <AlertTriangle size={9} /> Máx.
                                </span>
                                <span className="font-bold text-zinc-300">{cell.metrics.impactMax}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="flex items-center gap-1 text-zinc-500">
                                    <Ticket size={9} /> Tickets
                                </span>
                                <span className="font-bold text-zinc-300">{cell.metrics.openTickets}</span>
                            </div>
                        </div>
                    </div>

                    {/* Top contributors */}
                    {cell.topContributors.length > 0 && (
                        <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                            <SectionTitle icon={Zap} title="Top Nodos" />
                            <div className="flex flex-col gap-1">
                                {cell.topContributors.map((c, idx) => (
                                    <ContributorItem
                                        key={c.nodeId}
                                        label={c.label}
                                        impactScore={c.impactScore}
                                        isTop={idx === 0}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA — View nodes */}
                    {onViewNodes && (
                        <button
                            type="button"
                            onClick={() => onViewNodes(cell.id)}
                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 p-[1px] transition-all hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                        >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/0 via-sky-500/50 to-sky-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="relative flex h-full w-full items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0c] px-3 py-2 transition-all hover:bg-zinc-900/80">
                                <Eye size={12} className="text-sky-400" />
                                <span className="text-[11px] font-semibold text-zinc-200 transition-colors group-hover:text-white">
                                    Ver nodos en esta zona
                                </span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
