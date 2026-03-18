"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { useAtom } from "jotai"
import {
    filtersAtom,
    layersAtom,
    heatmapModeAtom,
    mapOverlayAtom,
    type MapFilters,
    type MapLayers,
    type MapOverlay,
} from "@/components/network/map/state/mapAtoms"
import type { MapNodeStatus, MapNodeType } from "@/types/network/mapProjection"
import type { HeatmapMode } from "@/lib/territory/types"
import {
    Wifi,
    WifiOff,
    AlertTriangle,
    HelpCircle,
    Search,
    Layers,
    LocateFixed,
    Server,
    Box,
    Cpu,
    Rocket,
    Activity,
    Users,
    Ticket,
    DollarSign,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

/* ══════════════════════════════════════════════════════════
   FilterButton – gradient pill with glow when active
   ══════════════════════════════════════════════════════════ */

type ColorScheme = "emerald" | "rose" | "amber" | "zinc" | "cyan" | "purple" | "blue"

const SCHEME_CLASSES: Record<ColorScheme, string> = {
    emerald:
        "text-emerald-400 bg-gradient-to-br from-zinc-800 from-40% to-emerald-600/40 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_2px_10px_rgba(16,185,129,0.15)]",
    rose:
        "text-rose-400 bg-gradient-to-br from-zinc-800 from-40% to-rose-600/40 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_2px_10px_rgba(244,63,94,0.15)]",
    amber:
        "text-amber-400 bg-gradient-to-br from-zinc-800 from-40% to-amber-600/40 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_2px_10px_rgba(245,158,11,0.15)]",
    zinc:
        "text-zinc-300 bg-gradient-to-br from-zinc-800 from-40% to-zinc-600/40 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_2px_10px_rgba(113,113,122,0.15)]",
    cyan:
        "text-cyan-400 bg-gradient-to-br from-zinc-800 from-40% to-cyan-600/40 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_2px_10px_rgba(6,182,212,0.15)]",
    purple:
        "text-purple-400 bg-gradient-to-br from-zinc-800 from-40% to-purple-600/40 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_2px_12px_rgba(168,85,247,0.2)]",
    blue:
        "text-blue-300 bg-gradient-to-br from-zinc-800 from-40% to-blue-600/40 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_4px_10px_rgba(59,130,246,0.15)]",
}
const INACTIVE_CLASS = "text-zinc-500 bg-transparent hover:bg-zinc-800/50 hover:text-zinc-300"

function FilterButton({
    active,
    onClick,
    icon: Icon,
    label,
    colorScheme,
}: {
    active: boolean
    onClick: () => void
    icon?: React.ElementType
    label: string
    colorScheme: ColorScheme
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`flex items-center justify-center gap-1.5 rounded-full p-2 h-8 w-8 md:p-0 md:h-auto md:w-auto md:px-2.5 md:py-1.5 text-[11px] font-bold transition-all duration-300 ${active ? SCHEME_CLASSES[colorScheme] : INACTIVE_CLASS}`}
        >
            {Icon && (
                <Icon
                    size={14}
                    className={active ? "drop-shadow-[0_0_8px_currentColor] shrink-0" : "opacity-60 shrink-0"}
                />
            )}
            <span className="hidden md:inline">{label}</span>
        </button>
    )
}

/* ══════════════════════════════════════════════════════════
   ToolbarSeparator – gradient vertical line
   ══════════════════════════════════════════════════════════ */
function ToolbarSeparator() {
    return (
        <div className="mx-1 h-5 w-px shrink-0 bg-gradient-to-b from-transparent via-zinc-700/80 to-transparent hidden md:block" />
    )
}

/* ══════════════════════════════════════════════════════════
   Dot color map for collapsed mobile indicator
   ══════════════════════════════════════════════════════════ */
const DOT_COLORS: Record<string, { active: string; inactive: string }> = {
    emerald: { active: "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]", inactive: "bg-white/80" },
    rose: { active: "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]", inactive: "bg-white/80" },
    amber: { active: "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]", inactive: "bg-white/80" },
    zinc: { active: "bg-zinc-300 shadow-[0_0_6px_rgba(161,161,170,0.5)]", inactive: "bg-white/80" },
    cyan: { active: "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]", inactive: "bg-white/80" },
}

