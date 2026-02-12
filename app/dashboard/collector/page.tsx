"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "@/components/dashboard/metric-card"
import { mockAssignments } from "@/mocks/collectors"
import {
  assignmentStatusLabels,
  assignmentStatusColors,
  type CollectorAssignment,
} from "@/types/collector"
import {
  Banknote,
  Users,
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  Home,
  ChevronRight,
  AlertCircle,
} from "lucide-react"

export default function CollectorPage() {
  const [assignments, setAssignments] = useState<CollectorAssignment[]>(mockAssignments)
  const [selected, setSelected] = useState<CollectorAssignment | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const pending = assignments.filter((a) => a.status === "pending")
  const collected = assignments.filter((a) => a.status === "collected")
  const totalCollected = collected.reduce((sum, a) => sum + a.amountDue, 0)
  const totalPending = pending.reduce((sum, a) => sum + a.amountDue, 0)

  function handleCollect(clientId: string) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.clientId === clientId ? { ...a, status: "collected" as const } : a
      )
    )
    setSelected(null)
    setShowConfirm(false)
  }

  function handleNotHome(clientId: string) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.clientId === clientId ? { ...a, status: "not_home" as const } : a
      )
    )
    setSelected(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Mis cobros del dia
        </h1>
        <p className="text-sm text-muted-foreground">
          6 de febrero, 2026 -- Zona: CDMX Sur
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          title="Clientes asignados"
          value={String(assignments.length)}
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Cobrados"
          value={String(collected.length)}
          icon={<CheckCircle className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-400"
        />
        <MetricCard
          title="Total cobrado"
          value={`$${totalCollected.toLocaleString()}`}
          icon={<Banknote className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-400"
        />
        <MetricCard
          title="Pendiente"
          value={`$${totalPending.toLocaleString()}`}
          icon={<Clock className="h-5 w-5" />}
          iconColor="bg-amber-500/10 text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Assignments list */}
        <div className="xl:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-foreground">
                Clientes asignados hoy
              </h2>
            </div>
            <div className="divide-y divide-border">
              {assignments.map((assignment) => (
                <button
                  key={assignment.clientId}
                  type="button"
                  onClick={() => setSelected(assignment)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/30 sm:px-5",
                    selected?.clientId === assignment.clientId && "bg-secondary/40"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      assignment.status === "collected"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : assignment.status === "not_home"
                          ? "bg-muted text-muted-foreground"
                          : "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    {assignment.status === "collected" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : assignment.status === "not_home" ? (
                      <Home className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {assignment.clientName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {assignment.clientAddress}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      ${assignment.amountDue.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex",
                        assignmentStatusColors[assignment.status]
                      )}
                    >
                      {assignmentStatusLabels[assignment.status]}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="glass-card space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Detalle del cobro
                </h3>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    assignmentStatusColors[selected.status]
                  )}
                >
                  {assignmentStatusLabels[selected.status]}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Cliente</span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.clientName}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.planName}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Monto</span>
                  <span className="text-sm font-bold text-foreground">
                    ${selected.amountDue.toLocaleString()} MXN
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Vence</span>
                  <span className="text-sm font-medium text-red-400">
                    {selected.dueDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-4 py-3">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {selected.clientAddress}
                </span>
              </div>

              <a
                href={`tel:${selected.clientPhone}`}
                className="flex items-center gap-2 rounded-lg bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-primary">
                  {selected.clientPhone}
                </span>
              </a>

              {selected.status === "pending" && (
                <div className="space-y-2 pt-2">
                  {!showConfirm ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Banknote className="h-4 w-4" />
                        Registrar pago en efectivo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNotHome(selected.clientId)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                      >
                        <XCircle className="h-4 w-4" />
                        No se encontro
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Confirmar cobro
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recibiste ${selected.amountDue.toLocaleString()} MXN
                            en efectivo de {selected.clientName}?
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCollect(selected.clientId)}
                          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                          Si, confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirm(false)}
                          className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selected.status === "collected" && (
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                      Pago registrado exitosamente
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Banknote className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Selecciona un cliente para ver detalles y registrar pago
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
