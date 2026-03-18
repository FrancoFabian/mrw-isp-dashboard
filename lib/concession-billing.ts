import type { BillingProfile } from "@/types/concession-client"

function formatMoney(amount: number, currency: "MXN" | "USD"): string {
  const formatted = Math.round(amount).toLocaleString("es-MX")
  return `$${formatted} ${currency}`
}

function toMonthlyAmount(profile: BillingProfile): number {
  const amount = profile.baseFee?.amount ?? 0
  if (amount <= 0) return 0
  if (profile.invoicingCycle === "monthly") return amount
  if (profile.invoicingCycle === "quarterly") return amount / 3
  if (profile.invoicingCycle === "annual") return amount / 12
  return amount
}

export function formatBillingSummary(profile: BillingProfile): string {
  if (profile.model === "retainer_sla") {
    const fee = profile.baseFee ? formatMoney(profile.baseFee.amount, profile.baseFee.currency) : "$0 MXN"
    const tier = profile.slaTier ? profile.slaTier.charAt(0).toUpperCase() + profile.slaTier.slice(1) : "Sin SLA"
    return `Retainer ${fee} + ${tier}`
  }

  if (profile.model === "revenue_share") {
    const pct = Number.isFinite(profile.revenueSharePct) ? profile.revenueSharePct : 0
    return `RevShare ${pct}%`
  }

  if (profile.model === "capacity_fee") {
    const committed = Number.isFinite(profile.committedMbps) ? profile.committedMbps : 0
    return `Commit ${committed} Mbps`
  }

  return "Custom"
}

export function estimateMRR(profile: BillingProfile): number {
  if (profile.model === "retainer_sla") {
    return toMonthlyAmount(profile)
  }

  if (profile.model === "capacity_fee") {
    return toMonthlyAmount(profile)
  }

  return 0
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
