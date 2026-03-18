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
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  overdue: "bg-red-500/10 text-red-400 border-red-500/20",
}

export const paymentSourceLabels: Record<PaymentSource, string> = {
  client: "Cliente",
  collector: "Cobrador",
  admin: "Admin",
}

export const paymentSourceColors: Record<PaymentSource, string> = {
  client: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  collector: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  admin: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
}

