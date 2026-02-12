export type CashCutStatus = "open" | "closed"

export interface CashPayment {
  id: string
  clientId: string
  clientName: string
  clientAddress: string
  amount: number
  collectedAt: string
  reference: string
  collectorId: string
  invoiceId?: string // Link to invoice for reconciliation
  reconciled: boolean // Whether payment is matched to an invoice
}

export interface CashCut {
  id: string
  collectorId: string
  date: string
  status: CashCutStatus
  totalAmount: number
  totalClients: number
  openedAt: string
  closedAt: string | null
  payments: CashPayment[]
}

export interface CollectorAssignment {
  clientId: string
  clientName: string
  clientAddress: string
  clientPhone: string
  zone: string
  planName: string
  amountDue: number
  dueDate: string
  status: "pending" | "collected" | "not_home" | "refused"
}

export const assignmentStatusLabels: Record<CollectorAssignment["status"], string> = {
  pending: "Pendiente",
  collected: "Cobrado",
  not_home: "No encontrado",
  refused: "Rechazo",
}

export const assignmentStatusColors: Record<CollectorAssignment["status"], string> = {
  pending: "bg-amber-500/20 text-amber-400",
  collected: "bg-emerald-500/20 text-emerald-400",
  not_home: "bg-muted text-muted-foreground",
  refused: "bg-red-500/20 text-red-400",
}

export const cashCutStatusLabels: Record<CashCutStatus, string> = {
  open: "Abierto",
  closed: "Cerrado",
}

export const cashCutStatusColors: Record<CashCutStatus, string> = {
  open: "bg-emerald-500/20 text-emerald-400",
  closed: "bg-muted text-muted-foreground",
}
