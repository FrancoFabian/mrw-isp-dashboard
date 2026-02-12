import type {
  BentoItem,
  ContactChannel,
  CoverageZone,
  FAQItem,
  LeadSegment,
  Plan,
  ShowcaseItem,
  TrustItem,
} from "@/lib/landing/types";

export const LEAD_SEGMENTS: Array<{ value: LeadSegment; label: string }> = [
  { value: "residencial", label: "Residencial" },
  { value: "negocio", label: "Negocio" },
  { value: "concesion", label: "Concesion" },
  { value: "software", label: "Software" },
];

export const SOLUTIONS_BENTO: BentoItem[] = [
  {
    id: "conectividad",
    title: "Conectividad FTTH",
    impact: "Fibra optica simetrica para continuidad residencial y comercial.",
    bullets: ["Simetria real", "Baja latencia"],
    cta: "Conocer mas",
    segment: "residencial",
  },
  {
    id: "concesiones",
    title: "Concesiones",
    impact: "Opera tu zona con un modelo estructurado y respaldo tecnico.",
    bullets: ["Operacion por zona", "Respaldo tecnico"],
    cta: "Conocer mas",
    segment: "concesion",
  },
  {
    id: "portal",
    title: "Software / Portal",
    impact: "Control, monetizacion y gestion centralizada de accesos.",
    bullets: ["Control de usuarios", "Administracion centralizada"],
    cta: "Conocer mas",
    segment: "software",
  },
  {
    id: "soporte",
    title: "Soporte especializado",
    impact: "Monitoreo, atencion y respuesta operativa en campo.",
    bullets: ["Monitoreo continuo", "Visita tecnica"],
    cta: "Conocer mas",
    segment: "negocio",
  },
  {
    id: "empresarial",
    title: "Soluciones empresariales",
    impact: "Enlaces y configuraciones a medida para cada operacion.",
    bullets: ["Dimensionamiento por demanda", "Escalabilidad por sitio"],
    cta: "Conocer mas",
    segment: "negocio",
  },
];

export const LANDING_PLANS: Plan[] = [
  {
    id: "plan-50",
    name: "Básico",
    speedLabel: "50 Mbps",
    summary: "Conectividad simetrica para uso residencial estable.",
    bullets: [
      "Fibra optica simetrica",
      "Latencia optimizada",
      "Instalacion programada",
      "Soporte tecnico local",
    ],
    whatsappText: "Hola, quiero cotizar el Plan 50 Mbps.",
  },
  {
    id: "plan-100",
    name: "Estándar",
    speedLabel: "100 Mbps",
    summary: "Balance para hogares con multiples dispositivos.",
    bullets: [
      "Fibra optica simetrica",
      "Capacidad para trabajo y streaming",
      "Monitoreo del servicio",
      "Soporte tecnico local",
    ],
    popular: true,
    whatsappText: "Hola, quiero cotizar el Plan 100 Mbps.",
  },
  {
    id: "plan-200",
    name: "Plus",
    speedLabel: "200 Mbps",
    summary: "Mayor capacidad para consumo intensivo y multiusuario.",
    bullets: [
      "Fibra optica simetrica",
      "Escalamiento por demanda",
      "Monitoreo del servicio",
      "Atencion tecnica",
    ],
    whatsappText: "Hola, quiero cotizar el Plan 200 Mbps.",
  },
  {
    id: "plan-empresarial",
    name: "Empresarial",
    speedLabel: "A medida",
    summary: "Enlaces y parametros adaptados a operacion empresarial.",
    bullets: [
      "Dimensionamiento segun operacion",
      "Opciones de redundancia",
      "Soporte especializado",
      "Implementacion programada",
    ],
    whatsappText: "Hola, quiero cotizar una solucion empresarial.",
  },
];

export const COVERAGE_ZONES: CoverageZone[] = [
  { id: "z1", name: "San Martin Tilcajete", status: "Disponible" },
  { id: "z2", name: "Santa Ana Zegache", status: "Disponible" },
  { id: "z3", name: "Ocotlan Centro", status: "Proximamente" },
  { id: "z4", name: "Corredor Sur", status: "Proximamente" },
];

export const CONCESSION_SCOPE = [
  "Estructura legal y operativa del modelo",
  "Acompanamiento tecnico para despliegue",
  "Soporte comercial y continuidad de servicio",
];

export const SOFTWARE_SCOPE = [
  "Usuarios y perfiles de acceso",
  "Control de sesiones y reglas operativas",
  "Monetizacion y seguimiento administrativo",
  "Visibilidad centralizada de operacion",
];

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "shot-1",
    title: "Panel de operacion",
    subtitle: "Estado de red y alertas prioritarias",
    chips: ["Monitoreo", "Alertas", "Estado"],
  },
  {
    id: "shot-2",
    title: "Gestion de usuarios",
    subtitle: "Altas, accesos y trazabilidad",
    chips: ["Usuarios", "Accesos", "Control"],
  },
  {
    id: "shot-3",
    title: "Control comercial",
    subtitle: "Cobros, paquetes y seguimiento",
    chips: ["Monetizacion", "Cobranza", "Reportes"],
  },
];

export const TRUST_ITEMS: TrustItem[] = [
  {
    id: "trust-1",
    title: "Monitoreo",
    value: "Continuo",
    detail: "Supervision operativa de eventos y estabilidad de servicio.",
  },
  {
    id: "trust-2",
    title: "Soporte",
    value: "Canales activos",
    detail: "Atencion por WhatsApp, seguimiento tecnico y visita programada.",
  },
  {
    id: "trust-3",
    title: "Infraestructura",
    value: "Escalable",
    detail:
      "Fibra, equipos y arquitectura compatibles con estandares del sector.",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-coverage",
    question: "Como se si hay cobertura?",
    answer:
      "Completa el formulario de cobertura y un asesor valida tu direccion con datos operativos.",
  },
  {
    id: "faq-install",
    question: "Que incluye la instalacion?",
    answer:
      "Incluye visita tecnica, validacion de ruta y puesta en marcha del servicio segun tu ubicacion.",
  },
  {
    id: "faq-contract",
    question: "Hay contrato o permanencia?",
    answer:
      "Las condiciones se confirman en la cotizacion final segun tipo de servicio y zona de instalacion.",
  },
  {
    id: "faq-failure",
    question: "Como reporto una falla?",
    answer:
      "Puedes reportarla por WhatsApp o canal de soporte. Se abre seguimiento tecnico y se da estatus.",
  },
  {
    id: "faq-payment",
    question: "Metodos de pago?",
    answer:
      "Se comparten opciones disponibles al momento de cotizar y formalizar tu instalacion.",
  },
  {
    id: "faq-outzone",
    question: "Que pasa si estoy fuera de zona?",
    answer:
      "Tu solicitud se registra igual. Evaluamos expansion por demanda o alternativas operativas para atenderte.",
  },
];

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "contact-residential",
    audience: "Residencial",
    label: "WhatsApp",
    value: "+52 951 278 3064",
    href: "https://wa.me/529512783064?text=Hola%2C%20quiero%20cotizar%20cobertura.",
  },
  {
    id: "contact-alliances",
    audience: "Alianzas / Concesiones",
    label: "Correo",
    value: "alianzas@mrwisp.com",
    href: "mailto:alianzas@mrwisp.com",
  },
  {
    id: "contact-b2b-form",
    audience: "Partners B2B",
    label: "Formulario",
    value: "Solicitar evaluacion",
    href: "#b2b",
  },
];
