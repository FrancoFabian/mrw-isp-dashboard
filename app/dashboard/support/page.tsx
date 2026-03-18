"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { mockTickets } from "@/mocks/tickets"
import type { TicketStatus, TicketCategory, TicketPriority } from "@/types/ticket"
import {
  ticketStatusLabels,
  ticketCategoryLabels,
  ticketChannelLabels,
} from "@/types/ticket"
import {
  Search,
  LayoutGrid,
  List,
  MessageCircle,
  Phone,
  Globe,
  AlertCircle,
  Clock,
  MoreVertical,
  Plus,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Mail,
  User,
  Calendar,
  ExternalLink,
  LifeBuoy
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ModernTabs } from "@/components/ui/tabs-modern"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { TablePagination } from "@/components/ui/table-pagination"
import { StatusBadge } from "@/components/ui/status-badge"

// --- LOGICA ORIGINAL DE SLA ---
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

// --- UTILIDADES VISUALES (KABAN) ---
const getPriorityStyles = (priority: TicketPriority) => {
  const styles = {
    'critical': 'bg-red-950 text-red-400 border-red-900',
    'high': 'bg-yellow-950 text-yellow-500 border-yellow-900',
    'medium': 'bg-blue-950 text-blue-400 border-blue-900',
    'low': 'bg-zinc-800 text-zinc-300 border-zinc-700',
  }
  return styles[priority] || styles['low']
}

const getCategoryStyles = (category: TicketCategory) => {
  const styles = {
    'technical': 'bg-cyan-950 text-cyan-400 border-cyan-900',
    'billing': 'bg-emerald-950 text-emerald-400 border-emerald-900',
    'installation': 'bg-orange-950 text-orange-400 border-orange-900',
    'general': 'bg-zinc-800 text-zinc-300 border-zinc-700',
  }
  return styles[category] || styles['general']
}

const getChannelIcon = (channel: string, size = 14) => {
  switch (channel) {
    case 'whatsapp': return <MessageCircle size={size} className="text-emerald-400" />
    case 'phone': return <Phone size={size} className="text-blue-400" />
    case 'portal': return <Globe size={size} className="text-purple-400" />
    default: return <Mail size={size} className="text-zinc-400" />
  }
}

