import type { TaskDevNote, TaskItem, TaskPriority, TaskStatus, TaskType } from '@/types/task'
import { ApiRequestError } from '@/lib/chat/request-error'

interface ApiErrorPayload {
    error?: string
    message?: string
}

interface TaskListResponse {
    requestId?: string
    tasks: TaskItem[]
}

interface TaskUpdatePayload {
    status?: TaskStatus
    priority?: TaskPriority
    type?: TaskType
    title?: string
}

interface CreateDevNotePayload {
    authorName?: string
    text: string
}

function buildApiError(status: number, payload: ApiErrorPayload | null): ApiRequestError {
    const detail = payload?.message ?? payload?.error ?? `status ${status}`
    return new ApiRequestError(`Feedback tasks API responded with ${detail}`, 'http', status)
}

async function parseErrorPayload(response: Response): Promise<ApiErrorPayload | null> {
    try {
        return (await response.json()) as ApiErrorPayload
    } catch {
        return null
    }
}

export async function requestTasks(): Promise<TaskItem[]> {
    let response: Response
    try {
        response = await fetch('/api/feedback-chat/tasks', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
    } catch {
        throw new ApiRequestError('Unable to reach tasks API', 'network')
    }

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    const payload = (await response.json()) as TaskListResponse
    return payload.tasks ?? []
}

export async function requestTask(taskId: string): Promise<TaskItem> {
    let response: Response
    try {
        response = await fetch(`/api/feedback-chat/tasks/${encodeURIComponent(taskId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
    } catch {
        throw new ApiRequestError('Unable to reach task detail API', 'network')
    }

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as TaskItem
}

export async function updateTask(taskId: string, payload: TaskUpdatePayload): Promise<TaskItem> {
    let response: Response
    try {
        response = await fetch(`/api/feedback-chat/tasks/${encodeURIComponent(taskId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
    } catch {
        throw new ApiRequestError('Unable to reach task update API', 'network')
    }

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as TaskItem
}

export async function addTaskDevNote(taskId: string, payload: CreateDevNotePayload): Promise<TaskDevNote> {
    let response: Response
    try {
        response = await fetch(`/api/feedback-chat/tasks/${encodeURIComponent(taskId)}/dev-notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
    } catch {
        throw new ApiRequestError('Unable to reach task notes API', 'network')
    }

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as TaskDevNote
}

export async function removeTaskAttachment(taskId: string, attachmentId: string): Promise<void> {
    let response: Response
    try {
        response = await fetch(
            `/api/feedback-chat/tasks/${encodeURIComponent(taskId)}/attachments/${encodeURIComponent(attachmentId)}`,
            { method: 'DELETE' }
        )
    } catch {
        throw new ApiRequestError('Unable to reach task attachments API', 'network')
    }

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }
}
