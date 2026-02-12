import type { UserRole } from '@/types/roles'
import type { RoleTag } from '@/types/task'

/**
 * Maps UserRole (lowercase) to RoleTag (uppercase) for task tagging
 */
export function userRoleToRoleTag(role: UserRole): RoleTag {
    const mapping: Record<UserRole, RoleTag> = {
        admin: 'ADMIN',
        installer: 'INSTALLER',
        client: 'CLIENT',
        collector: 'COLLECTOR',
        concession_client: 'CONCESSION_CLIENT',
        captive_client: 'CAPTIVE_CLIENT',
        dev: 'DEV',
    }
    return mapping[role]
}

/**
 * Section mappings by role and route patterns
 */
const sectionMappings: Record<string, { pattern: RegExp; section: string }[]> = {
    admin: [
        { pattern: /^\/dashboard\/?$/, section: 'Dashboard' },
        { pattern: /^\/dashboard\/clients/, section: 'Clientes' },
        { pattern: /^\/dashboard\/billing/, section: 'Facturación' },
        { pattern: /^\/dashboard\/network/, section: 'Red' },
        { pattern: /^\/dashboard\/support/, section: 'Soporte' },
        { pattern: /^\/dashboard\/team/, section: 'Equipo' },
        { pattern: /^\/dashboard\/concessions/, section: 'Concesiones' },
        { pattern: /^\/dashboard\/settings/, section: 'Configuración' },
    ],
    installer: [
        { pattern: /^\/dashboard\/installer\/?$/, section: 'Mi agenda' },
        { pattern: /^\/dashboard\/installer\/jobs/, section: 'Instalaciones' },
        { pattern: /^\/dashboard\/settings/, section: 'Configuración' },
    ],
    collector: [
        { pattern: /^\/dashboard\/collector\/?$/, section: 'Mis cobros' },
        { pattern: /^\/dashboard\/collector\/history/, section: 'Historial' },
        { pattern: /^\/dashboard\/collector\/captive-codes/, section: 'Códigos cautivo' },
        { pattern: /^\/dashboard\/collector\/cashcut/, section: 'Corte de caja' },
        { pattern: /^\/dashboard\/settings/, section: 'Configuración' },
    ],
    client: [
        { pattern: /^\/dashboard\/portal\/?$/, section: 'Mi servicio' },
        { pattern: /^\/dashboard\/portal\/wifi/, section: 'Mi red WiFi' },
        { pattern: /^\/dashboard\/portal\/payments/, section: 'Pagos' },
        { pattern: /^\/dashboard\/portal\/payment-methods/, section: 'Métodos de pago' },
        { pattern: /^\/dashboard\/settings/, section: 'Configuración' },
    ],
    concession_client: [
        { pattern: /^\/dashboard\/concession-portal\/?$/, section: 'Mi infraestructura' },
        { pattern: /^\/dashboard\/concession-portal\/invoices/, section: 'Facturas' },
        { pattern: /^\/dashboard\/concession-portal\/tools/, section: 'Herramientas' },
        { pattern: /^\/dashboard\/settings/, section: 'Configuración' },
    ],
    captive_client: [
        { pattern: /^\/dashboard\/captive\/?$/, section: 'Mi acceso' },
        { pattern: /^\/dashboard\/captive\/codes/, section: 'Mis códigos' },
    ],
    dev: [
        { pattern: /^\/dashboard\/dev\/?$/, section: 'Dashboard DEV' },
        { pattern: /^\/dashboard\/dev\/tasks/, section: 'Inbox de tareas' },
    ],
}

/**
 * Maps a pathname to a readable section name based on the current role
 * @param pathname - Current route pathname (e.g., '/dashboard/billing')
 * @param role - Current user role
 * @returns Section name or 'Unknown' if not matched
 */
export function routeToSection(pathname: string, role: UserRole): string {
    const roleMappings = sectionMappings[role]

    if (!roleMappings) {
        return 'Unknown'
    }

    for (const mapping of roleMappings) {
        if (mapping.pattern.test(pathname)) {
            return mapping.section
        }
    }

    // Fallback: try to extract section from pathname
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1]
        // Capitalize first letter
        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
    }

    return 'Unknown'
}