const getInitials = (name?: string) => {
  if (!name || name === 'Sistema' || name === 'Portal') return 'PR'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default function SupportPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [filterCategory, setFilterCategory] = useState<TicketCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [zoom, setZoom] = useState(100)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Pagination
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  const filteredTickets = useMemo(() => {
    return mockTickets.filter(t => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
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
  }, [filterCategory, searchQuery])

  // Reset pagination on filter change
  useMemo(() => {
    setPage(1)
  }, [filterCategory, searchQuery])

  // Slice tickets based on page
  const pagedTickets = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filteredTickets.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTickets, page])

  const stats = useMemo(() => ({
    nuevos: mockTickets.filter(t => t.status === 'new').length,
    abiertos: mockTickets.filter(t => t.status === 'open').length,
    enProgreso: mockTickets.filter(t => t.status === 'in_progress').length,
    slaVencido: mockTickets.filter(t => getSLAStatus(t) === 'breached' || getSLAStatus(t) === 'warning').length,
  }), [])

  const z = useMemo(() => {
    if (zoom <= 60) return {
      colWidth: 'w-[75vw] sm:w-[220px] md:w-56',
      title: 'text-xs',
      desc: 'text-[10px] line-clamp-1 mb-2',
      tag: 'text-[8px] px-1.5 py-0',
      avatar: 'w-5 h-5 text-[9px]',
      iconSize: 12,
      pad: 'p-3',
      gap: 'gap-3',
      headerText: 'text-xs',
      footerText: 'text-[9px]',
    }
    if (zoom <= 80) return {
      colWidth: 'w-[80vw] sm:w-[260px] md:w-64',
      title: 'text-[13px]',
      desc: 'text-[11px] line-clamp-2 mb-3',
      tag: 'text-[9px] px-2 py-0.5',
      avatar: 'w-6 h-6 text-[10px]',
      iconSize: 14,
      pad: 'p-3.5',
      gap: 'gap-4',
      headerText: 'text-sm',
      footerText: 'text-[10px]',
    }
    return { // 100% 
      colWidth: 'w-[85vw] sm:w-[300px] md:w-80',
      title: 'text-sm',
      desc: 'text-xs line-clamp-2 mb-4',
      tag: 'text-[10px] px-2 py-0.5',
      avatar: 'w-6 h-6 text-[10px]',
      iconSize: 16,
      pad: 'p-4',
      gap: 'gap-4 md:gap-6',
      headerText: 'text-sm',
      footerText: 'text-[10px]',
    }
  }, [zoom])

  const kanbanColumns: { id: TicketStatus; label: string; color: string }[] = [
    { id: 'new', label: 'Nuevos', color: 'bg-purple-500' },
    { id: 'open', label: 'Abiertos', color: 'bg-blue-500' },
    { id: 'in_progress', label: 'En progreso', color: 'bg-cyan-500' },
    { id: 'waiting_customer', label: 'Esperando', color: 'bg-amber-500' },
    { id: 'resolved', label: 'Resueltos', color: 'bg-emerald-500' },
  ]

  const categoryOptions: { label: string; value: TicketCategory | 'all' }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Técnico', value: 'technical' },
    { label: 'Facturación', value: 'billing' },
    { label: 'Instalación', value: 'installation' },
    { label: 'General', value: 'general' },
  ]

  // DataTable columns for List View
  const listColumns: ColumnDef<typeof mockTickets[0]>[] = [
    {
      id: "ticket",
      header: "Ticket",
      cell: (ticket) => (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border border-[#1E1E24] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm" title={`Cliente: ${ticket.clientName}`}>
              {getInitials(ticket.clientName)}
            </div>
            {ticket.assignedToName && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border border-[#1E1E24] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm" title={`Agente: ${ticket.assignedToName}`}>
                {getInitials(ticket.assignedToName)}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              {ticket.subject}
              <span className="text-xs font-mono text-zinc-500 bg-[#121212] border border-white/5 px-1.5 rounded-sm">
                {ticket.id}
              </span>
            </div>
            <div className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
              {ticket.description}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "category",
      header: "Categoría",
      cell: (ticket) => (
        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border", getCategoryStyles(ticket.category))}>
          {ticketCategoryLabels[ticket.category]}
        </span>
      )
    },
    {
      id: "priority",
      header: "Prioridad",
      cell: (ticket) => {
        const sla = getSLAStatus(ticket)
        return (
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border", getPriorityStyles(ticket.priority))}>
              {ticket.priority === 'critical' ? 'Crítica' : ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
            {(sla === 'warning' || sla === 'breached') && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border",
                sla === 'breached' ? "bg-red-950 text-red-400 border-red-900" : "bg-amber-950 text-amber-400 border-amber-900"
              )}>
                <AlertTriangle className="h-3 w-3" />
                {sla === 'breached' ? 'Vencido' : 'Riesgo'}
              </span>
            )}
          </div>
        )
      }
    },
    {
      id: "status",
      header: "Estado",
      cell: (ticket) => (
        <StatusBadge
          label={ticketStatusLabels[ticket.status]}
          colorClass={
            ticket.status === 'new' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
              ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                ticket.status === 'in_progress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  ticket.status === 'waiting_customer' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }
          dot={ticket.status !== 'resolved' && ticket.status !== 'closed'}
        />
      )
    },
    {
      id: "date",
      header: "Tiempo",
      cell: (ticket) => {
        const d = new Date(ticket.createdAt)
        const monthName = format(d, 'MMMM', { locale: es })
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

        return (
          <span className="text-[14px] font-medium text-zinc-200 whitespace-nowrap">
            {d.getDate()} {capitalizedMonth} {d.getFullYear()}
          </span>
        )
      }
    }
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden font-sans">
      {/* HEADER & METRICS */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Soporte y Tickets
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gestiona los reportes y solicitudes de tus clientes
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar snap-x snap-mandatory xl:w-auto">
          {[
            { label: 'Nuevos', count: stats.nuevos, icon: <AlertCircle size={16} className="text-purple-400" />, bg: 'bg-purple-500/10' },
            { label: 'Abiertos', count: stats.abiertos, icon: <AlertCircle size={16} className="text-blue-400" />, bg: 'bg-blue-500/10' },
            { label: 'En Progreso', count: stats.enProgreso, icon: <Clock size={16} className="text-cyan-400" />, bg: 'bg-cyan-500/10' },
            { label: 'SLA Riesgo/Vencido', count: stats.slaVencido, icon: <AlertTriangle size={16} className="text-red-400" />, bg: 'bg-red-500/10', alert: true },
          ].map((stat, i) => (
            <div key={i} className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-[#121212] min-w-[150px] snap-start",
              stat.alert && 'border-red-900/50'
            )}>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* SEARCH AND VIEW TOGGLES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/10 pb-4 shrink-0">

        {/* Zoom Controls (Desktop only) */}
        <div className="hidden lg:flex items-center bg-[#121212] border border-white/5 rounded-lg h-9">
          <button
            onClick={() => setZoom(prev => Math.max(60, prev - 20))}
            disabled={zoom === 60}
            className="h-full px-2.5 text-zinc-500 hover:text-white hover:bg-[#1e1e1e] rounded-l-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 flex items-center justify-center"
            title="Alejar"
          >
            <ZoomOut size={14} />
          </button>
          <div className="w-px h-4 bg-white/10"></div>
          <span className="text-[11px] font-medium text-zinc-300 w-11 text-center select-none">
            {zoom}%
          </span>
          <div className="w-px h-4 bg-white/10"></div>
          <button
            onClick={() => setZoom(prev => Math.min(100, prev + 20))}
            disabled={zoom === 100}
            className="h-full px-2.5 text-zinc-500 hover:text-white hover:bg-[#1e1e1e] rounded-r-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 flex items-center justify-center"
            title="Acercar"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        {/* Search & Layout Toggles */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto ml-auto">
          <div className="relative w-full sm:flex-1 sm:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Buscar por ID o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-white/5 text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10 mx-1"></div>

          <ModernTabs
            tabs={[
              { id: "kanban", label: <div className="flex items-center gap-2"><LayoutGrid size={16} /><span>Kanban</span></div> },
              { id: "list", label: <div className="flex items-center gap-2"><List size={16} /><span>Lista</span></div> }
            ]}
            value={viewMode}
            onChange={(id) => setViewMode(id as 'kanban' | 'list')}
          />
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar w-full snap-x snap-mandatory shrink-0">
        {categoryOptions.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap snap-start",
              filterCategory === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-[#121212] text-zinc-400 border-white/5 hover:bg-[#1e1e1e]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-h-0 relative -mx-4 px-4 pb-4 sm:-mx-6 sm:px-6">

        {viewMode === 'kanban' ? (
          /* KANBAN BOARD */
          <div className={cn("h-full flex overflow-x-auto overflow-y-hidden noc-scrollbar snap-x snap-mandatory md:snap-none transition-all duration-300 pb-2", z.gap)}>
            {kanbanColumns.map(column => {
              const columnTickets = filteredTickets.filter(t => t.status === column.id);

              return (
                <div key={column.id} className={cn("shrink-0 flex flex-col snap-center md:snap-align-none transition-all duration-300 h-full", z.colWidth)}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", column.color)} />
                      <h3 className={cn("font-medium text-white transition-all duration-300", z.headerText)}>
                        {column.label}
                      </h3>
                      <span className="text-xs text-zinc-500 bg-[#121212] border border-white/5 px-2 py-0.5 rounded-full">
                        {columnTickets.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Body / Cards */}
                  <div className="flex-1 overflow-y-auto noc-scrollbar flex flex-col gap-3 pb-8 pr-2">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={cn("bg-gradient-to-b from-[#111111] to-black border border-white/5 rounded-xl shadow-lg shadow-black/80 flex flex-col", z.pad)}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex gap-1.5">
                              <div className={cn("bg-white/5 rounded-full animate-pulse w-12 h-4")} />
                              <div className={cn("bg-white/5 rounded-full animate-pulse w-16 h-4")} />
                            </div>
                          </div>
                          <div className="mb-0">
                            <div className={cn("bg-white/5 rounded animate-pulse w-3/4 mb-2 h-4")} />
                            <div className={cn("bg-white/5 rounded animate-pulse w-full mb-1 h-3")} />
                            <div className={cn("bg-white/5 rounded animate-pulse w-2/3 mb-4 h-3")} />
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                            <div className="flex items-center gap-2">
                              <div className={cn("rounded-full bg-white/5 animate-pulse shrink-0", z.avatar)} />
                              <div className={cn("bg-white/5 rounded animate-pulse w-12 h-3")} />
                            </div>
                            <div className={cn("bg-white/5 rounded animate-pulse w-16 h-5")} />
                          </div>
                        </div>
                      ))
                    ) : (
                      columnTickets.map(ticket => {
                        const sla = getSLAStatus(ticket)
                        return (
                          <Link
                            href={`/dashboard/support/${ticket.id}`}
                            key={ticket.id}
                            className={cn(
                              "bg-gradient-to-b from-[#111111] to-black border border-white/5 rounded-xl cursor-pointer hover:from-[#1a1a1a] hover:to-[#050505] hover:-translate-y-1 shadow-lg shadow-black/80 transition-all duration-300 group block",
                              z.pad
                            )}
                          >
                            {/* Top Row: Tags */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex flex-wrap gap-1.5">
                                <span className={cn("rounded-full font-medium border transition-all duration-300", getPriorityStyles(ticket.priority), z.tag)}>
                                  {ticket.priority === 'critical' ? 'Crítica' : ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                                </span>
                                <span className={cn("rounded-full font-medium border transition-all duration-300", getCategoryStyles(ticket.category), z.tag)}>
                                  {ticketCategoryLabels[ticket.category]}
                                </span>
                                {(sla === 'warning' || sla === 'breached') && (
                                  <span className={cn("flex items-center gap-1 rounded-full font-medium transition-all duration-300",
                                    sla === 'breached' ? "bg-red-950 text-red-400 border-red-900" : "bg-amber-950 text-amber-400 border-amber-900",
                                    z.tag
                                  )}>
                                    <AlertTriangle size={10} /> {sla === 'breached' ? 'Vencido' : 'Riesgo'}
                                  </span>
                                )}
                              </div>
                              <button className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
                                <MoreVertical size={16} />
                              </button>
                            </div>

                            {/* Content */}
                            <div className="mb-0">
                              <h4 className={cn("font-semibold text-white leading-snug transition-all duration-300", z.title)}>
                                {ticket.subject}
                              </h4>
                              <p className={cn("text-zinc-500 leading-relaxed transition-all duration-300", z.desc)}>
                                {ticket.description}
                              </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  <div className={cn("rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border border-[#1E1E24] flex items-center justify-center font-bold text-white shadow-sm transition-all duration-300", z.avatar)} title={`Cliente: ${ticket.clientName}`}>
                                    {getInitials(ticket.clientName)}
                                  </div>
                                  {ticket.assignedToName && (
                                    <div className={cn("rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border border-[#1E1E24] flex items-center justify-center font-bold text-white shadow-sm transition-all duration-300", z.avatar)} title={`Agente: ${ticket.assignedToName}`}>
                                      {getInitials(ticket.assignedToName)}
                                    </div>
                                  )}
                                </div>
                                <span className={cn("text-zinc-600 font-medium transition-all duration-300", z.footerText)}>
                                  {ticket.id}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5" title={`Canal: ${ticketChannelLabels[ticket.channel]}`}>
                                  {getChannelIcon(ticket.channel, z.iconSize)}
                                </div>
                                <div className={cn("text-zinc-500 font-medium bg-[#050505] border border-white/5 px-2 py-1 rounded-md transition-all duration-300", z.footerText)}>
                                  {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: es })}
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}

                    {columnTickets.length === 0 && !isLoading && (
                      <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-zinc-600 text-sm p-4 text-center mt-2">
                        Vacio
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="h-full overflow-y-auto noc-scrollbar pb-8">
            <DataTable
              data={pagedTickets}
              columns={listColumns}
              isLoading={isLoading}
              getRowId={(t) => t.id}
              emptyMessage="No hay tickets que coincidan con los filtros"
              emptyIcon={<LifeBuoy className="h-12 w-12 text-zinc-600 mb-4" />}
              footer={
                <TablePagination
                  totalItems={filteredTickets.length}
                  filteredItems={filteredTickets.length}
                  itemName="tickets"
                  currentPage={page}
                  totalPages={Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE))}
                  onPageChange={setPage}
                />
              }
              renderActions={(ticket) => (
                <div className="flex items-center justify-end">
                  <Link
                    href={`/dashboard/support/${ticket.id}`}
                    className="flex p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded hover:bg-zinc-800/50"
                  >
                    <ExternalLink size={16} />
                  </Link>
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}
