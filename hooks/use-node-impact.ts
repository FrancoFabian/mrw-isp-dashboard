"use client"

import { useMemo, useRef } from "react"
import type { MapNodeProjection, MapNodeStatus } from "@/types/network/mapProjection"
import type {
    ClientImpactFilter,
    ClientNodeLink,
    ImpactStats,
    NocScope,
    NodeClientImpact,
    NodeImpact,
} from "@/lib/impact/types"
import { computeImpactBatch, computeImpactStats } from "@/lib/impact/computeImpact"
import { buildClientNodeIndex } from "@/lib/impact/client-impact-index"
import {
    classifyClientAgainstNode,
    computeNodeClientImpactBatch,
    recomputeNodeClientImpactIncremental,
} from "@/lib/impact/computeClientImpact"
import { generateMockClientLinks } from "@/lib/impact/generateMockClientLinks"
import { DEFAULT_CLIENT_IMPACT_CONFIG, DEFAULT_IMPACT_CONFIG } from "@/lib/impact/config"

export interface UseNodeImpactResult {
    impactMap: Map<string, NodeImpact>
    clientImpactMap: Map<string, NodeClientImpact>
    ranking: NodeImpact[]
    stats: ImpactStats
    getNodeClientsByFilter: (nodeId: string, filter: ClientImpactFilter) => ClientNodeLink[]
}

interface ImpactCache {
    scopeKey: string
    nodeIdsKey: string
    nodeStatusMap: Map<string, MapNodeStatus>
    clientImpactMap: Map<string, NodeClientImpact>
    clientIndex: ReturnType<typeof buildClientNodeIndex>
}

/**
 * Compute operational impact for visible nodes.
 *
 * - Builds client index O(n)
 * - Computes node-client impact O(n)
 * - Produces O(1) lookup maps for node impact + clients by node
 */
export function useNodeImpact(nodes: MapNodeProjection[], scope?: NocScope): UseNodeImpactResult {
    const cacheRef = useRef<ImpactCache | null>(null)
    const scopeNodeIdsKey = (scope?.nodeIds ?? []).join(",")

    return useMemo(() => {
        const t0 = performance.now()
        const scopeKey = `${scope?.tenantId ?? "default"}|${scopeNodeIdsKey}`
        const nodeIdsKey = nodes.map((node) => node.id).join("|")
        const nodeStatusMap = new Map(nodes.map((node) => [node.id, node.status]))

        let clientIndex: ReturnType<typeof buildClientNodeIndex>
        let clientImpactMap: Map<string, NodeClientImpact>
        const cache = cacheRef.current

        if (cache && cache.scopeKey === scopeKey && cache.nodeIdsKey === nodeIdsKey) {
            clientIndex = cache.clientIndex

            const changedNodeIds: string[] = []
            for (const [nodeId, nodeStatus] of nodeStatusMap) {
                if (cache.nodeStatusMap.get(nodeId) !== nodeStatus) changedNodeIds.push(nodeId)
            }

            clientImpactMap = changedNodeIds.length > 0
                ? recomputeNodeClientImpactIncremental(
                    cache.clientImpactMap,
                    changedNodeIds,
                    nodeStatusMap,
                    clientIndex,
                    DEFAULT_CLIENT_IMPACT_CONFIG,
                )
                : cache.clientImpactMap
        } else {
            const clientLinks = generateMockClientLinks(nodes, { tenantId: scope?.tenantId ?? "default" })
            clientIndex = buildClientNodeIndex(clientLinks, scope)
            clientImpactMap = computeNodeClientImpactBatch(nodes, clientIndex, DEFAULT_CLIENT_IMPACT_CONFIG)
        }

        const inputs = nodes.map((node) => {
            const clientImpact = clientImpactMap.get(node.id)
            const affectedClients = clientImpact?.affectedClients ?? 0
            const degradedClients = clientImpact?.degradedClients ?? 0
            const affectedMRR = clientImpact?.affectedMRR ?? 0

            const openTickets = estimateOpenTickets(node.status, affectedClients, degradedClients)

            return {
                nodeId: node.id,
                status: node.status,
                affectedClients,
                affectedMRR,
                openTickets,
                degradedClients,
            }
        })

        const impactMap = computeImpactBatch(inputs, DEFAULT_IMPACT_CONFIG)
        const computeTimeMs = performance.now() - t0

        const ranking = Array.from(impactMap.values())
            .sort((a, b) => b.impactScore - a.impactScore)

        const stats = computeImpactStats(impactMap, computeTimeMs)

        const getNodeClientsByFilter = (nodeId: string, filter: ClientImpactFilter): ClientNodeLink[] => {
            const links = clientIndex.byNodeId.get(nodeId) ?? []
            if (filter === "all") return links

            const nodeStatus = nodeStatusMap.get(nodeId) ?? "UNKNOWN"
            return links.filter((link) => {
                const classification = classifyClientAgainstNode(
                    nodeStatus,
                    link.status,
                    DEFAULT_CLIENT_IMPACT_CONFIG.unknownPolicy,
                )
                if (filter === "affected") return classification.isAffected
                if (filter === "degraded") return classification.isDegraded
                return true
            })
        }

        cacheRef.current = {
            scopeKey,
            nodeIdsKey,
            nodeStatusMap,
            clientImpactMap,
            clientIndex,
        }

        return { impactMap, clientImpactMap, ranking, stats, getNodeClientsByFilter }
    }, [nodes, scope?.tenantId, scopeNodeIdsKey])
}

function estimateOpenTickets(
    nodeStatus: MapNodeStatus,
    affectedClients: number,
    degradedClients: number,
): number {
    if (affectedClients <= 0) return 0

    if (nodeStatus === "OFFLINE") return Math.max(1, Math.round(affectedClients * 0.12))
    if (nodeStatus === "DEGRADED") return Math.max(1, Math.round(degradedClients * 0.2))
    if (nodeStatus === "UNKNOWN") return Math.max(1, Math.round(affectedClients * 0.08))
    return Math.max(0, Math.round(affectedClients * 0.04))
}
