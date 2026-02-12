import type { NetworkNode } from "@/types/network"

export const mockNodes: NetworkNode[] = [
  {
    id: "NOD-001",
    name: "Nodo Centro-01",
    type: "router",
    status: "online",
    ip: "192.168.1.1",
    location: "Centro, CDMX",
    clients: 45,
    uptime: "99.8%",
    lastSeen: "2026-02-06T10:30:00",
  },
  {
    id: "NOD-002",
    name: "Nodo Norte-02",
    type: "antenna",
    status: "online",
    ip: "192.168.2.1",
    location: "Guadalajara, Jalisco",
    clients: 38,
    uptime: "99.2%",
    lastSeen: "2026-02-06T10:30:00",
    signal: 85,
  },
  {
    id: "NOD-003",
    name: "Nodo Sur-03",
    type: "antenna",
    status: "degraded",
    ip: "192.168.3.1",
    location: "Sur, CDMX",
    clients: 52,
    uptime: "94.1%",
    lastSeen: "2026-02-06T10:25:00",
    signal: 62,
  },
  {
    id: "NOD-004",
    name: "Nodo Este-01",
    type: "router",
    status: "online",
    ip: "192.168.4.1",
    location: "Monterrey, Nuevo Leon",
    clients: 41,
    uptime: "99.5%",
    lastSeen: "2026-02-06T10:30:00",
  },
  {
    id: "NOD-005",
    name: "Nodo Puebla-01",
    type: "antenna",
    status: "online",
    ip: "192.168.5.1",
    location: "Puebla, Puebla",
    clients: 22,
    uptime: "98.9%",
    lastSeen: "2026-02-06T10:28:00",
    signal: 78,
  },
  {
    id: "NOD-006",
    name: "AP Centro-02",
    type: "ap",
    status: "offline",
    ip: "192.168.1.10",
    location: "Centro, CDMX",
    clients: 0,
    uptime: "0%",
    lastSeen: "2026-02-05T18:45:00",
    signal: 0,
  },
  {
    id: "NOD-007",
    name: "Switch Centro-01",
    type: "switch",
    status: "online",
    ip: "192.168.1.2",
    location: "Centro, CDMX",
    clients: 28,
    uptime: "99.9%",
    lastSeen: "2026-02-06T10:30:00",
  },
  {
    id: "NOD-008",
    name: "Antena Norte-03",
    type: "antenna",
    status: "online",
    ip: "192.168.2.5",
    location: "Zapopan, Jalisco",
    clients: 15,
    uptime: "97.8%",
    lastSeen: "2026-02-06T10:29:00",
    signal: 72,
  },
]

// Re-export all GPON network mocks from the network subdirectory
export * from "./network/olts"
export * from "./network/naps"
export * from "./network/onus"
export * from "./network/alerts"
export * from "./network/events"
export * from "./network/jobs"
export * from "./network/profiles"
