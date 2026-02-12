"use client"

import React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mockInstallations } from "@/mocks/installations"
import {
  installationStatusLabels,
  installationStatusColors,
  type InstallationStatus,
} from "@/types/installation"
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  CheckCircle,
  Navigation,
  RotateCcw,
  AlertTriangle,
  User,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import type { Installation } from "@/types/installation"

export default function InstallerAgendaPage() {
  const [selectedInstallation, setSelectedInstallation] =
    useState<Installation | null>(null)

  const todayInstallations = mockInstallations.filter(
    (i) => i.date === "2026-02-06"
  )
  const upcomingInstallations = mockInstallations.filter(
    (i) => i.date > "2026-02-06"
  )
  const completedInstallations = mockInstallations.filter(
    (i) => i.status === "installed" || i.status === "requires_reschedule"
  )

  const pendingCount = mockInstallations.filter(
    (i) => i.status === "pending" || i.status === "confirmed"
  ).length
  const enRouteCount = mockInstallations.filter(
    (i) => i.status === "en_route"
  ).length
  const doneCount = mockInstallations.filter(
    (i) => i.status === "installed"
  ).length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Mi agenda
        </h1>
        <p className="text-sm text-muted-foreground">
          Tus instalaciones programadas para hoy y los proximos dias
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 sm:h-10 sm:w-10">
            <Clock className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">Pendientes</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {pendingCount}
            </p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 sm:h-10 sm:w-10">
            <Navigation className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">En camino</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {enRouteCount}
            </p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 sm:h-10 sm:w-10">
            <CheckCircle className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">Completadas</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {doneCount}
            </p>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Installation list */}
        <div className="space-y-4 xl:col-span-2">
          {/* Today */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
              Hoy - 6 de febrero
            </h2>
            <div className="space-y-2">
              {todayInstallations.map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => setSelectedInstallation(inst)}
                  className={cn(
                    "glass-card-hover flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4",
                    selectedInstallation?.id === inst.id && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary sm:h-12 sm:w-12">
                    <span className="text-xs text-muted-foreground">
                      {inst.timeSlot.split(" - ")[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {inst.clientName}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          installationStatusColors[inst.status]
                        )}
                      >
                        {installationStatusLabels[inst.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {inst.address}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {inst.planName}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
              {todayInstallations.length === 0 && (
                <div className="glass-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay instalaciones programadas para hoy
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming */}
          {upcomingInstallations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Proximos dias
              </h2>
              <div className="space-y-2">
                {upcomingInstallations.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setSelectedInstallation(inst)}
                    className={cn(
                      "glass-card-hover flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4",
                      selectedInstallation?.id === inst.id && "border-primary/40 bg-primary/5"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary sm:h-12 sm:w-12">
                      <span className="text-[10px] text-muted-foreground">
                        {inst.date.slice(8)}
                      </span>
                      <span className="text-xs font-medium text-foreground">Feb</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {inst.clientName}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                            installationStatusColors[inst.status]
                          )}
                        >
                          {installationStatusLabels[inst.status]}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {inst.timeSlot} - {inst.city}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent completed */}
          {completedInstallations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Recientes
              </h2>
              <div className="space-y-2">
                {completedInstallations.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setSelectedInstallation(inst)}
                    className={cn(
                      "glass-card-hover flex w-full items-center gap-3 p-3 text-left opacity-70 sm:gap-4 sm:p-4",
                      selectedInstallation?.id === inst.id && "border-primary/40 bg-primary/5 opacity-100"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary sm:h-12 sm:w-12">
                      {inst.status === "installed" ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <RotateCcw className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {inst.clientName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {inst.date} - {inst.planName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        installationStatusColors[inst.status]
                      )}
                    >
                      {installationStatusLabels[inst.status]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          {selectedInstallation ? (
            <InstallationDetail
              installation={selectedInstallation}
              onStatusChange={(newStatus) => {
                setSelectedInstallation({
                  ...selectedInstallation,
                  status: newStatus,
                })
              }}
            />
          ) : (
            <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                Selecciona una instalacion para ver los detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InstallationDetail({
  installation,
  onStatusChange,
}: {
  installation: Installation
  onStatusChange: (status: InstallationStatus) => void
}) {
  const nextActions: Record<
    InstallationStatus,
    { label: string; next: InstallationStatus; icon: React.ReactNode; color: string }[]
  > = {
    pending: [
      {
        label: "Confirmar cita",
        next: "confirmed",
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
    ],
    confirmed: [
      {
        label: "En camino",
        next: "en_route",
        icon: <Navigation className="h-4 w-4" />,
        color: "bg-cyan-600 text-white hover:bg-cyan-700",
      },
    ],
    en_route: [
      {
        label: "Instalacion completada",
        next: "installed",
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-emerald-600 text-white hover:bg-emerald-700",
      },
      {
        label: "Requiere reprogramar",
        next: "requires_reschedule",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "bg-red-600 text-white hover:bg-red-700",
      },
    ],
    installed: [],
    requires_reschedule: [
      {
        label: "Reprogramar cita",
        next: "pending",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
    ],
  }

  const actions = nextActions[installation.status] ?? []

  return (
    <div className="glass-card space-y-5 p-4 sm:p-5">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            installationStatusColors[installation.status]
          )}
        >
          {installationStatusLabels[installation.status]}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {installation.id}
        </span>
      </div>

      {/* Client */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Cliente
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <User className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {installation.clientName}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {installation.clientPhone}
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Ubicacion
        </h3>
        <div className="rounded-lg bg-secondary/30 p-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm text-foreground">{installation.address}</p>
              <p className="text-xs text-muted-foreground">
                {installation.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Horario
        </h3>
        <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
          <Clock className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm text-foreground">{installation.timeSlot}</p>
            <p className="text-xs text-muted-foreground">{installation.date}</p>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Plan a instalar
        </h3>
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-sm font-medium text-primary">
            {installation.planName}
          </p>
        </div>
      </div>

      {/* Notes */}
      {installation.notes && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Notas
          </h3>
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-sm text-foreground">{installation.notes}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          {actions.map((action) => (
            <button
              key={action.next}
              type="button"
              onClick={() => onStatusChange(action.next)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                action.color
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {installation.status === "installed" && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-emerald-400" />
          <p className="mt-2 text-sm font-medium text-emerald-400">
            Instalacion completada
          </p>
          <p className="text-xs text-muted-foreground">
            El cliente ya puede activar su servicio
          </p>
        </div>
      )}
    </div>
  )
}
