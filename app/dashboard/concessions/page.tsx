"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "@/components/dashboard/metric-card"
import { mockConcessions } from "@/mocks/concessions"
import {
  concessionTypeLabels,
  concessionTypeColors,
  concessionStatusLabels,
  concessionStatusColors,
  type Concession,
} from "@/types/concession"
import {
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  AlertTriangle,
  Users,
  Radio,
  X,
  ChevronRight,
} from "lucide-react"

export default function ConcessionsPage() {
  const [selected, setSelected] = useState<Concession | null>(null)
  const [statusFilter, setStatusFilter] = useState<Concession["status"] | "all">("all")

  const filtered = mockConcessions.filter(
    (c) => statusFilter === "all" || c.status === statusFilter
  )

  const totalMonthlyCost = mockConcessions.reduce((sum, c) => sum + c.monthlyCost, 0)
  const activeCount = mockConcessions.filter((c) => c.status === "active").length
  const expiringCount = mockConcessions.filter(
    (c) => c.status === "expiring_soon"
  ).length
  const totalCoverage = mockConcessions.reduce((sum, c) => sum + c.coverageKm, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Concesiones e infraestructura
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestion de infraestructura rentada y concesiones activas
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          title="Costo mensual total"
          value={`$${totalMonthlyCost.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Concesiones activas"
          value={String(activeCount)}
          icon={<Building2 className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-400"
        />
        <MetricCard
          title="Por vencer"
          value={String(expiringCount)}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="bg-amber-500/10 text-amber-400"
        />
        <MetricCard
          title="Cobertura total"
          value={`${totalCoverage} km`}
          icon={<Radio className="h-5 w-5" />}
          iconColor="bg-cyan-500/10 text-cyan-400"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "active", "expiring_soon", "expired"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {s === "all" ? "Todas" : concessionStatusLabels[s]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Concessions grid */}
        <div className="space-y-3 xl:col-span-2">
          {filtered.map((concession) => (
            <button
              key={concession.id}
              type="button"
              onClick={() => setSelected(concession)}
              className={cn(
                "glass-card-hover flex w-full items-center gap-4 p-4 text-left sm:p-5",
                selected?.id === concession.id && "border-primary/30 bg-card"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  concessionTypeColors[concession.type]
                )}
              >
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {concession.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {concession.provider} -- {concessionTypeLabels[concession.type]}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      concessionStatusColors[concession.status]
                    )}
                  >
                    {concessionStatusLabels[concession.status]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {concession.zone}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />$
                    {concession.monthlyCost.toLocaleString()}/mes
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Vence: {concession.endDate}
                  </span>
                </div>
              </div>
              <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron concesiones con el filtro seleccionado
              </p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="glass-card space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Detalle de concesion
                </h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                    concessionTypeColors[selected.type]
                  )}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {selected.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selected.provider}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Tipo</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      concessionTypeColors[selected.type]
                    )}
                  >
                    {concessionTypeLabels[selected.type]}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      concessionStatusColors[selected.status]
                    )}
                  >
                    {concessionStatusLabels[selected.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Costo mensual</span>
                  <span className="text-sm font-bold text-foreground">
                    ${selected.monthlyCost.toLocaleString()} MXN
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Zona</span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.zone}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Cobertura</span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.coverageKm} km
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Clientes servidos
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.clientsServed}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Inicio</span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.startDate}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Vencimiento</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      selected.status === "expiring_soon"
                        ? "text-amber-400"
                        : selected.status === "expired"
                          ? "text-red-400"
                          : "text-foreground"
                    )}
                  >
                    {selected.endDate}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Descripcion
                </p>
                <p className="text-sm text-foreground">
                  {selected.description}
                </p>
              </div>

              {selected.status === "expiring_soon" && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <p className="text-xs text-muted-foreground">
                      Esta concesion esta proxima a vencer. Considere iniciar el
                      proceso de renovacion.
                    </p>
                  </div>
                </div>
              )}

              {selected.status === "expired" && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-xs text-muted-foreground">
                      Esta concesion ha vencido. Se requiere renovacion urgente
                      para mantener la operacion en la zona.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Selecciona una concesion para ver sus detalles completos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
