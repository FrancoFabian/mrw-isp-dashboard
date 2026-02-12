/**
 * General areas for cross-cutting feedback (when "Cambios generales" is ON)
 */
export type GeneralArea =
    | 'General'
    | 'Roles'
    | 'Navegación'
    | 'Diseño'
    | 'Performance'
    | 'Seguridad'
    | 'Billing'

export const generalAreaLabels: Record<GeneralArea, string> = {
    General: 'General',
    Roles: 'Roles y permisos',
    Navegación: 'Navegación',
    Diseño: 'Diseño y UI',
    Performance: 'Rendimiento',
    Seguridad: 'Seguridad',
    Billing: 'Facturación',
}

export const generalAreas: GeneralArea[] = [
    'General',
    'Roles',
    'Navegación',
    'Diseño',
    'Performance',
    'Seguridad',
    'Billing',
]
