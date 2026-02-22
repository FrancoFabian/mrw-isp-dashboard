import type { UserRole } from '@/types/roles'
import type { RoleTag } from '@/types/task'

/**
 * Maps UserRole (lowercase) to RoleTag (uppercase) for task tagging.
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

type SectionMapping = {
    pattern: RegExp
    section: string
}

/**
 * Section mappings by role and route patterns.
 * Ordered from most specific to most generic.
 */
const sectionMappings: Record<UserRole, SectionMapping[]> = {
    admin: [
        { pattern: /^\/dashboard\/notifications\/templates(?:\/|$)/, section: 'Notificaciones / Plantillas' },
        { pattern: /^\/dashboard\/notifications\/rules(?:\/|$)/, section: 'Notificaciones / Reglas' },
        { pattern: /^\/dashboard\/notifications\/logs(?:\/|$)/, section: 'Notificaciones / Logs' },
        { pattern: /^\/dashboard\/notifications(?:\/|$)/, section: 'Notificaciones' },
        { pattern: /^\/dashboard\/work-orders(?:\/|$)/, section: 'Ordenes de trabajo' },
        { pattern: /^\/dashboard\/billing\/invoices(?:\/|$)/, section: 'Facturacion / Facturas' },
        { pattern: /^\/dashboard\/billing\/payments(?:\/|$)/, section: 'Facturacion / Pagos' },
        { pattern: /^\/dashboard\/billing(?:\/|$)/, section: 'Facturacion' },
        { pattern: /^\/dashboard\/clients(?:\/|$)/, section: 'Clientes' },
        { pattern: /^\/dashboard\/network(?:\/|$)/, section: 'Red' },
        { pattern: /^\/dashboard\/support(?:\/|$)/, section: 'Soporte' },
        { pattern: /^\/dashboard\/team(?:\/|$)/, section: 'Equipo' },
        { pattern: /^\/dashboard\/concessions(?:\/|$)/, section: 'Concesiones' },
        { pattern: /^\/dashboard\/settings(?:\/|$)/, section: 'Configuracion' },
        { pattern: /^\/dashboard(?:\/|$)/, section: 'Dashboard' },
    ],
    installer: [
        { pattern: /^\/dashboard\/installer\/jobs(?:\/|$)/, section: 'Instalaciones' },
        { pattern: /^\/dashboard\/installer(?:\/|$)/, section: 'Mi agenda' },
        { pattern: /^\/dashboard\/settings(?:\/|$)/, section: 'Configuracion' },
    ],
    collector: [
        { pattern: /^\/dashboard\/collector\/history(?:\/|$)/, section: 'Historial' },
        { pattern: /^\/dashboard\/collector\/captive-codes(?:\/|$)/, section: 'Codigos cautivo' },
        { pattern: /^\/dashboard\/collector\/cashcut(?:\/|$)/, section: 'Corte de caja' },
        { pattern: /^\/dashboard\/collector(?:\/|$)/, section: 'Mis cobros' },
        { pattern: /^\/dashboard\/settings(?:\/|$)/, section: 'Configuracion' },
    ],
    client: [
        { pattern: /^\/dashboard\/portal\/support\/new(?:\/|$)/, section: 'Soporte / Nuevo ticket' },
        { pattern: /^\/dashboard\/portal\/support(?:\/|$)/, section: 'Soporte' },
        { pattern: /^\/dashboard\/portal\/invoices(?:\/|$)/, section: 'Facturas' },
        { pattern: /^\/dashboard\/portal\/payment-methods(?:\/|$)/, section: 'Metodos de pago' },
        { pattern: /^\/dashboard\/portal\/payments(?:\/|$)/, section: 'Pagos' },
        { pattern: /^\/dashboard\/portal\/wifi(?:\/|$)/, section: 'Mi red WiFi' },
        { pattern: /^\/dashboard\/portal(?:\/|$)/, section: 'Mi servicio' },
        { pattern: /^\/dashboard\/settings(?:\/|$)/, section: 'Configuracion' },
    ],
    concession_client: [
        { pattern: /^\/dashboard\/concession-portal\/invoices(?:\/|$)/, section: 'Facturas' },
        { pattern: /^\/dashboard\/concession-portal\/tools(?:\/|$)/, section: 'Herramientas' },
        { pattern: /^\/dashboard\/concession-portal(?:\/|$)/, section: 'Mi infraestructura' },
        { pattern: /^\/dashboard\/settings(?:\/|$)/, section: 'Configuracion' },
    ],
    captive_client: [
        { pattern: /^\/dashboard\/captive\/codes(?:\/|$)/, section: 'Mis codigos' },
        { pattern: /^\/dashboard\/captive(?:\/|$)/, section: 'Mi acceso' },
    ],
    dev: [
        { pattern: /^\/dashboard\/dev\/tasks(?:\/|$)/, section: 'Inbox de tareas' },
        { pattern: /^\/dashboard\/dev(?:\/|$)/, section: 'Dashboard DEV' },
    ],
}

