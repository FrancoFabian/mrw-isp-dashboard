import type { MediaCapabilitiesResponse, MediaUploadResponse } from '@/types/chat-assistant'

export class MediaUploadError extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

async function parseError(response: Response): Promise<string> {
    try {
        const payload = await response.json() as { error?: string; message?: string }
        return payload.message ?? payload.error ?? `status ${response.status}`
    } catch {
        return `status ${response.status}`
    }
}

export async function uploadChatMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/chat/media/upload', {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
        throw new MediaUploadError(response.status, await parseError(response))
    }

    return await response.json() as MediaUploadResponse
}

export async function requestMediaCapabilities(): Promise<MediaCapabilitiesResponse> {
    const response = await fetch('/api/chat/media/capabilities', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
        throw new MediaUploadError(response.status, await parseError(response))
    }

    return await response.json() as MediaCapabilitiesResponse
}
