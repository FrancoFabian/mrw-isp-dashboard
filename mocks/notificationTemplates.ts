import type { NotificationTemplate } from "@/types/notification"

export const mockNotificationTemplates: NotificationTemplate[] = [
    // Billing templates
    {
        id: "TPL-001",
        name: "Factura Emitida",
        channel: "email",
        subject: "Tu factura de {{invoice.period}} está lista",
        body: `Hola {{customer.name}},

Tu factura por \${{invoice.amount}} MXN correspondiente al periodo {{invoice.period}} ya está disponible.

Fecha de vencimiento: {{invoice.dueDate}}

Puedes consultar y pagar tu factura desde el portal de clientes.

Gracias por tu preferencia.`,
        variables: ["customer.name", "invoice.amount", "invoice.period", "invoice.dueDate"],
        enabled: true,
    },
    {
        id: "TPL-002",
        name: "Recordatorio de Pago",
        channel: "whatsapp",
        body: `Hola {{customer.name}} 👋

Te recordamos que tu factura de \${{invoice.amount}} vence el {{invoice.dueDate}}.

Evita la suspensión de tu servicio realizando tu pago a tiempo.

¿Necesitas ayuda? Responde a este mensaje.`,
        variables: ["customer.name", "invoice.amount", "invoice.dueDate"],
        enabled: true,
    },
    {
        id: "TPL-003",
        name: "Pago Vencido",
        channel: "sms",
        body: "{{customer.name}}, tu pago de ${{invoice.amount}} está vencido. Evita la suspensión pagando hoy. Info: 800-123-4567",
        variables: ["customer.name", "invoice.amount"],
        enabled: true,
    },
    {
        id: "TPL-004",
        name: "Pago Recibido",
        channel: "email",
        subject: "Confirmación de pago recibido",
        body: `Hola {{customer.name}},

Hemos recibido tu pago por \${{invoice.amount}} MXN.

Número de referencia: {{payment.reference}}
Fecha: {{payment.date}}

Gracias por mantenerte al corriente.`,
        variables: ["customer.name", "invoice.amount", "payment.reference", "payment.date"],
        enabled: true,
    },
    {
        id: "TPL-005",
        name: "Pago Recibido WhatsApp",
        channel: "whatsapp",
        body: `✅ ¡Pago confirmado!

Hola {{customer.name}}, recibimos tu pago de \${{invoice.amount}}.

Tu servicio está activo. ¡Gracias!`,
        variables: ["customer.name", "invoice.amount"],
        enabled: true,
    },

    // Account templates
    {
        id: "TPL-006",
        name: "Cuenta Suspendida",
        channel: "email",
        subject: "Tu servicio ha sido suspendido",
        body: `Hola {{customer.name}},

Lamentamos informarte que tu servicio ha sido suspendido por falta de pago.

Para reactivar tu servicio, realiza el pago pendiente de \${{invoice.amount}} desde el portal o comunícate con nosotros.

Estamos para ayudarte.`,
        variables: ["customer.name", "invoice.amount"],
        enabled: true,
    },
    {
        id: "TPL-007",
        name: "Cuenta Reactivada",
        channel: "whatsapp",
        body: `🎉 ¡Tu servicio está activo!

Hola {{customer.name}}, tu cuenta ha sido reactivada exitosamente.

Disfruta tu internet. Cualquier duda, aquí estamos.`,
        variables: ["customer.name"],
        enabled: true,
    },

    // Installation templates
    {
        id: "TPL-008",
        name: "Instalación Agendada",
        channel: "email",
        subject: "Tu instalación está confirmada",
        body: `Hola {{customer.name}},

Tu instalación ha sido agendada para el {{installation.date}} a las {{installation.time}}.

Técnico asignado: {{installation.technician}}

Por favor asegúrate de que haya alguien en el domicilio para recibir al técnico.`,
        variables: ["customer.name", "installation.date", "installation.time", "installation.technician"],
        enabled: true,
    },
    {
        id: "TPL-009",
        name: "Instalación Reprogramada",
        channel: "whatsapp",
        body: `📅 Cambio de cita

Hola {{customer.name}}, tu instalación ha sido reprogramada para el {{installation.date}} a las {{installation.time}}.

Si tienes algún problema con esta fecha, responde a este mensaje.`,
        variables: ["customer.name", "installation.date", "installation.time"],
        enabled: true,
    },

    // Ticket templates
    {
        id: "TPL-010",
        name: "Ticket Creado",
        channel: "email",
        subject: "Hemos recibido tu solicitud #{{ticket.id}}",
        body: `Hola {{customer.name}},

Hemos recibido tu solicitud de soporte.

Número de ticket: {{ticket.id}}
Asunto: {{ticket.subject}}

Nuestro equipo revisará tu caso y te responderá lo antes posible.`,
        variables: ["customer.name", "ticket.id", "ticket.subject"],
        enabled: true,
    },
    {
        id: "TPL-011",
        name: "Ticket Actualizado",
        channel: "push",
        body: "Tu ticket #{{ticket.id}} ha sido actualizado. Estado: {{ticket.status}}",
        variables: ["ticket.id", "ticket.status"],
        enabled: true,
    },
    {
        id: "TPL-012",
        name: "Ticket Resuelto",
        channel: "email",
        subject: "Tu solicitud #{{ticket.id}} ha sido resuelta",
        body: `Hola {{customer.name}},

Nos complace informarte que tu solicitud de soporte ha sido resuelta.

Número de ticket: {{ticket.id}}
Asunto: {{ticket.subject}}

Si el problema persiste o tienes alguna otra consulta, no dudes en contactarnos.

¡Gracias por confiar en nosotros!`,
        variables: ["customer.name", "ticket.id", "ticket.subject"],
        enabled: true,
    },
]
