import type { BillingProfile, UplinkHandoff, UplinkType, UplinkClient } from "@/types/uplink-client"
import { uplinkHandoffLabels, uplinkTypeLabels } from "@/types/uplink-client"

function formatMoney(amount: number, currency: "MXN" | "USD"): string {
  const formatted = Math.round(amount).toLocaleString("es-MX")
  return `$${formatted} ${currency}`
}

function toMonthly(amount: number, cycle: BillingProfile["invoicingCycle"]): number {
  if (cycle === "monthly") return amount
  if (cycle === "quarterly") return amount / 3
  if (cycle === "annual") return amount / 12
  return amount
}

export function formatUplinkType(uplinkType: UplinkType, handoff: UplinkHandoff): string {
  return `${uplinkTypeLabels[uplinkType]} · ${uplinkHandoffLabels[handoff]}`
}

export function formatBillingSummary(billing: BillingProfile): string {
  if (billing.model === "capacity_fee") {
    const rate = billing.ratePerMbps
    const committed = typeof billing.committedMbps === "number" ? billing.committedMbps : 0
    if (rate && committed > 0) {
      return `${formatMoney(rate.amount, rate.currency)}/Mbps x ${committed}`
    }
    return `Commit ${committed} Mbps`
  }

  if (billing.model === "retainer_sla") {
    if (!billing.baseFee) return "Retainer $0 MXN"
    return `Retainer ${formatMoney(billing.baseFee.amount, billing.baseFee.currency)}`
  }

  return "Custom"
}

export function estimateUplinkMRR(billing: BillingProfile): number {
  if (billing.model === "capacity_fee") {
    const rate = billing.ratePerMbps?.amount ?? 0
    const committed = billing.committedMbps ?? 0
    if (rate > 0 && committed > 0) {
      return toMonthly(rate * committed, billing.invoicingCycle)
    }
    if (billing.baseFee?.amount) {
      return toMonthly(billing.baseFee.amount, billing.invoicingCycle)
    }
    return 0
  }

  if (billing.model === "retainer_sla") {
    const amount = billing.baseFee?.amount ?? 0
    return amount > 0 ? toMonthly(amount, billing.invoicingCycle) : 0
  }

  return 0
}

export function computeHealth(monitoring?: UplinkClient["monitoring"]): "ok" | "degraded" {
  if (!monitoring) return "ok"
  const loss = monitoring.lossPct ?? 0
  const latency = monitoring.latencyMs ?? 0
  return loss >= 1 || latency >= 80 ? "degraded" : "ok"
}

export function isContractExpiring(endDate?: string, days = 30): boolean {
  if (!endDate) return false
  const target = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(target.getTime())) return false

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = target.getTime() - today.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= days
}
