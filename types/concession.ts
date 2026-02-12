export type ConcessionStatus = "active" | "expiring_soon" | "expired"

export interface Concession {
  id: string
  name: string
  provider: string
  type: "tower" | "fiber" | "spectrum" | "right_of_way"
  zone: string
  monthlyCost: number
  startDate: string
  endDate: string
  status: ConcessionStatus
  description: string
  coverageKm: number
  clientsServed: number
}

export const concessionTypeLabels: Record<Concession["type"], string> = {
  tower: "Torre",
  fiber: "Fibra optica",
  spectrum: "Espectro",
  right_of_way: "Derecho de via",
}

export const concessionTypeColors: Record<Concession["type"], string> = {
  tower: "bg-primary/20 text-primary",
  fiber: "bg-cyan-500/20 text-cyan-400",
  spectrum: "bg-amber-500/20 text-amber-400",
  right_of_way: "bg-emerald-500/20 text-emerald-400",
}

export const concessionStatusLabels: Record<ConcessionStatus, string> = {
  active: "Activa",
  expiring_soon: "Por vencer",
  expired: "Vencida",
}

export const concessionStatusColors: Record<ConcessionStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  expiring_soon: "bg-amber-500/20 text-amber-400",
  expired: "bg-red-500/20 text-red-400",
}
