import type { TicketEvent } from "@/types/ticket"

export const mockTicketEvents: TicketEvent[] = [
    // TKT-001
    {
        id: "EVT-001",
        ticketId: "TKT-001",
        type: "created",
        payload: { channel: "portal" },
        createdAt: "2026-02-06T14:30:00",
        actorName: "Juan Hernandez",
    },

    // TKT-002
    {
        id: "EVT-002",
        ticketId: "TKT-002",
        type: "created",
        payload: { channel: "portal" },
        createdAt: "2026-02-04T09:15:00",
        actorName: "Ana Garcia",
    },
    {
        id: "EVT-003",
        ticketId: "TKT-002",
        type: "assigned",
        payload: { assignedTo: "Mariana Gutierrez" },
        createdAt: "2026-02-04T09:30:00",
        actorId: "STF-001",
        actorName: "Alejandro Morales",
    },
    {
        id: "EVT-004",
        ticketId: "TKT-002",
        type: "status_changed",
        payload: { from: "new", to: "open" },
        createdAt: "2026-02-04T09:30:00",
        actorId: "STF-004",
        actorName: "Mariana Gutierrez",
    },
    {
        id: "EVT-005",
        ticketId: "TKT-002",
        type: "status_changed",
        payload: { from: "open", to: "in_progress" },
        createdAt: "2026-02-06T11:00:00",
        actorId: "STF-004",
        actorName: "Mariana Gutierrez",
    },

    // TKT-003
    {
        id: "EVT-006",
        ticketId: "TKT-003",
        type: "created",
        payload: { channel: "whatsapp" },
        createdAt: "2026-02-05T16:45:00",
        actorName: "Laura Flores",
    },
    {
        id: "EVT-007",
        ticketId: "TKT-003",
        type: "assigned",
        payload: { assignedTo: "Mariana Gutierrez" },
        createdAt: "2026-02-05T16:50:00",
        actorId: "STF-001",
        actorName: "Alejandro Morales",
    },
    {
        id: "EVT-008",
        ticketId: "TKT-003",
        type: "status_changed",
        payload: { from: "new", to: "open" },
        createdAt: "2026-02-05T17:00:00",
        actorId: "STF-004",
        actorName: "Mariana Gutierrez",
    },

    // TKT-004
    {
        id: "EVT-009",
        ticketId: "TKT-004",
        type: "created",
        payload: { channel: "phone" },
        createdAt: "2026-02-03T10:00:00",
        actorName: "Carlos Martinez",
    },
    {
        id: "EVT-010",
        ticketId: "TKT-004",
        type: "assigned",
        payload: { assignedTo: "Carmen Ortiz" },
        createdAt: "2026-02-03T10:05:00",
        actorId: "STF-001",
        actorName: "Alejandro Morales",
    },
    {
        id: "EVT-011",
        ticketId: "TKT-004",
        type: "status_changed",
        payload: { from: "new", to: "in_progress" },
        createdAt: "2026-02-03T10:30:00",
        actorId: "STF-008",
        actorName: "Carmen Ortiz",
    },
    {
        id: "EVT-012",
        ticketId: "TKT-004",
        type: "status_changed",
        payload: { from: "in_progress", to: "resolved" },
        createdAt: "2026-02-03T11:30:00",
        actorId: "STF-008",
        actorName: "Carmen Ortiz",
    },

    // TKT-006
    {
        id: "EVT-013",
        ticketId: "TKT-006",
        type: "created",
        payload: { channel: "portal" },
        createdAt: "2026-02-06T08:00:00",
        actorName: "Patricia Ramirez",
    },
    {
        id: "EVT-014",
        ticketId: "TKT-006",
        type: "attachment_added",
        payload: { filename: "comprobante_pago.jpg" },
        createdAt: "2026-02-06T08:00:00",
        actorName: "Patricia Ramirez",
    },
    {
        id: "EVT-015",
        ticketId: "TKT-006",
        type: "assigned",
        payload: { assignedTo: "Mariana Gutierrez" },
        createdAt: "2026-02-06T08:15:00",
        actorId: "STF-001",
        actorName: "Alejandro Morales",
    },
    {
        id: "EVT-016",
        ticketId: "TKT-006",
        type: "status_changed",
        payload: { from: "new", to: "waiting_customer" },
        createdAt: "2026-02-06T10:00:00",
        actorId: "STF-004",
        actorName: "Mariana Gutierrez",
    },

    // TKT-007 - Critical with SLA breach
    {
        id: "EVT-017",
        ticketId: "TKT-007",
        type: "created",
        payload: { channel: "phone" },
        createdAt: "2026-02-06T07:30:00",
        actorName: "Fernando Cruz",
    },
    {
        id: "EVT-018",
        ticketId: "TKT-007",
        type: "priority_changed",
        payload: { from: "high", to: "critical" },
        createdAt: "2026-02-06T07:35:00",
        actorId: "STF-001",
        actorName: "Alejandro Morales",
    },
    {
        id: "EVT-019",
        ticketId: "TKT-007",
        type: "assigned",
        payload: { assignedTo: "Mariana Gutierrez" },
        createdAt: "2026-02-06T07:40:00",
        actorId: "STF-001",
        actorName: "Alejandro Morales",
    },
    {
        id: "EVT-020",
        ticketId: "TKT-007",
        type: "status_changed",
        payload: { from: "new", to: "in_progress" },
        createdAt: "2026-02-06T08:00:00",
        actorId: "STF-004",
        actorName: "Mariana Gutierrez",
    },
    {
        id: "EVT-021",
        ticketId: "TKT-007",
        type: "sla_warning",
        payload: { minutesRemaining: "30" },
        createdAt: "2026-02-06T09:00:00",
    },
    {
        id: "EVT-022",
        ticketId: "TKT-007",
        type: "sla_breached",
        payload: { breachedAfterMinutes: "120" },
        createdAt: "2026-02-06T09:30:00",
    },
    {
        id: "EVT-023",
        ticketId: "TKT-007",
        type: "note_added",
        payload: { note: "Afecta 32 clientes. Fibra cortada en poste 47-A." },
        createdAt: "2026-02-06T09:30:00",
        actorId: "STF-001",
        actorName: "Alejandro Morales",
    },

    // TKT-010
    {
        id: "EVT-024",
        ticketId: "TKT-010",
        type: "created",
        payload: { channel: "portal" },
        createdAt: "2026-02-06T16:30:00",
        actorName: "Sofia Mendoza",
    },
    {
        id: "EVT-025",
        ticketId: "TKT-010",
        type: "attachment_added",
        payload: { filename: "router_luz_roja.jpg" },
        createdAt: "2026-02-06T16:30:00",
        actorName: "Sofia Mendoza",
    },

    // TKT-020
    {
        id: "EVT-026",
        ticketId: "TKT-020",
        type: "created",
        payload: { channel: "portal" },
        createdAt: "2026-02-06T09:00:00",
        actorName: "Sofia Mendoza",
    },
]

// Helper functions
export const getEventsByTicket = (ticketId: string) =>
    mockTicketEvents
        .filter((e) => e.ticketId === ticketId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
