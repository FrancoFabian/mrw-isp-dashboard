"use client"

import { useState, useMemo } from "react"
import { mockNodes } from "@/mocks/network"
import type { NodeStatus, Olt, Nap, Onu } from "@/types/network"
import { NodeCard } from "@/components/network/node-card"
import { NetworkKpiCards, AlertsTable } from "@/components/network"
import { StatusPill } from "@/components/network/StatusPill"
import { SignalStrengthBadge } from "@/components/network/SignalStrengthBadge"
import { useNetwork } from "@/stores/network-context"
import { Globe, Wifi, AlertTriangle, WifiOff, Filter, Activity, Box, Server, Radio, Settings, Search } from "lucide-react"
import { ModernTabs } from "@/components/ui/tabs-modern"
import { TablePagination } from "@/components/ui/table-pagination"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { TableSearch } from "@/components/ui/table-search"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type ViewTab = "overview" | "nodes" | "olts" | "naps" | "onus"

const statusFilters: { label: string; value: NodeStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "En linea", value: "online" },
  { label: "Degradado", value: "degraded" },
  { label: "Sin conexion", value: "offline" },
]

const viewTabs: { label: string; value: ViewTab; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Resumen GPON", value: "overview", icon: Activity },
  { label: "Nodos legacy", value: "nodes", icon: Radio },
  { label: "OLTs", value: "olts", icon: Server },
  { label: "NAPs", value: "naps", icon: Box },
  { label: "ONUs", value: "onus", icon: Wifi },
]

const oltColumns: ColumnDef<Olt>[] = [
  {
    id: "name",
    header: "Nombre",
    cell: (row) => <span className="text-sm font-medium text-zinc-200">{row.name}</span>,
  },
  {
    id: "vendor_model",
    header: "Marca / Modelo",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-zinc-200">{row.vendor}</span>
        <span className="text-[13px] text-zinc-500">{row.model}</span>
      </div>
    ),
  },
  {
    id: "mgmtIp",
    header: "IP Gestión",
    cell: (row) => <span className="font-mono text-[13px] text-zinc-400">{row.mgmtIp}</span>,
  },
  {
    id: "status",
    header: "Estado",
    cell: (row) => <StatusPill status={row.status} />,
  },
  {
    id: "ponPortCount",
    header: "Puertos PON",
    cell: (row) => <span className="text-sm font-medium text-zinc-200">{row.ponPortCount}</span>,
  },
  {
    id: "locationName",
    header: "Ubicación",
    cell: (row) => <span className="text-[13px] text-zinc-400">{row.locationName}</span>,
  },
]

const napColumns: ColumnDef<Nap>[] = [
  {
    id: "name",
    header: "Nombre",
    cell: (row) => <span className="text-sm font-medium text-zinc-200">{row.name}</span>,
  },
  {
    id: "type",
    header: "Tipo",
    cell: (row) => <span className="text-sm font-medium text-zinc-200 capitalize">{row.type.replace("splitter_", "1:")}</span>,
  },
  {
    id: "locationName",
    header: "Ubicación",
    cell: (row) => <span className="text-[13px] text-zinc-400">{row.locationName}</span>,
  },
  {
    id: "totalPorts",
    header: "Puertos",
    cell: (row) => <span className="text-sm font-medium text-zinc-200">{row.totalPorts} total</span>,
  },
  {
    id: "installedAt",
    header: "Instalado",
    cell: (row) => <span className="text-[13px] text-zinc-500">{format(new Date(row.installedAt), "d MMM yyyy", { locale: es })}</span>,
  },
]

