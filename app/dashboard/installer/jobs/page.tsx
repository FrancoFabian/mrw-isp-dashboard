"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mockInstallations } from "@/mocks/installations"
import {
  installationStatusLabels,
  installationStatusColors,
  type InstallationStatus,
} from "@/types/installation"
import {
  Filter,
  MapPin,
  Clock,
  Phone,
  ClipboardCheck,
} from "lucide-react"

type FilterValue = "all" | InstallationStatus

const filters: { label: string; value: FilterValue }[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Confirmadas", value: "confirmed" },
  { label: "En camino", value: "en_route" },
  { label: "Instaladas", value: "installed" },
  { label: "Reprogramar", value: "requires_reschedule" },
]

export default function InstallerJobsPage() {
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all")

  const filtered =
    statusFilter === "all"
      ? mockInstallations
      : mockInstallations.filter((i) => i.status === statusFilter)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Instalaciones
        </h1>
        <p className="text-sm text-muted-foreground">
          Historial y estado de todas tus instalaciones asignadas
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((inst) => (
          <div key={inst.id} className="glass-card space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  installationStatusColors[inst.status]
                )}
              >
                {installationStatusLabels[inst.status]}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {inst.id}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                {inst.clientName}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {inst.clientPhone}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="line-clamp-2">
                  {inst.address}, {inst.city}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {inst.date} - {inst.timeSlot}
              </div>
            </div>

            <div className="rounded-lg bg-primary/5 px-3 py-2">
              <p className="text-xs font-medium text-primary">
                {inst.planName}
              </p>
            </div>

            {inst.notes && (
              <p className="text-xs text-muted-foreground/80 italic line-clamp-2">
                {inst.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No hay instalaciones con este filtro
          </p>
        </div>
      )}
    </div>
  )
}
