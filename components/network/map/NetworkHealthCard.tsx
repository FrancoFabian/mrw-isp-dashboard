"use client"

import React, { useEffect, useState } from "react"
import type { NetworkHealthSummary, NetworkStatus } from "@/lib/health/types"
import { NETWORK_STATUS_LABELS } from "@/lib/health/types"
import type { MapNodeStatus } from "@/types/network/mapProjection"
import {
    Wifi,
    WifiOff,
    AlertTriangle,
    HelpCircle,
    Radio,
    ChevronRight,
} from "lucide-react"

/* ══════════════════════════════════════════════════════════
   Injected keyframes for the ECG sweep animation
   ══════════════════════════════════════════════════════════ */
const HEALTH_BAR_STYLES = `
@keyframes sweep-fast {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: -100; }
}
.ecg-line-fast {
  stroke-dasharray: 20 80;
  animation: sweep-fast 1.8s linear infinite;
}
`

/* ══════════════════════════════════════════════════════════
   Animated Gauge (SVG circle with viewBox scaling)
   ══════════════════════════════════════════════════════════ */
function AnimatedGauge({
    value,
    max = 100,
    colorClass = "text-amber-500",
    size = 52,
    textSizeClass = "text-lg",
}: {
    value: number
    max?: number
    colorClass?: string
    size?: number
    textSizeClass?: string
}) {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const [offset, setOffset] = useState(circumference)

    useEffect(() => {
        const progressOffset = ((max - value) / max) * circumference
        const timer = setTimeout(() => setOffset(progressOffset), 100)
        return () => clearTimeout(timer)
    }, [value, max, circumference])

    return (
        <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 overflow-visible">
                {/* Track */}
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-zinc-800/80" />
                {/* Progress */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${colorClass}`}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className={`${textSizeClass} font-black leading-none tracking-tighter bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-sm`}>
                    {value}
                </span>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   Heartbeat ECG line
   ══════════════════════════════════════════════════════════ */
function HeartbeatLine({ className = "text-amber-500" }: { className?: string }) {
    return (
        <div className={`relative flex h-2.5 w-4 items-center overflow-hidden ${className}`}>
            <svg viewBox="0 0 100 30" className="h-full w-full" preserveAspectRatio="none">
                <path
                    d="M 0 15 L 20 15 L 25 5 L 35 25 L 40 10 L 45 15 L 100 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ecg-line-fast"
                />
            </svg>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   Status counter card (with colored bottom-border glow)
   ══════════════════════════════════════════════════════════ */

type StatusType = "online" | "offline" | "degraded" | "unknown"

const STATUS_CARD_STYLES: Record<StatusType, {
    gradient: string
    border: string
    iconColor: string
    icon: React.ElementType
}> = {
    online: {
        gradient: "from-transparent from-70% to-emerald-500/15",
        border: "border-zinc-800 border-b-emerald-500/50 border-t-zinc-800",
        iconColor: "text-emerald-400",
        icon: Wifi,
    },
    offline: {
        gradient: "from-transparent from-70% to-rose-500/15",
        border: "border-zinc-800 border-b-rose-500/50 border-t-zinc-800",
        iconColor: "text-rose-400",
        icon: WifiOff,
    },
    degraded: {
        gradient: "from-transparent from-70% to-amber-500/15",
        border: "border-zinc-800 border-b-amber-500/50 border-t-zinc-800",
        iconColor: "text-amber-400",
        icon: AlertTriangle,
    },
    unknown: {
        gradient: "from-transparent from-70% to-zinc-500/15",
        border: "border-zinc-800 border-b-zinc-500/50 border-t-zinc-800",
        iconColor: "text-zinc-400",
        icon: HelpCircle,
    },
}

function StatusCounter({
    label,
    count,
    pct,
    type,
    onClick,
}: {
    label: string
    count: number
    pct: string
    type: StatusType
    onClick?: () => void
}) {
    const config = STATUS_CARD_STYLES[type]
    const Icon = config.icon

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative flex min-w-[72px] flex-col items-center justify-center rounded-xl border bg-[#080808] bg-gradient-to-b px-2.5 py-1.5 shadow-[0_6px_12px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-0.5 ${config.gradient} ${config.border} ${onClick ? "cursor-pointer" : "cursor-default"}`}
        >
            <Icon size={14} className={`${config.iconColor} mb-1 opacity-80 drop-shadow-md transition-all group-hover:scale-110 group-hover:opacity-100`} />
            <span className="mb-1 bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-xl font-black leading-none tracking-tight text-transparent drop-shadow-sm">
                {count}
            </span>
            <span className="mb-1 text-[9px] font-bold uppercase leading-none tracking-widest text-zinc-300">
                {label}
            </span>
            <span className="font-mono text-[9px] font-medium leading-none text-zinc-500">
                {pct}%
            </span>
        </button>
    )
}

/* ══════════════════════════════════════════════════════════
   Score-based color helper
   ══════════════════════════════════════════════════════════ */
function scoreGaugeColor(score: number): string {
    if (score >= 90) return "text-emerald-500"
    if (score >= 70) return "text-amber-500"
    return "text-red-500"
}

