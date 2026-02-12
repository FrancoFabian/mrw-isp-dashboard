export type ToolPlatform = "ANDROID" | "WEB"

export type ToolStatus = "available" | "coming_soon"

export interface Tool {
  id: string
  name: string
  description: string
  longDescription: string
  platforms: ToolPlatform[]
  status: ToolStatus
  icon: string
  category: string
}

export const toolPlatformLabels: Record<ToolPlatform, string> = {
  ANDROID: "Android",
  WEB: "Web App",
}

export const toolStatusLabels: Record<ToolStatus, string> = {
  available: "Disponible",
  coming_soon: "Proximamente",
}

export const toolStatusColors: Record<ToolStatus, string> = {
  available: "bg-emerald-500/20 text-emerald-400",
  coming_soon: "bg-amber-500/20 text-amber-400",
}
