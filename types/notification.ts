// ─────────────────────────────────────────────────────────────
// Notification Channels & Events
// ─────────────────────────────────────────────────────────────

export type NotificationChannel = "email" | "whatsapp" | "push" | "sms"

export type NotificationEventType =
    | "billing_invoice_issued"
    | "billing_due_soon"
    | "billing_overdue"
    | "billing_payment_received"
    | "account_suspended"
    | "account_reactivated"
    | "installation_scheduled"
    | "installation_rescheduled"
    | "ticket_created"
    | "ticket_status_changed"
    | "ticket_resolved"

// ─────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────

export interface NotificationTemplate {
    id: string
    name: string
    channel: NotificationChannel
    subject?: string // for email
    body: string
    variables: string[] // ["customer.name", "invoice.amount"]
    enabled: boolean
}

// ─────────────────────────────────────────────────────────────
// Rules
// ─────────────────────────────────────────────────────────────

export type RuleOperator = "eq" | "gt" | "lt" | "in" | "contains"

export interface NotificationRuleCondition {
    field: string
    operator: RuleOperator
    value: string | number | string[]
}

export interface NotificationRule {
    id: string
    name: string
    eventType: NotificationEventType
    channel: NotificationChannel
    templateId: string
    conditions?: NotificationRuleCondition[]
    enabled: boolean
}

// ─────────────────────────────────────────────────────────────
// Logs
// ─────────────────────────────────────────────────────────────

export type NotificationLogStatus = "queued" | "sent" | "failed"

export interface NotificationLog {
    id: string
    customerId: string
    customerName: string
    eventType: NotificationEventType
    channel: NotificationChannel
    templateId: string
    templateName?: string
    status: NotificationLogStatus
    renderedPreview: string
    createdAt: string
    sentAt?: string
    error?: string
}

// ─────────────────────────────────────────────────────────────
// Labels & Colors
// ─────────────────────────────────────────────────────────────

export const notificationChannelLabels: Record<NotificationChannel, string> = {
    email: "Email",
    whatsapp: "WhatsApp",
    push: "Push",
    sms: "SMS",
}

export const notificationChannelColors: Record<NotificationChannel, string> = {
    email: "bg-blue-500/20 text-blue-400",
    whatsapp: "bg-emerald-500/20 text-emerald-400",
    push: "bg-purple-500/20 text-purple-400",
    sms: "bg-amber-500/20 text-amber-400",
}

export const notificationEventLabels: Record<NotificationEventType, string> = {
    billing_invoice_issued: "Factura emitida",
    billing_due_soon: "Próximo vencimiento",
    billing_overdue: "Pago vencido",
    billing_payment_received: "Pago recibido",
    account_suspended: "Cuenta suspendida",
    account_reactivated: "Cuenta reactivada",
    installation_scheduled: "Instalación agendada",
    installation_rescheduled: "Instalación reprogramada",
    ticket_created: "Ticket creado",
    ticket_status_changed: "Estado de ticket cambiado",
    ticket_resolved: "Ticket resuelto",
}

// Alias for backward compatibility
export const notificationEventTypeLabels = notificationEventLabels

export const notificationLogStatusLabels: Record<NotificationLogStatus, string> = {
    queued: "En cola",
    sent: "Enviado",
    failed: "Fallido",
}

export const notificationLogStatusColors: Record<NotificationLogStatus, string> = {
    queued: "bg-amber-500/20 text-amber-400",
    sent: "bg-emerald-500/20 text-emerald-400",
    failed: "bg-red-500/20 text-red-400",
}

// Variable hints for template editor
export const notificationVariables: Record<string, string[]> = {
    customer: ["name", "email", "phone", "plan"],
    invoice: ["id", "amount", "dueDate", "period"],
    ticket: ["id", "subject", "status"],
    installation: ["date", "time", "technician"],
    account: ["status", "suspendedAt"],
}
