export type UserRole =
  | "admin"
  | "installer"
  | "collector"
  | "client"
  | "concession_client"
  | "captive_client"
  | "dev"

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  avatar?: string
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  installer: "Instalador",
  collector: "Cobrador",
  client: "Cliente ISP",
  concession_client: "Cliente Concesion",
  captive_client: "Portal Cautivo",
  dev: "Desarrollador",
}

export const roleDescriptions: Record<UserRole, string> = {
  admin: "Gestion completa del ISP",
  installer: "Agenda e instalaciones",
  collector: "Cobros y codigos cautivo",
  client: "Portal de servicio",
  concession_client: "Infraestructura rentada",
  captive_client: "Acceso por codigo WiFi",
  dev: "Gestion de tareas y feedback",
}
