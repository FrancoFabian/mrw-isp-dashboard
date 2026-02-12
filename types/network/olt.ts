import type { GeoLocation } from "./geo"

/** OLT vendor brands */
export type OltVendor = "Huawei" | "ZTE" | "VSOL" | "FiberHome" | "Nokia" | "Other"

/** OLT operational status */
export type OltStatus = "online" | "offline" | "maintenance"

/** Optical Line Terminal (OLT) entity */
export interface Olt {
    id: string
    name: string
    vendor: OltVendor
    model: string
    mgmtIp: string
    mgmtPort?: number
    status: OltStatus
    location: GeoLocation
    locationName: string
    ponPortCount: number
    createdAt: string
    updatedAt: string
}

/** OLT with aggregated statistics */
export interface OltWithStats extends Olt {
    onuCount: number
    onuOnlineCount: number
    onuOfflineCount: number
    activeAlerts: number
    avgRxPower: number | null
}

export const oltStatusLabels: Record<OltStatus, string> = {
    online: "En línea",
    offline: "Sin conexión",
    maintenance: "Mantenimiento",
}

export const oltStatusColors: Record<OltStatus, string> = {
    online: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    offline: "bg-red-500/20 text-red-400 border-red-500/30",
    maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

export const oltVendorLabels: Record<OltVendor, string> = {
    Huawei: "Huawei",
    ZTE: "ZTE",
    VSOL: "VSOL",
    FiberHome: "FiberHome",
    Nokia: "Nokia",
    Other: "Otro",
}
