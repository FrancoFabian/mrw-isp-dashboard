import { describe, expect, it } from "vitest"
import { buildClientNodeIndex } from "@/lib/impact/client-impact-index"
import {
    computeNodeClientImpactBatch,
    recomputeNodeClientImpactIncremental,
} from "@/lib/impact/computeClientImpact"
import { DEFAULT_CLIENT_IMPACT_CONFIG } from "@/lib/impact/config"
import type { ClientNodeLink } from "@/lib/impact/types"
import type { MapNodeProjection } from "@/types/network/mapProjection"

describe("recomputeNodeClientImpactIncremental", () => {
    it("recomputes only changed nodes and preserves others", () => {
        const nodes: MapNodeProjection[] = [
            { id: "n1", lat: 0, lng: 0, status: "ONLINE", lastSeenAt: new Date().toISOString(), health: 100, type: "nap" },
            { id: "n2", lat: 0, lng: 0, status: "ONLINE", lastSeenAt: new Date().toISOString(), health: 100, type: "nap" },
        ]

        const links: ClientNodeLink[] = [
            { clientId: "c1", nodeId: "n1", status: "ONLINE", monthlyRevenue: 400 },
            { clientId: "c2", nodeId: "n1", status: "OFFLINE", monthlyRevenue: 600 },
            { clientId: "c3", nodeId: "n2", status: "ONLINE", monthlyRevenue: 500 },
        ]

        const index = buildClientNodeIndex(links)
        const prevMap = computeNodeClientImpactBatch(nodes, index, DEFAULT_CLIENT_IMPACT_CONFIG)
        const unchangedRef = prevMap.get("n2")

        const statusMap = new Map([
            ["n1", "OFFLINE" as const],
            ["n2", "ONLINE" as const],
        ])

        const nextMap = recomputeNodeClientImpactIncremental(
            prevMap,
            ["n1"],
            statusMap,
            index,
            DEFAULT_CLIENT_IMPACT_CONFIG,
        )

        expect(nextMap.get("n1")?.affectedClients).toBe(2)
        expect(nextMap.get("n2")).toBe(unchangedRef)
    })

    it("handles large dataset shape (100k clients, 50k nodes)", () => {
        const nodeCount = 50_000
        const nodes: MapNodeProjection[] = []
        const links: ClientNodeLink[] = []

        for (let i = 0; i < nodeCount; i++) {
            const nodeId = `n-${i}`
            nodes.push({
                id: nodeId,
                lat: 16 + (i % 100) * 0.001,
                lng: -96 + (i % 100) * 0.001,
                status: i % 8 === 0 ? "DEGRADED" : "ONLINE",
                lastSeenAt: new Date().toISOString(),
                health: 90,
                type: "nap",
            })

            links.push({ clientId: `c-${i}-a`, nodeId, status: "ONLINE", monthlyRevenue: 499 })
            links.push({ clientId: `c-${i}-b`, nodeId, status: i % 10 === 0 ? "OFFLINE" : "ONLINE", monthlyRevenue: 699 })
        }

        const index = buildClientNodeIndex(links)
        const impacts = computeNodeClientImpactBatch(nodes, index, DEFAULT_CLIENT_IMPACT_CONFIG)

        expect(links).toHaveLength(100_000)
        expect(impacts.size).toBe(nodeCount)
        expect(impacts.get("n-0")?.totalClients).toBe(2)
    })
})
