"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { mockTickets } from "@/mocks/tickets"
import type { TicketStatus, TicketCategory } from "@/types/ticket"
import {
  ticketPriorityLabels,
  ticketPriorityColors,
  ticketStatusLabels,
  ticketStatusColors,
  ticketCategoryLabels,
  ticketCategoryColors,
  ticketChannelLabels,
} from "@/types/ticket"
import { cn } from "@/lib/utils"
import {
  LifeBuoy,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle,
  Archive,
  User,
  Calendar,
  Search,
  AlertTriangle,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  Inbox,
  UserCheck,
} from "lucide-react"

const statusFilters: { label: string; value: TicketStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Nuevos", value: "new" },
  { label: "Abiertos", value: "open" },
  { label: "Esperando", value: "waiting_customer" },
  { label: "En progreso", value: "in_progress" },
  { label: "Resueltos", value: "resolved" },
  { label: "Cerrados", value: "closed" },
]

const categoryFilters: { label: string; value: TicketCategory | "all" }[] = [
  { label: "Todas", value: "all" },
  { label: "Técnico", value: "technical" },
  { label: "Facturación", value: "billing" },
  { label: "Instalación", value: "installation" },
  { label: "General", value: "general" },
]

// Simple SLA check: 2 hours for critical, 4 hours for high, 24 hours for others
function getSLAStatus(ticket: typeof mockTickets[0]) {
  if (ticket.status === "resolved" || ticket.status === "closed") return null
  if (ticket.slaBreachedAt) return "breached"

  const created = new Date(ticket.createdAt).getTime()
  const now = Date.now()
  const hoursElapsed = (now - created) / (1000 * 60 * 60)

  const thresholds = { critical: 2, high: 4, medium: 24, low: 48 }
  const threshold = thresholds[ticket.priority]

  if (hoursElapsed > threshold) return "breached"
  if (hoursElapsed > threshold * 0.75) return "warning"
  return "ok"
}

export default function SupportPage() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTickets = useMemo(() => {
    return mockTickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !t.id.toLowerCase().includes(q) &&
          !t.subject.toLowerCase().includes(q) &&
          !t.clientName.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [statusFilter, categoryFilter, searchQuery])

  const counts = useMemo(() => ({
    new: mockTickets.filter((t) => t.status === "new").length,
    open: mockTickets.filter((t) => t.status === "open").length,
    inProgress: mockTickets.filter((t) => t.status === "in_progress").length,
    waiting: mockTickets.filter((t) => t.status === "waiting_customer").length,
    slaWarning: mockTickets.filter((t) => getSLAStatus(t) === "warning").length,
    slaBreached: mockTickets.filter((t) => getSLAStatus(t) === "breached").length,
  }), [])

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp": return <MessageSquare className="h-3 w-3" />
      case "phone": return <Phone className="h-3 w-3" />
      default: return <Mail className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Soporte y Tickets
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los reportes y solicitudes de tus clientes
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Inbox className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nuevos</p>
            <p className="text-xl font-bold text-foreground">{counts.new}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Abiertos</p>
            <p className="text-xl font-bold text-foreground">{counts.open}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
            <Clock className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">En progreso</p>
            <p className="text-xl font-bold text-foreground">{counts.inProgress}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <UserCheck className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Esperando</p>
            <p className="text-xl font-bold text-foreground">{counts.waiting}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">SLA Riesgo</p>
            <p className="text-xl font-bold text-amber-400">{counts.slaWarning}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">SLA Vencido</p>
            <p className="text-xl font-bold text-red-400">{counts.slaBreached}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por ID, asunto o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Estado:</span>
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="ml-6 text-xs text-muted-foreground">Categoría:</span>
          {categoryFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setCategoryFilter(filter.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                categoryFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No hay tickets que coincidan con los filtros</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const slaStatus = getSLAStatus(ticket)
            return (
              <Link
                key={ticket.id}
                href={`/dashboard/support/${ticket.id}`}
                className="glass-card-hover block p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {ticket.id}
                      </span>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          ticketPriorityColors[ticket.priority]
                        )}
                      >
                        {ticketPriorityLabels[ticket.priority]}
                      </span>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          ticketCategoryColors[ticket.category]
                        )}
                      >
                        {ticketCategoryLabels[ticket.category]}
                      </span>
                      {slaStatus === "warning" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          SLA en riesgo
                        </span>
                      )}
                      {slaStatus === "breached" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                          <AlertTriangle className="h-3 w-3" />
                          SLA vencido
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {ticket.subject}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        ticketStatusColors[ticket.status]
                      )}
                    >
                      {ticketStatusLabels[ticket.status]}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{ticket.clientName}</span>
                  </div>
                  {ticket.assignedToName && (
                    <div className="flex items-center gap-1">
                      <LifeBuoy className="h-3 w-3" />
                      <span>{ticket.assignedToName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {getChannelIcon(ticket.channel)}
                    <span>{ticketChannelLabels[ticket.channel]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{ticket.createdAt.split("T")[0]}</span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Results count */}
      <div className="text-center text-xs text-muted-foreground">
        Mostrando {filteredTickets.length} de {mockTickets.length} tickets
      </div>
    </div>
  )
}

