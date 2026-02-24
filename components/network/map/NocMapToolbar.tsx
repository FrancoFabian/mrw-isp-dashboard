"use client"

import { useAtom } from "jotai"
import { filtersAtom, layersAtom, heatmapModeAtom, mapOverlayAtom, type MapFilters, type MapLayers, type MapOverlay } from "@/components/network/map/state/mapAtoms"
import type { MapNodeStatus, MapNodeType } from "@/types/network/mapProjection"
import type { HeatmapMode } from "@/lib/territory/types"
import { LocateFixed, Search, Layers, Rocket } from "lucide-react"

/* ── Status buttons ── */

const STATUS_OPTIONS: { value: MapNodeStatus; label: string; color: string; activeColor: string }[] = [
    { value: "ONLINE", label: "Online", color: "border-emerald-500/30 text-emerald-400/60", activeColor: "bg-emerald-500/20 border-emerald-500/60 text-emerald-300" },
    { value: "OFFLINE", label: "Offline", color: "border-red-500/30 text-red-400/60", activeColor: "bg-red-500/20 border-red-500/60 text-red-300" },
    { value: "DEGRADED", label: "Degraded", color: "border-amber-500/30 text-amber-400/60", activeColor: "bg-amber-500/20 border-amber-500/60 text-amber-300" },
    { value: "UNKNOWN", label: "Unknown", color: "border-gray-500/30 text-gray-400/60", activeColor: "bg-gray-500/20 border-gray-500/60 text-gray-300" },
]

const TYPE_OPTIONS: { value: MapNodeType; label: string }[] = [
    { value: "olt", label: "OLT" },
    { value: "nap", label: "NAP" },
    { value: "onu", label: "ONU" },
]

const MODE_OPTIONS: { value: HeatmapMode; label: string }[] = [
    { value: "impact", label: "Impacto" },
    { value: "revenue", label: "MRR" },
    { value: "clients", label: "Clientes" },
    { value: "tickets", label: "Tickets" },
]

interface NocMapToolbarProps {
    onFocusMyNodes?: () => void
    inlineMessage?: string | null
}

export function NocMapToolbar({ onFocusMyNodes, inlineMessage }: NocMapToolbarProps) {
    const [filters, setFilters] = useAtom(filtersAtom)
    const [layers, setLayers] = useAtom(layersAtom)
    const [heatmapMode, setHeatmapMode] = useAtom(heatmapModeAtom)
    const [overlay, setOverlay] = useAtom(mapOverlayAtom)

    function toggleStatus(status: MapNodeStatus) {
        setFilters((f: MapFilters) => {
            const has = f.statuses.includes(status)
            return {
                ...f,
                statuses: has
                    ? f.statuses.filter((s: MapNodeStatus) => s !== status)
                    : [...f.statuses, status],
            }
        })
    }

    function toggleType(type: MapNodeType) {
        setFilters((f: MapFilters) => {
            const has = f.types.includes(type)
            return {
                ...f,
                types: has
                    ? f.types.filter((t: MapNodeType) => t !== type)
                    : [...f.types, type],
            }
        })
    }

    function setSearch(search: string) {
        setFilters((f: MapFilters) => ({ ...f, search }))
    }

    function toggleHeatmap() {
        setLayers((l: MapLayers) => ({ ...l, heatmap: !l.heatmap }))
    }

    return (
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border border-white/6 bg-slate-900/70 px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-xl">
            {/* Status toggles */}
            <div className="flex items-center gap-1.5">
                {STATUS_OPTIONS.map((opt) => {
                    const active = filters.statuses.includes(opt.value)
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleStatus(opt.value)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-150 ${active ? opt.activeColor : opt.color} hover:brightness-125`}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-white/10" />

            {/* Type toggles */}
            <div className="flex items-center gap-1.5">
                {TYPE_OPTIONS.map((opt) => {
                    const active = filters.types.includes(opt.value)
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleType(opt.value)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${active
                                ? "border-sky-500/50 bg-sky-500/15 text-sky-300"
                                : "border-white/10 text-white/40 hover:text-white/70"
                                }`}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-white/10" />

            {/* Heatmap toggle + overlay selector */}
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={toggleHeatmap}
                    className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all duration-150 ${layers.heatmap
                            ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                            : "border-white/10 text-white/40 hover:text-white/70"
                        }`}
                >
                    <Layers className="h-3.5 w-3.5" />
                    Heatmap
                </button>

                {layers.heatmap && (
                    <>
                        {/* Overlay mode: Impact vs Expansion */}
                        <div className="flex items-center rounded-lg border border-white/10 bg-white/5">
                            <button
                                type="button"
                                onClick={() => setOverlay("impact")}
                                className={`rounded-l-md px-2.5 py-1 text-[10px] font-bold transition-all ${overlay === "impact"
                                        ? "bg-violet-500/20 text-violet-300"
                                        : "text-white/35 hover:text-white/60"
                                    }`}
                            >
                                Impact
                            </button>
                            <button
                                type="button"
                                onClick={() => setOverlay("expansion")}
                                className={`flex items-center gap-1 rounded-r-md px-2.5 py-1 text-[10px] font-bold transition-all ${overlay === "expansion"
                                        ? "bg-teal-500/20 text-teal-300"
                                        : "text-white/35 hover:text-white/60"
                                    }`}
                            >
                                <Rocket className="h-3 w-3" />
                                Expansión
                            </button>
                        </div>

                        {/* Impact sub-modes (only when overlay is impact) */}
                        {overlay === "impact" && (
                            <div className="flex items-center gap-1">
                                {MODE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setHeatmapMode(opt.value)}
                                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all duration-150 ${heatmapMode === opt.value
                                                ? "bg-violet-500/20 text-violet-300"
                                                : "text-white/35 hover:text-white/60"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-white/10" />

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar nodo…"
                    className="h-7 w-36 rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white/80 placeholder:text-white/25 focus:border-sky-500/40 focus:outline-none sm:w-44"
                />
            </div>

            <button
                type="button"
                onClick={onFocusMyNodes}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/15 px-3 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-500/25"
            >
                <LocateFixed className="h-3.5 w-3.5" />
                Mis nodos
            </button>

            {inlineMessage && (
                <span className="text-xs font-medium text-amber-300/90">{inlineMessage}</span>
            )}
        </div>
    )
}
