import type { ChatMessage } from '@/types/chat'

export const feedbackWelcomeText = 'Hola. Soy tu asistente de feedback. Te dire en que ruta y seccion estas para registrar cambios con contexto. Si necesitas mayor precision, usa etiquetas como #Clients/pagos al inicio de tu mensaje.'

/**
 * Mock chat messages for development.
 */
export const mockChatMessages: ChatMessage[] = [
    {
        id: 'MSG-WELCOME',
        createdAt: '2026-02-21T12:00:00.000Z',
        sender: 'BOT',
        text: feedbackWelcomeText,
    },
]
