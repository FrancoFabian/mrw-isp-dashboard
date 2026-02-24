"use client"

import { useQuery } from "@tanstack/react-query"
import type { MapNodeProjection, MapNodeStatus } from "@/types/network/mapProjection"

export interface NetworkNodeDetails {
    id: string
    label: string
    status: MapNodeStatus
    lastSeenAt: string
    type?: MapNodeProjection["type"]
    customer: {
        id?: string
        name: string
        username: string
        plan: string
    }
    device: {
        id?: string
        model: string
        vendor: string
        ip: string
        mac: string
    }
}

interface ApiNodeDetailsDto {
    id: string
    label?: string
    status?: string
    lastSeenAt?: string
    type?: string
    customer?: {
        id?: string
        name?: string
        username?: string
        plan?: string
    }
    device?: {
        id?: string
        model?: string
        vendor?: string
        ip?: string
        mac?: string
    }
}

function normalizeStatus(status?: string): MapNodeStatus {
    switch ((status || "").toUpperCase()) {
        case "ONLINE":
            return "ONLINE"
        case "OFFLINE":
            return "OFFLINE"
        case "DEGRADED":
            return "DEGRADED"
        default:
            return "UNKNOWN"
    }
}

function toNodeDetails(dto: ApiNodeDetailsDto): NetworkNodeDetails {
    return {
        id: dto.id,
        label: dto.label || dto.id,
        status: normalizeStatus(dto.status),
        lastSeenAt: dto.lastSeenAt || new Date().toISOString(),
        type: dto.type === "olt" || dto.type === "nap" || dto.type === "onu" ? dto.type : undefined,
        customer: {
            id: dto.customer?.id,
            name: dto.customer?.name || "Cliente no asignado",
            username: dto.customer?.username || "sin_usuario",
            plan: dto.customer?.plan || "Plan sin definir",
        },
        device: {
            id: dto.device?.id,
            model: dto.device?.model || "Modelo no disponible",
            vendor: dto.device?.vendor || "Vendor N/A",
            ip: dto.device?.ip || "0.0.0.0",
            mac: dto.device?.mac || "00:00:00:00:00:00",
        },
    }
}

function fallbackNodeDetails(nodeId: string): NetworkNodeDetails {
    return {
        id: nodeId,
        label: `Nodo ${nodeId}`,
        status: "UNKNOWN",
        lastSeenAt: new Date().toISOString(),
        customer: {
            name: "Cliente no encontrado",
            username: "sin_usuario",
            plan: "Sin plan",
        },
        device: {
            model: "Sin datos",
            vendor: "Sin datos",
            ip: "0.0.0.0",
            mac: "00:00:00:00:00:00",
        },
    }
}

async function fetchNetworkNodeDetails(nodeId: string, signal?: AbortSignal): Promise<NetworkNodeDetails> {
    try {
        const res = await fetch(`/api/noc/map/nodes/${nodeId}`, { signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const raw = (await res.json()) as ApiNodeDetailsDto
        return toNodeDetails(raw)
    } catch {
        return fallbackNodeDetails(nodeId)
    }
}

export function useNetworkNodeDetails(nodeId: string | null) {
    return useQuery<NetworkNodeDetails>({
        queryKey: ["noc-node-details", nodeId],
        queryFn: ({ signal }) => fetchNetworkNodeDetails(nodeId as string, signal),
        enabled: Boolean(nodeId),
        staleTime: 20_000,
    })
}
