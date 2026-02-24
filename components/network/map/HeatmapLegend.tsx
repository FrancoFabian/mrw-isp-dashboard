"use client"

import type { HeatmapMode } from "@/lib/territory/types"
import { HEATMAP_MODE_LABELS, HEATMAP_MODE_UNITS } from "@/lib/territory/types"
import type { MapOverlay } from "@/components/network/map/state/mapAtoms"

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
        <div className="pointer-events-auto w-52 rounded-xl border border-white/8 bg-slate-900/85 px-3 py-2.5 shadow-xl shadow-black/30 backdrop-blur-xl">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
                {title}
            </div>

            <div
                className="h-2.5 w-full rounded-full"
                style={{ background: `linear-gradient(to right, ${gradient})` }}
            />

            <div className="mt-1 flex justify-between text-[9px] text-white/40">
                {tierLabels.map((label) => (
                    <span key={label}>{label}</span>
                ))}
            </div>

            <div className="mt-1.5 text-[9px] text-white/30">
                {unit}
            </div>
        </div>
    )
}
