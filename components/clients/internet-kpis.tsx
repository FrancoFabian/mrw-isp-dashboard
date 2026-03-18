"use client"

import { useMemo } from "react"
import { Activity, CircleDollarSign, Wallet } from "lucide-react"
import { KpiStatCard, Point } from "@/components/dashboard/kpi-stat-card"

interface InternetDistributionCardProps {
  total: number
  active: number
  suspended: number
  atRisk: number
}

interface InternetKpisRowProps {
  total: number
  active: number
  suspended: number
  atRisk: number
  estimatedMrr: number
  autopayEnabled: number
  withoutAutopay: number
}

const HALF_ARC = Math.PI * 40

function percent(value: number, total: number) {
  if (total <= 0) return 0
  return Math.max(0, Math.min(1, value / total))
}

function buildArcSegments(values: number[], total: number) {
  const gapPerBoundary = 2
  let offset = 0
  const lastIndex = values.length - 1

  return values.map((value, index) => {
    const rawLength = percent(value, total) * HALF_ARC
    const visibleLength = Math.max(0, rawLength - (index < lastIndex ? gapPerBoundary : 0))
    const segment = { dasharray: `${visibleLength} ${HALF_ARC}`, dashoffset: `${-offset}` }
    offset += rawLength
    return segment
  })
}

function formatMxCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("es-MX")}`
}

function toTrend(seed: number): Point[] {
  const base = [58, 61, 59, 65, 63, 70, 67, 73, 71, 78]
  return base.map((y, index, arr) => ({
    x: (index / (arr.length - 1)) * 100,
    y: Math.max(8, Math.min(96, y + seed)),
  }))
}

function InternetDistributionCard({ total, active, suspended, atRisk }: InternetDistributionCardProps) {
  const [activeSeg, suspendedSeg, atRiskSeg] = buildArcSegments([active, suspended, atRisk], total)
  const distributionItems = [
    { id: "active", label: "Activos", value: active, dotClass: "bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.8)]" },
    { id: "suspended", label: "Susp.", value: suspended, dotClass: "bg-[#fb7185] shadow-[0_0_6px_rgba(251,113,133,0.8)]" },
    { id: "risk", label: "Riesgo", value: atRisk, dotClass: "bg-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.8)]" },
  ]

  return (
    <article className="bg-linear-to-br from-zinc-800/40 to-black border border-white/5 rounded-2xl p-4 relative overflow-hidden h-[150px]">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
          <Activity className="w-3 h-3 text-zinc-400" />
        </span>
        <span className="text-zinc-300 text-[13px] font-medium">Total Clientes</span>
      </div>

      <div className="relative flex-1 flex flex-col justify-end items-center mt-1.5">
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/5 blur-xl rounded-t-full pointer-events-none" />

        <div className="relative w-full max-w-[110px]">
          <svg className="w-full h-auto overflow-visible" viewBox="0 0 100 55">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="10" strokeLinecap="round" />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#4ade80"
              strokeWidth="10"
              strokeDasharray={activeSeg.dasharray}
              strokeDashoffset={activeSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(74,222,128,0.7)]"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#fb7185"
              strokeWidth="10"
              strokeDasharray={suspendedSeg.dasharray}
              strokeDashoffset={suspendedSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(251,113,133,0.7)]"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="10"
              strokeDasharray={atRiskSeg.dasharray}
              strokeDashoffset={atRiskSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]"
            />
          </svg>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-xl font-bold text-white leading-none tracking-tight">{total}</span>
          </div>
        </div>

        <div className="flex justify-between w-full max-w-[190px] mt-1.5 pt-1.5 border-t border-white/5">
          {distributionItems.map((item) => (
            <div key={item.id} className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${item.dotClass}`} />
                <span className="text-[9px] text-zinc-400 font-medium">{item.label}</span>
              </div>
              <span className="text-[11px] font-bold text-zinc-100">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export function InternetKpisRow({
  total,
  active,
  suspended,
  atRisk,
  estimatedMrr,
  autopayEnabled,
  withoutAutopay,
}: InternetKpisRowProps) {
  const mrrDelta = total > 0 ? Number((((active - suspended) / total) * 10).toFixed(1)) : 0
  const mrrTrend = useMemo(() => toTrend(Math.min(Math.floor(estimatedMrr / 3000), 10)), [estimatedMrr])
  const autopayRate = total > 0 ? Number(((autopayEnabled / total) * 100).toFixed(1)) : 0
  const autopayTrend = useMemo(() => toTrend(Math.max(-6, Math.min(autopayEnabled - withoutAutopay, 10))), [autopayEnabled, withoutAutopay])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <KpiStatCard
        title="MRR estimado (MXN)"
        subtitle="CLIENTES ACTIVOS"
        value={formatMxCurrency(estimatedMrr)}
        deltaPct={mrrDelta}
        points={mrrTrend}
        tone="success"
        icon={<CircleDollarSign size={18} />}
      />
      <InternetDistributionCard total={total} active={active} suspended={suspended} atRisk={atRisk} />
      <KpiStatCard
        title="Autopago activo"
        subtitle="ADOPCION DE COBRO"
        value={`${autopayRate}%`}
        deltaPct={autopayRate}
        points={autopayTrend}
        tone="info"
        icon={<Wallet size={18} />}
      />
    </div>
  )
}
