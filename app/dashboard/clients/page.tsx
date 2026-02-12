"use client"

import { useState, useMemo } from "react"
import { mockClients } from "@/mocks/clients"
import type { Client, ClientStatus } from "@/types/client"
import { clientStatusLabels } from "@/types/client"
import { ClientTable } from "@/components/clients/client-table"
import { ClientDetail } from "@/components/clients/client-detail"
import { Users, Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

const statusFilters: { label: string; value: ClientStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Suspendidos", value: "suspended" },
  { label: "En riesgo", value: "at_risk" },
]

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all")

  const filteredClients = useMemo(() => {
    let result = mockClients

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
      )
    }

    return result
  }, [statusFilter, searchQuery])

  const activeCount = mockClients.filter((c) => c.status === "active").length
  const suspendedCount = mockClients.filter((c) => c.status === "suspended").length
  const atRiskCount = mockClients.filter((c) => c.status === "at_risk").length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Gestion de clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra la informacion y servicios de tus clientes
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 sm:h-10 sm:w-10">
            <Users className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">Activos</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">{activeCount}</p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 sm:h-10 sm:w-10">
            <Users className="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">Suspendidos</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">{suspendedCount}</p>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 sm:h-10 sm:w-10">
            <Users className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">En riesgo</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">{atRiskCount}</p>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-72"
          />
        </div>
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
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={cn(selectedClient ? "lg:col-span-2" : "lg:col-span-3")}>
          <ClientTable
            clients={filteredClients}
            onSelectClient={setSelectedClient}
            selectedClientId={selectedClient?.id ?? null}
          />
        </div>
        {selectedClient && (
          <div className="lg:col-span-1">
            <ClientDetail
              client={selectedClient}
              onClose={() => setSelectedClient(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
