import type { FeatureCollection, Point } from "geojson"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { AffectedSeverity, ImpactTier, NodeClientImpact, NodeImpact } from "@/lib/impact/types"
import { DEFAULT_CLIENT_IMPACT_CONFIG } from "@/lib/impact/config"
import { getAffectedSeverity } from "@/lib/impact/computeClientImpact"

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
    totalClients?: number
    affectedClients?: number
    degradedClients?: number
    onlineClients?: number
    affectedMRR?: number
    affectedSeverity?: AffectedSeverity
    lastComputedAt?: string
}

export type NocNodesGeoJson = FeatureCollection<Point, NocNodeFeatureProperties>

export function buildNocGeoJson(
    nodes: MapNodeProjection[],
    impactMap?: Map<string, NodeImpact>,
    clientImpactMap?: Map<string, NodeClientImpact>,
): NocNodesGeoJson {
    return {
        type: "FeatureCollection",
        features: nodes
            .filter((node) => Number.isFinite(node.lat) && Number.isFinite(node.lng))
            .map((node) => {
                const impact = impactMap?.get(node.id)
                const clientImpact = clientImpactMap?.get(node.id)
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
                        totalClients: clientImpact?.totalClients ?? 0,
                        affectedClients: clientImpact?.affectedClients ?? 0,
                        degradedClients: clientImpact?.degradedClients ?? 0,
                        onlineClients: clientImpact?.onlineClients ?? 0,
                        affectedMRR: clientImpact?.affectedMRR ?? 0,
                        affectedSeverity: getAffectedSeverity(clientImpact, DEFAULT_CLIENT_IMPACT_CONFIG),
                        lastComputedAt: clientImpact?.lastComputedAt,
                    },
                }
            }),
    }
}
