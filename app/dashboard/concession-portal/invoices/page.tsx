"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { mockConcessions } from "@/mocks/concessions"
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  ArrowDownToLine,
  DollarSign,
} from "lucide-react"

const myConcessions = mockConcessions.filter((c) =>
  ["CON-001", "CON-002", "CON-004"].includes(c.id)
)

const totalMonthly = myConcessions.reduce((s, c) => s + c.monthlyCost, 0)

interface Invoice {
  id: string
  period: string
  dueDate: string
  amount: number
  status: "paid" | "pending" | "overdue"
  concessions: string[]
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-CON-001",
    period: "Febrero 2026",
    dueDate: "2026-02-15",
    amount: totalMonthly,
    status: "pending",
    concessions: myConcessions.map((c) => c.name),
  },
  {
    id: "INV-CON-002",
    period: "Enero 2026",
    dueDate: "2026-01-15",
    amount: totalMonthly,
    status: "paid",
    concessions: myConcessions.map((c) => c.name),
  },
  {
    id: "INV-CON-003",
    period: "Diciembre 2025",
    dueDate: "2025-12-15",
    amount: totalMonthly,
    status: "paid",
    concessions: myConcessions.map((c) => c.name),
  },
  {
    id: "INV-CON-004",
    period: "Noviembre 2025",
    dueDate: "2025-11-15",
    amount: totalMonthly,
    status: "paid",
    concessions: myConcessions.map((c) => c.name),
  },
]

const statusConfig: Record<
  Invoice["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  paid: {
    label: "Pagada",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  pending: {
    label: "Pendiente",
    color: "bg-amber-500/20 text-amber-400",
    icon: <Clock className="h-4 w-4" />,
  },
  overdue: {
    label: "Vencida",
    color: "bg-red-500/20 text-red-400",
    icon: <Clock className="h-4 w-4" />,
  },
}

export default function ConcessionInvoicesPage() {
  const pending = mockInvoices.filter((i) => i.status !== "paid")
  const paid = mockInvoices.filter((i) => i.status === "paid")

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Facturas
        </h1>
        <p className="text-sm text-muted-foreground">
          Historial de facturacion por infraestructura rentada
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Costo mensual</p>
              <p className="text-lg font-bold text-foreground">
                ${totalMonthly.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Proximo vencimiento</p>
              <p className="text-lg font-bold text-foreground">
                {pending[0]?.dueDate || "---"}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Concesiones</p>
              <p className="text-lg font-bold text-foreground">
                {myConcessions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending invoices */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Facturas pendientes
          </h2>
          {pending.map((inv) => {
            const config = statusConfig[inv.status]
            return (
              <div
                key={inv.id}
                className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    {config.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {inv.period}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          config.color
                        )}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Vence: {inv.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-foreground">
                    ${inv.amount.toLocaleString()} MXN
                  </p>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Pagar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paid history */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Historial de facturas
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Periodo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Vencimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="sr-only">Descargar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paid.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {inv.period}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {inv.dueDate}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        Pagada
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="Descargar factura"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="space-y-px sm:hidden">
            {paid.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between border-b border-border/50 px-4 py-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {inv.period}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${inv.amount.toLocaleString()} MXN
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Pagada
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
