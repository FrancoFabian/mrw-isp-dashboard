"use client"

import React, { useEffect, useState } from "react"
import type { ConcessionClient, ConcessionClientStatus } from "@/types/concession-client"
import {
  concessionClientStatusLabels,
  concessionClientStatusColors,
  concessionTypeLabels,
} from "@/types/concession-client"
import { Eye, PauseCircle, PlayCircle, RefreshCw, ArrowRightLeft, Plus } from "lucide-react"
import { ModernSelectTailwind } from "@/components/ui/selection-modern"
import { ModernDatePicker } from "@/components/ui/date-picker-modern"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { TableSearch } from "@/components/ui/table-search"
import { TablePagination } from "@/components/ui/table-pagination"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatBillingSummary } from "@/lib/concession-billing"

interface ConcessionClientTableProps {
  clients: ConcessionClient[]
  filteredClients: ConcessionClient[]
  onSelectClient: (client: ConcessionClient) => void
  onCreateClient: () => void
  selectedClientId: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedQuery: string
  isSearching: boolean
  statusFilter: ConcessionClientStatus | "all"
  setStatusFilter: (filter: ConcessionClientStatus | "all") => void
  dateFilter: Date | null
  setDateFilter: (date: Date | null) => void
}

const statusFiltersArray: { label: string; value: ConcessionClientStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Suspendidos", value: "suspended" },
  { label: "En riesgo", value: "at_risk" },
]

const formatSla = (client: ConcessionClient) => {
  const availability = client.sla?.availabilityPct
  const response = client.sla?.responseHours
  const availabilityLabel = typeof availability === "number" ? `${availability.toFixed(1)}%` : "N/A"
  const responseLabel = typeof response === "number" ? `${response}h` : "N/A"
  return `${availabilityLabel} / ${responseLabel}`
}

