"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { useRoiSimulator } from "@/hooks/use-roi-simulator"
import type { ExpansionCell } from "@/lib/expansion/types"
import type { RoiAssumptions, RoiViability } from "@/lib/roi/types"
import { ROI_VIABILITY_LABELS } from "@/lib/roi/types"
import { OPPORTUNITY_TIER_LABELS } from "@/lib/expansion/types"
import {
    X,
    RotateCcw,
    Coins,
    Users,
    TrendingUp,
    BarChart3,
    ChevronDown,
} from "lucide-react"

/* ══════════════════════════════════════════════════════════
   Injected styles (number-input arrows, custom scrollbar)
   ══════════════════════════════════════════════════════════ */
const PANEL_STYLES = `
.roi-hide-arrows::-webkit-inner-spin-button,
.roi-hide-arrows::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.roi-hide-arrows {
  -moz-appearance: textfield;
}
`

/* ══════════════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════════════ */

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="mb-4 flex items-center gap-2">
            <Icon size={14} className="text-zinc-400" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                {title}
            </h3>
        </div>
    )
}

function InputRow({
    label,
    value,
    onChange,
    prefix,
    suffix,
    step,
    min,
    max,
}: {
    label: string
    value: number
    onChange: (v: number) => void
    prefix?: string
    suffix?: string
    step?: number
    min?: number
    max?: number
}) {
    return (
        <div className="flex items-center justify-between py-1">
            <label className="text-sm text-zinc-400">{label}</label>
            <div className="relative flex items-center">
                {prefix && (
                    <span className="absolute left-3 text-sm text-zinc-500">{prefix}</span>
                )}
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    step={step ?? 1}
                    min={min ?? 0}
                    max={max}
                    className={`roi-hide-arrows w-28 rounded-lg border border-white/10 bg-black/50 py-1.5 text-right text-sm font-medium text-zinc-200 transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-7" : "pr-3"}`}
                />
                {suffix && (
                    <span className="absolute right-3 text-sm text-zinc-500">{suffix}</span>
                )}
            </div>
        </div>
    )
}

