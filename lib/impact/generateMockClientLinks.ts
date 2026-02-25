import type { MapNodeProjection, MapNodeStatus } from "@/types/network/mapProjection"
import type { ClientNodeLink } from "./types"

interface MockClientRange {
    min: number
    max: number
}

export interface MockClientLinkOptions {
    tenantId?: string
    multiplier?: number
    missingRevenueRatio?: number
}

const RANGE_BY_TYPE: Record<string, MockClientRange> = {
    olt: { min: 120, max: 280 },
    nap: { min: 12, max: 48 },
    onu: { min: 1, max: 3 },
}

const DEFAULT_RANGE: MockClientRange = { min: 4, max: 20 }
const PLAN_POOL = ["Basico", "Hogar", "Plus", "Empresarial"] as const
const PLAN_PRICE: Record<(typeof PLAN_POOL)[number], number> = {
    Basico: 349,
    Hogar: 499,
    Plus: 699,
    Empresarial: 999,
}

function seeded(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return x - Math.floor(x)
}

function hashId(id: string): number {
    let h = 0
    for (let i = 0; i < id.length; i++) {
        h = ((h << 5) - h + id.charCodeAt(i)) | 0
    }
    return Math.abs(h)
}

function intBetween(seed: number, min: number, max: number): number {
    return Math.round(min + (max - min) * seeded(seed))
}

function pickStatus(seed: number): MapNodeStatus {
    const r = seeded(seed)
    if (r < 0.78) return "ONLINE"
    if (r < 0.9) return "DEGRADED"
    if (r < 0.97) return "OFFLINE"
    return "UNKNOWN"
}

function pickPlan(seed: number): (typeof PLAN_POOL)[number] {
    return PLAN_POOL[Math.floor(seeded(seed) * PLAN_POOL.length) % PLAN_POOL.length]
}

export function generateMockClientLinks(
    nodes: MapNodeProjection[],
    options: MockClientLinkOptions = {},
): ClientNodeLink[] {
    const {
        tenantId = "default",
        multiplier = 1,
        missingRevenueRatio = 0.2,
    } = options

    const links: ClientNodeLink[] = []

    for (const node of nodes) {
        const nodeSeed = hashId(node.id)
        const range = RANGE_BY_TYPE[node.type ?? ""] ?? DEFAULT_RANGE
        const baseCount = intBetween(nodeSeed + 11, range.min, range.max)
        const clientCount = Math.max(1, Math.round(baseCount * Math.max(multiplier, 0.1)))

        for (let i = 0; i < clientCount; i++) {
            const seed = nodeSeed + i * 31
            const status = pickStatus(seed + 3)
            const plan = pickPlan(seed + 7)
            const hasRevenue = seeded(seed + 13) > missingRevenueRatio

            const octet2 = (seed % 200) + 10
            const octet3 = ((seed + 21) % 200) + 10
            const octet4 = ((seed + 39) % 220) + 10
            const lastSeenMins = intBetween(seed + 17, 1, 240)

            links.push({
                clientId: `${node.id}-cl-${String(i + 1).padStart(4, "0")}`,
                nodeId: node.id,
                status,
                monthlyRevenue: hasRevenue ? PLAN_PRICE[plan] : undefined,
                clientName: `Cliente ${String(i + 1).padStart(4, "0")}`,
                ip: `10.${octet2}.${octet3}.${octet4}`,
                plan,
                lastSeenAt: new Date(Date.now() - lastSeenMins * 60_000).toISOString(),
                tenantId,
            })
        }
    }

    return links
}
