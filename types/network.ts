export type NodeStatus = "online" | "offline" | "degraded"
export type NodeType = "router" | "antenna" | "switch" | "ap"

export interface NetworkNode {
  id: string
  name: string
  type: NodeType
  status: NodeStatus
  ip: string
  location: string
  clients: number
  uptime: string
  lastSeen: string
  signal?: number
}

export const nodeStatusLabels: Record<NodeStatus, string> = {
  online: "En linea",
  offline: "Sin conexion",
  degraded: "Degradado",
}

export const nodeStatusColors: Record<NodeStatus, string> = {
  online: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  offline: "bg-red-500/20 text-red-400 border-red-500/30",
  degraded: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

export const nodeStatusDotColors: Record<NodeStatus, string> = {
  online: "bg-emerald-400",
  offline: "bg-red-400",
  degraded: "bg-amber-400",
}

export const nodeTypeLabels: Record<NodeType, string> = {
  router: "Router",
  antenna: "Antena",
  switch: "Switch",
  ap: "Punto de acceso",
}

// Re-export all GPON network types from the network subdirectory
export * from "./network/geo"
export * from "./network/olt"
export * from "./network/pon"
export * from "./network/nap"
export * from "./network/napPort"
export * from "./network/onu"
export * from "./network/provisioningJob"
export * from "./network/networkAlert"
export * from "./network/networkEvent"
export * from "./network/bandwidthProfile"

