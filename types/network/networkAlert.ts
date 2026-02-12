/** Alert severity levels */
export type AlertSeverity = "info" | "warning" | "critical"

/** Alert types for network entities */
export type AlertType =
    | "LOW_RX_POWER"
    | "LOS"
    | "FLAPPING"
    | "NAP_SATURATION"
    | "ONU_OFFLINE"
    | "OLT_OFFLINE"
    | "HIGH_LATENCY"
    | "PORT_DAMAGED"
    | "CONFIG_MISMATCH"

/** Entity types that can have alerts */
export type AlertEntityType = "onu" | "nap" | "olt" | "pon" | "customer"

/** Network alert entity */
export interface NetworkAlert {
    id: string
    severity: AlertSeverity
    type: AlertType
    entityType: AlertEntityType
    entityId: string
    /** Human-readable message */
    message: string
    /** Additional context data */
    metadata?: Record<string, string | number | boolean>
    createdAt: string
    /** Acknowledged timestamp */
    acknowledgedAt?: string
    /** User who acknowledged */
    acknowledgedBy?: string
    /** Resolved/closed timestamp */
    resolvedAt?: string
}

/** Alert with entity name for display */
export interface NetworkAlertWithEntity extends NetworkAlert {
    entityName: string
}

export const alertSeverityLabels: Record<AlertSeverity, string> = {
    info: "Información",
    warning: "Advertencia",
    critical: "Crítico",
}

export const alertSeverityColors: Record<AlertSeverity, string> = {
    info: "bg-primary/20 text-primary border-primary/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
}

export const alertSeverityIconColors: Record<AlertSeverity, string> = {
    info: "text-primary",
    warning: "text-amber-400",
    critical: "text-red-400",
}

export const alertTypeLabels: Record<AlertType, string> = {
    LOW_RX_POWER: "Potencia RX baja",
    LOS: "Pérdida de señal (LOS)",
    FLAPPING: "Conexión inestable (Flapping)",
    NAP_SATURATION: "NAP saturada",
    ONU_OFFLINE: "ONU sin conexión",
    OLT_OFFLINE: "OLT sin conexión",
    HIGH_LATENCY: "Latencia alta",
    PORT_DAMAGED: "Puerto dañado",
    CONFIG_MISMATCH: "Configuración inconsistente",
}

export const alertTypeDefaultSeverity: Record<AlertType, AlertSeverity> = {
    LOW_RX_POWER: "warning",
    LOS: "critical",
    FLAPPING: "warning",
    NAP_SATURATION: "warning",
    ONU_OFFLINE: "critical",
    OLT_OFFLINE: "critical",
    HIGH_LATENCY: "info",
    PORT_DAMAGED: "warning",
    CONFIG_MISMATCH: "info",
}