const excludedChatRoutePatterns: RegExp[] = [
    /^\/dashboard\/captive(?:\/|$)/,
]

const roleTagTokenLabels: Record<RoleTag, string> = {
    ADMIN: 'Admins',
    INSTALLER: 'Installers',
    CLIENT: 'Clients',
    COLLECTOR: 'Collectors',
    CONCESSION_CLIENT: 'Concessions',
    CAPTIVE_CLIENT: 'Captive',
    GENERAL: 'General',
    DEV: 'Dev',
}

const contextTokenToRoleTag: Record<string, RoleTag> = {
    admin: 'ADMIN',
    admins: 'ADMIN',
    installer: 'INSTALLER',
    installers: 'INSTALLER',
    cliente: 'CLIENT',
    clientes: 'CLIENT',
    client: 'CLIENT',
    clients: 'CLIENT',
    collector: 'COLLECTOR',
    collectors: 'COLLECTOR',
    cobrador: 'COLLECTOR',
    cobradores: 'COLLECTOR',
    concession: 'CONCESSION_CLIENT',
    concessions: 'CONCESSION_CLIENT',
    general: 'GENERAL',
    dev: 'DEV',
    captive: 'CAPTIVE_CLIENT',
}

export interface ParsedContextToken {
    raw: string
    roleTag?: RoleTag
    sectionTag: string
    sectionSlug: string
}

function segmentToTitleCase(value: string): string {
    return value
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function decodeSegment(segment: string): string {
    try {
        return decodeURIComponent(segment)
    } catch {
        return segment
    }
}

function looksLikeDynamicId(segment: string): boolean {
    return /^[0-9]+$/.test(segment) || /^[a-z0-9-]{6,}$/i.test(segment)
}

/**
 * Converts a section label to a stable hashtag-friendly slug.
 */
export function toContextSlug(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '')
}

/**
 * Converts a context slug to a display section.
 */
export function contextSlugToSection(value: string): string {
    const normalized = toContextSlug(value)
    return segmentToTitleCase(normalized.replace(/-/g, ' '))
}

/**
 * Builds a context token such as #Clients/pagos.
 */
export function buildContextToken(roleTag: RoleTag, section: string): string {
    return `#${roleTagTokenLabels[roleTag]}/${toContextSlug(section)}`
}

/**
 * Parses optional context token in chat text, e.g. "#Clients/pagos ...".
 */
export function parseContextToken(message: string): ParsedContextToken | null {
    const match = message.match(/(?:^|\s)#([A-Za-z_]+)\/([A-Za-z0-9_-]+)/)
    if (!match) {
        return null
    }

    const tokenRole = match[1].toLowerCase()
    const tokenSection = match[2]
    const roleTag = contextTokenToRoleTag[tokenRole]

    return {
        raw: match[0].trim(),
        roleTag,
        sectionTag: contextSlugToSection(tokenSection),
        sectionSlug: toContextSlug(tokenSection),
    }
}

/**
 * Routes excluded from feedback chat flow.
 */
export function isChatRouteExcluded(pathname: string): boolean {
    return excludedChatRoutePatterns.some((pattern) => pattern.test(pathname))
}

/**
 * Maps pathname to a readable section name based on the current role.
 */
export function routeToSection(pathname: string, role: UserRole): string {
    const roleMappings = sectionMappings[role]

    for (const mapping of roleMappings) {
        if (mapping.pattern.test(pathname)) {
            return mapping.section
        }
    }

    // Fallback: extract a readable segment from path while tolerating dynamic ids.
    const parts = pathname.split('/').filter(Boolean).map(decodeSegment)
    if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1]
        const segment = looksLikeDynamicId(lastPart) && parts.length > 2
            ? parts[parts.length - 2]
            : lastPart
        return segmentToTitleCase(segment.replace(/[-_]/g, ' '))
    }

    return 'Unknown'
}
