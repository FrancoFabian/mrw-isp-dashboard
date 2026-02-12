"use client"

import React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "@/components/dashboard/metric-card"
import { mockStaff } from "@/mocks/staff"
import {
  staffRoleLabels,
  staffRoleColors,
  staffStatusLabels,
  staffStatusColors,
  type StaffMember,
  type StaffRole,
} from "@/types/staff"
import {
  Users,
  Shield,
  Wrench,
  Banknote,
  LifeBuoy,
  Search,
  MapPin,
  Mail,
  Phone,
  X,
  UserCog,
  ChevronRight,
} from "lucide-react"

const roleIcons: Record<StaffRole, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  installer: <Wrench className="h-4 w-4" />,
  collector: <Banknote className="h-4 w-4" />,
  support: <LifeBuoy className="h-4 w-4" />,
}

export default function TeamPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all")
  const [selected, setSelected] = useState<StaffMember | null>(null)

  const filtered = mockStaff.filter((m) => {
    const matchSearch =
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || m.role === roleFilter
    return matchSearch && matchRole
  })

  const activeCount = mockStaff.filter((m) => m.status === "active").length
  const byRole = mockStaff.reduce(
    (acc, m) => {
      acc[m.role] = (acc[m.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Equipo
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestion del personal y permisos del ISP
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          title="Total personal"
          value={String(mockStaff.length)}
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Activos"
          value={String(activeCount)}
          icon={<UserCog className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-400"
        />
        <MetricCard
          title="Instaladores"
          value={String(byRole.installer || 0)}
          icon={<Wrench className="h-5 w-5" />}
          iconColor="bg-cyan-500/10 text-cyan-400"
        />
        <MetricCard
          title="Cobradores"
          value={String(byRole.collector || 0)}
          icon={<Banknote className="h-5 w-5" />}
          iconColor="bg-amber-500/10 text-amber-400"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "admin", "installer", "collector", "support"] as const).map(
            (r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  roleFilter === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "all" ? "Todos" : staffRoleLabels[r]}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Staff table */}
        <div className="xl:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-5">
                      Nombre
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell sm:px-5">
                      Rol
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell md:px-5">
                      Zona
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-5">
                      Estado
                    </th>
                    <th className="px-4 py-3 sm:px-5">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((member) => (
                    <tr
                      key={member.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-secondary/20",
                        selected?.id === member.id && "bg-secondary/30"
                      )}
                      onClick={() => setSelected(member)}
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                              staffRoleColors[member.role]
                            )}
                          >
                            {roleIcons[member.role]}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground sm:hidden">
                              {staffRoleLabels[member.role]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell sm:px-5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            staffRoleColors[member.role]
                          )}
                        >
                          {staffRoleLabels[member.role]}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell md:px-5">
                        <span className="text-sm text-muted-foreground">
                          {member.zone}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            staffStatusColors[member.status]
                          )}
                        >
                          {staffStatusLabels[member.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No se encontraron miembros del equipo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="glass-card space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Perfil del miembro
                </h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile header */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                    staffRoleColors[selected.role]
                  )}
                >
                  {selected.firstName[0]}
                  {selected.lastName[0]}
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {selected.firstName} {selected.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selected.occupation}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">ID</span>
                  <span className="text-xs font-mono text-foreground">
                    {selected.id}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Rol</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      staffRoleColors[selected.role]
                    )}
                  >
                    {staffRoleLabels[selected.role]}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      staffStatusColors[selected.status]
                    )}
                  >
                    {staffStatusLabels[selected.status]}
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-2 rounded-lg bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-sm text-primary">
                    {selected.email}
                  </span>
                </a>
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center gap-2 rounded-lg bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-primary">{selected.phone}</span>
                </a>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-4 py-3">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {selected.zone}
                  </span>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Permisos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="rounded-md bg-secondary px-2 py-1 text-xs text-foreground"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Registrado desde {selected.registeredAt}
              </p>
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <UserCog className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Selecciona un miembro del equipo para ver su perfil completo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
