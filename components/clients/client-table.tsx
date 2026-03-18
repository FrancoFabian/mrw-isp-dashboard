"use client"

import React, { useState, useEffect } from 'react';
import type { Client, ClientStatus } from "@/types/client"
import { clientStatusLabels, clientStatusColors } from "@/types/client"
import { mockPlans } from "@/mocks/plans"
import { Eye, PauseCircle, PlayCircle, RefreshCw, ArrowRightLeft, Plus } from 'lucide-react';
import { ModernSelectTailwind } from "@/components/ui/selection-modern";
import { ModernDatePicker } from "@/components/ui/date-picker-modern";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSearch } from "@/components/ui/table-search";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusBadge } from "@/components/ui/status-badge";

interface ClientTableProps {
  clients: Client[]
  filteredClients: Client[]
  onSelectClient: (client: Client) => void
  onCreateClient: () => void
  selectedClientId: string | null

  // Search and Filter props from parent
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedQuery: string
  isSearching: boolean
  statusFilter: ClientStatus | "all"
  setStatusFilter: (filter: ClientStatus | "all") => void
  dateFilter: Date | null
  setDateFilter: (date: Date | null) => void
}

const statusFiltersArray: { label: string; value: ClientStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Suspendidos", value: "suspended" },
  { label: "En riesgo", value: "at_risk" },
]

// Función nativa para formatear fechas sin dependencias externas
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
  } catch {
    return dateString
  }
};

function getPlanName(planId: string): string {
  const plan = mockPlans.find((p) => p.id === planId)
  return plan ? plan.name : "N/A"
}

function getPlanPrice(planId: string): number {
  const plan = mockPlans.find((p) => p.id === planId)
  return plan ? plan.price : 0
}

export function ClientTable({
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
  setDateFilter
}: ClientTableProps) {
  const defaultColumns = ['client', 'plan', 'status', 'cutoff', 'monthly'];
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns);

  const columnOptions = [
    { keyId: 'client', label: 'Cliente' },
    { keyId: 'plan', label: 'Plan' },
    { keyId: 'status', label: 'Estado' },
    { keyId: 'cutoff', label: 'Corte' },
    { keyId: 'monthly', label: 'Mensualidad' },
  ];

  // Local state for actions to simulate loading like the example
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTableLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleClientStatus = (clientId: string) => {
    setLoadingActionId(clientId);
    setTimeout(() => {
      setLoadingActionId(null);
    }, 1500);
  };

  const refreshClientData = (clientId: string) => {
    setRefreshingId(clientId);
    setTimeout(() => {
      setRefreshingId(null);
    }, 1500);
  };

  // Column definitions for DataTable
  const columns: ColumnDef<Client>[] = [
    {
      id: 'client',
      header: 'Cliente',
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id;
        return isRefreshLoading ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800/60 animate-pulse shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 bg-zinc-800/60 rounded w-32 animate-pulse" />
              <div className="h-3 bg-zinc-800/40 rounded w-48 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 text-sm font-semibold text-zinc-400 shrink-0">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                {client.firstName} {client.lastName}
              </div>
              <div className="text-[13px] text-zinc-500 mt-0.5">
                {client.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'plan',
      header: 'Plan',
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id;
        return isRefreshLoading ? (
          <div className="h-4 bg-zinc-800/60 rounded w-16 animate-pulse" />
        ) : (
          <span className="text-sm text-zinc-300 font-medium">{getPlanName(client.planId)}</span>
        );
      },
    },
    {
      id: 'status',
      header: 'Estado',
      cell: (client) => {
        const isAnyActionLoading = loadingActionId === client.id || refreshingId === client.id;
        return isAnyActionLoading ? (
          <div className="h-6 bg-zinc-800/60 rounded-md w-20 animate-pulse" />
        ) : (
          <StatusBadge
            label={clientStatusLabels[client.status]}
            colorClass={clientStatusColors[client.status]}
            dot
            pulse={client.status === 'at_risk'}
          />
        );
      },
    },
    {
      id: 'cutoff',
      header: 'Corte',
      hiddenOnMobile: true,
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id;
        return isRefreshLoading ? (
          <div className="h-4 bg-zinc-800/60 rounded w-24 animate-pulse" />
        ) : (
          <div className="text-sm text-zinc-300 font-medium">
            {formatDate(client.cutoffDate)}
          </div>
        );
      },
    },
    {
      id: 'monthly',
      header: 'Mensualidad',
      cell: (client) => {
        const isRefreshLoading = refreshingId === client.id;
        return isRefreshLoading ? (
          <div className="h-5 bg-zinc-800/60 rounded w-16 animate-pulse" />
        ) : (
          <div className="text-sm md:text-base font-medium text-zinc-200 tracking-tight">${getPlanPrice(client.planId).toLocaleString()}</div>
        );
      },
    },
  ];

  const renderActions = (client: Client) => {
    const isPausedLoading = loadingActionId === client.id;
    const isRefreshLoading = refreshingId === client.id;
    const isAnyActionLoading = isPausedLoading || isRefreshLoading;
    const isPaused = client.status === 'suspended';

    return (
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onSelectClient(client); }}
          className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 p-1 rounded hover:bg-zinc-800/50"
          disabled={isAnyActionLoading}
          title="Ver detalles"
          aria-label="Ver detalles"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleClientStatus(client.id); }}
          disabled={isAnyActionLoading}
          aria-label={isPaused ? "Reactivar" : "Pausar servicio"}
          className={`transition-colors flex items-center justify-center p-1 rounded hover:bg-zinc-800/50 ${isPausedLoading ? 'text-blue-500'
            : isPaused ? 'text-zinc-500 hover:text-emerald-400'
              : 'text-zinc-500 hover:text-amber-400'
            }`}
          title={isPaused ? "Reactivar" : "Pausar servicio"}
        >
          <span className={`transition-all duration-150 ease-in-out motion-reduce:transition-none flex items-center justify-center ${isPausedLoading ? 'opacity-40 scale-75' : 'opacity-100 scale-100'
            }`}>
            {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
          </span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); refreshClientData(client.id); }}
          disabled={isAnyActionLoading}
          aria-label="Recargar datos"
          className={`transition-colors flex items-center justify-center p-1 rounded hover:bg-zinc-800/50 ${isRefreshLoading ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          title="Recargar datos"
        >
          <RefreshCw
            size={16}
            className={isRefreshLoading ? "animate-spin repeat-[1] animation-duration-[800ms] [animation-timing-function:ease-out]" : ""}
          />
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="mb-6 space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Directorio de Clientes</h2>
          <p className="text-sm text-zinc-400 mt-1">Gestiona el estado y la facturación de tus usuarios.</p>
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
            placeholder="Buscar cliente..."
            isSearching={isSearching}
            disabled={isTableLoading}
          />

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
            <ModernSelectTailwind
              items={statusFiltersArray.map(f => ({ keyId: f.value, label: f.label }))}
              width="auto"
              placeholder="Estado"
              defaultSelectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                if (keys.length > 0) {
                  setStatusFilter(keys[0] as ClientStatus | "all");
                }
              }}
            />

            <ModernDatePicker
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="Corte"
            />

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

      <DataTable<Client>
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
            : "Ningún cliente encontrado con el estado seleccionado."
        }
        footer={
          <TablePagination
            totalItems={clients.length}
            filteredItems={filteredClients.length}
            itemName="clientes"
            isLoading={isTableLoading}
            currentPage={1}
            totalPages={1}
          />
        }
      />
    </>
  )
}
