import type { Nap, NapPort } from "@/types/network"

export const mockNaps: Nap[] = [
    // CDMX NAPs (OLT-001)
    {
        id: "NAP-001",
        name: "NAP Centro-01",
        type: "splitter_1x16",
        oltId: "OLT-001",
        ponId: "PON-001-1",
        location: { lat: 19.4326, lng: -99.1332 },
        locationName: "Col. Centro, CDMX",
        totalPorts: 16,
        installedAt: "2023-07-01",
        createdAt: "2023-07-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-002",
        name: "NAP Roma Norte-01",
        type: "splitter_1x16",
        oltId: "OLT-001",
        ponId: "PON-001-1",
        location: { lat: 19.4194, lng: -99.1583 },
        locationName: "Col. Roma Norte, CDMX",
        totalPorts: 16,
        installedAt: "2023-07-15",
        createdAt: "2023-07-15T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-003",
        name: "NAP Condesa-01",
        type: "splitter_1x8",
        oltId: "OLT-001",
        ponId: "PON-001-2",
        location: { lat: 19.4111, lng: -99.1726 },
        locationName: "Col. Condesa, CDMX",
        totalPorts: 8,
        installedAt: "2023-08-01",
        createdAt: "2023-08-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-004",
        name: "NAP Del Valle-01",
        type: "splitter_1x16",
        oltId: "OLT-001",
        ponId: "PON-001-2",
        location: { lat: 19.3762, lng: -99.1669 },
        locationName: "Col. Del Valle, CDMX",
        totalPorts: 16,
        installedAt: "2023-08-15",
        createdAt: "2023-08-15T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-005",
        name: "NAP Napoles-01",
        type: "splitter_1x8",
        oltId: "OLT-001",
        ponId: "PON-001-3",
        location: { lat: 19.3939, lng: -99.1769 },
        locationName: "Col. Nápoles, CDMX",
        totalPorts: 8,
        installedAt: "2023-09-01",
        createdAt: "2023-09-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },

    // Guadalajara NAPs (OLT-002)
    {
        id: "NAP-006",
        name: "NAP Centro GDL-01",
        type: "splitter_1x16",
        oltId: "OLT-002",
        ponId: "PON-002-1",
        location: { lat: 20.6736, lng: -103.3448 },
        locationName: "Centro, Guadalajara",
        totalPorts: 16,
        installedAt: "2023-09-15",
        createdAt: "2023-09-15T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-007",
        name: "NAP Americana-01",
        type: "splitter_1x16",
        oltId: "OLT-002",
        ponId: "PON-002-1",
        location: { lat: 20.6714, lng: -103.3621 },
        locationName: "Col. Americana, Guadalajara",
        totalPorts: 16,
        installedAt: "2023-10-01",
        createdAt: "2023-10-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-008",
        name: "NAP Zapopan-01",
        type: "splitter_1x8",
        oltId: "OLT-002",
        ponId: "PON-002-2",
        location: { lat: 20.7225, lng: -103.3847 },
        locationName: "Zapopan, Jalisco",
        totalPorts: 8,
        installedAt: "2023-10-15",
        createdAt: "2023-10-15T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-009",
        name: "NAP Vallarta-01",
        type: "splitter_1x8",
        oltId: "OLT-002",
        ponId: "PON-002-2",
        location: { lat: 20.6839, lng: -103.3669 },
        locationName: "Col. Vallarta, Guadalajara",
        totalPorts: 8,
        installedAt: "2023-11-01",
        createdAt: "2023-11-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },

    // Monterrey NAPs (OLT-003)
    {
        id: "NAP-010",
        name: "NAP Centro MTY-01",
        type: "splitter_1x16",
        oltId: "OLT-003",
        ponId: "PON-003-1",
        location: { lat: 25.6714, lng: -100.3093 },
        locationName: "Centro, Monterrey",
        totalPorts: 16,
        installedAt: "2024-01-15",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-011",
        name: "NAP San Pedro-01",
        type: "splitter_1x16",
        oltId: "OLT-003",
        ponId: "PON-003-1",
        location: { lat: 25.6567, lng: -100.4028 },
        locationName: "San Pedro Garza García",
        totalPorts: 16,
        installedAt: "2024-02-01",
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-012",
        name: "NAP Garza Sada-01",
        type: "splitter_1x8",
        oltId: "OLT-003",
        ponId: "PON-003-2",
        location: { lat: 25.6461, lng: -100.2886 },
        locationName: "Av. Garza Sada, Monterrey",
        totalPorts: 8,
        installedAt: "2024-02-15",
        createdAt: "2024-02-15T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-013",
        name: "NAP Santa Catarina-01",
        type: "splitter_1x8",
        oltId: "OLT-003",
        ponId: "PON-003-2",
        location: { lat: 25.6732, lng: -100.4594 },
        locationName: "Santa Catarina, NL",
        totalPorts: 8,
        installedAt: "2024-03-01",
        createdAt: "2024-03-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-014",
        name: "NAP Apodaca-01",
        type: "splitter_1x16",
        oltId: "OLT-003",
        ponId: "PON-003-3",
        location: { lat: 25.7814, lng: -100.1889 },
        locationName: "Apodaca, NL",
        totalPorts: 16,
        installedAt: "2024-03-15",
        createdAt: "2024-03-15T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "NAP-015",
        name: "NAP Escobedo-01",
        type: "splitter_1x8",
        oltId: "OLT-003",
        ponId: "PON-003-3",
        location: { lat: 25.7978, lng: -100.3178 },
        locationName: "Escobedo, NL",
        totalPorts: 8,
        installedAt: "2024-04-01",
        createdAt: "2024-04-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
    },
]

/** Generate NAP ports for a NAP */
function generateNapPorts(nap: Nap, occupancyRate: number): NapPort[] {
    const ports: NapPort[] = []
    const occupiedCount = Math.floor(nap.totalPorts * occupancyRate)

    for (let i = 1; i <= nap.totalPorts; i++) {
        let status: NapPort["status"] = "free"
        if (i <= occupiedCount) {
            status = "occupied"
        } else if (i === nap.totalPorts && Math.random() > 0.8) {
            status = "damaged"
        } else if (Math.random() > 0.9) {
            status = "reserved"
        }

        ports.push({
            id: `${nap.id}-PORT-${i.toString().padStart(2, "0")}`,
            napId: nap.id,
            index: i,
            status,
            updatedAt: "2026-02-01T10:00:00Z",
        })
    }

    return ports
}

// Generate ports with varying occupancy rates
const occupancyRates: Record<string, number> = {
    "NAP-001": 0.75, // 12/16 occupied
    "NAP-002": 0.5,  // 8/16 occupied
    "NAP-003": 0.875, // 7/8 occupied (almost full)
    "NAP-004": 0.625, // 10/16 occupied
    "NAP-005": 0.5,  // 4/8 occupied
    "NAP-006": 0.8125, // 13/16 occupied
    "NAP-007": 0.5625, // 9/16 occupied
    "NAP-008": 0.625, // 5/8 occupied
    "NAP-009": 0.375, // 3/8 occupied
    "NAP-010": 0.625, // 10/16 occupied
    "NAP-011": 0.25, // 4/16 occupied
    "NAP-012": 0.625, // 5/8 occupied
    "NAP-013": 0.5,  // 4/8 occupied
    "NAP-014": 0.3125, // 5/16 occupied
    "NAP-015": 0.25, // 2/8 occupied
}

export const mockNapPorts: NapPort[] = mockNaps.flatMap(nap =>
    generateNapPorts(nap, occupancyRates[nap.id] ?? 0.5)
)

/** Get NAP by ID */
export function getNapById(id: string): Nap | undefined {
    return mockNaps.find(nap => nap.id === id)
}

/** Get ports for a NAP */
export function getPortsByNapId(napId: string): NapPort[] {
    return mockNapPorts.filter(port => port.napId === napId)
}

/** Get NAPs for a specific OLT */
export function getNapsByOltId(oltId: string): Nap[] {
    return mockNaps.filter(nap => nap.oltId === oltId)
}

/** Get NAPs for a specific PON */
export function getNapsByPonId(ponId: string): Nap[] {
    return mockNaps.filter(nap => nap.ponId === ponId)
}

/** Get free ports count for a NAP */
export function getFreePortCount(napId: string): number {
    return mockNapPorts.filter(p => p.napId === napId && p.status === "free").length
}
