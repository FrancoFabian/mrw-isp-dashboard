export type StaffRole = "admin" | "installer" | "collector" | "support"

export type StaffStatus = "active" | "inactive"

export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: StaffRole
  occupation: string
  zone: string
  status: StaffStatus
  registeredAt: string
  permissions: string[]
}

export const staffRoleLabels: Record<StaffRole, string> = {
  admin: "Administrador",
  installer: "Instalador",
  collector: "Cobrador",
  support: "Soporte",
}

export const staffRoleColors: Record<StaffRole, string> = {
  admin: "bg-primary/20 text-primary",
  installer: "bg-cyan-500/20 text-cyan-400",
  collector: "bg-amber-500/20 text-amber-400",
  support: "bg-emerald-500/20 text-emerald-400",
}

export const staffStatusLabels: Record<StaffStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
}

export const staffStatusColors: Record<StaffStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  inactive: "bg-red-500/20 text-red-400",
}
