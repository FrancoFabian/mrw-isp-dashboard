"use client"

import type { HeatmapMode } from "@/lib/territory/types"
import { HEATMAP_MODE_LABELS, HEATMAP_MODE_UNITS } from "@/lib/territory/types"
import type { MapOverlay } from "@/components/network/map/state/mapAtoms"
import { Layers } from "lucide-react"

interface HeatmapLegendProps {
    mode: HeatmapMode
    overlay: MapOverlay
    visible: boolean
}

/* ── Impact gradient stops ── */
const IMPACT_GRADIENT_STOPS = [
    { color: "#065f46", label: "0" },
    { color: "#a16207", label: "" },
    { color: "#92400e", label: "" },
    { color: "#b91c1c", label: "" },
    { color: "#dc2626", label: "max" },
]

/* ── Expansion gradient stops ── */
const EXPANSION_GRADIENT_STOPS = [
    { color: "#0f172a", label: "0" },
    { color: "#115e59", label: "" },
    { color: "#a16207", label: "" },
    { color: "#c2410c", label: "" },
    { color: "#dc2626", label: "100" },
]

const EXPANSION_TIER_LABELS = ["Bajo", "Medio", "Alto", "Prioritario"]

export function HeatmapLegend({ mode, overlay, visible }: HeatmapLegendProps) {
    if (!visible) return null

    const isExpansion = overlay === "expansion"
    const stops = isExpansion ? EXPANSION_GRADIENT_STOPS : IMPACT_GRADIENT_STOPS
    const gradient = stops.map((s) => s.color).join(", ")
    const title = isExpansion ? "Oportunidad de Expansión" : HEATMAP_MODE_LABELS[mode]
    const unit = isExpansion ? "score 0–100" : `Unidad: ${HEATMAP_MODE_UNITS[mode]}`
    const tierLabels = isExpansion ? EXPANSION_TIER_LABELS : ["Bajo", "Medio", "Alto", "Crítico"]

    return (
        <div className="pointer-events-auto w-56 overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/70 via-[#0a0a0c]/95 to-black/95 shadow-[0_12px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-black/20 px-3 py-2.5">
                <div className="rounded-md border border-purple-500/20 bg-purple-500/10 p-1 text-purple-400">
                    <Layers size={12} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    {title}
                </span>
            </div>

            {/* Content */}
            <div className="p-3">
                {/* Gradient bar with glow */}
                <div className="relative">
                    <div
                        className="h-2.5 w-full rounded-full"
                        style={{ background: `linear-gradient(to right, ${gradient})` }}
                    />
                    {/* Subtle glow beneath */}
                    <div
                        className="absolute inset-0 top-0.5 rounded-full opacity-40 blur-[6px]"
                        style={{ background: `linear-gradient(to right, ${gradient})` }}
                    />
                </div>

                {/* Tier labels */}
                <div className="mt-1.5 flex justify-between text-[9px] font-medium text-zinc-500">
                    {tierLabels.map((label) => (
                        <span key={label}>{label}</span>
                    ))}
                </div>

                {/* Unit */}
                <div className="mt-2 rounded-lg border border-white/5 bg-black/30 px-2 py-1 text-center text-[9px] font-medium text-zinc-600">
                    {unit}
                </div>
            </div>
        </div>
    )
}
