import { describe, expect, it } from "vitest"
import { buildClientNodeIndex } from "@/lib/impact/client-impact-index"
import type { ClientNodeLink } from "@/lib/impact/types"

describe("buildClientNodeIndex", () => {
    it("indexes links by node and client", () => {
        const links: ClientNodeLink[] = [
            { clientId: "c1", nodeId: "n1", status: "ONLINE", tenantId: "t1" },
            { clientId: "c2", nodeId: "n1", status: "OFFLINE", tenantId: "t1" },
            { clientId: "c3", nodeId: "n2", status: "DEGRADED", tenantId: "t1" },
        ]

        const index = buildClientNodeIndex(links, { tenantId: "t1" })

        expect(index.byNodeId.get("n1")).toHaveLength(2)
        expect(index.byNodeId.get("n2")).toHaveLength(1)
        expect(index.byClientId.get("c2")?.nodeId).toBe("n1")
    })

    it("filters by tenant and scope node IDs", () => {
        const links: ClientNodeLink[] = [
            { clientId: "c1", nodeId: "n1", status: "ONLINE", tenantId: "t1" },
            { clientId: "c2", nodeId: "n2", status: "OFFLINE", tenantId: "t1" },
            { clientId: "c3", nodeId: "n3", status: "OFFLINE", tenantId: "t2" },
        ]

        const index = buildClientNodeIndex(links, { tenantId: "t1", nodeIds: ["n2"] })

        expect(index.byNodeId.has("n1")).toBe(false)
        expect(index.byNodeId.has("n2")).toBe(true)
        expect(index.byNodeId.has("n3")).toBe(false)
        expect(index.byClientId.has("c2")).toBe(true)
        expect(index.byClientId.has("c1")).toBe(false)
    })
})
