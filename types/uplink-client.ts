import type { Money as SharedMoney } from "@/types/concession-client"

export type UplinkStatus = "active" | "paused" | "degraded"
export type UplinkType = "l2" | "l3" | "mpls" | "gre" | "ipsec" | "vlan" | "unknown"
export type UpstreamCarrier = "telmex" | "totalplay" | "axtel" | "cogent" | "lumen" | "other"
export type UplinkHandoff = "ethernet" | "sfp" | "sfp+" | "unknown"

export type Money = SharedMoney
export type BillingModel = "capacity_fee" | "retainer_sla" | "custom"

export type BillingProfile = {
  model: BillingModel
  invoicingCycle: "monthly" | "quarterly" | "annual"
  baseFee?: Money
  committedMbps?: number
  burstMbps?: number
  ratePerMbps?: Money
  nextInvoiceDate?: string
  lastInvoicedAt?: string
  status: "active" | "paused"
  notes?: string
}

export interface UplinkClient {
  id: string
  customerName: string
  contactName?: string
  email: string
  phone: string
  city?: string
  state?: string
  status: UplinkStatus
  registeredAt: string
  upstreamCarrier: UpstreamCarrier
  uplinkType: UplinkType
  handoff: UplinkHandoff
  circuitId?: string
  popA?: string
  popB?: string
  committedMbps?: number
  burstMbps?: number
  routing?: {
    bgp?: boolean
    asn?: number
    publicPrefixes?: string[]
  }
  monitoring?: {
    latencyMs?: number
    lossPct?: number
    jitterMs?: number
    lastCheckAt?: string
  }
  sla?: {
    availabilityPct?: number
    responseHours?: number
  }
  contract?: {
    folio?: string
    startDate?: string
    endDate?: string
  }
  billing: BillingProfile
  notes?: string
}

export const uplinkStatusLabels: Record<UplinkStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  degraded: "Degradado",
}

export const uplinkStatusColors: Record<UplinkStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paused: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  degraded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

export const uplinkTypeLabels: Record<UplinkType, string> = {
  l2: "L2",
  l3: "L3",
  mpls: "MPLS",
  gre: "GRE",
  ipsec: "IPsec",
  vlan: "VLAN",
  unknown: "Sin tipo",
}

export const upstreamCarrierLabels: Record<UpstreamCarrier, string> = {
  telmex: "Telmex",
  totalplay: "Totalplay",
  axtel: "Axtel",
  cogent: "Cogent",
  lumen: "Lumen",
  other: "Otro",
}

export const uplinkHandoffLabels: Record<UplinkHandoff, string> = {
  ethernet: "Ethernet",
  sfp: "SFP",
  "sfp+": "SFP+",
  unknown: "Sin definir",
}

