"use client"

import { useState, useMemo } from "react"
import { mockNodes } from "@/mocks/network"
import type { NodeStatus, Olt, Nap, Onu } from "@/types/network"
import { NodeCard } from "@/components/network/node-card"
import { NetworkKpiCards, AlertsTable } from "@/components/network"
import { EntityTable, type Column } from "@/components/network/EntityTable"
import { StatusPill } from "@/components/network/StatusPill"
import { SignalStrengthBadge } from "@/components/network/SignalStrengthBadge"
import { useNetwork } from "@/stores/network-context"
import { Globe, Wifi, AlertTriangle, WifiOff, Filter, Activity, Box, Server, Radio, Settings, Search } from "lucide-react"
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

const oltColumns: Column<Olt>[] = [
  {
    key: "name",
    header: "Nombre",
    render: (olt) => <span className="font-medium text-foreground">{olt.name}</span>,
    sortable: true,
  },
  {
    key: "vendor",
    header: "Marca / Modelo",
    render: (olt) => (
      <div className="flex flex-col">
        <span className="text-foreground">{olt.vendor}</span>
        <span className="text-xs text-muted-foreground">{olt.model}</span>
      </div>
    ),
    sortable: true,
  },
  {
    key: "mgmtIp",
    header: "IP Gestión",
    render: (olt) => <span className="font-mono text-xs">{olt.mgmtIp}</span>,
    sortable: true,
  },
  {
    key: "status",
    header: "Estado",
    render: (olt) => <StatusPill status={olt.status} />,
    sortable: true,
  },
  {
    key: "ponPortCount",
    header: "Puertos PON",
    render: (olt) => <span>{olt.ponPortCount}</span>,
    sortable: true,
  },
  {
    key: "location",
    header: "Ubicación",
    render: (olt) => <span className="text-muted-foreground">{olt.locationName}</span>,
    sortable: true,
  },
]

const napColumns: Column<Nap>[] = [
  {
    key: "name",
    header: "Nombre",
    render: (nap) => <span className="font-medium text-foreground">{nap.name}</span>,
    sortable: true,
  },
  {
    key: "type",
    header: "Tipo",
    render: (nap) => <span className="capitalize">{nap.type.replace("splitter_", "1:")}</span>,
    sortable: true,
  },
  {
    key: "location",
    header: "Ubicación",
    render: (nap) => <span className="text-muted-foreground">{nap.locationName}</span>,
    sortable: true,
  },
  {
    key: "totalPorts",
    header: "Puertos",
    render: (nap) => <span>{nap.totalPorts} total</span>,
    sortable: true,
  },
  {
    key: "installedAt",
    header: "Instalado",
    render: (nap) => <span className="text-xs text-muted-foreground">{format(new Date(nap.installedAt), "d MMM yyyy", { locale: es })}</span>,
    sortable: true,
  },
]

const onuColumns: Column<Onu>[] = [
  {
    key: "serial",
    header: "Serial / ID",
    render: (onu) => (
      <div className="flex flex-col">
        <span className="font-mono font-medium text-foreground">{onu.serial}</span>
        <span className="text-xs text-muted-foreground">{onu.id}</span>
      </div>
    ),
    sortable: true,
  },
  {
    key: "status",
    header: "Estado",
    render: (onu) => <StatusPill status={onu.status} />,
    sortable: true,
  },
  {
    key: "signal",
    header: "Potencia (RX/TX)",
    render: (onu) => (
      <SignalStrengthBadge rxPowerDbm={onu.rxPowerDbm} txPowerDbm={onu.txPowerDbm} />
    ),
    sortable: true,
  },
  {
    key: "model",
    header: "Modelo",
    render: (onu) => (
      <div className="flex flex-col">
        <span>{onu.vendor}</span>
        <span className="text-xs text-muted-foreground">{onu.model}</span>
      </div>
    ),
    sortable: true,
  },
  {
    key: "lastSeen",
    header: "Última vez",
    render: (onu) => <span className="text-xs text-muted-foreground">{format(new Date(onu.lastSeen), "d MMM HH:mm", { locale: es })}</span>,
    sortable: true,
  },
]


export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("overview")
  const [statusFilter, setStatusFilter] = useState<NodeStatus | "all">("all")
  const { stats, olts, naps, onus } = useNetwork()

  const filteredNodes = useMemo(() => {
    if (statusFilter === "all") return mockNodes
    return mockNodes.filter((n) => n.status === statusFilter)
  }, [statusFilter])

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
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {viewTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
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
          <EntityTable
            data={olts}
            columns={oltColumns}
            keyExtractor={(item) => item.id}
            emptyMessage="No hay OLTs registrados"
          />
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
          <EntityTable
            data={naps}
            columns={napColumns}
            keyExtractor={(item) => item.id}
            emptyMessage="No hay NAPs registrados"
          />
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
          <EntityTable
            data={onus}
            columns={onuColumns}
            keyExtractor={(item) => item.id}
            emptyMessage="No hay ONUs registradas"
          />
        </div>
      )}
    </div>
  )
}
