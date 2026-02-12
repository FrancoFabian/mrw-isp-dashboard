export type InstallationStatus =
  | "pending"
  | "confirmed"
  | "en_route"
  | "installed"
  | "requires_reschedule"

export interface Installation {
  id: string
  clientId: string
  clientName: string
  clientPhone: string
  address: string
  city: string
  date: string
  timeSlot: string
  status: InstallationStatus
  installerId: string
  installerName: string
  planId: string
  planName: string
  notes: string
  completedAt?: string
}

export const installationStatusLabels: Record<InstallationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  en_route: "En camino",
  installed: "Instalado",
  requires_reschedule: "Reprogramar",
}

export const installationStatusColors: Record<InstallationStatus, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  confirmed: "bg-primary/20 text-primary",
  en_route: "bg-cyan-500/20 text-cyan-400",
  installed: "bg-emerald-500/20 text-emerald-400",
  requires_reschedule: "bg-red-500/20 text-red-400",
}
