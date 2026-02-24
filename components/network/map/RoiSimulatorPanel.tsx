"use client"

import { useRoiSimulator } from "@/hooks/use-roi-simulator"
import type { ExpansionCell } from "@/lib/expansion/types"
import type { RoiAssumptions, RoiViability } from "@/lib/roi/types"
import { ROI_VIABILITY_LABELS, ROI_VIABILITY_EMOJI } from "@/lib/roi/types"
import { OPPORTUNITY_TIER_LABELS } from "@/lib/expansion/types"
import { X, RotateCcw } from "lucide-react"

interface RoiSimulatorPanelProps {
    cell: ExpansionCell
    onClose: () => void
}

/* ── Viability semaphore styles ── */
const VIABILITY_STYLES: Record<RoiViability, string> = {
    EXCELLENT: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    GOOD: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    RISKY: "border-orange-500/40 bg-orange-500/10 text-orange-300",
    POOR: "border-red-500/40 bg-red-500/10 text-red-300",
}

/* ── Editable number input ── */
function EditableInput({
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
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-white/50">{label}</span>
            <div className="flex items-center gap-1">
                {prefix && <span className="text-[10px] text-white/35">{prefix}</span>}
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    step={step ?? 1}
                    min={min ?? 0}
                    max={max}
                    className="w-20 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-right text-xs font-medium text-white/80 transition-colors focus:border-teal-500/40 focus:outline-none"
                />
                {suffix && <span className="text-[10px] text-white/35">{suffix}</span>}
            </div>
        </div>
    )
}

export function RoiSimulatorPanel({ cell, onClose }: RoiSimulatorPanelProps) {
    const { result, assumptions, setAssumption, resetAssumptions } = useRoiSimulator(cell)

    if (!result) return null

    const formatMoney = (n: number) => `$${n.toLocaleString()}`
    const formatPct = (n: number | null) => n !== null ? `${n.toFixed(1)}%` : "—"
    const formatMonths = (n: number | null) => n !== null ? `${n.toFixed(1)} meses` : "—"

    return (
        <div className="pointer-events-auto w-80 rounded-2xl border border-white/10 bg-slate-900/92 shadow-2xl shadow-black/50 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <div>
                    <h3 className="text-sm font-bold text-white/90">📊 Simulador ROI</h3>
                    <p className="mt-0.5 text-[10px] text-white/40">
                        Zona {OPPORTUNITY_TIER_LABELS[cell.opportunityTier]} · Score {cell.opportunityScore}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={resetAssumptions}
                        title="Restaurar valores por defecto"
                        className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white/60"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white/60"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-0 divide-y divide-white/6">
                {/* ── Bloque Inversión ── */}
                <div className="px-4 py-3">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                        💰 Inversión
                    </div>
                    <div className="space-y-2">
                        <EditableInput
                            label="CAPEX nodo"
                            value={assumptions.nodeCapex}
                            onChange={(v) => setAssumption("nodeCapex", v)}
                            prefix="$"
                            step={1000}
                        />
                        <EditableInput
                            label="OPEX mensual"
                            value={assumptions.monthlyOpex}
                            onChange={(v) => setAssumption("monthlyOpex", v)}
                            prefix="$"
                            step={100}
                        />
                    </div>
                </div>

                {/* ── Bloque Mercado ── */}
                <div className="px-4 py-3">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                        👥 Mercado
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">Leads detectados</span>
                            <span className="text-xs font-semibold text-teal-400">{cell.metrics.leadsNoCoverage}</span>
                        </div>
                        <EditableInput
                            label="Tasa conversión"
                            value={Math.round(assumptions.conversionRate * 100)}
                            onChange={(v) => setAssumption("conversionRate", v / 100)}
                            suffix="%"
                            step={5}
                            min={1}
                            max={100}
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">Clientes estimados</span>
                            <span className="text-xs font-bold text-white/90">{result.estimatedClients}</span>
                        </div>
                        <EditableInput
                            label="ARPU mensual"
                            value={assumptions.arpuMonthly}
                            onChange={(v) => setAssumption("arpuMonthly", v)}
                            prefix="$"
                            step={50}
                        />
                        <EditableInput
                            label="Límite clientes"
                            value={assumptions.maxClientsPerNode}
                            onChange={(v) => setAssumption("maxClientsPerNode", v)}
                            step={8}
                            min={1}
                            max={256}
                        />
                    </div>
                </div>

                {/* ── Bloque Financiero (destacado) ── */}
                <div className="px-4 py-3">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                        📈 Proyección financiera
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">MRR estimado</span>
                            <span className="text-xs font-bold text-emerald-400">{formatMoney(result.estimatedMRR)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">Utilidad mensual</span>
                            <span className={`text-xs font-bold ${result.monthlyGrossProfit > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {formatMoney(result.monthlyGrossProfit)}
                            </span>
                        </div>

                        {/* Payback + ROI */}
                        <div className="mt-1 rounded-xl border border-white/8 bg-white/3 p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white/60">Recuperación</span>
                                <span className={`text-sm font-bold ${result.paybackMonths !== null && result.paybackMonths <= 12 ? "text-emerald-400" : result.paybackMonths !== null && result.paybackMonths <= 24 ? "text-yellow-400" : "text-red-400"}`}>
                                    {formatMonths(result.paybackMonths)}
                                </span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between">
                                <span className="text-xs font-semibold text-white/60">ROI anual</span>
                                <span className={`text-sm font-bold ${result.annualROI !== null && result.annualROI > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {formatPct(result.annualROI)}
                                </span>
                            </div>
                        </div>

                        {/* Viability semaphore */}
                        <div className={`mt-1 flex items-center justify-center gap-2 rounded-xl border p-3 ${VIABILITY_STYLES[result.viability]}`}>
                            <span className="text-lg">{ROI_VIABILITY_EMOJI[result.viability]}</span>
                            <span className="text-sm font-bold">{ROI_VIABILITY_LABELS[result.viability]}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer — assumptions note */}
            <div className="border-t border-white/6 px-4 py-2 text-[9px] text-white/25">
                Simulación basada en supuestos editables. Datos mockeados en MVP.
            </div>
        </div>
    )
}
