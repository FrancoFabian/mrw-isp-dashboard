import type { NetworkAlert } from "@/types/network"
import { mockOnus } from "./onus"
import { mockNaps } from "./naps"

// Generate alerts for ONUs with issues
const onusWithIssues = mockOnus.filter(onu =>
    onu.status === "offline" ||
    onu.status === "los" ||
    onu.status === "degraded" ||
    (onu.rxPowerDbm !== null && onu.rxPowerDbm < -27)
)

// Generate alerts for saturated NAPs (>80% occupied)
const saturatedNaps = mockNaps.filter(nap => {
    // Count from naps mock is approximate
    return nap.id === "NAP-003" || nap.id === "NAP-006"
})

// Deterministic base date
const BASE_DATE = new Date("2026-02-01T12:00:00Z").getTime()

const baseAlerts: NetworkAlert[] = [
    // ONU offline alerts
    ...onusWithIssues.slice(0, 5).map((onu, i) => ({
        id: `ALERT-${(i + 1).toString().padStart(3, "0")}`,
        severity: onu.status === "los" ? "critical" as const : onu.status === "offline" ? "critical" as const : "warning" as const,
        type: onu.status === "los" ? "LOS" as const : onu.status === "offline" ? "ONU_OFFLINE" as const : "LOW_RX_POWER" as const,
        entityType: "onu" as const,
        entityId: onu.id,
        message: onu.status === "los"
            ? `ONU ${onu.serial} perdió señal óptica (LOS)`
            : onu.status === "offline"
                ? `ONU ${onu.serial} sin conexión desde ${new Date(onu.lastSeen).toLocaleDateString()}`
                : `ONU ${onu.serial} con potencia RX baja: ${onu.rxPowerDbm?.toFixed(1)} dBm`,
        metadata: {
            serial: onu.serial,
            rxPower: onu.rxPowerDbm ?? 0,
            lastSeen: onu.lastSeen,
        },
        createdAt: new Date(BASE_DATE - ((i + 1) * 3600000)).toISOString(),
    })),

    // NAP saturation alerts
    ...saturatedNaps.map((nap, i) => ({
        id: `ALERT-NAP-${(i + 1).toString().padStart(3, "0")}`,
        severity: "warning" as const,
        type: "NAP_SATURATION" as const,
        entityType: "nap" as const,
        entityId: nap.id,
        message: `NAP ${nap.name} tiene menos del 20% de puertos disponibles`,
        metadata: {
            totalPorts: nap.totalPorts,
            napName: nap.name,
        },
        createdAt: new Date(BASE_DATE - ((i + 1) * 7200000)).toISOString(),
    })),

    // Flapping alert
    {
        id: "ALERT-FLAP-001",
        severity: "warning" as const,
        type: "FLAPPING" as const,
        entityType: "onu" as const,
        entityId: mockOnus[15]?.id ?? "ONU-016",
        message: `ONU ${mockOnus[15]?.serial ?? "UNKNOWN"} presenta conexiones inestables (5 reconexiones en 1 hora)`,
        metadata: {
            reconnections: 5,
            timeWindow: "1h",
        },
        createdAt: new Date(BASE_DATE - 30 * 60 * 1000).toISOString(),
    },

    // High latency info
    {
        id: "ALERT-LAT-001",
        severity: "info" as const,
        type: "HIGH_LATENCY" as const,
        entityType: "onu" as const,
        entityId: mockOnus[20]?.id ?? "ONU-021",
        message: `ONU ${mockOnus[20]?.serial ?? "UNKNOWN"} reporta latencia elevada: 45ms`,
        metadata: {
            latencyMs: 45,
        },
        createdAt: new Date(BASE_DATE - 2 * 60 * 60 * 1000).toISOString(),
    },

    // Port damaged alert
    {
        id: "ALERT-PORT-001",
        severity: "warning" as const,
        type: "PORT_DAMAGED" as const,
        entityType: "nap" as const,
        entityId: "NAP-004",
        message: "Puerto 16 de NAP Del Valle-01 marcado como dañado",
        metadata: {
            portIndex: 16,
        },
        createdAt: new Date(BASE_DATE - 3 * 24 * 60 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(BASE_DATE - 2 * 24 * 60 * 60 * 1000).toISOString(),
        acknowledgedBy: "USR-001",
    },
]

export const mockAlerts: NetworkAlert[] = baseAlerts

/** Get active (unresolved) alerts */
export function getActiveAlerts(): NetworkAlert[] {
    return mockAlerts.filter(alert => !alert.resolvedAt)
}

/** Get alerts by severity */
export function getAlertsBySeverity(severity: NetworkAlert["severity"]): NetworkAlert[] {
    return mockAlerts.filter(alert => alert.severity === severity && !alert.resolvedAt)
}

/** Get alerts for an entity */
export function getAlertsForEntity(entityType: NetworkAlert["entityType"], entityId: string): NetworkAlert[] {
    return mockAlerts.filter(alert => alert.entityType === entityType && alert.entityId === entityId)
}

/** Get critical alert count */
export function getCriticalAlertCount(): number {
    return mockAlerts.filter(alert => alert.severity === "critical" && !alert.resolvedAt).length
}

/** Get total active alert count */
export function getActiveAlertCount(): number {
    return mockAlerts.filter(alert => !alert.resolvedAt).length
}
