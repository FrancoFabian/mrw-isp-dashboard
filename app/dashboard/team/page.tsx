"use client"

import React from "react"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { TableSearch } from "@/components/ui/table-search"
import { FilterPills } from "@/components/ui/filter-pills"
import { TablePagination } from "@/components/ui/table-pagination"
import { StatusBadge } from "@/components/ui/status-badge"
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

  // Pagination
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Reset pagination on filter change
  useMemo(() => {
    setPage(1)
  }, [roleFilter, search])

  // Slice team members based on page
  const pagedStaff = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))

  const columns: ColumnDef<StaffMember>[] = [
    {
      id: "name",
      header: "Nombre",
      cell: (member) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium border",
              staffRoleColors[member.role]
            )}
          >
            {roleIcons[member.role]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-100">
              {member.firstName} {member.lastName}
            </p>
            <p className="truncate text-xs text-zinc-500 sm:hidden">
              {staffRoleLabels[member.role]}
            </p>
          </div>
        </div>
      )
    },
    {
      id: "role",
      header: "Rol",
      hiddenOnMobile: true,
      cell: (member) => (
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border",
            staffRoleColors[member.role]
          )}
        >
          {staffRoleLabels[member.role]}
        </span>
      )
    },
    {
      id: "zone",
      header: "Zona",
      hiddenOnMobile: true,
      cell: (member) => (
        <span className="text-[13px] text-zinc-400">
          {member.zone}
        </span>
      )
    },
    {
      id: "status",
      header: "Estado",
      cell: (member) => (
        <StatusBadge
          label={staffStatusLabels[member.status]}
          colorClass={staffStatusColors[member.status]}
          dot={true}
        />
      )
    }
  ]

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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Staff table */}
        <div className="xl:col-span-2">
          <DataTable
            data={pagedStaff}
            columns={columns}
            getRowId={(m) => m.id}
            selectedRowId={selected?.id}
            onRowClick={(row) => setSelected(row)}
            emptyIcon={<UserCog className="h-12 w-12 text-zinc-600 mb-4" />}
            emptyMessage="No se encontraron miembros del equipo"
            header={
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TableSearch
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar por nombre o email..."
                />
                <FilterPills
                  value={roleFilter}
                  onChange={(val) => setRoleFilter(val as StaffRole | "all")}
                  filters={[
                    { value: "all", label: "Todos" },
                    { value: "admin", label: staffRoleLabels["admin"] },
                    { value: "installer", label: staffRoleLabels["installer"] },
                    { value: "collector", label: staffRoleLabels["collector"] },
                    { value: "support", label: staffRoleLabels["support"] },
                  ]}
                />
              </div>
            }
            footer={
              <TablePagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                filteredItems={pagedStaff.length}
                totalItems={filtered.length}
              />
            }
            renderActions={() => (
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            )}
          />
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="rounded-2xl border border-zinc-800/80 bg-black/50 backdrop-blur-md shadow-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Perfil del miembro
                </h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
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
            <div className="rounded-2xl border border-zinc-800/80 bg-black/50 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
                <UserCog className="h-8 w-8 text-zinc-500" />
              </div>
              <p className="mt-3 text-sm text-zinc-400 max-w-[200px]">
                Selecciona un miembro del equipo para ver su perfil completo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
