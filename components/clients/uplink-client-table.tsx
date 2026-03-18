"use client"

import React, { useEffect, useState } from "react"
import type { UplinkClient, UplinkStatus } from "@/types/uplink-client"
import { upstreamCarrierLabels } from "@/types/uplink-client"
import { Eye, PauseCircle, PlayCircle, RefreshCw, ArrowRightLeft, Plus } from "lucide-react"
import { ModernSelectTailwind } from "@/components/ui/selection-modern"
import { ModernDatePicker } from "@/components/ui/date-picker-modern"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { TableSearch } from "@/components/ui/table-search"
import { TablePagination } from "@/components/ui/table-pagination"
import { StatusBadge } from "@/components/ui/status-badge"
import { computeHealth, formatBillingSummary, formatUplinkType } from "@/lib/uplink-billing"

interface UplinkClientTableProps {
  clients: UplinkClient[]
  filteredClients: UplinkClient[]
  onSelectClient: (client: UplinkClient) => void
  onCreateClient: () => void
  selectedClientId: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedQuery: string
  isSearching: boolean
  statusFilter: UplinkStatus | "all"
  setStatusFilter: (filter: UplinkStatus | "all") => void
  dateFilter: Date | null
  setDateFilter: (date: Date | null) => void
}

const statusFiltersArray: { label: string; value: UplinkStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Pausados", value: "paused" },
  { label: "Degradados", value: "degraded" },
]

function formatCapacity(client: UplinkClient) {
  const committed = client.committedMbps ?? client.billing.committedMbps ?? 0
  const burst = client.burstMbps ?? client.billing.burstMbps ?? 0
  return `${committed} / ${burst} Mbps`
}

function healthFromClient(client: UplinkClient): "ok" | "degraded" {
  if (client.status === "degraded") return "degraded"
  return computeHealth(client.monitoring)
}

export function UplinkClientTable({
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
}: UplinkClientTableProps) {
  const defaultColumns = ["customer", "carrier", "type", "capacity", "pops", "health", "billing"]
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [isTableLoading, setIsTableLoading] = useState(true)

  const columnOptions = [
    { keyId: "customer", label: "Cliente ISP" },
    { keyId: "carrier", label: "Carrier" },
    { keyId: "type", label: "Tipo" },
    { keyId: "capacity", label: "Capacidad" },
    { keyId: "pops", label: "POPs" },
    { keyId: "health", label: "Salud" },
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

  const columns: ColumnDef<UplinkClient>[] = [
    {
      id: "customer",
      header: "Cliente ISP",
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id
        return isRefreshLoading ? (
          <div className="flex flex-col gap-2 w-full">
            <div className="h-4 bg-zinc-800/60 rounded w-44 animate-pulse" />
            <div className="h-3 bg-zinc-800/40 rounded w-28 animate-pulse" />
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{client.customerName}</div>
            <div className="text-[13px] text-zinc-500 mt-0.5">{client.email}</div>
          </div>
        )
      },
    },
    {
      id: "carrier",
      header: "Carrier",
      cell: (client) => (
        <span className="text-sm text-zinc-300 font-medium">{upstreamCarrierLabels[client.upstreamCarrier]}</span>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      cell: (client) => <span className="text-sm text-zinc-300">{formatUplinkType(client.uplinkType, client.handoff)}</span>,
    },
    {
      id: "capacity",
      header: "Capacidad",
      cell: (client) => <span className="text-sm md:text-base font-medium text-zinc-200 tracking-tight">{formatCapacity(client)}</span>,
    },
    {
      id: "pops",
      header: "POP A -> POP B",
      hiddenOnMobile: true,
      cell: (client) => (
        <span className="text-sm text-zinc-300">
          {(client.popA ?? "N/A")} {"->"} {(client.popB ?? "N/A")}
        </span>
      ),
    },
    {
      id: "health",
      header: "Salud",
      cell: (client) => {
        const health = healthFromClient(client)
        const healthLabel = health === "ok" ? "OK" : "Degradado"
        const healthColor =
          health === "ok"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        return <StatusBadge label={healthLabel} colorClass={healthColor} dot pulse={health === "degraded"} />
      },
    },
    {
      id: "billing",
      header: "Cobro",
      cell: (client) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-200 font-medium">{formatBillingSummary(client.billing)}</span>
          {client.billing.status === "paused" && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-400">
              Paused
            </span>
          )}
        </div>
      ),
    },
  ]

  const renderActions = (client: UplinkClient) => {
    const isPausedLoading = loadingActionId === client.id
    const isRefreshLoading = refreshingId === client.id
    const isAnyActionLoading = isPausedLoading || isRefreshLoading
    const isPaused = client.status === "paused"

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
              isRefreshLoading ? "animate-spin repeat-[1] animation-duration-[800ms] [animation-timing-function:ease-out]" : ""
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
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Directorio Uplink</h2>
          <p className="text-sm text-zinc-400 mt-1">Gestiona enlaces de transporte/backhaul entre POPs y carriers.</p>
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
            placeholder="Buscar uplink..."
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
                  setStatusFilter(keys[0] as UplinkStatus | "all")
                }
              }}
            />

            <ModernDatePicker value={dateFilter} onChange={setDateFilter} placeholder="Alta" />

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

      <DataTable<UplinkClient>
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
          debouncedQuery ? `No se encontraron resultados para "${debouncedQuery}".` : "Ningún uplink encontrado con el estado seleccionado."
        }
        footer={
          <TablePagination
            totalItems={clients.length}
            filteredItems={filteredClients.length}
            itemName="uplinks"
            isLoading={isTableLoading}
            currentPage={1}
            totalPages={1}
          />
        }
      />
    </>
  )
}
