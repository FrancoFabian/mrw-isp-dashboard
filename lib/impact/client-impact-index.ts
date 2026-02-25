import type { ClientNodeLink, NocScope } from "./types"

export interface ClientNodeIndex {
    byNodeId: Map<string, ClientNodeLink[]>
    byClientId: Map<string, ClientNodeLink>
}

function shouldIncludeLink(link: ClientNodeLink, scope?: NocScope): boolean {
    if (!scope) return true

    if (scope.tenantId && link.tenantId && link.tenantId !== scope.tenantId) {
        return false
    }

    if (scope.nodeIds && scope.nodeIds.length > 0 && !scope.nodeIds.includes(link.nodeId)) {
        return false
    }

    return true
}

/**
 * Build client impact indexes in a single O(n) pass.
 *
 * - byNodeId: O(1) lookup of clients associated to a node
 * - byClientId: O(1) lookup of a client link
 */
export function buildClientNodeIndex(
    links: ClientNodeLink[],
    scope?: NocScope,
): ClientNodeIndex {
    const byNodeId = new Map<string, ClientNodeLink[]>()
    const byClientId = new Map<string, ClientNodeLink>()

    for (const link of links) {
        if (!shouldIncludeLink(link, scope)) continue

        byClientId.set(link.clientId, link)

        const current = byNodeId.get(link.nodeId)
        if (current) current.push(link)
        else byNodeId.set(link.nodeId, [link])
    }

    return { byNodeId, byClientId }
}
