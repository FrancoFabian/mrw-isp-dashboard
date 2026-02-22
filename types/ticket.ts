// ─────────────────────────────────────────────────────────────
// Ticket Core Types
// ─────────────────────────────────────────────────────────────

export type TicketPriority = "low" | "medium" | "high" | "critical"
export type TicketStatus = "new" | "open" | "waiting_customer" | "in_progress" | "resolved" | "closed"
export type TicketCategory = "technical" | "billing" | "installation" | "general"
export type TicketChannel = "portal" | "whatsapp" | "phone"

export interface Ticket {
  id: string
  clientId: string
  clientName: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  channel: TicketChannel
  assignedToId?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
  lastCustomerReplyAt?: string
  lastAgentReplyAt?: string
  slaBreachedAt?: string
  visualAttachments?: Array<{
    id: string
    mediaPath: string
    mimeType: string
    sizeBytes: number
    createdAt: string
  }>
}

// ─────────────────────────────────────────────────────────────
// Ticket Messages
// ─────────────────────────────────────────────────────────────

export type MessageSender = "customer" | "agent" | "system"

export interface TicketAttachment {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  sender: MessageSender
  senderId?: string
  senderName?: string
  body: string
  createdAt: string
  attachments?: TicketAttachment[]
  isInternal?: boolean // true = internal note (agents only)
}

// ─────────────────────────────────────────────────────────────
// Ticket Events (Timeline)
// ─────────────────────────────────────────────────────────────

export type TicketEventType =
  | "created"
  | "status_changed"
  | "assigned"
  | "priority_changed"
  | "note_added"
  | "sla_warning"
  | "sla_breached"
  | "attachment_added"

export interface TicketEvent {
  id: string
  ticketId: string
  type: TicketEventType
  payload: Record<string, string>
  createdAt: string
  actorId?: string
  actorName?: string
}

// ─────────────────────────────────────────────────────────────
// Labels & Colors
// ─────────────────────────────────────────────────────────────

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
}

export const ticketPriorityColors: Record<TicketPriority, string> = {
  low: "bg-slate-500/20 text-slate-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-amber-500/20 text-amber-400",
  critical: "bg-red-500/20 text-red-400",
}

export const ticketStatusLabels: Record<TicketStatus, string> = {
  new: "Nuevo",
  open: "Abierto",
  waiting_customer: "Esperando cliente",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
}

export const ticketStatusColors: Record<TicketStatus, string> = {
  new: "bg-purple-500/20 text-purple-400",
  open: "bg-blue-500/20 text-blue-400",
  waiting_customer: "bg-amber-500/20 text-amber-400",
  in_progress: "bg-cyan-500/20 text-cyan-400",
  resolved: "bg-emerald-500/20 text-emerald-400",
  closed: "bg-slate-500/20 text-slate-400",
}

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  technical: "Técnico",
  billing: "Facturación",
  installation: "Instalación",
  general: "General",
}

export const ticketCategoryColors: Record<TicketCategory, string> = {
  technical: "bg-cyan-500/20 text-cyan-400",
  billing: "bg-emerald-500/20 text-emerald-400",
  installation: "bg-orange-500/20 text-orange-400",
  general: "bg-slate-500/20 text-slate-400",
}

export const ticketChannelLabels: Record<TicketChannel, string> = {
  portal: "Portal",
  whatsapp: "WhatsApp",
  phone: "Teléfono",
}

export const messageSenderLabels: Record<MessageSender, string> = {
  customer: "Cliente",
  agent: "Agente",
  system: "Sistema",
}

export const ticketEventTypeLabels: Record<TicketEventType, string> = {
  created: "Ticket creado",
  status_changed: "Estado cambiado",
  assigned: "Asignado",
  priority_changed: "Prioridad cambiada",
  note_added: "Nota agregada",
  sla_warning: "Alerta SLA",
  sla_breached: "SLA incumplido",
  attachment_added: "Archivo adjunto",
}
