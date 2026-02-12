// lib/landing/content.ts

export type Feature = { id: string; title: string; desc: string };

// Fiber optic features
export const featuresFiber: Feature[] = [
    { id: "F1", title: "Fibra hasta tu hogar", desc: "Conectividad FTTH con alta estabilidad y latencia baja." },
    { id: "F2", title: "Simetría real", desc: "Subidas y descargas equilibradas para videollamadas, cargas y copias de seguridad." },
    { id: "F3", title: "Instalación profesional", desc: "ONT y tendido óptico por técnicos certificados." },
    { id: "F4", title: "Soporte dedicado", desc: "Acompañamiento técnico y monitoreo para mantener tu conexión al 100%." },
];

// Standard internet features
export const featuresStandard: Feature[] = [
    { id: "S1", title: "Rendimiento estable", desc: "Ideal para streaming, clases y trabajo remoto." },
    { id: "S2", title: "Cobertura local", desc: "Infraestructura cerca de ti para menor latencia." },
    { id: "S3", title: "Instalación ágil", desc: "Agendamos y dejamos listo tu servicio sin complicaciones." },
    { id: "S4", title: "Soporte que responde", desc: "Atención cercana cuando la necesites." },
];

export type Plan = {
    id: string;
    name: string;
    price: number;
    icon: string;
    popular?: boolean;
    items: string[];
};

export const plans: Plan[] = [
    { id: "1d", name: "Básico", price: 50, icon: "⚡", popular: false, items: ["Simétricos", "Baja latencia", "Instalación gratuita", "Soporte técnico", "100% fibra óptica"] },
    { id: "2d", name: "Estandar", price: 100, icon: "⚡", popular: true, items: ["Simétricos", "Baja latencia", "Instalación gratuita e inmediata", "Soporte técnico", "100% fibra óptica"] },
    { id: "3d", name: "Plus", price: 200, icon: "🚀", popular: false, items: ["Simétricos", "Baja latencia", "Instalación gratuita e inmediata", "Soporte técnico prioritario", "100% fibra óptica"] },
    { id: "4d", name: "Empresarial", price: 0, icon: "🏢", popular: false, items: ["Velocidad personalizada", "Simétricos", "Baja latencia", "Instalación gratuita e inmediata", "Soporte técnico prioritario", "100% fibra óptica"] },
];
