import { NextResponse } from "next/server"

type MapNodeStatus = "ONLINE" | "OFFLINE" | "DEGRADED" | "UNKNOWN"
type MapNodeType = "olt" | "nap" | "onu"

interface MapNodeResponse {
    id: string
    lat: number
    lng: number
    status: MapNodeStatus
    lastSeenAt: string
    health: number
    label: string
    type: MapNodeType
    badge?: string
    customerId?: string
    deviceId?: string
}

interface Bbox {
    west: number
    south: number
    east: number
    north: number
}

interface Locality {
    name: string
    lat: number
    lng: number
}

const NODE_PLAN: Record<MapNodeType, number> = {
    olt: 6,
    nap: 34,
    onu: 120,
}

const LOCALITIES: Locality[] = [
    { name: "Oaxaca Centro", lat: 17.0732, lng: -96.7266 },
    { name: "Santa Cruz Xoxocotlan", lat: 17.0295, lng: -96.7358 },
    { name: "San Martin Tilcajete", lat: 16.8628, lng: -96.6937 },
    { name: "Santo Tomas Jalieza", lat: 16.8476, lng: -96.6715 },
    { name: "San Pedro Gegorexe", lat: 16.8189, lng: -96.7051 },
    { name: "San Jacinto Chilateca", lat: 16.5818, lng: -96.7386 },
    { name: "Ocotlan de Morelos", lat: 16.791, lng: -96.6742 },
    { name: "Zaachila", lat: 16.9501, lng: -96.7508 },
    { name: "San Bartolo Coyotepec", lat: 16.9552, lng: -96.7287 },
    { name: "Cuilapam de Guerrero", lat: 16.992, lng: -96.7781 },
]

function parseBbox(raw: string | null): Bbox | null {
    if (!raw) return null
    const parts = raw.split(",").map((value) => Number(value))
    if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) return null
    const [west, south, east, north] = parts
    return { west, south, east, north }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

function seeded(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return x - Math.floor(x)
}

function inBbox(lat: number, lng: number, bbox: Bbox): boolean {
    return lng >= bbox.west && lng <= bbox.east && lat >= bbox.south && lat <= bbox.north
}

function jitterByType(type: MapNodeType): { lat: number; lng: number } {
    if (type === "olt") return { lat: 0.003, lng: 0.003 }
    if (type === "nap") return { lat: 0.007, lng: 0.008 }
    return { lat: 0.012, lng: 0.014 }
}

function statusByType(type: MapNodeType, seed: number): MapNodeStatus {
    const r = seeded(seed)
    if (type === "olt") {
        if (r < 0.9) return "ONLINE"
        if (r < 0.95) return "DEGRADED"
        if (r < 0.985) return "OFFLINE"
        return "UNKNOWN"
    }
    if (type === "nap") {
        if (r < 0.8) return "ONLINE"
        if (r < 0.9) return "DEGRADED"
        if (r < 0.97) return "OFFLINE"
        return "UNKNOWN"
    }
    if (r < 0.72) return "ONLINE"
    if (r < 0.86) return "DEGRADED"
    if (r < 0.97) return "OFFLINE"
    return "UNKNOWN"
}

function healthByStatus(status: MapNodeStatus, seed: number): number {
    const noise = seeded(seed)
    if (status === "ONLINE") return clamp(Math.round(84 + noise * 16), 0, 100)
    if (status === "DEGRADED") return clamp(Math.round(38 + noise * 28), 0, 100)
    if (status === "UNKNOWN") return clamp(Math.round(20 + noise * 18), 0, 100)
    return 0
}

function buildLabel(type: MapNodeType, locality: Locality, serial: number): string {
    const localityTag = locality.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 3)
        .toUpperCase()
    return `${type.toUpperCase()}-${localityTag}-${String(serial).padStart(3, "0")}`
}

function generateMockNodes(bbox: Bbox): MapNodeResponse[] {
    const nodes: MapNodeResponse[] = []

    ;(["olt", "nap", "onu"] as MapNodeType[]).forEach((type) => {
        const total = NODE_PLAN[type]

        for (let index = 0; index < total; index++) {
            const globalSeed = index + (type === "olt" ? 1000 : type === "nap" ? 3000 : 6000)
            const locality = LOCALITIES[Math.floor(seeded(globalSeed) * LOCALITIES.length) % LOCALITIES.length]
            const jitter = jitterByType(type)
            const lat = locality.lat + (seeded(globalSeed + 21) - 0.5) * jitter.lat
            const lng = locality.lng + (seeded(globalSeed + 42) - 0.5) * jitter.lng

            if (!inBbox(lat, lng, bbox)) continue

            const status = statusByType(type, globalSeed + 63)
            const serial = index + 1

            nodes.push({
                id: `${type}-${String(serial).padStart(3, "0")}`,
                lat,
                lng,
                status,
                lastSeenAt: new Date(Date.now() - Math.round(seeded(globalSeed + 84) * 4_500_000)).toISOString(),
                health: healthByStatus(status, globalSeed + 105),
                label: buildLabel(type, locality, serial),
                type,
                badge: status === "OFFLINE" ? "LOS" : status === "DEGRADED" ? "Atenuacion alta" : undefined,
                customerId: type === "onu" ? `cust-${(serial % 120) + 1}` : undefined,
                deviceId: `dev-${type}-${String(serial).padStart(5, "0")}`,
            })
        }
    })

    return nodes
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const bbox = parseBbox(searchParams.get("bbox")) ?? {
        west: -96.95,
        south: 16.55,
        east: -96.65,
        north: 16.85,
    }

    const statuses = (searchParams.get("statuses") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as MapNodeStatus[]

    const types = (searchParams.get("types") || "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean) as MapNodeType[]

    const q = (searchParams.get("q") || "").trim().toLowerCase()

    const generated = generateMockNodes(bbox)

    const filtered = generated.filter((node) => {
        if (statuses.length > 0 && !statuses.includes(node.status)) return false
        if (types.length > 0 && !types.includes(node.type)) return false
        if (q) {
            const haystack = `${node.label} ${node.id} ${node.customerId || ""} ${node.deviceId || ""}`.toLowerCase()
            if (!haystack.includes(q)) return false
        }
        return true
    })

    return NextResponse.json(filtered, { status: 200 })
}
