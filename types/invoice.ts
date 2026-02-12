export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "cancelled"

export type InvoiceItemType = "plan" | "extra" | "adjustment" | "discount"

export interface InvoiceItem {
    id: string
    description: string
    amount: number
    type: InvoiceItemType
    quantity?: number
}

export interface Invoice {
    id: string
    customerId: string
    customerName: string
    billingCycleId?: string
    period: string // "YYYY-MM" format
    items: InvoiceItem[]
    subtotal: number
    tax?: number
    total: number
    dueDate: string
    status: InvoiceStatus
    issuedAt: string
    paidAt?: string
    cancelledAt?: string
    payments: string[] // Payment IDs
    notes?: string
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
    draft: "Borrador",
    issued: "Emitida",
    paid: "Pagada",
    overdue: "Vencida",
    cancelled: "Cancelada",
}

export const invoiceStatusColors: Record<InvoiceStatus, string> = {
    draft: "bg-slate-500/20 text-slate-400",
    issued: "bg-blue-500/20 text-blue-400",
    paid: "bg-emerald-500/20 text-emerald-400",
    overdue: "bg-red-500/20 text-red-400",
    cancelled: "bg-muted text-muted-foreground",
}

export const invoiceItemTypeLabels: Record<InvoiceItemType, string> = {
    plan: "Plan",
    extra: "Extra",
    adjustment: "Ajuste",
    discount: "Descuento",
}
