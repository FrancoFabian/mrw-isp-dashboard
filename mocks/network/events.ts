import type { NetworkEvent } from "@/types/network"
import { mockOnus } from "./onus"

// Generate events for the first 30 ONUs
const eventOnus = mockOnus.slice(0, 30)

// Deterministic base date matching other files
const BASE_DATE = new Date("2026-02-01T12:00:00Z").getTime()

function generateOnuEvents(onuId: string, onuSerial: string, index: number): NetworkEvent[] {
    const events: NetworkEvent[] = []
    const baseTime = BASE_DATE - index * 2 * 24 * 60 * 60 * 1000 // Stagger by 2 days

    // Provisioning event (always first)
    events.push({
        id: `EVT-${onuId}-001`,
        entityType: "onu",
        entityId: onuId,
        type: "PROVISIONED",
        description: `ONU ${onuSerial} provisionada exitosamente`,
        payload: {
            serial: onuSerial,
            installerName: "Luis Ramírez",
        },
        triggeredBy: "USR-010",
        createdAt: new Date(baseTime - 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    // Random events based on index
    if (index % 5 === 0) {
        // Power fluctuation
        events.push({
            id: `EVT-${onuId}-002`,
            entityType: "onu",
            entityId: onuId,
            type: "POWER_LOW",
            description: `Potencia RX descendió a -28.5 dBm`,
            payload: { rxPower: -28.5 },
            createdAt: new Date(baseTime - 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        events.push({
            id: `EVT-${onuId}-003`,
            entityType: "onu",
            entityId: onuId,
            type: "POWER_RECOVERED",
            description: `Potencia RX recuperada a -24.2 dBm`,
            payload: { rxPower: -24.2 },
            createdAt: new Date(baseTime - 6 * 24 * 60 * 60 * 1000).toISOString(),
        })
    }

    if (index % 7 === 0) {
        // Offline/online cycle
        events.push({
            id: `EVT-${onuId}-004`,
            entityType: "onu",
            entityId: onuId,
            type: "WENT_OFFLINE",
            description: `ONU perdió conexión`,
            createdAt: new Date(baseTime - 3 * 24 * 60 * 60 * 1000).toISOString(),
        })
        events.push({
            id: `EVT-${onuId}-005`,
            entityType: "onu",
            entityId: onuId,
            type: "CAME_ONLINE",
            description: `ONU reconectada después de 2 horas`,
            payload: { downtimeMinutes: 120 },
            createdAt: new Date(baseTime - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        })
    }

    if (index % 10 === 0) {
        // Profile change
        events.push({
            id: `EVT-${onuId}-006`,
            entityType: "onu",
            entityId: onuId,
            type: "PROFILE_CHANGED",
            description: `Perfil cambiado de "Hogar 50" a "Premium 100"`,
            payload: {
                oldProfile: "PROF-002",
                newProfile: "PROF-003",
            },
            triggeredBy: "USR-001",
            createdAt: new Date(baseTime - 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
    }

    if (index % 12 === 0) {
        // Port move
        events.push({
            id: `EVT-${onuId}-007`,
            entityType: "onu",
            entityId: onuId,
            type: "PORT_MOVED",
            description: `Movido de puerto 5 a puerto 8 en NAP`,
            payload: {
                fromPort: 5,
                toPort: 8,
            },
            triggeredBy: "USR-010",
            createdAt: new Date(baseTime - 21 * 24 * 60 * 60 * 1000).toISOString(),
        })
    }

    return events
}

// Customer-related events
const customerEvents: NetworkEvent[] = [
    {
        id: "EVT-CUST-001",
        entityType: "customer",
        entityId: "CLT-003",
        type: "SERVICE_SUSPENDED",
        description: "Servicio suspendido por falta de pago",
        payload: { reason: "payment_overdue", daysPastDue: 15 },
        triggeredBy: "SYSTEM",
        createdAt: new Date(BASE_DATE - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "EVT-CUST-002",
        entityType: "customer",
        entityId: "CLT-006",
        type: "SERVICE_SUSPENDED",
        description: "Servicio suspendido por falta de pago",
        payload: { reason: "payment_overdue", daysPastDue: 30 },
        triggeredBy: "SYSTEM",
        createdAt: new Date(BASE_DATE - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
]

export const mockEvents: NetworkEvent[] = [
    ...eventOnus.flatMap((onu, i) => generateOnuEvents(onu.id, onu.serial, i)),
    ...customerEvents,
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

/** Get events for an entity */
export function getEventsForEntity(entityType: NetworkEvent["entityType"], entityId: string): NetworkEvent[] {
    return mockEvents
        .filter(event => event.entityType === entityType && event.entityId === entityId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/** Get recent events (last 24h) */
export function getRecentEvents(hours: number = 24): NetworkEvent[] {
    const cutoff = BASE_DATE - hours * 60 * 60 * 1000
    return mockEvents.filter(event => new Date(event.createdAt).getTime() > cutoff)
}

/** Get events by type */
export function getEventsByType(type: NetworkEvent["type"]): NetworkEvent[] {
    return mockEvents.filter(event => event.type === type)
}
