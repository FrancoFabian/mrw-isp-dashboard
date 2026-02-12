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
  type ConcessionStatus,
} from "@/types/concession"
import {
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  FileText,
  AlertTriangle,
} from "lucide-react"

// This concession client rents CON-001, CON-002, CON-004
const myConcessions = mockConcessions.filter((c) =>
  ["CON-001", "CON-002", "CON-004"].includes(c.id)
)

const totalMonthlyCost = myConcessions.reduce((s, c) => s + c.monthlyCost, 0)
const totalCoverage = myConcessions.reduce((s, c) => s + c.coverageKm, 0)
const totalClients = myConcessions.reduce((s, c) => s + c.clientsServed, 0)

export default function ConcessionPortalPage() {
  const [selected, setSelected] = useState<Concession | null>(null)
  const [filter, setFilter] = useState<ConcessionStatus | "all">("all")

  const filtered =
    filter === "all" ? myConcessions : myConcessions.filter((c) => c.status === filter)

  const expiring = myConcessions.filter((c) => c.status === "expiring_soon")

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Mi infraestructura
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestion de infraestructura rentada y concesiones activas
        </p>
      </div>

      {/* Warning for expiring */}
      {expiring.length > 0 && (
        <div className="glass-card border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {expiring.length} concesi{expiring.length === 1 ? "on" : "ones"}{" "}
                por vencer
              </p>
              <p className="text-xs text-muted-foreground">
                {expiring.map((c) => c.name).join(", ")} -- Contacta al
                administrador para renovar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          title="Concesiones activas"
          value={String(myConcessions.length)}
          icon={<Building2 className="h-5 w-5" />}
          iconColor="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Costo mensual total"
          value={`$${totalMonthlyCost.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="bg-amber-500/10 text-amber-400"
        />
        <MetricCard
          title="Cobertura total"
          value={`${totalCoverage} km`}
          icon={<MapPin className="h-5 w-5" />}
          iconColor="bg-cyan-500/10 text-cyan-400"
        />
        <MetricCard
          title="Clientes servidos"
          value={String(totalClients)}
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(["all", "active", "expiring_soon", "expired"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {s === "all"
              ? "Todas"
              : concessionStatusLabels[s as ConcessionStatus]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Concession list */}
        <div className="xl:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-foreground">
                Infraestructura rentada
              </h2>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((con) => (
                <button
                  key={con.id}
                  type="button"
                  onClick={() => setSelected(con)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/30 sm:px-5",
                    selected?.id === con.id && "bg-secondary/40"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      concessionTypeColors[con.type]
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {con.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {concessionTypeLabels[con.type]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {con.zone}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex",
                        concessionStatusColors[con.status]
                      )}
                    >
                      {concessionStatusLabels[con.status]}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      ${con.monthlyCost.toLocaleString()}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay concesiones con este filtro
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="glass-card space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Detalle
                </h3>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    concessionStatusColors[selected.status]
                  )}
                >
                  {concessionStatusLabels[selected.status]}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.name}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Proveedor
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.provider}
                  </span>
                </div>
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
                  <span className="text-sm text-muted-foreground">Zona</span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.zone}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Costo mensual
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    ${selected.monthlyCost.toLocaleString()} MXN
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Cobertura
                  </span>
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

              {/* Contract dates */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contrato
                </h4>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Inicio</span>
                  <span className="text-sm font-medium text-foreground">
                    {selected.startDate}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Vencimiento
                  </span>
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

              <p className="text-xs text-muted-foreground">
                {selected.description}
              </p>
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Selecciona una concesion para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
