import type { PaymentPromise } from "@/types/paymentPromise"

export const mockPaymentPromises: PaymentPromise[] = [
    // Active promises
    {
        id: "PRM-001",
        customerId: "CLT-003",
        customerName: "Juan Hernandez",
        invoiceId: "INV-2026-0007",
        originalDueDate: "2026-01-05",
        promisedUntil: "2026-02-10",
        createdAt: "2026-01-08",
        createdBy: "STF-001",
        status: "active",
        note: "Cliente promete pagar el día 10 de febrero",
    },
    {
        id: "PRM-002",
        customerId: "CLT-008",
        customerName: "Laura Flores",
        invoiceId: "INV-2026-0013",
        originalDueDate: "2026-02-07",
        promisedUntil: "2026-02-14",
        createdAt: "2026-02-06",
        createdBy: "client",
        status: "active",
        note: "Solicitud desde portal cliente - espera cobro de nómina",
    },
    {
        id: "PRM-003",
        customerId: "CLT-004",
        customerName: "Ana Garcia",
        invoiceId: "INV-2026-0008",
        originalDueDate: "2026-02-08",
        promisedUntil: "2026-02-15",
        createdAt: "2026-02-05",
        createdBy: "client",
        status: "active",
    },

    // Expired promises
    {
        id: "PRM-004",
        customerId: "CLT-006",
        customerName: "Patricia Ramirez",
        invoiceId: "INV-2026-0010",
        originalDueDate: "2025-12-28",
        promisedUntil: "2026-01-10",
        createdAt: "2025-12-30",
        createdBy: "STF-001",
        status: "expired",
        note: "No cumplió - servicio suspendido",
    },
    {
        id: "PRM-005",
        customerId: "CLT-011",
        customerName: "Fernando Cruz",
        invoiceId: "INV-2026-0015",
        originalDueDate: "2025-12-15",
        promisedUntil: "2025-12-30",
        createdAt: "2025-12-18",
        createdBy: "STF-003",
        status: "expired",
        note: "Cliente no disponible para cobro",
    },

    // Fulfilled promises
    {
        id: "PRM-006",
        customerId: "CLT-007",
        customerName: "Diego Torres",
        invoiceId: "INV-2026-0012",
        originalDueDate: "2026-01-18",
        promisedUntil: "2026-01-25",
        createdAt: "2026-01-20",
        createdBy: "client",
        status: "fulfilled",
        fulfilledAt: "2026-01-29",
        note: "Pagó en efectivo al cobrador",
    },
    {
        id: "PRM-007",
        customerId: "CLT-001",
        customerName: "Carlos Martinez",
        invoiceId: "INV-2026-0002",
        originalDueDate: "2026-01-15",
        promisedUntil: "2026-01-30",
        createdAt: "2026-01-16",
        createdBy: "client",
        status: "fulfilled",
        fulfilledAt: "2026-01-28",
    },
]

export const getActivePromises = () =>
    mockPaymentPromises.filter((p) => p.status === "active")

export const getPromisesByCustomer = (customerId: string) =>
    mockPaymentPromises.filter((p) => p.customerId === customerId)

export const getPromiseByInvoice = (invoiceId: string) =>
    mockPaymentPromises.find((p) => p.invoiceId === invoiceId && p.status === "active")
