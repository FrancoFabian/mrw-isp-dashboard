import type { NotificationRule } from "@/types/notification"

export const mockNotificationRules: NotificationRule[] = [
    // Billing rules
    {
        id: "RULE-001",
        name: "Factura emitida → Email",
        eventType: "billing_invoice_issued",
        channel: "email",
        templateId: "TPL-001",
        enabled: true,
    },
    {
        id: "RULE-002",
        name: "Próximo vencimiento → WhatsApp",
        eventType: "billing_due_soon",
        channel: "whatsapp",
        templateId: "TPL-002",
        conditions: [{ field: "daysUntilDue", operator: "lt", value: 3 }],
        enabled: true,
    },
    {
        id: "RULE-003",
        name: "Pago vencido → SMS",
        eventType: "billing_overdue",
        channel: "sms",
        templateId: "TPL-003",
        enabled: true,
    },
    {
        id: "RULE-004",
        name: "Pago recibido → Email",
        eventType: "billing_payment_received",
        channel: "email",
        templateId: "TPL-004",
        enabled: true,
    },
    {
        id: "RULE-005",
        name: "Pago recibido → WhatsApp",
        eventType: "billing_payment_received",
        channel: "whatsapp",
        templateId: "TPL-005",
        enabled: true,
    },

    // Account rules
    {
        id: "RULE-006",
        name: "Cuenta suspendida → Email",
        eventType: "account_suspended",
        channel: "email",
        templateId: "TPL-006",
        enabled: true,
    },
    {
        id: "RULE-007",
        name: "Cuenta reactivada → WhatsApp",
        eventType: "account_reactivated",
        channel: "whatsapp",
        templateId: "TPL-007",
        enabled: true,
    },

    // Installation rules
    {
        id: "RULE-008",
        name: "Instalación agendada → Email",
        eventType: "installation_scheduled",
        channel: "email",
        templateId: "TPL-008",
        enabled: true,
    },
    {
        id: "RULE-009",
        name: "Instalación reprogramada → WhatsApp",
        eventType: "installation_rescheduled",
        channel: "whatsapp",
        templateId: "TPL-009",
        enabled: true,
    },

    // Ticket rules
    {
        id: "RULE-010",
        name: "Ticket creado → Email",
        eventType: "ticket_created",
        channel: "email",
        templateId: "TPL-010",
        enabled: true,
    },
    {
        id: "RULE-011",
        name: "Ticket actualizado → Push",
        eventType: "ticket_status_changed",
        channel: "push",
        templateId: "TPL-011",
        enabled: true,
    },
    {
        id: "RULE-012",
        name: "Ticket resuelto → Email",
        eventType: "ticket_resolved",
        channel: "email",
        templateId: "TPL-012",
        enabled: true,
    },
]
