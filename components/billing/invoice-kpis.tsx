"use client"

import { useMemo } from "react"
import { AlertTriangle, CircleDollarSign, FileClock, ShieldAlert, Activity } from "lucide-react"
import { KpiStatCard, type Point } from "@/components/dashboard/kpi-stat-card"

interface InvoiceDistributionCardProps {
  total: number
  paid: number
  issued: number
  overdue: number
}

interface InvoiceAttentionCardProps {
  pendingCollection: number
  clientsWithDebt: number
}

interface InvoiceKpisRowProps {
  total: number
  paid: number
  issued: number
  overdue: number
  pendingCollection: number
  clientsWithDebt: number
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
  const base = [55, 58, 57, 62, 60, 67, 65, 71, 69, 75]
  return base.map((y, index, arr) => ({
    x: (index / (arr.length - 1)) * 100,
    y: Math.max(8, Math.min(96, y + seed)),
  }))
}

function formatMxCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("es-MX")}`
}

function InvoiceDistributionCard({ total, paid, issued, overdue }: InvoiceDistributionCardProps) {
  const [paidSeg, issuedSeg, overdueSeg] = buildArcSegments([paid, issued, overdue], total)
  const distributionItems = [
    { id: "paid", label: "Pagadas", value: paid, dotClass: "bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.8)]" },
    { id: "issued", label: "Emitidas", value: issued, dotClass: "bg-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.8)]" },
    { id: "overdue", label: "Vencidas", value: overdue, dotClass: "bg-[#fb7185] shadow-[0_0_6px_rgba(251,113,133,0.8)]" },
  ]

  return (
    <article className="bg-linear-to-br from-zinc-800/40 to-black border border-white/5 rounded-2xl p-4 relative overflow-hidden h-[150px]">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
          <Activity className="w-3 h-3 text-zinc-400" />
        </span>
        <span className="text-zinc-300 text-[13px] font-medium">Total Facturas</span>
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
              strokeDasharray={paidSeg.dasharray}
              strokeDashoffset={paidSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(74,222,128,0.7)]"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="10"
              strokeDasharray={issuedSeg.dasharray}
              strokeDashoffset={issuedSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#fb7185"
              strokeWidth="10"
              strokeDasharray={overdueSeg.dasharray}
              strokeDashoffset={overdueSeg.dashoffset}
              strokeLinecap="butt"
              className="drop-shadow-[0_0_6px_rgba(251,113,133,0.7)]"
            />
          </svg>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-xl font-bold text-white leading-none tracking-tight">{total}</span>
          </div>
        </div>

        <div className="flex justify-between w-full max-w-[205px] mt-1.5 pt-1.5 border-t border-white/5">
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

function InvoiceAttentionCard({ pendingCollection, clientsWithDebt }: InvoiceAttentionCardProps) {
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
            <span className="text-xl leading-none font-semibold text-zinc-100">{pendingCollection}</span>
            <span className="text-sm leading-none font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
              Facturas por cobrar
            </span>
          </div>
        </div>

        <div className="group relative h-[42px] flex items-center gap-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 px-3 py-1.5 overflow-hidden transition-all duration-300 hover:bg-zinc-900/60 hover:border-zinc-700/50">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-amber-500/10" />
          <div className="relative flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
            <FileClock className="w-5 h-5 text-amber-500/80" strokeWidth={1.5} />
          </div>
          <div className="flex flex-1 items-baseline gap-3 min-w-0">
            <span className="text-xl leading-none font-semibold text-zinc-100">{clientsWithDebt}</span>
            <span className="text-sm leading-none font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
              Clientes con saldo pendiente
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export function InvoiceKpisRow({
  total,
  paid,
  issued,
  overdue,
  pendingCollection,
  clientsWithDebt,
  collectedAmount,
}: InvoiceKpisRowProps) {
  const paidRate = total > 0 ? Number(((paid / total) * 100).toFixed(1)) : 0
  const amountTrend = useMemo(() => toTrend(Math.min(Math.floor(collectedAmount / 1200), 12)), [collectedAmount])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <KpiStatCard
        title="Cobrado (MXN)"
        subtitle="FACTURAS PAGADAS"
        value={formatMxCurrency(collectedAmount)}
        deltaPct={paidRate}
        points={amountTrend}
        tone="success"
        icon={<CircleDollarSign size={18} />}
      />
      <InvoiceDistributionCard total={total} paid={paid} issued={issued} overdue={overdue} />
      <InvoiceAttentionCard pendingCollection={pendingCollection} clientsWithDebt={clientsWithDebt} />
    </div>
  )
}
