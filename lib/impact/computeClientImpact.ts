import type { MapNodeProjection, MapNodeStatus } from "@/types/network/mapProjection"
import type { ClientNodeIndex } from "./client-impact-index"
import type {
    AffectedSeverity,
    ClientImpactConfig,
    ClientNodeLink,
    NodeClientImpact,
    UnknownImpactPolicy,
} from "./types"
import { DEFAULT_CLIENT_IMPACT_CONFIG } from "./config"

export interface ClientImpactClassification {
    isAffected: boolean
    isDegraded: boolean
    isOnline: boolean
    affectedWeight: number
}

function resolveUnknownWeight(policy: UnknownImpactPolicy): number {
    if (policy === "ignore") return 0
    if (policy === "half") return 0.5
    return 1
}

export function classifyClientAgainstNode(
    nodeStatus: MapNodeStatus,
    clientStatus: MapNodeStatus,
    policy: UnknownImpactPolicy = DEFAULT_CLIENT_IMPACT_CONFIG.unknownPolicy,
): ClientImpactClassification {
    const unknownWeight = resolveUnknownWeight(policy)

    if (nodeStatus === "OFFLINE") {
        return {
            isAffected: true,
            isDegraded: clientStatus === "DEGRADED",
            isOnline: false,
            affectedWeight: 1,
        }
    }

    if (clientStatus === "OFFLINE") {
        return { isAffected: true, isDegraded: false, isOnline: false, affectedWeight: 1 }
    }

    if (clientStatus === "DEGRADED") {
        return { isAffected: true, isDegraded: true, isOnline: false, affectedWeight: 1 }
    }

    if (clientStatus === "UNKNOWN") {
        return {
            isAffected: unknownWeight > 0,
            isDegraded: false,
            isOnline: false,
            affectedWeight: unknownWeight,
        }
    }

    if (nodeStatus === "DEGRADED") {
        return { isAffected: false, isDegraded: false, isOnline: true, affectedWeight: 0 }
    }

    return { isAffected: false, isDegraded: false, isOnline: true, affectedWeight: 0 }
}

/**
 * Compute client impact for one node (O(k), k=clients linked to node).
 *
 * Signature intentionally keeps `nodeStatus` + `nodeLinks` as primary inputs,
 * matching the future backend contract behavior.
 */
export function computeNodeClientImpact(
    nodeStatus: MapNodeStatus,
    nodeLinks: ClientNodeLink[],
    config: ClientImpactConfig = DEFAULT_CLIENT_IMPACT_CONFIG,
    nodeIdOverride?: string,
): NodeClientImpact {
    const nodeId = nodeIdOverride ?? nodeLinks[0]?.nodeId ?? "unknown-node"
    const totalClients = nodeLinks.length

    let affectedClientsRaw = 0
    let degradedClients = 0
    let onlineClients = 0
    let affectedMRR = 0

    for (const link of nodeLinks) {
        const classification = classifyClientAgainstNode(nodeStatus, link.status, config.unknownPolicy)
        const resolvedRevenue = link.monthlyRevenue ?? config.defaultArpu

        if (classification.isAffected) {
            affectedClientsRaw += classification.affectedWeight
            affectedMRR += resolvedRevenue * classification.affectedWeight
        }
        if (classification.isDegraded) degradedClients += 1
        if (classification.isOnline) onlineClients += 1
    }

    return {
        nodeId,
        totalClients,
        affectedClients: Math.round(affectedClientsRaw),
        degradedClients,
        onlineClients,
        affectedMRR: Math.round(affectedMRR),
        lastComputedAt: new Date().toISOString(),
    }
}

export function computeNodeClientImpactBatch(
    nodes: MapNodeProjection[],
    index: ClientNodeIndex,
    config: ClientImpactConfig = DEFAULT_CLIENT_IMPACT_CONFIG,
): Map<string, NodeClientImpact> {
    const result = new Map<string, NodeClientImpact>()

    for (const node of nodes) {
        const links = index.byNodeId.get(node.id) ?? []
        result.set(node.id, computeNodeClientImpact(node.status, links, config, node.id))
    }

    return result
}

/**
 * Recompute only changed nodes while keeping previous map references for others.
 */
export function recomputeNodeClientImpactIncremental(
    prevMap: Map<string, NodeClientImpact>,
    changedNodeIds: string[],
    nodeStatusMap: Map<string, MapNodeStatus>,
    index: ClientNodeIndex,
    config: ClientImpactConfig = DEFAULT_CLIENT_IMPACT_CONFIG,
): Map<string, NodeClientImpact> {
    const nextMap = new Map(prevMap)

    for (const nodeId of changedNodeIds) {
        const nodeStatus = nodeStatusMap.get(nodeId) ?? "UNKNOWN"
        const links = index.byNodeId.get(nodeId) ?? []
        nextMap.set(nodeId, computeNodeClientImpact(nodeStatus, links, config, nodeId))
    }

    return nextMap
}

export function getAffectedSeverity(
    impact: NodeClientImpact | undefined,
    config: ClientImpactConfig = DEFAULT_CLIENT_IMPACT_CONFIG,
): AffectedSeverity {
    if (!impact || impact.affectedClients <= 0) return "NONE"
    if (impact.affectedClients >= config.severityThresholds.highAffectedClients) return "HIGH"
    return "LOW"
}
