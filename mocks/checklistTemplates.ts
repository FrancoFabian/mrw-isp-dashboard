import type { ChecklistTemplate } from "@/types/checklist"

/** Mock checklist templates for different installation types */
export const mockChecklistTemplates: ChecklistTemplate[] = [
    {
        id: "TPL-FTTH-001",
        name: "Instalación FTTH Estándar",
        description: "Checklist completo para instalación de fibra óptica hasta el hogar",
        category: "FTTH",
        items: [
            {
                label: "Verificar señal óptica en NAP",
                description: "Confirmar potencia mínima -27 dBm en el puerto del NAP",
                required: true,
                order: 1,
            },
            {
                label: "Tender cable de acometida",
                description: "Instalar drop cable desde NAP hasta domicilio del cliente",
                required: true,
                order: 2,
            },
            {
                label: "Instalar roseta óptica",
                description: "Montar roseta en pared y realizar empalme",
                required: true,
                order: 3,
            },
            {
                label: "Conectar y configurar ONU",
                description: "Conectar ONU via patchcord SC/APC y verificar sincronización",
                required: true,
                order: 4,
            },
            {
                label: "Configurar red WiFi",
                description: "Configurar SSID y contraseña personalizada del cliente",
                required: true,
                order: 5,
            },
            {
                label: "Prueba de velocidad",
                description: "Realizar speedtest y confirmar velocidad contratada",
                required: true,
                order: 6,
            },
            {
                label: "Capacitar al cliente",
                description: "Explicar uso básico, reinicio de equipo y app móvil",
                required: false,
                order: 7,
            },
            {
                label: "Firma de conformidad",
                description: "Obtener firma del cliente confirmando instalación satisfactoria",
                required: true,
                order: 8,
            },
        ],
    },
    {
        id: "TPL-WIRELESS-001",
        name: "Instalación Wireless/P2P",
        description: "Checklist para instalaciones de enlaces inalámbricos",
        category: "WIRELESS",
        items: [
            {
                label: "Verificar línea de vista",
                description: "Confirmar línea de vista despejada hacia torre principal",
                required: true,
                order: 1,
            },
            {
                label: "Instalación de mástil/soporte",
                description: "Montar mástil o soporte en azotea/pared",
                required: true,
                order: 2,
            },
            {
                label: "Montaje de antena CPE",
                description: "Instalar y alinear antena CPE hacia sitio principal",
                required: true,
                order: 3,
            },
            {
                label: "Alineación de señal",
                description: "Ajustar azimut y elevación para maximizar señal",
                required: true,
                order: 4,
            },
            {
                label: "Tender cable de red",
                description: "Pasar cable ethernet desde antena hasta router interior",
                required: true,
                order: 5,
            },
            {
                label: "Configurar router WiFi",
                description: "Conectar y configurar router con SSID personalizado",
                required: true,
                order: 6,
            },
            {
                label: "Prueba de velocidad y latencia",
                description: "Speedtest y ping test para validar calidad del enlace",
                required: true,
                order: 7,
            },
            {
                label: "Firma de conformidad",
                description: "Obtener firma del cliente",
                required: true,
                order: 8,
            },
        ],
    },
    {
        id: "TPL-CPE-001",
        name: "Instalación/Cambio de CPE",
        description: "Checklist para cambio o actualización de equipo cliente",
        category: "CPE",
        items: [
            {
                label: "Desinstalar equipo anterior",
                description: "Desconectar y retirar equipo cliente viejo (si aplica)",
                required: false,
                order: 1,
            },
            {
                label: "Conectar nuevo equipo",
                description: "Conectar ONU/Router nuevo a la red",
                required: true,
                order: 2,
            },
            {
                label: "Verificar sincronización",
                description: "Confirmar que el equipo sincroniza correctamente",
                required: true,
                order: 3,
            },
            {
                label: "Configurar WiFi",
                description: "Configurar nombre y contraseña de red WiFi",
                required: true,
                order: 4,
            },
            {
                label: "Prueba de conectividad",
                description: "Validar conexión a internet en al menos 2 dispositivos",
                required: true,
                order: 5,
            },
            {
                label: "Entregar equipo viejo al cliente",
                description: "Devolver equipo anterior al cliente (si aplica)",
                required: false,
                order: 6,
            },
        ],
    },
    {
        id: "TPL-GENERAL-001",
        name: "Instalación General",
        description: "Checklist básico para cualquier tipo de instalación",
        category: "GENERAL",
        items: [
            {
                label: "Verificar disponibilidad de servicio",
                description: "Confirmar que hay cobertura en la zona",
                required: true,
                order: 1,
            },
            {
                label: "Instalar equipo cliente",
                description: "Conectar y configurar equipo CPE",
                required: true,
                order: 2,
            },
            {
                label: "Configurar red",
                description: "Configurar parámetros de red WiFi/LAN",
                required: true,
                order: 3,
            },
            {
                label: "Prueba de servicio",
                description: "Validar que el servicio funciona correctamente",
                required: true,
                order: 4,
            },
            {
                label: "Firma de conformidad",
                description: "Obtener firma del cliente",
                required: true,
                order: 5,
            },
        ],
    },
]