/* ── Status badge theme based on NetworkStatus ── */
const STATUS_BADGE_THEME: Record<NetworkStatus, {
    bg: string
    text: string
    border: string
    shadow: string
    pulse: boolean
}> = {
    OK: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        border: "border-emerald-500/30",
        shadow: "shadow-[0_0_15px_rgba(52,211,153,0.15)]",
        pulse: false,
    },
    WARNING: {
        bg: "bg-amber-500/10",
        text: "text-amber-500",
        border: "border-amber-500/30",
        shadow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        pulse: true,
    },
    CRITICAL: {
        bg: "bg-red-500/10",
        text: "text-red-500",
        border: "border-red-500/30",
        shadow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
        pulse: true,
    },
}

/* ── Glow line color ── */
function glowColor(status: NetworkStatus): string {
    if (status === "OK") return "via-emerald-500/50"
    if (status === "WARNING") return "via-amber-500/50"
    return "via-red-500/50"
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

interface NetworkHealthCardProps {
    health: NetworkHealthSummary
    onFilterByStatus?: (status: MapNodeStatus) => void
    /** When true, start in collapsed pill state (for compact viewports) */
    forceCollapsed?: boolean
}

function NetworkHealthCardInner({ health, onFilterByStatus, forceCollapsed }: NetworkHealthCardProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isExpanded, setIsExpanded] = useState(!forceCollapsed)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const gaugeColor = scoreGaugeColor(health.healthScore)
    const badge = STATUS_BADGE_THEME[health.status]

    const metrics: { id: StatusType; label: string; count: number; mapStatus: MapNodeStatus }[] = [
        { id: "online", label: "Online", count: health.online, mapStatus: "ONLINE" },
        { id: "offline", label: "Offline", count: health.offline, mapStatus: "OFFLINE" },
        { id: "degraded", label: "Degraded", count: health.degraded, mapStatus: "DEGRADED" },
        { id: "unknown", label: "Unknown", count: health.unknown, mapStatus: "UNKNOWN" },
    ]

    return (
        <>
            <style>{HEALTH_BAR_STYLES}</style>

            {/* Relative wrapper for morph effect */}
            <div className="pointer-events-auto relative flex h-[120px] items-center justify-end">

                {/* ── COLLAPSED STATE (magic pill) ── */}
                <div
                    className={`absolute transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${!isExpanded
                        ? "scale-100 opacity-100 blur-0"
                        : "pointer-events-none scale-50 translate-y-8 opacity-0 blur-sm"
                        }`}
                >
                    <button
                        type="button"
                        onClick={() => setIsExpanded(true)}
                        className={`group flex items-center gap-2.5 rounded-full border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 to-black/90 py-1.5 pl-1.5 pr-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)]`}
                        title="Expandir panel"
                    >
                        <AnimatedGauge value={health.healthScore} colorClass={gaugeColor} size={32} textSizeClass="text-xs" />
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-[9px] font-bold uppercase leading-none tracking-wider text-zinc-300">Estado</span>
                            <HeartbeatLine className={`${badge.text} transition-transform duration-300 group-hover:scale-110`} />
                        </div>
                    </button>
                </div>

                {/* ── EXPANDED STATE (full widget) ── */}
                <div
                    className={`absolute right-0 flex flex-col items-center gap-4 rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/80 via-[#0a0a0a]/95 to-black/90 py-2 pl-4 pr-2 shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex-row ${isExpanded && isLoaded
                        ? "scale-100 opacity-100 blur-0"
                        : "pointer-events-none scale-95 translate-y-4 opacity-0 blur-sm"
                        }`}
                >
                    {/* Top glow line */}
                    <div className={`absolute left-1/4 top-0 h-[1px] w-1/2 bg-gradient-to-r from-transparent ${glowColor(health.status)} to-transparent`} />

                    {/* ── LEFT: Score + Status badge ── */}
                    <div className="flex items-center gap-3 pl-1">
                        <AnimatedGauge value={health.healthScore} colorClass={gaugeColor} />

                        <div className="flex flex-col justify-center gap-1.5">
                            <div className={`flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 ${badge.bg} ${badge.border} ${badge.shadow} cursor-default`}>
                                {badge.pulse && (
                                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                                )}
                                <HeartbeatLine className={badge.text} />
                                <span className={`pr-1 pt-0.5 text-[10px] font-bold leading-none tracking-wide ${badge.text}`}>
                                    {NETWORK_STATUS_LABELS[health.status]}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-zinc-400">
                                <Radio size={10} className="text-zinc-500" />
                                <span className="pt-0.5 text-[10px] font-medium leading-none">
                                    {health.totalNodes} nodos
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-1 hidden h-12 w-px bg-gradient-to-b from-transparent via-zinc-700/80 to-transparent md:block" />
                    <div className="my-1 block h-px w-full bg-gradient-to-r from-transparent via-zinc-700/80 to-transparent md:hidden" />

                    {/* ── RIGHT: Status metric cards ── */}
                    <div className="flex gap-2">
                        {metrics.map((m) => (
                            <StatusCounter
                                key={m.id}
                                label={m.label}
                                count={m.count}
                                pct={health.totalNodes > 0 ? ((m.count / health.totalNodes) * 100).toFixed(1) : "0"}
                                type={m.id}
                                onClick={onFilterByStatus ? () => onFilterByStatus(m.mapStatus) : undefined}
                            />
                        ))}
                    </div>

                    {/* ── Collapse button ── */}
                    <div className="ml-1 flex items-center border-l border-zinc-800/80 pl-1">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="group rounded-full p-1.5 text-zinc-500 transition-all hover:bg-white/10 hover:text-white"
                            title="Ocultar panel"
                        >
                            <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export const NetworkHealthCard = React.memo(NetworkHealthCardInner)
