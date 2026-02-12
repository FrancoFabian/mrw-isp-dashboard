import type { Onu } from "@/types/network"
import { mockNapPorts } from "./naps"
import { mockClients } from "@/mocks/clients"

// Get occupied ports to assign ONUs
const occupiedPorts = mockNapPorts.filter(p => p.status === "occupied")

// Deterministic helper
const BASE_DATE = new Date("2026-02-01T12:00:00Z").getTime()

function getDeterministicRandom(seed: number) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

/** Generate deterministic signal power values */
function getSignalForIndex(index: number): { rx: number; tx: number } {
    const r = getDeterministicRandom(index)

    if (r > 0.85) {
        // Good signal
        return { rx: -20 + getDeterministicRandom(index + 1) * 5, tx: 2 + getDeterministicRandom(index + 2) * 2 }
    } else if (r > 0.6) {
        // Okay signal
        return { rx: -24 + getDeterministicRandom(index + 1) * 3, tx: 1 + getDeterministicRandom(index + 2) * 1.5 }
    } else if (r > 0.3) {
        // Warning signal
        return { rx: -27 + getDeterministicRandom(index + 1) * 2, tx: 0.5 + getDeterministicRandom(index + 2) * 1 }
    } else {
        // Critical signal
        return { rx: -30 - getDeterministicRandom(index + 1) * 3, tx: -0.5 + getDeterministicRandom(index + 2) * 1 }
    }
}

/** Generate ONU status based on signal and seed */
function getStatusForIndex(index: number, rx: number): Onu["status"] {
    const r = getDeterministicRandom(index + 100)
    if (r > 0.92) return "offline"
    if (rx < -32) return "los"
    if (rx < -28) return "degraded"
    return "online"
}

// NAP to OLT/PON mapping for hierarchy
const napHierarchy: Record<string, { oltId: string; ponId: string }> = {
    "NAP-001": { oltId: "OLT-001", ponId: "PON-001-1" },
    "NAP-002": { oltId: "OLT-001", ponId: "PON-001-1" },
    "NAP-003": { oltId: "OLT-001", ponId: "PON-001-2" },
    "NAP-004": { oltId: "OLT-001", ponId: "PON-001-2" },
    "NAP-005": { oltId: "OLT-001", ponId: "PON-001-3" },
    "NAP-006": { oltId: "OLT-002", ponId: "PON-002-1" },
    "NAP-007": { oltId: "OLT-002", ponId: "PON-002-1" },
    "NAP-008": { oltId: "OLT-002", ponId: "PON-002-2" },
    "NAP-009": { oltId: "OLT-002", ponId: "PON-002-2" },
    "NAP-010": { oltId: "OLT-003", ponId: "PON-003-1" },
    "NAP-011": { oltId: "OLT-003", ponId: "PON-003-1" },
    "NAP-012": { oltId: "OLT-003", ponId: "PON-003-2" },
    "NAP-013": { oltId: "OLT-003", ponId: "PON-003-2" },
    "NAP-014": { oltId: "OLT-003", ponId: "PON-003-3" },
    "NAP-015": { oltId: "OLT-003", ponId: "PON-003-3" },
}

const vendors: Onu["vendor"][] = ["Huawei", "ZTE", "VSOL", "TP-Link", "Generic"]
const models: Record<string, string[]> = {
    Huawei: ["HG8145V5", "HG8546M", "EG8145V5"],
    ZTE: ["F670L", "F660", "F680"],
    VSOL: ["V2801F", "V2802RH"],
    "TP-Link": ["XZ400-G3", "XZ200-G3v"],
    Generic: ["GPON-ONU-01"],
}

const profileIds = ["PROF-001", "PROF-002", "PROF-003", "PROF-004", "PROF-005"]

// Link clients to the first 12 ONUs (matching existing mock clients)
const clientIds = mockClients.map(c => c.id)

export const mockOnus: Onu[] = occupiedPorts.map((port, index) => {
    const vendor = vendors[index % vendors.length]
    const modelList = models[vendor]
    const model = modelList[index % modelList.length]
    const signal = getSignalForIndex(index)
    const status = getStatusForIndex(index, signal.rx)
    const hierarchy = napHierarchy[port.napId] ?? { oltId: "OLT-001", ponId: "PON-001-1" }

    // Link to a customer if available
    const customerId = index < clientIds.length ? clientIds[index] : undefined

    // Deterministic times
    const lastSeenRandom = getDeterministicRandom(index + 200)
    const uptimeRandom = getDeterministicRandom(index + 300)
    const createdRandom = getDeterministicRandom(index + 400)

    return {
        id: `ONU-${(index + 1).toString().padStart(3, "0")}`,
        serial: `${vendor.substring(0, 4).toUpperCase()}${Math.floor(getDeterministicRandom(index + 500) * 100000000).toString(16).toUpperCase().padStart(8, '0')}`,
        vendor,
        model,
        status,
        rxPowerDbm: status === "offline" ? null : parseFloat(signal.rx.toFixed(2)),
        txPowerDbm: status === "offline" ? null : parseFloat(signal.tx.toFixed(2)),
        lastSeen: status === "offline"
            ? new Date(BASE_DATE - lastSeenRandom * 7 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(BASE_DATE - lastSeenRandom * 5 * 60 * 1000).toISOString(),
        uptimeSeconds: status === "online" ? Math.floor(uptimeRandom * 30 * 24 * 60 * 60) : undefined,
        oltId: hierarchy.oltId,
        ponId: hierarchy.ponId,
        napId: port.napId,
        portId: port.id,
        customerId,
        profileId: profileIds[(index % 4) + 1], // Distribute across profiles (mostly PROF-002/003)
        vlanId: 100 + (index % 10),
        createdAt: new Date(BASE_DATE - 365 * 24 * 60 * 60 * 1000 + createdRandom * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(BASE_DATE).toISOString(),
    }
})

// Update the mockNapPorts with ONU and customer assignments
mockOnus.forEach((onu, index) => {
    const port = occupiedPorts[index]
    if (port) {
        port.assignedOnuId = onu.id
        port.assignedCustomerId = onu.customerId
    }
})

/** Get ONU by ID */
export function getOnuById(id: string): Onu | undefined {
    return mockOnus.find(onu => onu.id === id)
}

/** Get ONU by customer ID */
export function getOnuByCustomerId(customerId: string): Onu | undefined {
    return mockOnus.find(onu => onu.customerId === customerId)
}

/** Get ONUs by OLT */
export function getOnusByOltId(oltId: string): Onu[] {
    return mockOnus.filter(onu => onu.oltId === oltId)
}

/** Get ONUs by NAP */
export function getOnusByNapId(napId: string): Onu[] {
    return mockOnus.filter(onu => onu.napId === napId)
}

/** Get online ONU count */
export function getOnlineOnuCount(): number {
    return mockOnus.filter(onu => onu.status === "online").length
}

/** Get offline ONU count */
export function getOfflineOnuCount(): number {
    return mockOnus.filter(onu => onu.status === "offline" || onu.status === "los").length
}

/** Get average RX power */
export function getAverageRxPower(): number {
    const onusWithPower = mockOnus.filter(onu => onu.rxPowerDbm !== null)
    if (onusWithPower.length === 0) return 0
    const sum = onusWithPower.reduce((acc, onu) => acc + (onu.rxPowerDbm ?? 0), 0)
    return parseFloat((sum / onusWithPower.length).toFixed(2))
}