export function ConcessionClientTable({
  clients,
  filteredClients,
  onSelectClient,
  onCreateClient,
  selectedClientId,
  searchQuery,
  setSearchQuery,
  debouncedQuery,
  isSearching,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
}: ConcessionClientTableProps) {
  const defaultColumns = ["entity", "type", "status", "zone", "sla", "billing"]
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [isTableLoading, setIsTableLoading] = useState(true)

  const columnOptions = [
    { keyId: "entity", label: "Entidad" },
    { keyId: "type", label: "Tipo" },
    { keyId: "status", label: "Estado" },
    { keyId: "zone", label: "Zona" },
    { keyId: "sla", label: "SLA" },
    { keyId: "billing", label: "Cobro" },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTableLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const toggleClientStatus = (clientId: string) => {
    setLoadingActionId(clientId)
    setTimeout(() => {
      setLoadingActionId(null)
    }, 1500)
  }

  const refreshClientData = (clientId: string) => {
    setRefreshingId(clientId)
    setTimeout(() => {
      setRefreshingId(null)
    }, 1500)
  }

  const columns: ColumnDef<ConcessionClient>[] = [
    {
      id: "entity",
      header: "Entidad",
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id
        return isRefreshLoading ? (
          <div className="flex flex-col gap-2 w-full">
            <div className="h-4 bg-zinc-800/60 rounded w-44 animate-pulse" />
            <div className="h-3 bg-zinc-800/40 rounded w-28 animate-pulse" />
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
              {client.legalName}
            </div>
            <div className="text-[13px] text-zinc-500 mt-0.5">{client.rfc ?? "Sin RFC"}</div>
          </div>
        )
      },
    },
    {
      id: "type",
      header: "Tipo",
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id
        return isRefreshLoading ? (
          <div className="h-4 bg-zinc-800/60 rounded w-16 animate-pulse" />
        ) : (
          <span className="text-sm text-zinc-300 font-medium">{concessionTypeLabels[client.concessionType]}</span>
        )
      },
    },
    {
      id: "status",
      header: "Estado",
      cell: (client) => {
        const isAnyActionLoading = loadingActionId === client.id || refreshingId === client.id
        return isAnyActionLoading ? (
          <div className="h-6 bg-zinc-800/60 rounded-md w-20 animate-pulse" />
        ) : (
          <StatusBadge
            label={concessionClientStatusLabels[client.status]}
            colorClass={concessionClientStatusColors[client.status]}
            dot
            pulse={client.status === "at_risk"}
          />
        )
      },
    },
    {
      id: "zone",
      header: "Zona",
      hiddenOnMobile: true,
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id
        return isRefreshLoading ? (
          <div className="h-4 bg-zinc-800/60 rounded w-24 animate-pulse" />
        ) : (
          <div className="text-sm text-zinc-300 font-medium">{client.coverageZone ?? "Sin definir"}</div>
        )
      },
    },
    {
      id: "sla",
      header: "SLA",
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id
        return isRefreshLoading ? (
          <div className="h-5 bg-zinc-800/60 rounded w-20 animate-pulse" />
        ) : (
          <div className="text-sm md:text-base font-medium text-zinc-200 tracking-tight">{formatSla(client)}</div>
        )
      },
    },
    {
      id: "billing",
      header: "Cobro",
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id
        return isRefreshLoading ? (
          <div className="h-5 bg-zinc-800/60 rounded w-40 animate-pulse" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-200 font-medium">{formatBillingSummary(client.billing)}</span>
            {client.billing.status === "paused" && (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-400">
                Paused
              </span>
            )}
          </div>
        )
      },
    },
  ]

  const renderActions = (client: ConcessionClient) => {
    const isPausedLoading = loadingActionId === client.id
    const isRefreshLoading = refreshingId === client.id
    const isAnyActionLoading = isPausedLoading || isRefreshLoading
    const isPaused = client.status === "suspended"

    return (
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelectClient(client)
          }}
          className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 p-1 rounded hover:bg-zinc-800/50"
          disabled={isAnyActionLoading}
          title="Ver detalles"
          aria-label="Ver detalles"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleClientStatus(client.id)
          }}
          disabled={isAnyActionLoading}
          aria-label={isPaused ? "Reactivar" : "Pausar servicio"}
          className={`transition-colors flex items-center justify-center p-1 rounded hover:bg-zinc-800/50 ${
            isPausedLoading
              ? "text-blue-500"
              : isPaused
                ? "text-zinc-500 hover:text-emerald-400"
                : "text-zinc-500 hover:text-amber-400"
          }`}
          title={isPaused ? "Reactivar" : "Pausar servicio"}
        >
          <span
            className={`transition-all duration-150 ease-in-out motion-reduce:transition-none flex items-center justify-center ${
              isPausedLoading ? "opacity-40 scale-75" : "opacity-100 scale-100"
            }`}
          >
            {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            refreshClientData(client.id)
          }}
          disabled={isAnyActionLoading}
          aria-label="Recargar datos"
          className={`transition-colors flex items-center justify-center p-1 rounded hover:bg-zinc-800/50 ${
            isRefreshLoading ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"
          }`}
          title="Recargar datos"
        >
          <RefreshCw
            size={16}
            className={
              isRefreshLoading
                ? "animate-spin repeat-[1] animation-duration-[800ms] [animation-timing-function:ease-out]"
                : ""
            }
          />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Directorio de Concesion</h2>
          <p className="text-sm text-zinc-400 mt-1">Gestiona estatus operativo y condiciones de concesion.</p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={onCreateClient}
            className="order-1 lg:order-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            <Plus size={16} />
            Nuevo cliente
          </button>

          <div className="order-2 lg:order-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <TableSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar entidad..."
            isSearching={isSearching}
            disabled={isTableLoading}
          />

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
            <ModernSelectTailwind
              items={statusFiltersArray.map((f) => ({ keyId: f.value, label: f.label }))}
              width="auto"
              placeholder="Estado"
              defaultSelectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                if (keys.length > 0) {
                  setStatusFilter(keys[0] as ConcessionClientStatus | "all")
                }
              }}
            />

            <ModernDatePicker value={dateFilter} onChange={setDateFilter} placeholder="Corte/Registro" />

            <ModernSelectTailwind
              items={columnOptions}
              multiple={true}
              width="auto"
              placeholder="Columnas"
              displayValue="Columnas"
              icon={<ArrowRightLeft size={16} />}
              defaultSelectedKeys={visibleColumns}
              onSelectionChange={(keys) => setVisibleColumns(keys)}
            />
          </div>
          </div>
        </div>
      </div>

      <DataTable<ConcessionClient>
        data={filteredClients}
        columns={columns}
        visibleColumns={visibleColumns}
        isLoading={isTableLoading}
        isSearching={isSearching}
        getRowId={(c) => c.id}
        onRowClick={onSelectClient}
        selectedRowId={selectedClientId}
        renderActions={renderActions}
        emptyMessage={
          debouncedQuery
            ? `No se encontraron resultados para "${debouncedQuery}".`
            : "Ninguna entidad encontrada con el estado seleccionado."
        }
        footer={
          <TablePagination
            totalItems={clients.length}
            filteredItems={filteredClients.length}
            itemName="entidades"
            isLoading={isTableLoading}
            currentPage={1}
            totalPages={1}
          />
        }
      />
    </>
  )
}
