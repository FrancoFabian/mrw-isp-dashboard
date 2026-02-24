import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { NodeImpactInput } from "./types"

/**
 * Deterministic PRNG — same seed always produces the same output.
 * Reuses the pattern from `use-network-map-data.ts`.
 */
function seeded(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return x - Math.floor(x)
}

/** Hash a node ID to a stable numeric seed */
function hashId(id: string): number {
    let h = 0
    for (let i = 0; i < id.length; i++) {
        h = ((h << 5) - h + id.charCodeAt(i)) | 0
    }
    return Math.abs(h)
}

interface MockRange {
    clients: [number, number]
    mrr: [number, number]
    tickets: [number, number]
}

const RANGES_BY_TYPE: Record<string, MockRange> = {
    olt: { clients: [80, 200], mrr: [8_000, 45_000], tickets: [0, 6] },
    nap: { clients: [4, 32], mrr: [400, 3_200], tickets: [0, 3] },
    onu: { clients: [1, 1], mrr: [150, 800], tickets: [0, 2] },
}

const DEFAULT_RANGE: MockRange = { clients: [1, 20], mrr: [100, 2_000], tickets: [0, 2] }

function lerp(a: number, b: number, t: number): number {
    return Math.round(a + (b - a) * t)
}

/**
 * Generate deterministic mock impact inputs from MapNodeProjection[].
 *
 * OFFLINE/DEGRADED nodes get biased toward higher values to simulate
 * real-world correlation between failures and customer impact.
 */
export function generateMockImpactInputs(nodes: MapNodeProjection[]): NodeImpactInput[] {
    return nodes.map((node) => {
        const seed = hashId(node.id)
        const range = RANGES_BY_TYPE[node.type ?? ""] ?? DEFAULT_RANGE

        // Status bias: failing nodes skew toward higher client/ticket counts
        const statusBias = node.status === "OFFLINE" ? 0.7
            : node.status === "DEGRADED" ? 0.4
                : node.status === "UNKNOWN" ? 0.3
                    : 0

        const baseFactor = seeded(seed + 1)
        const biasedFactor = Math.min(baseFactor + statusBias * 0.5, 1)

        const affectedClients = lerp(range.clients[0], range.clients[1], biasedFactor)
        const affectedMRR = lerp(range.mrr[0], range.mrr[1], biasedFactor)
        const openTickets = lerp(range.tickets[0], range.tickets[1], Math.min(seeded(seed + 2) + statusBias * 0.6, 1))

        // Degraded subset: fraction of affected clients with degraded service
        const degradedClients = node.status === "DEGRADED"
            ? Math.round(affectedClients * (0.3 + seeded(seed + 3) * 0.5))
            : 0

        return {
            nodeId: node.id,
            status: node.status,
            affectedClients,
            affectedMRR,
            openTickets,
            degradedClients,
        }
    })
}
