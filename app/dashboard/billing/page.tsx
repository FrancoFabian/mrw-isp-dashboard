"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { mockPayments } from "@/mocks/payments"
import { mockInvoices } from "@/mocks/invoices"
import { getActivePromises } from "@/mocks/paymentPromises"
import type { PaymentStatus } from "@/types/payment"
import { PlansGrid } from "@/components/billing/plans-grid"
import { PaymentTable } from "@/components/billing/payment-table"
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  FileText,
  CreditCard,
  ChevronRight,
  Users,
  Handshake
} from "lucide-react"
import { cn } from "@/lib/utils"

const paymentFilters: { label: string; value: PaymentStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Pagados", value: "paid" },
  { label: "Pendientes", value: "pending" },
  { label: "Vencidos", value: "overdue" },
]

export default function BillingPage() {
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all")

  const filteredPayments = useMemo(() => {
    if (paymentFilter === "all") return mockPayments
    return mockPayments.filter((p) => p.status === paymentFilter)
  }, [paymentFilter])

  // Payment KPIs
  const totalPaid = mockPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = mockPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = mockPayments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0)

  // Invoice KPIs
  const invoicesIssued = mockInvoices.filter((i) => i.status === "issued").length
  const invoicesOverdue = mockInvoices.filter((i) => i.status === "overdue").length
  const activePromises = getActivePromises().length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Facturación y Pagos
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona los planes de internet, pagos y facturación de tus clientes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3">
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 sm:h-10 sm:w-10">
            <CheckCircle className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              Cobrado
            </p>
            <p className="text-sm font-bold text-foreground sm:text-xl">
              ${totalPaid.toLocaleString("en-US")}
            </p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 sm:h-10 sm:w-10">
            <Clock className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              Pendiente
            </p>
            <p className="text-sm font-bold text-foreground sm:text-xl">
              ${totalPending.toLocaleString("en-US")}
            </p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 sm:h-10 sm:w-10">
            <AlertTriangle className="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              Vencido
            </p>
            <p className="text-sm font-bold text-foreground sm:text-xl">
              ${totalOverdue.toLocaleString("en-US")}
            </p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 sm:h-10 sm:w-10">
            <FileText className="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              F. Emitidas
            </p>
            <p className="text-sm font-bold text-foreground sm:text-xl">
              {invoicesIssued}
            </p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 sm:h-10 sm:w-10">
            <FileText className="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              F. Vencidas
            </p>
            <p className="text-sm font-bold text-foreground sm:text-xl">
              {invoicesOverdue}
            </p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 sm:h-10 sm:w-10">
            <Handshake className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              Promesas
            </p>
            <p className="text-sm font-bold text-foreground sm:text-xl">
              {activePromises}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/billing/invoices"
          className="glass-card group flex items-center justify-between p-4 transition-colors hover:bg-secondary/80"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Facturas</p>
              <p className="text-xs text-muted-foreground">Gestionar facturas internas</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/dashboard/billing/payments"
          className="glass-card group flex items-center justify-between p-4 transition-colors hover:bg-secondary/80"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CreditCard className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">Pagos y Conciliación</p>
              <p className="text-xs text-muted-foreground">Conciliar pagos con facturas</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Planes de internet
        </h2>
        <PlansGrid />
      </div>

      {/* Payment history */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Estado de pagos
          </h2>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex gap-2">
              {paymentFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setPaymentFilter(filter.value)}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    paymentFilter === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <PaymentTable payments={filteredPayments} />
      </div>
    </div>
  )
}

