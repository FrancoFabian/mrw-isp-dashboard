import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { MockLead } from "./types"

/**
 * Deterministic PRNG — same seed always produces the same output.
 * Reuses the pattern from existing mock generators.
 */
function seeded(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return x - Math.floor(x)
}

function hashStr(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0
    }
    return Math.abs(h)
}

/**
 * Generate synthetic leads scattered in uncovered zones.
 *
 * Strategy:
 * 1. Compute bounding box of existing nodes (+ padding)
 * 2. Generate lead positions using deterministic offsets from nodes
 * 3. Leads appear in gaps BETWEEN nodes (offset randomly)
 * 4. Count: ~2–4× node count for realistic demand simulation
 *
 * Deterministic: same nodes → same leads every time.
 */
export function generateMockLeads(
    nodes: MapNodeProjection[],
    multiplier = 3,
): MockLead[] {
    if (nodes.length === 0) return []

    const leads: MockLead[] = []
    const baseSeed = 42_007 // stable base

    // Compute bounds for clamping
    let minLat = Infinity, maxLat = -Infinity
    let minLng = Infinity, maxLng = -Infinity
    for (const n of nodes) {
        if (n.lat < minLat) minLat = n.lat
        if (n.lat > maxLat) maxLat = n.lat
        if (n.lng < minLng) minLng = n.lng
        if (n.lng > maxLng) maxLng = n.lng
    }

    // Pad bounds by ~15%
    const latPad = (maxLat - minLat) * 0.15
    const lngPad = (maxLng - minLng) * 0.15
    minLat -= latPad; maxLat += latPad
    minLng -= lngPad; maxLng += lngPad

    // Generate leads: for each node, scatter `multiplier` leads around it
    for (let ni = 0; ni < nodes.length; ni++) {
        const node = nodes[ni]
        const nodeSeed = hashStr(node.id) + baseSeed

        for (let li = 0; li < multiplier; li++) {
            const s = nodeSeed + li * 7 + ni * 13

            // Offset: 0.005–0.03 degrees (~0.5–3.3km) in random direction
            const angle = seeded(s + 1) * Math.PI * 2
            const dist = 0.005 + seeded(s + 2) * 0.025
            const lat = Math.max(minLat, Math.min(maxLat, node.lat + Math.sin(angle) * dist))
            const lng = Math.max(minLng, Math.min(maxLng, node.lng + Math.cos(angle) * dist))

            // Estimated MRR: 200–800 MXN
            const estimatedMRR = Math.round(200 + seeded(s + 3) * 600)

            leads.push({
                id: `lead-${ni}-${li}`,
                lat,
                lng,
                estimatedMRR,
            })
        }
    }

    return leads
}
