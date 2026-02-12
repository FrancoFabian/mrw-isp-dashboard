export type ClientStatus = "active" | "suspended" | "at_risk"

/** Full lifecycle status for client portal */
export type ClientLifecycleStatus =
  | "prospect"
  | "installation_scheduled"
  | "installation_confirmed"
  | "installed"
  | "active"
  | "suspended"

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  planId: string
  status: ClientStatus
  lifecycleStatus: ClientLifecycleStatus
  ip: string
  node: string
  cutoffDate: string
  registeredAt: string
  lastPaymentDate: string | null
  wifiName?: string
  wifiPassword?: string
  connectedDevices?: number
  autopayEnabled?: boolean
  paymentMethod?: string
}

export interface ClientWithPlan extends Client {
  planName: string
  planSpeed: string
  planPrice: number
}

export const clientStatusLabels: Record<ClientStatus, string> = {
  active: "Activo",
  suspended: "Suspendido",
  at_risk: "En riesgo",
}

export const clientStatusColors: Record<ClientStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  suspended: "bg-red-500/20 text-red-400",
  at_risk: "bg-amber-500/20 text-amber-400",
}

export const lifecycleStatusLabels: Record<ClientLifecycleStatus, string> = {
  prospect: "Cita agendada",
  installation_scheduled: "Instalacion programada",
  installation_confirmed: "Instalacion confirmada",
  installed: "Instalacion completada",
  active: "Activo",
  suspended: "Servicio pausado",
}

export const lifecycleStatusColors: Record<ClientLifecycleStatus, string> = {
  prospect: "bg-amber-500/20 text-amber-400",
  installation_scheduled: "bg-primary/20 text-primary",
  installation_confirmed: "bg-cyan-500/20 text-cyan-400",
  installed: "bg-emerald-500/20 text-emerald-400",
  active: "bg-emerald-500/20 text-emerald-400",
  suspended: "bg-red-500/20 text-red-400",
}
