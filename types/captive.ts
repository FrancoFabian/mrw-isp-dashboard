export type CaptiveUserType = "NON_CLIENT" | "ISP_CLIENT"

export type CaptivePlanTier = "PLUS" | "HOGAR" | "BASICO" | "EMPRESARIAL"

export interface CaptiveAccessRule {
  plan: CaptivePlanTier
  basePrice: number
  discount: number
  finalPrice: number
  label: string
}

export interface CaptiveCode {
  id: string
  code: string
  duration: string
  durationMinutes: number
  price: number
  discountedPrice?: number
  userType: CaptiveUserType
  clientPlan?: CaptivePlanTier
  clientName?: string
  soldAt: string
  soldBy: string
  paymentMethod: "cash"
  status: "active" | "used" | "expired"
}

export const captiveUserTypeLabels: Record<CaptiveUserType, string> = {
  NON_CLIENT: "No cliente",
  ISP_CLIENT: "Cliente ISP",
}

export const captiveUserTypeColors: Record<CaptiveUserType, string> = {
  NON_CLIENT: "bg-muted text-muted-foreground",
  ISP_CLIENT: "bg-primary/20 text-primary",
}

export const captiveCodeStatusLabels: Record<CaptiveCode["status"], string> = {
  active: "Activo",
  used: "Usado",
  expired: "Expirado",
}

export const captiveCodeStatusColors: Record<CaptiveCode["status"], string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  used: "bg-muted text-muted-foreground",
  expired: "bg-red-500/20 text-red-400",
}

/** Pricing rules for captive portal access */
export const captiveAccessRules: CaptiveAccessRule[] = [
  {
    plan: "PLUS",
    basePrice: 0,
    discount: 100,
    finalPrice: 0,
    label: "Acceso gratuito incluido en plan Plus",
  },
  {
    plan: "EMPRESARIAL",
    basePrice: 0,
    discount: 100,
    finalPrice: 0,
    label: "Acceso gratuito incluido en plan Empresarial",
  },
  {
    plan: "HOGAR",
    basePrice: 30,
    discount: 50,
    finalPrice: 15,
    label: "50% de descuento para plan Hogar",
  },
  {
    plan: "BASICO",
    basePrice: 30,
    discount: 25,
    finalPrice: 22,
    label: "25% de descuento para plan Basico",
  },
]

/** Captive portal code durations and base prices (for non-clients) */
export const captiveCodeOptions = [
  { duration: "1 hora", durationMinutes: 60, price: 15 },
  { duration: "3 horas", durationMinutes: 180, price: 30 },
  { duration: "24 horas", durationMinutes: 1440, price: 50 },
  { duration: "7 dias", durationMinutes: 10080, price: 150 },
]
