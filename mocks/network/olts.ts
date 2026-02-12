import type { Olt, Pon } from "@/types/network"

export const mockOlts: Olt[] = [
    {
        id: "OLT-001",
        name: "OLT Centro CDMX",
        vendor: "Huawei",
        model: "MA5608T",
        mgmtIp: "10.0.0.1",
        mgmtPort: 22,
        status: "online",
        location: { lat: 19.4326, lng: -99.1332 },
        locationName: "Centro, CDMX",
        ponPortCount: 4,
        createdAt: "2023-06-15T10:00:00Z",
        updatedAt: "2026-02-06T10:00:00Z",
    },
    {
        id: "OLT-002",
        name: "OLT Guadalajara",
        vendor: "ZTE",
        model: "C320",
        mgmtIp: "10.0.0.2",
        mgmtPort: 22,
        status: "online",
        location: { lat: 20.6597, lng: -103.3496 },
        locationName: "Guadalajara, Jalisco",
        ponPortCount: 4,
        createdAt: "2023-08-20T10:00:00Z",
        updatedAt: "2026-02-06T10:00:00Z",
    },
    {
        id: "OLT-003",
        name: "OLT Monterrey",
        vendor: "VSOL",
        model: "V1600G4",
        mgmtIp: "10.0.0.3",
        mgmtPort: 22,
        status: "online",
        location: { lat: 25.6866, lng: -100.3161 },
        locationName: "Monterrey, Nuevo León",
        ponPortCount: 4,
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2026-02-06T10:00:00Z",
    },
]

export const mockPons: Pon[] = [
    // OLT Centro CDMX PONs
    { id: "PON-001-1", oltId: "OLT-001", label: "PON 1/0/1", slot: 0, port: 1, status: "active", capacity: 64, onuCount: 18 },
    { id: "PON-001-2", oltId: "OLT-001", label: "PON 1/0/2", slot: 0, port: 2, status: "active", capacity: 64, onuCount: 15 },
    { id: "PON-001-3", oltId: "OLT-001", label: "PON 1/0/3", slot: 0, port: 3, status: "active", capacity: 64, onuCount: 12 },
    { id: "PON-001-4", oltId: "OLT-001", label: "PON 1/0/4", slot: 0, port: 4, status: "inactive", capacity: 64, onuCount: 0 },

    // OLT Guadalajara PONs
    { id: "PON-002-1", oltId: "OLT-002", label: "PON 1/0/1", slot: 0, port: 1, status: "active", capacity: 64, onuCount: 22 },
    { id: "PON-002-2", oltId: "OLT-002", label: "PON 1/0/2", slot: 0, port: 2, status: "active", capacity: 64, onuCount: 8 },
    { id: "PON-002-3", oltId: "OLT-002", label: "PON 1/0/3", slot: 0, port: 3, status: "fault", capacity: 64, onuCount: 0, description: "Falla en transceptor" },
    { id: "PON-002-4", oltId: "OLT-002", label: "PON 1/0/4", slot: 0, port: 4, status: "inactive", capacity: 64, onuCount: 0 },

    // OLT Monterrey PONs
    { id: "PON-003-1", oltId: "OLT-003", label: "PON 1/0/1", slot: 0, port: 1, status: "active", capacity: 64, onuCount: 14 },
    { id: "PON-003-2", oltId: "OLT-003", label: "PON 1/0/2", slot: 0, port: 2, status: "active", capacity: 64, onuCount: 11 },
    { id: "PON-003-3", oltId: "OLT-003", label: "PON 1/0/3", slot: 0, port: 3, status: "active", capacity: 64, onuCount: 5 },
    { id: "PON-003-4", oltId: "OLT-003", label: "PON 1/0/4", slot: 0, port: 4, status: "inactive", capacity: 64, onuCount: 0 },
]

/** Get PONs for a specific OLT */
export function getPonsByOltId(oltId: string): Pon[] {
    return mockPons.filter(pon => pon.oltId === oltId)
}

/** Get OLT by ID */
export function getOltById(id: string): Olt | undefined {
    return mockOlts.find(olt => olt.id === id)
}