/* ══════════════════════════════════════════════════════════
   AnimatedSegmentedControl – sliding pill tabs
   ══════════════════════════════════════════════════════════ */
interface SegmentOption<T extends string> {
    value: T
    label: string
    icon?: React.ElementType
}

function AnimatedSegmentedControl<T extends string>({
    options,
    activeValue,
    onChange,
    activeTextColor,
    pillColor,
}: {
    options: SegmentOption<T>[]
    activeValue: T
    onChange: (v: T) => void
    activeTextColor: string
    pillColor: string
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 })

    const updatePill = useCallback(() => {
        if (!containerRef.current) return
        const activeEl = containerRef.current.querySelector<HTMLElement>(
            '[data-active="true"]',
        )
        if (activeEl) {
            setPillStyle({
                left: activeEl.offsetLeft,
                width: activeEl.offsetWidth,
                opacity: 1,
            })
        }
    }, [])

    useEffect(() => {
        const observer = new ResizeObserver(() => updatePill())
        if (containerRef.current) observer.observe(containerRef.current)
        updatePill()
        const timeout = setTimeout(updatePill, 100)
        return () => {
            observer.disconnect()
            clearTimeout(timeout)
        }
    }, [activeValue, options, updatePill])

    return (
        <div ref={containerRef} className="relative z-0 flex items-center p-0.5">
            {/* Sliding pill backdrop */}
            <div
                className={`absolute bottom-0.5 top-0.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${pillColor}`}
                style={{
                    left: `${pillStyle.left}px`,
                    width: `${pillStyle.width}px`,
                    opacity: pillStyle.opacity,
                }}
            />

            {options.map((opt) => {
                const isActive = activeValue === opt.value
                const Icon = opt.icon
                return (
                    <button
                        key={opt.value}
                        type="button"
                        data-active={isActive}
                        onClick={() => onChange(opt.value)}
                        className={`relative z-10 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors duration-300 ${isActive
                            ? activeTextColor
                            : "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300"
                            }`}
                    >
                        {Icon && (
                            <Icon size={14} className={isActive ? "" : "opacity-60"} />
                        )}
                        {opt.label}
                    </button>
                )
            })}
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   Status / Type option maps
   ══════════════════════════════════════════════════════════ */

const STATUS_OPTIONS: {
    value: MapNodeStatus
    label: string
    icon: React.ElementType
    colorScheme: ColorScheme
}[] = [
        { value: "ONLINE", label: "Online", icon: Wifi, colorScheme: "emerald" },
        { value: "OFFLINE", label: "Offline", icon: WifiOff, colorScheme: "rose" },
        { value: "DEGRADED", label: "Degraded", icon: AlertTriangle, colorScheme: "amber" },
        { value: "UNKNOWN", label: "Unknown", icon: HelpCircle, colorScheme: "zinc" },
    ]

const TYPE_OPTIONS: {
    value: MapNodeType
    label: string
    icon: React.ElementType
}[] = [
        { value: "olt", label: "OLT", icon: Server },
        { value: "nap", label: "NAP", icon: Box },
        { value: "onu", label: "ONU", icon: Cpu },
    ]

const OVERLAY_OPTIONS: SegmentOption<MapOverlay>[] = [
    { value: "impact", label: "Impact", icon: Layers },
    { value: "expansion", label: "Expansión", icon: Rocket },
]

const MODE_OPTIONS: SegmentOption<HeatmapMode>[] = [
    { value: "impact", label: "Impacto", icon: Activity },
    { value: "revenue", label: "MRR", icon: DollarSign },
    { value: "clients", label: "Clientes", icon: Users },
    { value: "tickets", label: "Tickets", icon: Ticket },
]

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

interface NocMapToolbarProps {
    onFocusMyNodes?: () => void
    inlineMessage?: string | null
}

function NocMapToolbarInner({ onFocusMyNodes, inlineMessage }: NocMapToolbarProps) {
    const [filters, setFilters] = useAtom(filtersAtom)
    const [layers, setLayers] = useAtom(layersAtom)
    const [heatmapMode, setHeatmapMode] = useAtom(heatmapModeAtom)
    const [overlay, setOverlay] = useAtom(mapOverlayAtom)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [isMobileExpanded, setIsMobileExpanded] = useState(false)
    const [isMobileTypeExpanded, setIsMobileTypeExpanded] = useState(false)

    /* ── Mutators ── */
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

    /* ── Overlay pill color ── */
    const overlayPillColor =
        overlay === "impact"
            ? "bg-gradient-to-br from-zinc-800 from-40% to-purple-600/60 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),_0_2px_8px_rgba(147,51,234,0.4)]"
            : "bg-gradient-to-br from-zinc-800 from-40% to-emerald-600/60 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),_0_2px_8px_rgba(16,185,129,0.4)]"

    return (
        <div className="pointer-events-auto flex flex-col items-start">
            {/* ═══════════════════════════════════════════
                LEVEL 1: Main toolbar (always visible)
               ═══════════════════════════════════════════ */}
            <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-zinc-800/80 bg-[#0a0a0a]/85 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:rounded-full">

                {/* ── MOBILE: Collapsed dot grid OR expanded icons ── */}
                <div className="flex items-center gap-1 md:hidden">
                    {!isMobileExpanded ? (
                        /* 2x2 dot grid when collapsed */
                        <button
                            type="button"
                            onClick={() => setIsMobileExpanded(true)}
                            className="flex items-center justify-center rounded-full p-2 transition-all duration-200 hover:bg-zinc-800/50"
                            title="Expandir filtros"
                        >
                            <div className="grid grid-cols-2 gap-1">
                                {STATUS_OPTIONS.map((opt) => {
                                    const isActive = filters.statuses.includes(opt.value)
                                    const colors = DOT_COLORS[opt.colorScheme]
                                    return (
                                        <div
                                            key={opt.value}
                                            className={`h-2 w-2 rounded-full transition-all duration-300 ${isActive ? colors.active : colors.inactive}`}
                                        />
                                    )
                                })}
                            </div>
                        </button>
                    ) : (
                        /* Expanded: show filters + collapse chevron */
                        <>
                            <div className="flex items-center gap-0.5">
                                {STATUS_OPTIONS.map((opt) => (
                                    <FilterButton
                                        key={opt.value}
                                        active={filters.statuses.includes(opt.value)}
                                        onClick={() => toggleStatus(opt.value)}
                                        colorScheme={opt.colorScheme}
                                        label={opt.label}
                                        icon={opt.icon}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileExpanded(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
                                title="Colapsar filtros"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </>
                    )}
                </div>

                {/* ── DESKTOP: Status toggles (always visible) ── */}
                <div className="hidden items-center gap-0.5 md:flex">
                    {STATUS_OPTIONS.map((opt) => (
                        <FilterButton
                            key={opt.value}
                            active={filters.statuses.includes(opt.value)}
                            onClick={() => toggleStatus(opt.value)}
                            colorScheme={opt.colorScheme}
                            label={opt.label}
                            icon={opt.icon}
                        />
                    ))}
                </div>

                <ToolbarSeparator />

                {/* ── MOBILE: Type dot grid OR expanded type icons ── */}
                <div className="flex items-center gap-1 md:hidden">
                    {!isMobileTypeExpanded ? (
                        /* 3-dot row when collapsed */
                        <button
                            type="button"
                            onClick={() => setIsMobileTypeExpanded(true)}
                            className="flex items-center justify-center rounded-full p-2 transition-all duration-200 hover:bg-zinc-800/50"
                            title="Expandir tipos"
                        >
                            <div className="flex gap-1">
                                {TYPE_OPTIONS.map((opt) => {
                                    const isActive = filters.types.includes(opt.value)
                                    const colors = DOT_COLORS["cyan"]
                                    return (
                                        <div
                                            key={opt.value}
                                            className={`h-2 w-2 rounded-full transition-all duration-300 ${isActive ? colors.active : colors.inactive}`}
                                        />
                                    )
                                })}
                            </div>
                        </button>
                    ) : (
                        /* Expanded: show type filters + collapse chevron */
                        <>
                            <div className="flex items-center gap-0.5">
                                {TYPE_OPTIONS.map((opt) => (
                                    <FilterButton
                                        key={opt.value}
                                        active={filters.types.includes(opt.value)}
                                        onClick={() => toggleType(opt.value)}
                                        colorScheme="cyan"
                                        label={opt.label}
                                        icon={opt.icon}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileTypeExpanded(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
                                title="Colapsar tipos"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </>
                    )}
                </div>

                {/* ── DESKTOP: Type toggles — hidden below 1280px ── */}
                <div className="hidden items-center gap-0.5 xl:flex">
                    {TYPE_OPTIONS.map((opt) => (
                        <FilterButton
                            key={opt.value}
                            active={filters.types.includes(opt.value)}
                            onClick={() => toggleType(opt.value)}
                            colorScheme="cyan"
                            label={opt.label}
                            icon={opt.icon}
                        />
                    ))}
                </div>

                <ToolbarSeparator />

                {/* Heatmap toggle — hidden below 1024px */}
                <div className="hidden lg:block">
                    <FilterButton
                        active={layers.heatmap}
                        onClick={toggleHeatmap}
                        colorScheme="purple"
                        label="Heatmap"
                        icon={Layers}
                    />
                </div>

                <ToolbarSeparator />

                {/* Expandable search — hidden below 1024px */}
                <div className="group relative ml-1 hidden items-center lg:flex">
                    <Search
                        size={14}
                        className={`pointer-events-none absolute left-3 transition-colors duration-300 ${isSearchFocused || filters.search
                            ? "text-cyan-500"
                            : "text-zinc-500 group-hover:text-zinc-400"
                            }`}
                    />
                    <input
                        type="text"
                        placeholder="Buscar nodo..."
                        value={filters.search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={`rounded-full border border-zinc-800 bg-black/40 py-1.5 pl-8 text-xs text-zinc-200 placeholder:text-zinc-600 transition-all duration-300 ease-out focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 ${isSearchFocused || filters.search
                            ? "w-48 pr-4"
                            : "w-32 cursor-pointer pr-2"
                            }`}
                    />
                </div>

                {/* Focus my nodes — hidden below 1280px */}
                <div className="ml-2 mr-0.5 hidden xl:block">
                    <button
                        type="button"
                        onClick={onFocusMyNodes}
                        className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-zinc-800 from-40% to-blue-600/40 px-3 py-1.5 text-[11px] font-bold text-blue-300 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_4px_10px_rgba(59,130,246,0.15)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.35)] hover:to-blue-500/50"
                    >
                        <LocateFixed size={14} className="drop-shadow-[0_0_8px_currentColor]" />
                        Mis nodos
                    </button>
                </div>
            </div>

            {/* Inline message */}
            {inlineMessage && (
                <span className="mt-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300/90 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                    {inlineMessage}
                </span>
            )}

            {/* ═══════════════════════════════════════════
                LEVEL 2: Contextual bar (Heatmap settings)
               ═══════════════════════════════════════════ */}
            <div
                className={`flex origin-top flex-col items-start transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${layers.heatmap
                    ? "h-auto translate-y-2 scale-y-100 opacity-100"
                    : "pointer-events-none -translate-y-4 h-0 scale-y-75 opacity-0"
                    }`}
            >
                {/* Visual connector */}
                <div className="mb-1 ml-8 h-3 w-px bg-zinc-700/50" />

                {/* Level-2 container */}
                <div className="flex items-center rounded-full border border-zinc-800/80 bg-[#0a0a0a]/90 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                    {/* Overlay mode: Impact vs Expansion */}
                    <AnimatedSegmentedControl
                        activeValue={overlay}
                        onChange={(v) => setOverlay(v as MapOverlay)}
                        activeTextColor="text-white drop-shadow-md"
                        pillColor={overlayPillColor}
                        options={OVERLAY_OPTIONS}
                    />

                    {/* Sub-metrics (only visible in Impact mode) */}
                    <div
                        className={`flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${overlay === "impact"
                            ? "max-w-[600px] opacity-100"
                            : "max-w-0 opacity-0"
                            }`}
                    >
                        <div className="mx-1 h-5 w-px shrink-0 bg-zinc-800" />

                        <AnimatedSegmentedControl
                            activeValue={heatmapMode}
                            onChange={(v) => setHeatmapMode(v as HeatmapMode)}
                            activeTextColor="text-purple-200 drop-shadow-sm"
                            pillColor="bg-gradient-to-br from-zinc-800 from-40% to-purple-600/30 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_0_4px_12px_rgba(168,85,247,0.25)]"
                            options={MODE_OPTIONS}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const NocMapToolbar = React.memo(NocMapToolbarInner)
