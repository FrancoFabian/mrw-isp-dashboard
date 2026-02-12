export type PaymentStatus = "paid" | "pending" | "overdue"

export type PaymentSource = "client" | "collector" | "admin"

export interface Payment {
  id: string
  clientId: string
  clientName: string
  invoiceId?: string // Link to invoice for reconciliation
  amount: number
  date: string
  dueDate: string
  status: PaymentStatus
  method: string
  reference: string
  source: PaymentSource // Origin of payment
  reconciled: boolean // Whether payment is matched to an invoice
  reconciledAt?: string
  proofUrl?: string // Mock: URL/path to payment proof
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  overdue: "Vencido",
}

export const paymentStatusColors: Record<PaymentStatus, string> = {
  paid: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/20 text-amber-400",
  overdue: "bg-red-500/20 text-red-400",
}

export const paymentSourceLabels: Record<PaymentSource, string> = {
  client: "Cliente",
  collector: "Cobrador",
  admin: "Admin",
}

export const paymentSourceColors: Record<PaymentSource, string> = {
  client: "bg-blue-500/20 text-blue-400",
  collector: "bg-purple-500/20 text-purple-400",
  admin: "bg-cyan-500/20 text-cyan-400",
}

