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
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  suspended: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  at_risk: "bg-amber-500/10 text-amber-400 border-amber-500/20",
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
  prospect: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  installation_scheduled: "bg-primary/10 text-primary border-primary/20",
  installation_confirmed: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  installed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  suspended: "bg-rose-500/10 text-rose-400 border-rose-500/20",
}
