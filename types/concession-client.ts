export type ConcessionClientStatus = "active" | "suspended" | "at_risk"

export type ConcessionType = "ift" | "municipal" | "internal" | "unknown"

export type BillingModel = "retainer_sla" | "revenue_share" | "capacity_fee" | "custom"

export type Money = {
  amount: number
  currency: "MXN" | "USD"
}

export type BillingProfile = {
  model: BillingModel
  invoicingCycle: "monthly" | "quarterly" | "annual"
  baseFee?: Money
  slaTier?: "bronze" | "silver" | "gold"
  revenueSharePct?: number
  committedMbps?: number
  burstMbps?: number
  perIncidentFee?: Money
  nextInvoiceDate?: string
  lastInvoicedAt?: string
  status: "active" | "paused"
  notes?: string
}

export interface ConcessionClient {
  id: string
  legalName: string
  rfc?: string
  contactName?: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  status: ConcessionClientStatus
  lifecycleStatus?: string
  registeredAt: string
  cutoffDate?: string
  billing: BillingProfile
  concessionType: ConcessionType
  coverageZone?: string
  contract?: {
    folio?: string
    startDate?: string
    endDate?: string
  }
  sla?: {
    availabilityPct?: number
    responseHours?: number
  }
  notes?: string
}

export const concessionClientStatusLabels: Record<ConcessionClientStatus, string> = {
  active: "Activo",
  suspended: "Suspendido",
  at_risk: "En riesgo",
}

export const concessionClientStatusColors: Record<ConcessionClientStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  suspended: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  at_risk: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

export const concessionTypeLabels: Record<ConcessionType, string> = {
  ift: "IFT",
  municipal: "Municipal",
  internal: "Interna",
  unknown: "Sin clasificar",
}

export const billingModelLabels: Record<BillingModel, string> = {
  retainer_sla: "Retainer + SLA",
  revenue_share: "Revenue Share",
  capacity_fee: "Capacity Fee",
  custom: "Custom",
}
