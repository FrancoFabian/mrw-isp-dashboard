import type { LucideIcon } from "lucide-react";

/* ─── Message ─── */
export type MessageRole = "user" | "assistant";

export interface Message {
    id: number;
    role: MessageRole;
    text: string;
    /** Pre-formatted timestamp string (computed once at creation) */
    timestamp: string;
}

/* ─── Quick Actions ─── */
export interface QuickActionItem {
    id: string;
    icon: LucideIcon;
    label: string;
    description: string;
    /** Message sent on click */
    message: string;
}

/* ─── Labels / Copy ─── */
export interface ChatLabels {
    headerTitle: string;
    headerSubtitle: string;
    inputPlaceholder: string;
    quickActionsTitle: string;
    footerText: string;
    welcomeMessage: string;
    fallbackResponse: string;
    infraStatusTitle: string;
    infraUptime: string;
    infraLatency: string;
    infraUptimeValue: string;
    infraLatencyValue: string;
}

export const DEFAULT_LABELS: ChatLabels = {
    headerTitle: "MRW Smart Assist",
    headerSubtitle: "Soporte Nivel 3 Activo",
    inputPlaceholder: "Escribe tu consulta…",
    quickActionsTitle: "Atajos de Red",
    footerText: "Powered by MRW Core Intelligence — v2.5.4",
    welcomeMessage:
        "Bienvenido a la red MRW. Soy tu asistente de infraestructura inteligente. ¿En qué puedo potenciar tu conectividad hoy?",
    fallbackResponse:
        "Analizando solicitud en el nodo central… Un especialista de infraestructura se pondrá en contacto contigo o puedes usar nuestras herramientas rápidas de diagnóstico.",
    infraStatusTitle: "Estado de Infraestructura",
    infraUptime: "Uptime",
    infraLatency: "Latencia",
    infraUptimeValue: "99.99%",
    infraLatencyValue: "12ms",
};

/* ─── Telemetry callbacks ─── */
export interface ChatCallbacks {
    onOpen?: () => void;
    onClose?: () => void;
    onSend?: (text: string) => void;
}
