import type { TaskItem } from '@/types/task'

/**
 * Mock tasks for development and testing
 */
export const mockTasks: TaskItem[] = [
    {
        id: 'TASK-ABC123',
        createdAt: '2026-02-05T14:30:00Z',
        title: 'El botón de pago no responde en móvil',
        message:
            'Cuando intento hacer un pago desde mi celular, el botón de "Confirmar pago" no hace nada al tocarlo. Esto pasa en Chrome Android.',
        roleTag: 'CLIENT',
        sectionTag: 'Pagos',
        route: '/dashboard/portal/payments',
        type: 'BUG',
        priority: 'HIGH',
        status: 'OPEN',
        author: { kind: 'CLIENT_USER', name: 'Carlos Martinez' },
        includeScreenshotLater: true,
        attachments: [
            {
                id: 'ATT-MOCK-001',
                taskId: 'TASK-ABC123',
                mediaPath: 'u/2026/02/mock-portal-pago.png',
                mimeType: 'image/png',
                sizeBytes: 184320,
                createdAt: '2026-02-05T14:35:00Z',
            },
        ],
        devNotes: [],
    },
    {
        id: 'TASK-DEF456',
        createdAt: '2026-02-04T09:15:00Z',
        title: 'Agregar filtro por fecha en historial de cobros',
        message:
            'Sería muy útil poder filtrar los cobros por rango de fechas. Actualmente solo puedo ver todo el historial sin filtrar.',
        roleTag: 'COLLECTOR',
        sectionTag: 'Historial',
        route: '/dashboard/collector/history',
        type: 'IMPROVEMENT',
        priority: 'MEDIUM',
        status: 'IN_REVIEW',
        author: { kind: 'CLIENT_USER', name: 'Ricardo Perez' },
        devNotes: [
            {
                id: 'NOTE-001',
                createdAt: '2026-02-04T11:00:00Z',
                author: { kind: 'DEV_USER', name: 'Dev Team' },
                text: 'Considerando usar date-fns para el date picker. Revisar componente Calendar existente.',
            },
        ],
    },
    {
        id: 'TASK-GHI789',
        createdAt: '2026-02-03T16:45:00Z',
        title: 'Falta rol para técnicos de soporte',
        message:
            'Necesitamos un rol intermedio entre instalador y administrador para técnicos que dan soporte remoto pero no hacen instalaciones físicas.',
        roleTag: 'GENERAL',
        sectionTag: 'Roles',
        route: '/dashboard/team',
        type: 'NEW_SECTION',
        priority: 'LOW',
        status: 'DONE',
        author: { kind: 'CLIENT_USER', name: 'Alejandro Morales' },
        devNotes: [
            {
                id: 'NOTE-002',
                createdAt: '2026-02-05T10:00:00Z',
                author: { kind: 'DEV_USER', name: 'Dev Team' },
                text: 'Implementado como rol "support_tech". Cerrado.',
            },
        ],
    },
]
