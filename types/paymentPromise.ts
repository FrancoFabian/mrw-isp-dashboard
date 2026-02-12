export type PromiseStatus = "active" | "expired" | "fulfilled"

export interface PaymentPromise {
    id: string
    customerId: string
    customerName: string
    invoiceId: string
    originalDueDate: string
    promisedUntil: string
    createdAt: string
    createdBy: string // staff ID or "client"
    status: PromiseStatus
    fulfilledAt?: string
    note?: string
}

export const promiseStatusLabels: Record<PromiseStatus, string> = {
    active: "Activa",
    expired: "Expirada",
    fulfilled: "Cumplida",
}

export const promiseStatusColors: Record<PromiseStatus, string> = {
    active: "bg-amber-500/20 text-amber-400",
    expired: "bg-red-500/20 text-red-400",
    fulfilled: "bg-emerald-500/20 text-emerald-400",
}
