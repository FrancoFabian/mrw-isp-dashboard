"use client"

import React, { useState } from "react"

import { cn } from "@/lib/utils"
import { mockPayments } from "@/mocks/payments"
import { mockClients } from "@/mocks/clients"
import { mockPlans } from "@/mocks/plans"
import type { Payment } from "@/types/payment"
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  ArrowDownToLine,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Building,
  Store,
} from "lucide-react"

interface PaymentMethod {
  id: string
  type: "card" | "oxxo" | "transfer"
  label: string
  detail: string
  isDefault: boolean
}

const initialMethods: PaymentMethod[] = [
  {
    id: "PM-001",
    type: "card",
    label: "Tarjeta Visa",
    detail: "**** **** **** 4532",
    isDefault: true,
  },
]

const currentClient = mockClients[0]
const currentPlan = mockPlans.find((p) => p.id === currentClient.planId)

// Get payments for this client
const clientPayments = mockPayments.filter(
  (p) => p.clientId === currentClient.id
)

const statusConfig: Record<
  Payment["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  paid: {
    label: "Pagado",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  pending: {
    label: "Pendiente",
    color: "bg-amber-500/20 text-amber-400",
    icon: <Clock className="h-4 w-4" />,
  },
  overdue: {
    label: "Vencido",
    color: "bg-red-500/20 text-red-400",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
}

export default function ClientPaymentsPage() {
  const paidPayments = clientPayments.filter((p) => p.status === "paid")
  const pendingPayments = clientPayments.filter((p) => p.status !== "paid")

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Mis pagos
        </h1>
        <p className="text-sm text-muted-foreground">
          Historial de pagos y estado de tu cuenta
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mensualidad</p>
              <p className="text-lg font-bold text-foreground">
                ${currentPlan?.price.toLocaleString()}
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
              <p className="text-xs text-muted-foreground">Proximo cobro</p>
              <p className="text-lg font-bold text-foreground">
                {currentClient.cutoffDate}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Metodo de pago</p>
              <p className="text-lg font-bold text-foreground">
                {currentClient.paymentMethod || "Sin definir"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending payments */}
      {pendingPayments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Pagos pendientes
          </h2>
          <div className="space-y-2">
            {pendingPayments.map((payment) => {
              const config = statusConfig[payment.status]
              return (
                <div
                  key={payment.id}
                  className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        payment.status === "overdue"
                          ? "bg-red-500/10"
                          : "bg-amber-500/10"
                      )}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Mensualidad - {currentPlan?.name}
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
                          Vence: {payment.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-foreground">
                      ${payment.amount.toLocaleString()}
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
        </div>
      )}

      {/* Payment history */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Historial de pagos
        </h2>
        <div className="glass-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Referencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Metodo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paidPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-sm text-foreground">
                      {payment.reference}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {payment.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {payment.method}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        Pagado
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="Descargar recibo"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="space-y-px sm:hidden">
            {paidPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    ${payment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.date} - {payment.method}
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Pagado
                </span>
              </div>
            ))}
          </div>
        </div>

        {paidPayments.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              No hay pagos registrados aun
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
