import { describe, expect, it } from "vitest"
import { buildNocGeoJson } from "@/components/network/map/buildNocGeoJson"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { NodeClientImpact, NodeImpact } from "@/lib/impact/types"

function makeNodeImpact(nodeId: string): NodeImpact {
    return {
        nodeId,
        status: "DEGRADED",
        affectedClients: 10,
        affectedMRR: 12000,
        openTickets: 3,
        degradedClients: 4,
        technicalSeverity: 0.6,
        customerFactor: 0.5,
        revenueFactor: 0.4,
        ticketFactor: 0.3,
        impactScore: 72,
        impactTier: "HIGH",
        lastComputedAt: new Date().toISOString(),
    }
}

describe("buildNocGeoJson with client impact fields", () => {
    it("injects client impact properties", () => {
        const nodes: MapNodeProjection[] = [
            {
                id: "n1",
                lat: 16.7,
                lng: -96.7,
                status: "DEGRADED",
                lastSeenAt: new Date().toISOString(),
                health: 80,
                type: "nap",
            },
        ]

        const impactMap = new Map<string, NodeImpact>([["n1", makeNodeImpact("n1")]])
        const clientImpactMap = new Map<string, NodeClientImpact>([[
            "n1",
            {
                nodeId: "n1",
                totalClients: 18,
                affectedClients: 12,
                degradedClients: 5,
                onlineClients: 6,
                affectedMRR: 5600,
                lastComputedAt: new Date().toISOString(),
            },
        ]])

        const geoJson = buildNocGeoJson(nodes, impactMap, clientImpactMap)
        const props = geoJson.features[0].properties

        expect(props.id).toBe("n1")
        expect(props.impactScore).toBe(72)
        expect(props.totalClients).toBe(18)
        expect(props.affectedClients).toBe(12)
        expect(props.degradedClients).toBe(5)
        expect(props.onlineClients).toBe(6)
        expect(props.affectedMRR).toBe(5600)
        expect(props.affectedSeverity).toBe("LOW")
    })

    it("defaults impact-client properties when node has no links", () => {
        const nodes: MapNodeProjection[] = [
            {
                id: "n-empty",
                lat: 16.7,
                lng: -96.7,
                status: "ONLINE",
                lastSeenAt: new Date().toISOString(),
                health: 100,
                type: "olt",
            },
        ]

        const geoJson = buildNocGeoJson(nodes, new Map(), new Map())
        const props = geoJson.features[0].properties

        expect(props.totalClients).toBe(0)
        expect(props.affectedClients).toBe(0)
        expect(props.degradedClients).toBe(0)
        expect(props.onlineClients).toBe(0)
        expect(props.affectedMRR).toBe(0)
        expect(props.affectedSeverity).toBe("NONE")
    })
})
