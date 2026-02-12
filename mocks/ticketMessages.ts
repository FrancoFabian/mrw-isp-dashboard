import type { TicketMessage } from "@/types/ticket"

export const mockTicketMessages: TicketMessage[] = [
    // TKT-001: Sin servicio (new - no messages yet)

    // TKT-002: Velocidad lenta (in_progress - has conversation)
    {
        id: "MSG-001",
        ticketId: "TKT-002",
        sender: "customer",
        senderName: "Ana Garcia",
        body: "Hola, mi internet está muy lento desde hace 3 días. Contraté 50 Mbps pero apenas llego a 5 Mbps.",
        createdAt: "2026-02-04T09:15:00",
    },
    {
        id: "MSG-002",
        ticketId: "TKT-002",
        sender: "agent",
        senderId: "STF-004",
        senderName: "Mariana Gutierrez",
        body: "Hola Ana, lamentamos las molestias. Voy a revisar tu conexión remotamente. ¿Podrías decirme si esto pasa en todos los dispositivos?",
        createdAt: "2026-02-04T10:00:00",
    },
    {
        id: "MSG-003",
        ticketId: "TKT-002",
        sender: "customer",
        senderName: "Ana Garcia",
        body: "Sí, en mi laptop, celular y la TV. Todos están lentos.",
        createdAt: "2026-02-05T16:30:00",
    },
    {
        id: "MSG-004",
        ticketId: "TKT-002",
        sender: "agent",
        senderId: "STF-004",
        senderName: "Mariana Gutierrez",
        body: "Gracias por la info. Detecté saturación en el nodo. Estamos trabajando para resolverlo en las próximas 24 horas.",
        createdAt: "2026-02-06T11:00:00",
    },
    {
        id: "MSG-004-NOTE",
        ticketId: "TKT-002",
        sender: "agent",
        senderId: "STF-004",
        senderName: "Mariana Gutierrez",
        body: "Revisé el nodo NAP-003. Hay 15 clientes con el mismo problema. Escalado a infraestructura.",
        createdAt: "2026-02-06T11:05:00",
        isInternal: true,
    },

    // TKT-003: Cortes intermitentes
    {
        id: "MSG-005",
        ticketId: "TKT-003",
        sender: "customer",
        senderName: "Laura Flores",
        body: "Buenas tardes, el internet se corta varias veces. Sobre todo entre 5pm y 8pm.",
        createdAt: "2026-02-05T16:45:00",
    },
    {
        id: "MSG-006",
        ticketId: "TKT-003",
        sender: "agent",
        senderId: "STF-004",
        senderName: "Mariana Gutierrez",
        body: "Hola Laura, gracias por reportar. Vamos a monitorear tu conexión durante las próximas horas.",
        createdAt: "2026-02-05T17:00:00",
    },

    // TKT-004: Cambio contraseña (resolved)
    {
        id: "MSG-007",
        ticketId: "TKT-004",
        sender: "customer",
        senderName: "Carlos Martinez",
        body: "Hola, necesito cambiar la contraseña de mi WiFi. ¿Cómo lo hago?",
        createdAt: "2026-02-03T10:00:00",
    },
    {
        id: "MSG-008",
        ticketId: "TKT-004",
        sender: "agent",
        senderId: "STF-008",
        senderName: "Carmen Ortiz",
        body: "Hola Carlos! Para cambiar tu contraseña:\n1. Abre el navegador y ve a 192.168.1.1\n2. Usuario: admin, Contraseña: admin\n3. Ve a Wireless > Security\n4. Cambia la contraseña y guarda\n\n¿Necesitas más ayuda?",
        createdAt: "2026-02-03T10:30:00",
    },
    {
        id: "MSG-009",
        ticketId: "TKT-004",
        sender: "customer",
        senderName: "Carlos Martinez",
        body: "¡Perfecto! Ya lo hice. Muchas gracias por la ayuda rápida.",
        createdAt: "2026-02-03T11:15:00",
    },
    {
        id: "MSG-010",
        ticketId: "TKT-004",
        sender: "agent",
        senderId: "STF-008",
        senderName: "Carmen Ortiz",
        body: "¡Excelente! Me alegra que se haya resuelto. Cualquier duda, aquí estamos. ¡Buen día!",
        createdAt: "2026-02-03T11:30:00",
    },

    // TKT-006: Reactivación (waiting_customer)
    {
        id: "MSG-011",
        ticketId: "TKT-006",
        sender: "customer",
        senderName: "Patricia Ramirez",
        body: "Buenos días, ya realicé mi pago pendiente. Necesito que reactiven mi servicio.",
        createdAt: "2026-02-06T08:00:00",
        attachments: [
            {
                id: "ATT-001",
                filename: "comprobante_pago.jpg",
                mimeType: "image/jpeg",
                size: 245000,
                url: "/mocks/attachments/comprobante.jpg",
            },
        ],
    },
    {
        id: "MSG-012",
        ticketId: "TKT-006",
        sender: "agent",
        senderId: "STF-004",
        senderName: "Mariana Gutierrez",
        body: "Hola Patricia, gracias por enviar el comprobante. Estamos verificando el pago. ¿Podrías confirmar el monto y la fecha de la transferencia?",
        createdAt: "2026-02-06T10:00:00",
    },

    // TKT-007: Falla crítica zona norte
    {
        id: "MSG-013",
        ticketId: "TKT-007",
        sender: "customer",
        senderName: "Fernando Cruz",
        body: "¡URGENTE! No hay internet en toda la zona norte. Mis vecinos también están sin servicio.",
        createdAt: "2026-02-06T07:30:00",
    },
    {
        id: "MSG-014",
        ticketId: "TKT-007",
        sender: "agent",
        senderId: "STF-004",
        senderName: "Mariana Gutierrez",
        body: "Fernando, ya identificamos el problema. Hay un corte de fibra. El técnico está en camino. Tiempo estimado: 2 horas.",
        createdAt: "2026-02-06T08:00:00",
    },
    {
        id: "MSG-015",
        ticketId: "TKT-007",
        sender: "agent",
        senderId: "STF-004",
        senderName: "Mariana Gutierrez",
        body: "Actualización: El técnico llegó a la zona. Están trabajando en la reparación.",
        createdAt: "2026-02-06T09:15:00",
    },
    {
        id: "MSG-015-NOTE",
        ticketId: "TKT-007",
        sender: "agent",
        senderId: "STF-001",
        senderName: "Alejandro Morales",
        body: "Afecta a 32 clientes. Fibra cortada en poste 47-A. Contratista responsable ya notificado.",
        createdAt: "2026-02-06T09:30:00",
        isInternal: true,
    },

    // TKT-010: Router luz roja
    {
        id: "MSG-016",
        ticketId: "TKT-010",
        sender: "customer",
        senderName: "Sofia Mendoza",
        body: "Mi router tiene una luz roja que parpadea y no puedo conectarme. Ya lo reinicié pero sigue igual.",
        createdAt: "2026-02-06T16:30:00",
        attachments: [
            {
                id: "ATT-002",
                filename: "router_luz_roja.jpg",
                mimeType: "image/jpeg",
                size: 180000,
                url: "/mocks/attachments/router.jpg",
            },
        ],
    },

    // TKT-017: Factura duplicada
    {
        id: "MSG-017",
        ticketId: "TKT-017",
        sender: "customer",
        senderName: "Laura Flores",
        body: "Me llegaron dos facturas del mismo mes de febrero. Una por $499 y otra por $499. ¿Cuál es la correcta?",
        createdAt: "2026-02-06T12:00:00",
        attachments: [
            {
                id: "ATT-003",
                filename: "factura_1.pdf",
                mimeType: "application/pdf",
                size: 45000,
                url: "/mocks/attachments/factura1.pdf",
            },
            {
                id: "ATT-004",
                filename: "factura_2.pdf",
                mimeType: "application/pdf",
                size: 45000,
                url: "/mocks/attachments/factura2.pdf",
            },
        ],
    },

    // TKT-020: Cobro indebido
    {
        id: "MSG-018",
        ticketId: "TKT-020",
        sender: "customer",
        senderName: "Sofia Mendoza",
        body: "Hola, en mi última factura aparece un cargo de $150 por 'Servicio Premium' que nunca contraté. Necesito que lo revisen.",
        createdAt: "2026-02-06T09:00:00",
    },
]

// Helper functions
export const getMessagesByTicket = (ticketId: string) =>
    mockTicketMessages
        .filter((m) => m.ticketId === ticketId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

export const getVisibleMessages = (ticketId: string, isAgent: boolean) =>
    mockTicketMessages
        .filter((m) => m.ticketId === ticketId && (isAgent || !m.isInternal))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
