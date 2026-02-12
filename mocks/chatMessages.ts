import type { ChatMessage } from '@/types/chat'

/**
 * Mock chat messages for development
 */
export const mockChatMessages: ChatMessage[] = [
    {
        id: 'MSG-WELCOME',
        createdAt: '2026-02-06T00:00:00Z',
        sender: 'BOT',
        text: '¡Hola! 👋 Soy tu asistente de feedback. Cuéntame qué problema encontraste o qué mejora te gustaría ver. Cada mensaje que envíes se registrará como una tarea.',
    },
]
