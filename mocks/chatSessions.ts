import type { ChatMessage, ChatSession, ChatSessionStatus } from '@/types/chat'
import { feedbackWelcomeText } from './chatMessages'

type SessionSeed = {
    id: string
    title: string
    status: ChatSessionStatus
    createdAt: string
    updatedAt: string
    userMessage: string
    botMessage: string
}

function message(id: string, createdAt: string, sender: ChatMessage['sender'], text: string): ChatMessage {
    return {
        id,
        createdAt,
        sender,
        text,
    }
}

function buildSession(seed: SessionSeed): ChatSession {
    return {
        id: seed.id,
        title: seed.title,
        status: seed.status,
        createdAt: seed.createdAt,
        updatedAt: seed.updatedAt,
        messages: [
            message(`${seed.id}-WELCOME`, seed.createdAt, 'BOT', feedbackWelcomeText),
            message(`${seed.id}-USER`, seed.createdAt, 'USER', seed.userMessage),
            message(`${seed.id}-BOT`, seed.updatedAt, 'BOT', seed.botMessage),
        ],
    }
}

/**
 * Codex-like mock sessions to test conversation continuity.
 */
export const mockChatSessions: ChatSession[] = [
    buildSession({
        id: 'SES-001',
        title: 'Mejorar contexto de chat',
        status: 'ACTIVE',
        createdAt: '2026-02-21T17:05:00.000Z',
        updatedAt: '2026-02-21T17:46:00.000Z',
        userMessage: 'Quiero que el chat diga la ruta y seccion automaticamente.',
        botMessage: 'Listo. Ya deje contexto automatico y sugerencia #Clients/pagos.',
    }),
    buildSession({
        id: 'SES-002',
        title: 'Verificar flujo cache busqueda',
        status: 'COMPLETED',
        createdAt: '2026-02-21T13:10:00.000Z',
        updatedAt: '2026-02-21T13:35:00.000Z',
        userMessage: 'Revisa porque el cache de busqueda no invalida.',
        botMessage: 'Detecte la condicion de stale y propuse ajuste en key de cache.',
    }),
    buildSession({
        id: 'SES-003',
        title: 'Revisar busqueda y query catalog-svc',
        status: 'COMPLETED',
        createdAt: '2026-02-21T11:40:00.000Z',
        updatedAt: '2026-02-21T12:05:00.000Z',
        userMessage: 'Necesito auditar la query principal de catalog-svc.',
        botMessage: 'La consulta estaba sin indice compuesto; deje recomendacion.',
    }),
    buildSession({
        id: 'SES-004',
        title: 'Ubica endpoint para consulta de nodo',
        status: 'COMPLETED',
        createdAt: '2026-02-20T15:22:00.000Z',
        updatedAt: '2026-02-20T16:05:00.000Z',
        userMessage: 'En que endpoint viene el estado del nodo?',
        botMessage: 'Quedo localizado en /network/nodes/{id}/health.',
    }),
    buildSession({
        id: 'SES-005',
        title: 'Audita carrito navbar actual',
        status: 'COMPLETED',
        createdAt: '2026-02-20T10:10:00.000Z',
        updatedAt: '2026-02-20T11:01:00.000Z',
        userMessage: 'Hay mismatch entre total y subtotal en navbar cart.',
        botMessage: 'El calculo duplicaba shipping; deje fix propuesto.',
    }),
    buildSession({
        id: 'SES-006',
        title: 'Implementar BFF Next.js App Router',
        status: 'COMPLETED',
        createdAt: '2026-02-17T14:25:00.000Z',
        updatedAt: '2026-02-17T15:00:00.000Z',
        userMessage: 'Ayudame a separar el BFF del frontend con app router.',
        botMessage: 'Propuse rutas API y contratos para auth, cart y checkout.',
    }),
]
