import type { Tool } from "@/types/tool"

export const mockTools: Tool[] = [
  {
    id: "TOOL-001",
    name: "Calculadora de Energia",
    description: "Calcula el consumo energetico de tu infraestructura de red.",
    longDescription:
      "Herramienta para estimar el consumo electrico de equipos de red, antenas, routers y switches. Permite proyectar costos mensuales de energia y optimizar la eficiencia energetica de tu operacion.",
    platforms: ["ANDROID", "WEB"],
    status: "available",
    icon: "zap",
    category: "Infraestructura",
  },
  {
    id: "TOOL-002",
    name: "Monitor de Enlace",
    description: "Monitorea la calidad de tus enlaces punto a punto en tiempo real.",
    longDescription:
      "Verifica latencia, perdida de paquetes y throughput de tus enlaces inalambricos. Compatible con equipos Ubiquiti, MikroTik y Cambium.",
    platforms: ["WEB"],
    status: "coming_soon",
    icon: "activity",
    category: "Monitoreo",
  },
  {
    id: "TOOL-003",
    name: "Calculadora de Cobertura",
    description: "Estima el area de cobertura segun tipo de antena y terreno.",
    longDescription:
      "Calcula el radio de cobertura efectivo considerando tipo de antena, ganancia, altura de torre y perfil del terreno. Incluye mapas de calor estimados.",
    platforms: ["WEB"],
    status: "coming_soon",
    icon: "radio",
    category: "Infraestructura",
  },
  {
    id: "TOOL-004",
    name: "Gestor de Inventario",
    description: "Controla el stock de equipos, cables y materiales de instalacion.",
    longDescription:
      "Registra entradas, salidas y asignaciones de equipos. Genera alertas de stock bajo y reportes de uso por tecnico o zona.",
    platforms: ["ANDROID", "WEB"],
    status: "coming_soon",
    icon: "package",
    category: "Operaciones",
  },
]
