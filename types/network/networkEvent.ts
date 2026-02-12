/** Event types for network entities */
export type NetworkEventType =
    | "PROVISIONED"
    | "DECOMMISSIONED"
    | "PORT_MOVED"
    | "POWER_LOW"
    | "POWER_RECOVERED"
    | "WENT_OFFLINE"
    | "CAME_ONLINE"
    | "PROFILE_CHANGED"
    | "SERVICE_SUSPENDED"
    | "SERVICE_RESUMED"
    | "CONFIG_UPDATED"
    | "ALERT_TRIGGERED"
    | "ALERT_RESOLVED"

/** Entity types that can have events */
export type EventEntityType = "onu" | "nap" | "olt" | "customer"

/** Network event entity for timeline */
export interface NetworkEvent {
    id: string
    entityType: EventEntityType
    entityId: string
    type: NetworkEventType
    /** Human-readable description */
    description: string
    /** Additional context data */
    payload?: Record<string, string | number | boolean | null>
    /** User who triggered the event (if applicable) */
    triggeredBy?: string
    createdAt: string
}

/** Event with entity name for display */
export interface NetworkEventWithEntity extends NetworkEvent {
    entityName: string
}

export const networkEventTypeLabels: Record<NetworkEventType, string> = {
    PROVISIONED: "Provisionado",
    DECOMMISSIONED: "Dado de baja",
    PORT_MOVED: "Cambio de puerto",
    POWER_LOW: "Potencia baja",
    POWER_RECOVERED: "Potencia recuperada",
    WENT_OFFLINE: "Sin conexión",
    CAME_ONLINE: "Reconectado",
    PROFILE_CHANGED: "Perfil cambiado",
    SERVICE_SUSPENDED: "Servicio suspendido",
    SERVICE_RESUMED: "Servicio reactivado",
    CONFIG_UPDATED: "Configuración actualizada",
    ALERT_TRIGGERED: "Alerta generada",
    ALERT_RESOLVED: "Alerta resuelta",
}

export const networkEventTypeIcons: Record<NetworkEventType, string> = {
    PROVISIONED: "plus-circle",
    DECOMMISSIONED: "minus-circle",
    PORT_MOVED: "arrow-right",
    POWER_LOW: "alert-triangle",
    POWER_RECOVERED: "check-circle",
    WENT_OFFLINE: "wifi-off",
    CAME_ONLINE: "wifi",
    PROFILE_CHANGED: "settings",
    SERVICE_SUSPENDED: "pause-circle",
    SERVICE_RESUMED: "play-circle",
    CONFIG_UPDATED: "edit",
    ALERT_TRIGGERED: "bell",
    ALERT_RESOLVED: "bell-off",
}

export const networkEventTypeColors: Record<NetworkEventType, string> = {
    PROVISIONED: "text-emerald-400",
    DECOMMISSIONED: "text-red-400",
    PORT_MOVED: "text-primary",
    POWER_LOW: "text-amber-400",
    POWER_RECOVERED: "text-emerald-400",
    WENT_OFFLINE: "text-red-400",
    CAME_ONLINE: "text-emerald-400",
    PROFILE_CHANGED: "text-primary",
    SERVICE_SUSPENDED: "text-amber-400",
    SERVICE_RESUMED: "text-emerald-400",
    CONFIG_UPDATED: "text-gray-400",
    ALERT_TRIGGERED: "text-amber-400",
    ALERT_RESOLVED: "text-emerald-400",
}
