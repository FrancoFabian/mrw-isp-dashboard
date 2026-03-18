"use client"

import { useMemo } from "react"
import { Activity, AlertTriangle, CircleDollarSign, FileClock, ShieldAlert } from "lucide-react"
import { KpiStatCard, type Point } from "@/components/dashboard/kpi-stat-card"

interface PaymentDistributionCardProps {
  total: number
  client: number
  collector: number
  admin: number
}

interface PaymentAttentionCardProps {
  pendingReconciliation: number
  unlinkedPayments: number
}

interface PaymentKpisRowProps {
  total: number
  reconciled: number
  client: number
  collector: number
  admin: number
  pendingReconciliation: number
  unlinkedPayments: number
  collectedAmount: number
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

function toTrend(seed: number): Point[] {
  const base = [54, 56, 55, 60, 58, 64, 62, 68, 66, 72]
  return base.map((y, index, arr) => ({
    x: (index / (arr.length - 1)) * 100,
    y: Math.max(8, Math.min(96, y + seed)),
  }))
}

function formatMxCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("es-MX")}`
}

function PaymentDistributionCard({ total, client, collector, admin }: PaymentDistributionCardProps) {
  const [clientSeg, collectorSeg, adminSeg] = buildArcSegments([client, collector, admin], total)
  const distributionItems = [
    { id: "client", label: "Cliente", value: client, dotClass: "bg-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.8)]" },
    { id: "collector", label: "Cobrador", value: collector, dotClass: "bg-[#a855f7] shadow-[0_0_6px_rgba(168,85,247,0.8)]" },
    { id: "admin", label: "Admin", value: admin, dotClass: "bg-[#06b6d4] shadow-[0_0_6px_rgba(6,182,212,0.8)]" },
  ]

  return (
    <article className="bg-linear-to-br from-zinc-800/40 to-black border border-white/5 rounded-2xl p-4 relative overflow-hidden h-[150px]">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
          <Activity className="w-3 h-3 text-zinc-400" />
        </span>
        <span className="text-zinc-300 text-[13px] font-medium">Total Pagos</span>
      </div>

      <div className="relative flex-1 flex flex-col justify-end items-center mt-1.5">
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/5 blur-xl rounded-t-full pointer-events-none" />

        <div className="relative w-full max-w-[110px]">
          <svg className="w-full h-auto overflow-visible" viewBox="0 0 100 55">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="10" strokeLinecap="round" />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="10"
              strokeDasharray={clientSeg.dasharray}
              strokeDashoffset={clientSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#a855f7"
              strokeWidth="10"
              strokeDasharray={collectorSeg.dasharray}
              strokeDashoffset={collectorSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="10"
              strokeDasharray={adminSeg.dasharray}
              strokeDashoffset={adminSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]"
            />
          </svg>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-xl font-bold text-white leading-none tracking-tight">{total}</span>
          </div>
        </div>

        <div className="flex justify-between w-full max-w-[225px] mt-1.5 pt-1.5 border-t border-white/5">
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

function PaymentAttentionCard({ pendingReconciliation, unlinkedPayments }: PaymentAttentionCardProps) {
  return (
    <article className="bg-linear-to-br from-zinc-800/40 to-black border border-white/5 rounded-2xl p-4 relative overflow-hidden h-[150px] flex flex-col">
      <div className="flex items-center gap-2 mb-2 px-1 shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2.2} />
        <h2 className="text-[10.5px] font-bold tracking-[0.2em] text-zinc-500 uppercase">REQUIERE ATENCION</h2>
      </div>

      <div className="flex flex-1 flex-col gap-2 min-h-0 justify-between">
        <div className="group relative h-[42px] flex items-center gap-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 px-3 py-1.5 overflow-hidden transition-all duration-300 hover:bg-zinc-900/60 hover:border-zinc-700/50">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-rose-500/10" />
          <div className="relative flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/20 shadow-[0_0_10px_rgba(243,62,92,0.05)]">
            <ShieldAlert className="w-5 h-5 text-rose-500/80" strokeWidth={1.5} />
          </div>
          <div className="flex flex-1 items-baseline gap-3 min-w-0">
            <span className="text-xl leading-none font-semibold text-zinc-100">{pendingReconciliation}</span>
            <span className="text-sm leading-none font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
              Pagos por conciliar
            </span>
          </div>
        </div>

        <div className="group relative h-[42px] flex items-center gap-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 px-3 py-1.5 overflow-hidden transition-all duration-300 hover:bg-zinc-900/60 hover:border-zinc-700/50">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-amber-500/10" />
          <div className="relative flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
            <FileClock className="w-5 h-5 text-amber-500/80" strokeWidth={1.5} />
          </div>
          <div className="flex flex-1 items-baseline gap-3 min-w-0">
            <span className="text-xl leading-none font-semibold text-zinc-100">{unlinkedPayments}</span>
            <span className="text-sm leading-none font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
              Sin factura ligada
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export function PaymentKpisRow({
  total,
  reconciled,
  client,
  collector,
  admin,
  pendingReconciliation,
  unlinkedPayments,
  collectedAmount,
}: PaymentKpisRowProps) {
  const reconciledRate = total > 0 ? Number(((reconciled / total) * 100).toFixed(1)) : 0
  const amountTrend = useMemo(() => toTrend(Math.min(Math.floor(collectedAmount / 1200), 12)), [collectedAmount])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <KpiStatCard
        title="Cobrado (MXN)"
        subtitle="PAGOS CONCILIADOS"
        value={formatMxCurrency(collectedAmount)}
        deltaPct={reconciledRate}
        points={amountTrend}
        tone="success"
        icon={<CircleDollarSign size={18} />}
      />
      <PaymentDistributionCard total={total} client={client} collector={collector} admin={admin} />
      <PaymentAttentionCard pendingReconciliation={pendingReconciliation} unlinkedPayments={unlinkedPayments} />
    </div>
  )
}