const onuColumns: ColumnDef<Onu>[] = [
  {
    id: "serial_id",
    header: "Serial / ID",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-mono text-sm font-medium text-zinc-200">{row.serial}</span>
        <span className="text-[13px] text-zinc-500">{row.id}</span>
      </div>
    ),
  },
  {
    id: "status",
    header: "Estado",
    cell: (row) => <StatusPill status={row.status} />,
  },
  {
    id: "signal",
    header: "Potencia (RX/TX)",
    cell: (row) => (
      <SignalStrengthBadge rxPowerDbm={row.rxPowerDbm} txPowerDbm={row.txPowerDbm} />
    ),
  },
  {
    id: "vendor_model",
    header: "Modelo",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-zinc-200">{row.vendor}</span>
        <span className="text-[13px] text-zinc-500">{row.model}</span>
      </div>
    ),
  },
  {
    id: "lastSeen",
    header: "Última vez",
    cell: (row) => <span className="text-[13px] text-zinc-500">{format(new Date(row.lastSeen), "d MMM HH:mm", { locale: es })}</span>,
  },
]


export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("overview")
  const [statusFilter, setStatusFilter] = useState<NodeStatus | "all">("all")
  const [oltSearch, setOltSearch] = useState("")
  const [napSearch, setNapSearch] = useState("")
  const [onuSearch, setOnuSearch] = useState("")
  const [oltPage, setOltPage] = useState(1)
  const [napPage, setNapPage] = useState(1)
  const [onuPage, setOnuPage] = useState(1)
  const ITEMS_PER_PAGE = 20
  const { stats, olts, naps, onus } = useNetwork()

  // Tab 2 (Nodes) filtering
  const filteredNodes = useMemo(() => {
    if (statusFilter === "all") return mockNodes
    return mockNodes.filter((n) => n.status === statusFilter)
  }, [statusFilter])

  // Table filtering
  const filteredOlts = useMemo(() => {
    if (!oltSearch) return olts
    const q = oltSearch.toLowerCase()
    return olts.filter(o => o.name.toLowerCase().includes(q) || o.mgmtIp.includes(q))
  }, [olts, oltSearch])

  const filteredNaps = useMemo(() => {
    if (!napSearch) return naps
    const q = napSearch.toLowerCase()
    return naps.filter(n => n.name.toLowerCase().includes(q) || n.locationName.toLowerCase().includes(q))
  }, [naps, napSearch])

  const filteredOnus = useMemo(() => {
    if (!onuSearch) return onus
    const q = onuSearch.toLowerCase()
    return onus.filter(o => o.serial.toLowerCase().includes(q) || o.id.toLowerCase().includes(q))
  }, [onus, onuSearch])

  // Pagination slicing
  const pagedOlts = useMemo(() => {
    const start = (oltPage - 1) * ITEMS_PER_PAGE
    return filteredOlts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredOlts, oltPage])

  const pagedNaps = useMemo(() => {
    const start = (napPage - 1) * ITEMS_PER_PAGE
    return filteredNaps.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredNaps, napPage])

  const pagedOnus = useMemo(() => {
    const start = (onuPage - 1) * ITEMS_PER_PAGE
    return filteredOnus.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredOnus, onuPage])

  const onlineCount = mockNodes.filter((n) => n.status === "online").length
  const degradedCount = mockNodes.filter((n) => n.status === "degraded").length
  const offlineCount = mockNodes.filter((n) => n.status === "offline").length
  const totalClients = mockNodes.reduce((sum, n) => sum + n.clients, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Red y topología
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de red GPON/FTTH y equipos de red
          </p>
        </div>
        <Link
          href="/dashboard/network/provisioning"
          className="hidden sm:flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Provisioning
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border pb-3">
        <ModernTabs
          tabs={viewTabs.map((tab) => ({
            id: tab.value,
            label: (
              <div className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </div>
            )
          }))}
          value={activeTab}
          onChange={(id) => setActiveTab(id as ViewTab)}
        />
      </div>

      {/* GPON Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* GPON KPIs */}
          <NetworkKpiCards />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button onClick={() => setActiveTab("olts")} className="glass-card-hover p-4 text-left w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{olts.length}</p>
                  <p className="text-xs text-muted-foreground">OLTs</p>
                </div>
              </div>
            </button>
            <button onClick={() => setActiveTab("naps")} className="glass-card-hover p-4 text-left w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Box className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{naps.length}</p>
                  <p className="text-xs text-muted-foreground">NAPs</p>
                </div>
              </div>
            </button>
            <button onClick={() => setActiveTab("onus")} className="glass-card-hover p-4 text-left w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Wifi className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{onus.length}</p>
                  <p className="text-xs text-muted-foreground">ONUs</p>
                </div>
              </div>
            </button>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.criticalAlerts}</p>
                  <p className="text-xs text-muted-foreground">Alertas críticas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Alertas activas</h2>
              <Link href="/dashboard/network/alerts" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            <AlertsTable limit={5} />
          </div>
        </div>
      )}

      {/* Legacy Nodes Tab */}
      {activeTab === "nodes" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                <Globe className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground">Total nodos</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {mockNodes.length}
                </p>
              </div>
            </div>
            <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 sm:h-10 sm:w-10">
                <Wifi className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground">En linea</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {onlineCount}
                </p>
              </div>
            </div>
            <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 sm:h-10 sm:w-10">
                <AlertTriangle className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground">Problemas</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {degradedCount}
                </p>
              </div>
            </div>
            <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 sm:h-10 sm:w-10">
                <WifiOff className="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground">Sin conexion</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {offlineCount}
                </p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    statusFilter === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Node grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {filteredNodes.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}

      {/* OLTs Table Tab */}
      {activeTab === "olts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Listado de OLTs</h2>
            <Link
              href="/dashboard/network/olts/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Nuevo OLT
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <DataTable
              data={pagedOlts}
              columns={oltColumns}
              getRowId={(item) => item.id}
              emptyMessage="No hay OLTs registrados"
              header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <TableSearch
                    value={oltSearch}
                    onChange={(v) => { setOltSearch(v); setOltPage(1); }}
                    placeholder="Buscar OLT (Nombre o IP)..."
                  />
                </div>
              }
              footer={
                <TablePagination
                  totalItems={olts.length}
                  filteredItems={filteredOlts.length}
                  currentPage={oltPage}
                  totalPages={Math.ceil(filteredOlts.length / ITEMS_PER_PAGE)}
                  onPageChange={setOltPage}
                  itemName="OLTs"
                />
              }
            />
          </div>
        </div>
      )}

      {/* NAPs Table Tab */}
      {activeTab === "naps" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Listado de NAPs</h2>
            <Link
              href="/dashboard/network/naps/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Nuevo NAP
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <DataTable
              data={pagedNaps}
              columns={napColumns}
              getRowId={(item) => item.id}
              emptyMessage="No hay NAPs registrados"
              header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <TableSearch
                    value={napSearch}
                    onChange={(v) => { setNapSearch(v); setNapPage(1); }}
                    placeholder="Buscar NAP por nombre o ubicación..."
                  />
                </div>
              }
              footer={
                <TablePagination
                  totalItems={naps.length}
                  filteredItems={filteredNaps.length}
                  currentPage={napPage}
                  totalPages={Math.ceil(filteredNaps.length / ITEMS_PER_PAGE)}
                  onPageChange={setNapPage}
                  itemName="NAPs"
                />
              }
            />
          </div>
        </div>
      )}

      {/* ONUs Table Tab */}
      {activeTab === "onus" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Listado de ONUs</h2>
            <Link
              href="/dashboard/network/provisioning"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Provisionar ONU
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <DataTable
              data={pagedOnus}
              columns={onuColumns}
              getRowId={(item) => item.id}
              emptyMessage="No hay ONUs registradas"
              header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <TableSearch
                    value={onuSearch}
                    onChange={(v) => { setOnuSearch(v); setOnuPage(1); }}
                    placeholder="Buscar ONU por Serial o ID..."
                  />
                </div>
              }
              footer={
                <TablePagination
                  totalItems={onus.length}
                  filteredItems={filteredOnus.length}
                  currentPage={onuPage}
                  totalPages={Math.ceil(filteredOnus.length / ITEMS_PER_PAGE)}
                  onPageChange={setOnuPage}
                  itemName="ONUs"
                />
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