function ResultRow({
    label,
    value,
    isCurrency,
    colorClass = "text-zinc-200",
    bold = false,
}: {
    label: string
    value: number
    isCurrency?: boolean
    colorClass?: string
    bold?: boolean
}) {
    const formatted = isCurrency
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(value)
        : String(value)

    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">{label}</span>
            <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${colorClass}`}>
                {formatted}
            </span>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   Projection chart (interactive SVG)
   ══════════════════════════════════════════════════════════ */

function ProjectionChart({ capex, utilidad }: { capex: number; utilidad: number }) {
    const months = 36
    const [hoverMonth, setHoverMonth] = useState<number | null>(null)
    const chartRef = useRef<HTMLDivElement>(null)

    const data = useMemo(
        () => Array.from({ length: months + 1 }, (_, i) => -capex + utilidad * i),
        [capex, utilidad],
    )

    const maxVal = Math.max(...data, capex > 0 ? capex * 0.2 : 1000)
    const minVal = Math.min(...data, -capex)
    const range = maxVal - minVal || 1

    const width = 300
    const height = 90
    const padding = 10
    const usableHeight = height - padding * 2

    const getX = (m: number) => (m / months) * width
    const getY = (val: number) => height - padding - ((val - minVal) / range) * usableHeight

    const points = data.map((val, i) => `${getX(i)},${getY(val)}`).join(" ")
    const areaPoints = `0,${height} ${points} ${width},${height}`

    const zeroY = getY(0)
    const isViable = utilidad > 0
    const breakEvenMonth = isViable ? capex / utilidad : -1

    const handleMouseMove = (e: React.MouseEvent | { clientX: number }) => {
        if (!chartRef.current) return
        const rect = chartRef.current.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        setHoverMonth(Math.round(pct * months))
    }

    return (
        <div className="relative mb-2 mt-4 w-full overflow-visible rounded-xl border border-white/5 bg-black/30">
            {/* Header */}
            <div className="flex h-8 items-center justify-between px-3 pb-1 pt-2">
                <div className="text-[10px] font-medium text-zinc-500">Flujo Acumulado (36m)</div>
                {hoverMonth !== null && (
                    <div className="rounded border border-white/10 bg-zinc-800/90 px-2 py-0.5 text-[10px] font-medium text-zinc-200 shadow-sm backdrop-blur-sm">
                        Mes {hoverMonth}:{" "}
                        <span className={data[hoverMonth] >= 0 ? "font-bold text-emerald-400" : "font-bold text-rose-400"}>
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(data[hoverMonth])}
                        </span>
                    </div>
                )}
            </div>

            {/* SVG container */}
            <div
                ref={chartRef}
                className="group relative h-[100px] w-full cursor-crosshair select-none"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverMonth(null)}
                onTouchMove={(e) => {
                    if (e.touches.length > 0) handleMouseMove({ clientX: e.touches[0].clientX })
                }}
                onTouchEnd={() => setHoverMonth(null)}
            >
                <svg viewBox={`0 0 ${width} ${height}`} className="h-[80px] w-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="roiViableGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="roiLossGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[12, 24].map((m) => (
                        <line key={m} x1={getX(m)} y1="0" x2={getX(m)} y2={height} stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                    ))}

                    {/* Zero line */}
                    {zeroY > 0 && zeroY < height && (
                        <line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke="#52525b" strokeWidth="1" strokeDasharray="4 4" opacity="0.8" />
                    )}

                    {/* Filled area */}
                    <polygon points={areaPoints} fill={isViable ? "url(#roiViableGrad)" : "url(#roiLossGrad)"} />

                    {/* Main line */}
                    <polyline points={points} fill="none" stroke={isViable ? "#34d399" : "#fb7185"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Break-even dot */}
                    {isViable && breakEvenMonth > 0 && breakEvenMonth <= months && (
                        <circle cx={getX(breakEvenMonth)} cy={zeroY} r="4.5" fill="#10b981" stroke="#18181b" strokeWidth="2" />
                    )}

                    {/* Hover indicator */}
                    {hoverMonth !== null && (
                        <>
                            <line x1={getX(hoverMonth)} y1="0" x2={getX(hoverMonth)} y2={height} stroke="#a1a1aa" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                            <circle cx={getX(hoverMonth)} cy={getY(data[hoverMonth])} r="4" fill={data[hoverMonth] >= 0 ? "#34d399" : "#fb7185"} stroke="#fff" strokeWidth="1.5" className="transition-all duration-75" />
                        </>
                    )}
                </svg>

                {/* Time axis labels */}
                <div className="absolute bottom-1 flex w-full justify-between px-2">
                    {["0m", "12m", "24m", "36m"].map((lbl) => (
                        <span key={lbl} className="text-[9px] font-medium text-zinc-500">{lbl}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   VIABILITY STYLES
   ══════════════════════════════════════════════════════════ */

const VIABILITY_THEME: Record<RoiViability, { bg: string; border: string; text: string; glow: string; viable: boolean }> = {
    EXCELLENT: { bg: "bg-emerald-950/20", border: "border-emerald-500/20", text: "text-emerald-400", glow: "bg-emerald-500", viable: true },
    GOOD: { bg: "bg-emerald-950/20", border: "border-emerald-500/20", text: "text-emerald-400", glow: "bg-emerald-500", viable: true },
    RISKY: { bg: "bg-rose-950/20", border: "border-rose-500/20", text: "text-rose-400", glow: "bg-rose-500", viable: false },
    POOR: { bg: "bg-rose-950/20", border: "border-rose-500/20", text: "text-rose-400", glow: "bg-rose-500", viable: false },
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

interface RoiSimulatorPanelProps {
    cell: ExpansionCell
    onClose: () => void
}

export function RoiSimulatorPanel({ cell, onClose }: RoiSimulatorPanelProps) {
    const { result, assumptions, setAssumption, resetAssumptions } = useRoiSimulator(cell)

    /* Scroll-down arrow */
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showScrollArrow, setShowScrollArrow] = useState(false)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
            setShowScrollArrow(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 20)
        }
    }

    useEffect(() => {
        const t = setTimeout(checkScroll, 100)
        window.addEventListener("resize", checkScroll)
        return () => { clearTimeout(t); window.removeEventListener("resize", checkScroll) }
    }, [])

    if (!result) return null

    const isViable = result.monthlyGrossProfit > 0
    const viabilityTheme = VIABILITY_THEME[result.viability]
    const formatMoney = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n)
    const formatPct = (n: number | null) => (n !== null ? `${n.toFixed(1)}%` : "—")
    const formatMonths = (n: number | null) => (n !== null ? `${n.toFixed(1)} meses` : "—")

    return (
        <>
            <style>{PANEL_STYLES}</style>

            <div className="pointer-events-auto relative flex max-h-[75vh] w-[340px] flex-col overflow-hidden rounded-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/40 via-[#050505]/90 to-black/95 text-zinc-300 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                {/* Inner top sheen */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

                {/* ── HEADER ── */}
                <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/5 bg-black/40 p-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 shrink-0 items-center justify-center pr-0.5">
                            <BarChart3 size={24} className="text-zinc-500" strokeWidth={1.5} />
                        </div>
                        <div className="flex h-9 flex-col justify-center">
                            <h2 className="text-sm font-bold leading-tight text-zinc-100">
                                Simulador ROI
                            </h2>
                            <div className="text-[10px] font-medium text-zinc-500">
                                Zona {OPPORTUNITY_TIER_LABELS[cell.opportunityTier]} · Score {cell.opportunityScore}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={resetAssumptions}
                            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
                            title="Restaurar valores"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ── SCROLLABLE CONTENT ── */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="noc-scrollbar relative flex-1 space-y-4 overflow-y-auto p-3.5"
                >
                    {/* SECCIÓN 1: Inversión */}
                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                        <SectionTitle icon={Coins} title="Inversión" />
                        <div className="space-y-2">
                            <InputRow
                                label="CAPEX nodo"
                                value={assumptions.nodeCapex}
                                onChange={(v) => setAssumption("nodeCapex", v)}
                                prefix="$"
                                step={1000}
                            />
                            <InputRow
                                label="OPEX mensual"
                                value={assumptions.monthlyOpex}
                                onChange={(v) => setAssumption("monthlyOpex", v)}
                                prefix="$"
                                step={100}
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 2: Mercado */}
                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                        <SectionTitle icon={Users} title="Mercado" />
                        <div className="space-y-2">
                            <ResultRow
                                label="Leads detectados"
                                value={cell.metrics.leadsNoCoverage}
                                colorClass="text-emerald-400"
                                bold
                            />
                            <InputRow
                                label="Tasa conversión"
                                value={Math.round(assumptions.conversionRate * 100)}
                                onChange={(v) => setAssumption("conversionRate", v / 100)}
                                suffix="%"
                                step={5}
                                min={1}
                                max={100}
                            />

                            <div className="my-3 border-t border-white/5" />

                            <ResultRow
                                label="Clientes estimados"
                                value={result.estimatedClients}
                                colorClass={result.estimatedClients > 0 ? "text-emerald-400" : "text-zinc-500"}
                                bold
                            />
                            <InputRow
                                label="ARPU mensual"
                                value={assumptions.arpuMonthly}
                                onChange={(v) => setAssumption("arpuMonthly", v)}
                                prefix="$"
                                step={50}
                            />
                            <InputRow
                                label="Límite clientes"
                                value={assumptions.maxClientsPerNode}
                                onChange={(v) => setAssumption("maxClientsPerNode", v)}
                                step={8}
                                min={1}
                                max={256}
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 3: Proyección financiera */}
                    <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-black/40 p-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                        {/* Glow orb */}
                        <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 transition-colors duration-700 ${viabilityTheme.glow}`} />

                        <SectionTitle icon={TrendingUp} title="Proyección Financiera" />

                        <div className="mb-3 space-y-2">
                            <ResultRow label="MRR estimado" value={result.estimatedMRR} isCurrency bold colorClass="text-emerald-400 text-base" />
                            <ResultRow label="Utilidad mensual" value={result.monthlyGrossProfit} isCurrency bold colorClass={isViable ? "text-emerald-500" : "text-rose-500"} />
                        </div>

                        {/* Payback + ROI box */}
                        <div className="space-y-2 rounded-lg border border-white/5 bg-[#0a0a0c] p-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-zinc-400">Recuperación</span>
                                <span className={isViable ? "text-zinc-200" : "text-zinc-600"}>
                                    {formatMonths(result.paybackMonths)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-zinc-400">ROI anual</span>
                                <span className={isViable ? "text-emerald-400" : "text-zinc-600"}>
                                    {formatPct(result.annualROI)}
                                </span>
                            </div>
                        </div>

                        {/* Interactive chart */}
                        <ProjectionChart capex={assumptions.nodeCapex} utilidad={result.monthlyGrossProfit} />

                        {/* Viability banner */}
                        <div className={`relative mt-4 flex w-full items-center overflow-hidden rounded-lg border p-2.5 transition-all duration-300 ${viabilityTheme.bg} ${viabilityTheme.border}`}>
                            {/* Inner glow */}
                            <div className={`absolute -left-8 h-16 w-16 rounded-full opacity-30 blur-2xl ${viabilityTheme.glow}`} />

                            <div className="relative z-10 flex w-full items-center gap-3">
                                {viabilityTheme.viable && (
                                    <div className="relative ml-1 flex h-3 w-3 shrink-0">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    </div>
                                )}
                                <div className={`flex flex-col ${!viabilityTheme.viable ? "ml-1" : ""}`}>
                                    <span className={`text-sm font-semibold ${viabilityTheme.text}`}>
                                        {ROI_VIABILITY_LABELS[result.viability]}
                                    </span>
                                    <span className="mt-0.5 text-[10px] font-medium text-zinc-400">
                                        {viabilityTheme.viable
                                            ? "Los ingresos superan los costos operativos"
                                            : "Se requiere optimizar variables para rentabilidad"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="px-3 pb-1 text-center text-[9px] text-zinc-600">
                        Simulación basada en supuestos editables. Modifica los campos para evaluar escenarios.
                    </p>
                </div>

                {/* Scroll-down arrow */}
                {showScrollArrow && (
                    <button
                        type="button"
                        onClick={() => scrollRef.current?.scrollBy({ top: 250, behavior: "smooth" })}
                        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 animate-bounce focus:outline-none"
                        title="Ver más contenido"
                    >
                        <div className="flex cursor-pointer items-center justify-center rounded-full border border-zinc-600/50 bg-zinc-800/95 p-1.5 text-zinc-300 shadow-[0_4px_12px_rgba(0,0,0,0.9)] transition-colors hover:bg-zinc-700 hover:text-white">
                            <ChevronDown size={20} />
                        </div>
                    </button>
                )}
            </div>
        </>
    )
}
