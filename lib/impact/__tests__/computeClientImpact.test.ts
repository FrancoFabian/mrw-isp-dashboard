import { describe, expect, it } from "vitest"
import { computeNodeClientImpact } from "@/lib/impact/computeClientImpact"
import { DEFAULT_CLIENT_IMPACT_CONFIG } from "@/lib/impact/config"
import type { ClientNodeLink } from "@/lib/impact/types"

describe("computeNodeClientImpact", () => {
    it("returns zeroed metrics for node without clients", () => {
        const result = computeNodeClientImpact("ONLINE", [], DEFAULT_CLIENT_IMPACT_CONFIG, "n-empty")

        expect(result.nodeId).toBe("n-empty")
        expect(result.totalClients).toBe(0)
        expect(result.affectedClients).toBe(0)
        expect(result.degradedClients).toBe(0)
        expect(result.onlineClients).toBe(0)
        expect(result.affectedMRR).toBe(0)
    })

    it("marks all clients affected when node is OFFLINE", () => {
        const links: ClientNodeLink[] = [
            { clientId: "c1", nodeId: "n1", status: "ONLINE", monthlyRevenue: 400 },
            { clientId: "c2", nodeId: "n1", status: "DEGRADED", monthlyRevenue: 600 },
            { clientId: "c3", nodeId: "n1", status: "UNKNOWN" },
        ]

        const result = computeNodeClientImpact("OFFLINE", links, DEFAULT_CLIENT_IMPACT_CONFIG, "n1")

        expect(result.totalClients).toBe(3)
        expect(result.affectedClients).toBe(3)
        expect(result.degradedClients).toBe(1)
        expect(result.onlineClients).toBe(0)
        expect(result.affectedMRR).toBe(1499)
    })

    it("computes partial impact for DEGRADED node based on client status", () => {
        const links: ClientNodeLink[] = [
            { clientId: "c1", nodeId: "n2", status: "ONLINE", monthlyRevenue: 349 },
            { clientId: "c2", nodeId: "n2", status: "DEGRADED", monthlyRevenue: 699 },
            { clientId: "c3", nodeId: "n2", status: "OFFLINE", monthlyRevenue: 999 },
            { clientId: "c4", nodeId: "n2", status: "UNKNOWN" },
        ]

        const result = computeNodeClientImpact("DEGRADED", links, DEFAULT_CLIENT_IMPACT_CONFIG, "n2")

        expect(result.totalClients).toBe(4)
        expect(result.affectedClients).toBe(3)
        expect(result.degradedClients).toBe(1)
        expect(result.onlineClients).toBe(1)
        expect(result.affectedMRR).toBe(2197)
    })

    it("supports UNKNOWN policy half", () => {
        const links: ClientNodeLink[] = [
            { clientId: "c1", nodeId: "n3", status: "UNKNOWN", monthlyRevenue: 1000 },
            { clientId: "c2", nodeId: "n3", status: "ONLINE", monthlyRevenue: 1000 },
        ]

        const result = computeNodeClientImpact("ONLINE", links, {
            ...DEFAULT_CLIENT_IMPACT_CONFIG,
            unknownPolicy: "half",
        }, "n3")

        expect(result.affectedClients).toBe(1)
        expect(result.affectedMRR).toBe(500)
    })
})
