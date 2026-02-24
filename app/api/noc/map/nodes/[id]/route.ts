import { NextResponse } from "next/server"

interface NodeDetailsResponse {
    id: string
    label: string
    status: "ONLINE" | "OFFLINE" | "DEGRADED" | "UNKNOWN"
    lastSeenAt: string
    type: "olt" | "nap" | "onu"
    customer: {
        id: string
        name: string
        username: string
        plan: string
    }
    device: {
        id: string
        model: string
        vendor: string
        ip: string
        mac: string
    }
}

function pickStatus(seed: number, type: NodeDetailsResponse["type"]): NodeDetailsResponse["status"] {
    const r = Math.abs(Math.sin(seed * 17.137))
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

function inferTypeFromId(id: string): NodeDetailsResponse["type"] {
    if (id.startsWith("olt-")) return "olt"
    if (id.startsWith("nap-")) return "nap"
    return "onu"
}

function buildDeviceModel(type: NodeDetailsResponse["type"], seed: number): { model: string; vendor: string } {
    if (type === "olt") {
        const pool = [
            { model: "ZTE C320", vendor: "ZTE" },
            { model: "Huawei MA5608T", vendor: "Huawei" },
            { model: "Nokia ISAM 7360", vendor: "Nokia" },
        ]
        return pool[seed % pool.length]
    }

    if (type === "nap") {
        const pool = [
            { model: "NAP 1x8", vendor: "Fibrain" },
            { model: "NAP 1x16", vendor: "Corning" },
            { model: "Caja NAP 16 puertos", vendor: "Furukawa" },
        ]
        return pool[seed % pool.length]
    }

    const pool = [
        { model: "ZTE F660", vendor: "ZTE" },
        { model: "Huawei HG8145V5", vendor: "Huawei" },
        { model: "TP-Link Archer C6", vendor: "TP-Link" },
        { model: "MikroTik hAP ax2", vendor: "MikroTik" },
    ]
    return pool[seed % pool.length]
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    const numericSeed = id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)

    const type = inferTypeFromId(id)
    const status = pickStatus(numericSeed, type)
    const device = buildDeviceModel(type, numericSeed)

    const payload: NodeDetailsResponse = {
        id,
        label: `Nodo ${id}`,
        status,
        lastSeenAt: new Date(Date.now() - (numericSeed % 240) * 60_000).toISOString(),
        type,
        customer: {
            id: `cust-${(numericSeed % 120) + 1}`,
            name: `Cliente ${(numericSeed % 120) + 1}`,
            username: `usuario_${(numericSeed % 120) + 1}`,
            plan: ["30M", "80M", "150M", "300M"][numericSeed % 4],
        },
        device: {
            id: `dev-${type}-${String((numericSeed % 99999) + 1).padStart(5, "0")}`,
            model: device.model,
            vendor: device.vendor,
            ip: `10.10.${(numericSeed % 200) + 1}.${(numericSeed % 220) + 10}`,
            mac: `AA:BB:CC:${(numericSeed % 99).toString(16).padStart(2, "0")}:${((numericSeed + 23) % 99).toString(16).padStart(2, "0")}:${((numericSeed + 47) % 99).toString(16).padStart(2, "0")}`.toUpperCase(),
        },
    }

    return NextResponse.json(payload, { status: 200 })
}
