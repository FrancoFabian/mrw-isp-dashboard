import type { Olt } from "./olt"
import type { Nap } from "./nap"
import type { Onu } from "./onu"

/* ── Map node status (normalised for the map) ── */
export type MapNodeStatus = "ONLINE" | "OFFLINE" | "DEGRADED" | "UNKNOWN"

/* ── Device type discriminator ── */
export type MapNodeType = "olt" | "nap" | "onu"

/* ── Projection DTO consumed exclusively by the map module ── */
export interface MapNodeProjection {
    id: string
    lat: number
    lng: number
    status: MapNodeStatus
    lastSeenAt: string
    health: number          // 0-100 normalised
    label?: string
    type?: MapNodeType
    badge?: string          // e.g. "LOS", "5 alerts"
    customerId?: string
    deviceId?: string
}

/* ── Adapters ── */

export function oltToMapNode(olt: Olt): MapNodeProjection {
    const statusMap: Record<Olt["status"], MapNodeStatus> = {
        online: "ONLINE",
        offline: "OFFLINE",
        maintenance: "DEGRADED",
    }
    return {
        id: olt.id,
        lat: olt.location.lat,
        lng: olt.location.lng,
        status: statusMap[olt.status],
        lastSeenAt: olt.updatedAt,
        health: olt.status === "online" ? 100 : olt.status === "maintenance" ? 50 : 0,
        label: olt.name,
        type: "olt",
    }
}

export function napToMapNode(nap: Nap): MapNodeProjection {
    return {
        id: nap.id,
        lat: nap.location.lat,
        lng: nap.location.lng,
        status: "ONLINE",               // NAPs are passive; assume online
        lastSeenAt: nap.updatedAt,
        health: 100,
        label: nap.name,
        type: "nap",
    }
}

export function onuToMapNode(onu: Onu): MapNodeProjection {
    const statusMap: Record<Onu["status"], MapNodeStatus> = {
        online: "ONLINE",
        offline: "OFFLINE",
        degraded: "DEGRADED",
        los: "OFFLINE",
    }
    return {
        id: onu.id,
        lat: 0,   // ONU has no direct geo — caller must supply from NAP
        lng: 0,
        status: statusMap[onu.status],
        lastSeenAt: onu.lastSeen,
        health:
            onu.status === "online" ? 100
                : onu.status === "degraded" ? 50
                    : 0,
        label: onu.serial,
        type: "onu",
        badge: onu.status === "los" ? "LOS" : undefined,
    }
}
