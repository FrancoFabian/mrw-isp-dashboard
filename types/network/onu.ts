/** ONU vendor brands */
export type OnuVendor = "Huawei" | "ZTE" | "VSOL" | "TP-Link" | "Nokia" | "Generic" | "Other"

/** ONU operational status */
export type OnuStatus = "online" | "offline" | "degraded" | "los"

/** ONU/ONT (Optical Network Unit/Terminal) entity */
export interface Onu {
    id: string
    /** Serial number (unique identifier) */
    serial: string
    vendor: OnuVendor
    model: string
    status: OnuStatus
    /** Received optical power in dBm */
    rxPowerDbm: number | null
    /** Transmitted optical power in dBm */
    txPowerDbm: number | null
    /** Last communication timestamp */
    lastSeen: string
    /** Uptime in seconds since last boot */
    uptimeSeconds?: number
    /** Associated OLT ID */
    oltId: string
    /** Associated PON port ID */
    ponId: string
    /** Associated NAP ID */
    napId: string
    /** Associated NAP port ID */
    portId: string
    /** Associated customer ID (optional until provisioned) */
    customerId?: string
    /** Assigned bandwidth profile ID */
    profileId?: string
    /** LOID for authentication (if applicable) */
    loid?: string
    /** ONU password for authentication */
    onuPassword?: string
    /** VLAN ID assignment */
    vlanId?: number
    /** PPPoE username (if applicable) */
    pppoeUser?: string
    createdAt: string
    updatedAt: string
}

/** ONU with full hierarchy for display */
export interface OnuWithHierarchy extends Onu {
    oltName: string
    ponLabel: string
    napName: string
    portIndex: number
    customerName?: string
    profileName?: string
}

/** Signal quality thresholds (dBm) */
export const signalThresholds = {
    rx: {
        good: -25,      // Better than -25 dBm
        warning: -27,   // Between -25 and -27 dBm
        critical: -30,  // Below -30 dBm is critical
    },
    tx: {
        good: 2,
        warning: 1,
        critical: 0,
    },
} as const

export const onuStatusLabels: Record<OnuStatus, string> = {
    online: "En línea",
    offline: "Sin conexión",
    degraded: "Degradado",
    los: "LOS (Sin señal)",
}

export const onuStatusColors: Record<OnuStatus, string> = {
    online: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    offline: "bg-red-500/20 text-red-400 border-red-500/30",
    degraded: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    los: "bg-red-500/20 text-red-400 border-red-500/30",
}

export const onuVendorLabels: Record<OnuVendor, string> = {
    Huawei: "Huawei",
    ZTE: "ZTE",
    VSOL: "VSOL",
    "TP-Link": "TP-Link",
    Nokia: "Nokia",
    Generic: "Genérico",
    Other: "Otro",
}

/** Get signal quality level based on RX power */
export function getSignalQuality(rxPowerDbm: number | null): "good" | "warning" | "critical" | "unknown" {
    if (rxPowerDbm === null) return "unknown"
    if (rxPowerDbm >= signalThresholds.rx.good) return "good"
    if (rxPowerDbm >= signalThresholds.rx.warning) return "warning"
    return "critical"
}
