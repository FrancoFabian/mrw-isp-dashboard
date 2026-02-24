import type { FeatureCollection, Point } from "geojson"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { ImpactTier, NodeImpact } from "@/lib/impact/types"

export interface NocNodeFeatureProperties {
    id: string
    status: MapNodeProjection["status"]
    health: number
    lastSeenAt: string
    label?: string
    type?: MapNodeProjection["type"]
    badge?: string
    customerId?: string
    deviceId?: string
    impactScore?: number
    impactTier?: ImpactTier
}

export type NocNodesGeoJson = FeatureCollection<Point, NocNodeFeatureProperties>

export function buildNocGeoJson(
    nodes: MapNodeProjection[],
    impactMap?: Map<string, NodeImpact>,
): NocNodesGeoJson {
    return {
        type: "FeatureCollection",
        features: nodes
            .filter((node) => Number.isFinite(node.lat) && Number.isFinite(node.lng))
            .map((node) => {
                const impact = impactMap?.get(node.id)
                return {
                    type: "Feature" as const,
                    geometry: {
                        type: "Point" as const,
                        coordinates: [node.lng, node.lat],
                    },
                    properties: {
                        id: node.id,
                        status: node.status,
                        health: node.health,
                        lastSeenAt: node.lastSeenAt,
                        label: node.label,
                        type: node.type,
                        badge: node.badge,
                        customerId: node.customerId,
                        deviceId: node.deviceId,
                        impactScore: impact?.impactScore,
                        impactTier: impact?.impactTier,
                    },
                }
            }),
    }
}
