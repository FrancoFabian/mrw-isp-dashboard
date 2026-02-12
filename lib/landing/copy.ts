export const landingCopy = {
  navbar: {
    brand: "MRW ISP",
    links: [
      { label: "Inicio", href: "#inicio" },
      { label: "Soluciones", href: "#soluciones" },
      { label: "Planes", href: "#planes" },
      { label: "Cobertura", href: "#cobertura" },
      { label: "Contacto", href: "#contacto" },
    ],
    portalCta: "Iniciar Sesión",
    primaryCta: "Registrarse",
  },
  hero: {
    kicker: "Infraestructura MRW ISP",
    headline: "Conectividad e infraestructura para operar y escalar redes.",
    subheadline:
      "Fibra optica para hogares y negocios, soporte especializado y soluciones para expansion: concesiones, gestion de usuarios y control de acceso.",
    bullets: [
      "Soporte tecnico especializado",
      "Monitoreo continuo de red",
      "Instalacion programada",
    ],
    primaryCta: "Cotizar cobertura",
    secondaryCta: "Ver soluciones",
  },
  solutions: {
    headline: "Ecosistema de soluciones para operacion residencial y empresarial.",
    subheadline:
      "Unificamos conectividad, soporte y capacidades de crecimiento para operadores y aliados.",
    bullets: [
      "Modelo de servicio enfocado en continuidad operativa",
      "Cobertura por etapas con captura activa de demanda",
      "Herramientas para administracion y monetizacion",
    ],
  },
  plans: {
    headline: "Planes B2C con enfoque en estabilidad y soporte.",
    subheadline:
      "Mostramos capacidades por velocidad y tipo de servicio. La cotizacion final se valida por cobertura y condiciones de instalacion.",
    bullets: [
      "Fibra optica simetrica",
      "Escalamiento por crecimiento de consumo",
      "Canales de atencion y seguimiento",
    ],
    coverageCta: "Cotizar cobertura",
    whatsappCta: "Cotizar por WhatsApp",
    scheduleCta: "Agendar instalacion",
    requestQuoteCta: "Solicitar cotizacion",
    disclaimer:
      "Disponibilidad sujeta a cobertura y costos operativos por zona.",
  },
  coverage: {
    headline: "Cobertura comercial con captura de expansion.",
    subheadline:
      "Validamos direccion, contexto de instalacion y factibilidad operativa sin bloquear solicitudes fuera de zona activa.",
    bullets: [
      "Registro por colonia, calle y referencias",
      "Atencion de solicitudes fuera de zona para evaluacion",
      "Confirmacion por asesor en cada caso",
    ],
    cta: "Validar cobertura",
    mapTitle: "Mapa de cobertura referencial",
    mapBadge: "Actualizacion comercial",
    formTitle: "Validar cobertura",
    formBody: "Completa los datos de ubicacion. Siempre registramos tu solicitud.",
    colonyLabel: "Colonia",
    streetLabel: "Calle",
    referencesLabel: "Referencias",
    referencesPlaceholder: "Puntos de referencia para visita tecnica.",
    successTitle: "Recibimos tu solicitud.",
    successBody:
      "Un asesor validara cobertura y siguientes pasos de instalacion.",
    outOfZone:
      "Si tu ubicacion esta fuera de zona activa, podemos evaluar expansion o alternativas de atencion.",
  },
  b2b: {
    headline: "Soluciones B2B para operar, expandir y controlar servicios.",
    subheadline:
      "Integramos modelo de concesion y plataforma operativa para partners que requieren continuidad y trazabilidad.",
    bullets: [
      "Concesiones con soporte legal y operativo",
      "Portal para control de accesos y usuarios",
      "Acompanamiento tecnico para escalabilidad",
    ],
    concessionTitle: "Concesiones",
    concessionSubtitle:
      "Modelo de operacion para zonas de crecimiento con respaldo tecnico y comercial.",
    concessionCta: "Solicitar dossier",
    softwareTitle: "Software / Portal Cautivo",
    softwareSubtitle:
      "Herramientas para administracion de accesos, control y monetizacion.",
    softwareCta: "Agendar demo",
    advisorCta: "Hablar con un asesor",
    dossierSuccess:
      "Recibimos tu solicitud. Un asesor de alianzas te contacta con el siguiente paso.",
    softwareNote:
      "El software forma parte de soluciones internas y puede habilitarse para partners, sin afectar la experiencia residencial.",
  },
  showcase: {
    headline: "Vista operativa de la plataforma.",
    subheadline:
      "Paneles de referencia para monitoreo, usuarios, accesos y estado de la red.",
    bullets: [
      "Control centralizado de usuarios",
      "Gestion de accesos y cortes programados",
      "Seguimiento operativo en tiempo real",
    ],
  },
  trust: {
    headline: "Confianza basada en operacion y monitoreo.",
    subheadline:
      "Comunicamos capacidades verificables de servicio, soporte e infraestructura.",
    bullets: [
      "Monitoreo continuo",
      "Canales de soporte definidos",
      "Infraestructura compatible con estandares del sector",
    ],
  },
  faq: {
    kicker: "FAQ",
    headline: "Preguntas frecuentes",
    subheadline:
      "Respuestas directas para evaluar cobertura, instalacion y soporte.",
  },
  footer: {
    headline: "MRW ISP",
    subheadline:
      "Soluciones de conectividad, operacion y expansion para hogares, negocios y aliados.",
    legalTitle: "Legal y navegacion",
    legalLinks: [
      { label: "Aviso de privacidad", href: "#" },
      { label: "Terminos y condiciones", href: "#" },
      { label: "Cobertura", href: "#cobertura" },
      { label: "Soluciones", href: "#soluciones" },
    ],
    copyright: "© 2026 MRW ISP. Todos los derechos reservados.",
  },
  leadModal: {
    title: "Cotizar cobertura",
    description:
      "Comparte tus datos y un asesor te contacta para validar cobertura y condiciones de instalacion.",
    submit: "Enviar solicitud",
    submitted: "Recibimos tu solicitud.",
    submittedBody:
      "Nuestro equipo confirmara cobertura y opciones de instalacion.",
    fields: {
      name: "Nombre",
      address: "Colonia / Calle",
      whatsapp: "WhatsApp",
      segment: "Segmento",
      segmentPlaceholder: "Selecciona un segmento",
    },
    close: "Cerrar",
  },
} as const;
