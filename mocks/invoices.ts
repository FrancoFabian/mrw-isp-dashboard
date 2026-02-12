import type { Invoice } from "@/types/invoice"

// Helper to generate invoice ID
const genInvoiceId = (num: number) => `INV-2026-${String(num).padStart(4, "0")}`

export const mockInvoices: Invoice[] = [
    // CLT-001: Carlos Martinez - 3 months history
    {
        id: genInvoiceId(1),
        customerId: "CLT-001",
        customerName: "Carlos Martinez",
        billingCycleId: "BC-001",
        period: "2025-12",
        items: [
            { id: "ITEM-001", description: "Plan Plus 50 Mbps", amount: 699, type: "plan" },
        ],
        subtotal: 699,
        total: 699,
        dueDate: "2025-12-15",
        status: "paid",
        issuedAt: "2025-12-01",
        paidAt: "2025-12-10",
        payments: ["PAY-001"],
    },
    {
        id: genInvoiceId(2),
        customerId: "CLT-001",
        customerName: "Carlos Martinez",
        billingCycleId: "BC-001",
        period: "2026-01",
        items: [
            { id: "ITEM-002", description: "Plan Plus 50 Mbps", amount: 699, type: "plan" },
        ],
        subtotal: 699,
        total: 699,
        dueDate: "2026-01-15",
        status: "paid",
        issuedAt: "2026-01-01",
        paidAt: "2026-01-28",
        payments: ["PAY-001"],
    },
    {
        id: genInvoiceId(3),
        customerId: "CLT-001",
        customerName: "Carlos Martinez",
        billingCycleId: "BC-001",
        period: "2026-02",
        items: [
            { id: "ITEM-003", description: "Plan Plus 50 Mbps", amount: 699, type: "plan" },
            { id: "ITEM-003b", description: "Upgrade diferencia Premium", amount: 300, type: "extra" },
        ],
        subtotal: 999,
        total: 999,
        dueDate: "2026-02-15",
        status: "issued",
        issuedAt: "2026-02-01",
        payments: [],
    },

    // CLT-002: Maria Lopez - Paid on time
    {
        id: genInvoiceId(4),
        customerId: "CLT-002",
        customerName: "Maria Lopez",
        billingCycleId: "BC-002",
        period: "2026-01",
        items: [
            { id: "ITEM-004", description: "Plan Hogar 30 Mbps", amount: 499, type: "plan" },
        ],
        subtotal: 499,
        total: 499,
        dueDate: "2026-01-10",
        status: "paid",
        issuedAt: "2026-01-01",
        paidAt: "2026-01-30",
        payments: ["PAY-002"],
    },
    {
        id: genInvoiceId(5),
        customerId: "CLT-002",
        customerName: "Maria Lopez",
        billingCycleId: "BC-002",
        period: "2026-02",
        items: [
            { id: "ITEM-005", description: "Plan Hogar 30 Mbps", amount: 499, type: "plan" },
        ],
        subtotal: 499,
        total: 499,
        dueDate: "2026-02-10",
        status: "issued",
        issuedAt: "2026-02-01",
        payments: [],
    },

    // CLT-003: Juan Hernandez - OVERDUE (suspended client)
    {
        id: genInvoiceId(6),
        customerId: "CLT-003",
        customerName: "Juan Hernandez",
        billingCycleId: "BC-003",
        period: "2025-12",
        items: [
            { id: "ITEM-006", description: "Plan Basico 10 Mbps", amount: 349, type: "plan" },
        ],
        subtotal: 349,
        total: 349,
        dueDate: "2025-12-05",
        status: "paid",
        issuedAt: "2025-12-01",
        paidAt: "2025-12-08",
        payments: [],
    },
    {
        id: genInvoiceId(7),
        customerId: "CLT-003",
        customerName: "Juan Hernandez",
        billingCycleId: "BC-003",
        period: "2026-01",
        items: [
            { id: "ITEM-007", description: "Plan Basico 10 Mbps", amount: 349, type: "plan" },
        ],
        subtotal: 349,
        total: 349,
        dueDate: "2026-01-05",
        status: "overdue",
        issuedAt: "2026-01-01",
        payments: [],
        notes: "Cliente no responde. Servicio suspendido.",
    },

    // CLT-004: Ana Garcia - Pending, due soon
    {
        id: genInvoiceId(8),
        customerId: "CLT-004",
        customerName: "Ana Garcia",
        billingCycleId: "BC-004",
        period: "2026-02",
        items: [
            { id: "ITEM-008", description: "Plan Plus 50 Mbps", amount: 699, type: "plan" },
        ],
        subtotal: 699,
        total: 699,
        dueDate: "2026-02-08",
        status: "issued",
        issuedAt: "2026-02-01",
        payments: [],
    },

    // CLT-005: Roberto Sanchez - Paid early
    {
        id: genInvoiceId(9),
        customerId: "CLT-005",
        customerName: "Roberto Sanchez",
        billingCycleId: "BC-005",
        period: "2026-02",
        items: [
            { id: "ITEM-009", description: "Plan Premium 100 Mbps", amount: 999, type: "plan" },
        ],
        subtotal: 999,
        total: 999,
        dueDate: "2026-02-01",
        status: "paid",
        issuedAt: "2026-01-25",
        paidAt: "2026-02-01",
        payments: ["PAY-005"],
    },

    // CLT-006: Patricia Ramirez - OVERDUE long
    {
        id: genInvoiceId(10),
        customerId: "CLT-006",
        customerName: "Patricia Ramirez",
        billingCycleId: "BC-006",
        period: "2025-12",
        items: [
            { id: "ITEM-010", description: "Plan Hogar 30 Mbps", amount: 499, type: "plan" },
        ],
        subtotal: 499,
        total: 499,
        dueDate: "2025-12-28",
        status: "overdue",
        issuedAt: "2025-12-01",
        payments: [],
        notes: "Promesa de pago vencida - 2 meses atraso",
    },
    {
        id: genInvoiceId(11),
        customerId: "CLT-006",
        customerName: "Patricia Ramirez",
        billingCycleId: "BC-006",
        period: "2026-01",
        items: [
            { id: "ITEM-011", description: "Plan Hogar 30 Mbps", amount: 499, type: "plan" },
        ],
        subtotal: 499,
        total: 499,
        dueDate: "2026-01-28",
        status: "overdue",
        issuedAt: "2026-01-01",
        payments: [],
    },

    // CLT-007: Diego Torres - Paid via collector (cash)
    {
        id: genInvoiceId(12),
        customerId: "CLT-007",
        customerName: "Diego Torres",
        billingCycleId: "BC-007",
        period: "2026-01",
        items: [
            { id: "ITEM-012", description: "Plan Plus 50 Mbps", amount: 699, type: "plan" },
        ],
        subtotal: 699,
        total: 699,
        dueDate: "2026-01-18",
        status: "paid",
        issuedAt: "2026-01-01",
        paidAt: "2026-01-29",
        payments: ["PAY-007"],
    },

    // CLT-008: Laura Flores - Pending
    {
        id: genInvoiceId(13),
        customerId: "CLT-008",
        customerName: "Laura Flores",
        billingCycleId: "BC-008",
        period: "2026-02",
        items: [
            { id: "ITEM-013", description: "Plan Basico 10 Mbps", amount: 349, type: "plan" },
        ],
        subtotal: 349,
        total: 349,
        dueDate: "2026-02-07",
        status: "issued",
        issuedAt: "2026-02-01",
        payments: [],
    },

    // CLT-010: Sofia Mendoza - Paid + adjustment
    {
        id: genInvoiceId(14),
        customerId: "CLT-010",
        customerName: "Sofia Mendoza",
        billingCycleId: "BC-010",
        period: "2026-02",
        items: [
            { id: "ITEM-014", description: "Plan Premium 100 Mbps", amount: 999, type: "plan" },
            { id: "ITEM-014b", description: "Descuento promocional", amount: -100, type: "discount" },
        ],
        subtotal: 899,
        total: 899,
        dueDate: "2026-02-01",
        status: "paid",
        issuedAt: "2026-01-25",
        paidAt: "2026-02-02",
        payments: ["PAY-010"],
    },

    // CLT-011: Fernando Cruz - OVERDUE, needs collection
    {
        id: genInvoiceId(15),
        customerId: "CLT-011",
        customerName: "Fernando Cruz",
        billingCycleId: "BC-011",
        period: "2025-12",
        items: [
            { id: "ITEM-015", description: "Plan Plus 50 Mbps", amount: 699, type: "plan" },
        ],
        subtotal: 699,
        total: 699,
        dueDate: "2025-12-15",
        status: "overdue",
        issuedAt: "2025-12-01",
        payments: [],
        notes: "Asignado a cobrador",
    },
]

// Helper functions
export const getInvoicesByCustomer = (customerId: string) =>
    mockInvoices.filter((inv) => inv.customerId === customerId)

export const getOverdueInvoices = () =>
    mockInvoices.filter((inv) => inv.status === "overdue")

export const getPendingInvoices = () =>
    mockInvoices.filter((inv) => inv.status === "issued")

export const getPaidInvoices = () =>
    mockInvoices.filter((inv) => inv.status === "paid")
