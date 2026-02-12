"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mockCashCuts } from "@/mocks/collectors"
import {
  cashCutStatusLabels,
  cashCutStatusColors,
  type CashCut,
} from "@/types/collector"
import {
  ClipboardList,
  Banknote,
  Users,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Lock,
} from "lucide-react"

export default function CashCutPage() {
  const [cuts, setCuts] = useState<CashCut[]>(mockCashCuts)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const currentCut = cuts.find((c) => c.status === "open")
  const closedCuts = cuts.filter((c) => c.status === "closed")

  function handleCloseCut() {
    if (!currentCut) return
    setCuts((prev) =>
      prev.map((c) =>
        c.id === currentCut.id
          ? {
              ...c,
              status: "closed" as const,
              closedAt: new Date().toISOString(),
            }
          : c
      )
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Corte de caja
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestion de cortes diarios de efectivo
        </p>
      </div>

      {/* Current cut */}
      {currentCut && (
        <div className="glass-card space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <ClipboardList className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Corte actual
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentCut.date} -- Abierto desde{" "}
                  {new Date(currentCut.openedAt).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                cashCutStatusColors[currentCut.status]
              )}
            >
              {cashCutStatusLabels[currentCut.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary/30 p-3 text-center">
              <Banknote className="mx-auto h-5 w-5 text-emerald-400" />
              <p className="mt-1 text-lg font-bold text-foreground">
                ${currentCut.totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Cobrado hoy</p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3 text-center">
              <Users className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 text-lg font-bold text-foreground">
                {currentCut.totalClients}
              </p>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </div>
            <div className="col-span-2 rounded-lg bg-secondary/30 p-3 text-center sm:col-span-1">
              <Clock className="mx-auto h-5 w-5 text-amber-400" />
              <p className="mt-1 text-lg font-bold text-foreground">
                {new Date(currentCut.openedAt).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-xs text-muted-foreground">Hora de apertura</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseCut}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <Lock className="h-4 w-4" />
            Cerrar corte de caja
          </button>
        </div>
      )}

      {!currentCut && (
        <div className="glass-card flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <CheckCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Corte del dia cerrado
          </p>
          <p className="text-xs text-muted-foreground">
            No hay un corte de caja abierto. Se abrira automaticamente al
            iniciar el siguiente dia de cobro.
          </p>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Historial de cortes
        </h2>
        <div className="space-y-3">
          {closedCuts.map((cut) => (
            <div key={cut.id} className="glass-card overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === cut.id ? null : cut.id)
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/20 sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {cut.date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cut.totalClients} clientes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${cut.totalAmount.toLocaleString()}
                    </p>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        cashCutStatusColors[cut.status]
                      )}
                    >
                      {cashCutStatusLabels[cut.status]}
                    </span>
                  </div>
                  {expandedId === cut.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedId === cut.id && cut.payments.length > 0 && (
                <div className="border-t border-border">
                  <div className="divide-y divide-border">
                    {cut.payments.map((payment) => {
                      const dt = new Date(payment.collectedAt)
                      return (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between px-4 py-2.5 sm:px-5"
                        >
                          <div>
                            <p className="text-sm text-foreground">
                              {payment.clientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.clientAddress}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-emerald-400">
                              ${payment.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dt.toLocaleTimeString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="border-t border-border bg-secondary/20 px-4 py-2.5 sm:px-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Cerrado:{" "}
                        {cut.closedAt &&
                          new Date(cut.closedAt).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        Total: ${cut.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
