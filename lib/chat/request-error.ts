export type RequestErrorKind = 'http' | 'network' | 'unknown'

export class ApiRequestError extends Error {
    status?: number
    kind: RequestErrorKind

    constructor(message: string, kind: RequestErrorKind, status?: number) {
        super(message)
        this.kind = kind
        this.status = status
    }
}

function browserOffline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine === false
}

export function toApiRequestError(error: unknown): ApiRequestError {
    if (error instanceof ApiRequestError) {
        return error
    }

    if (error instanceof Error) {
        const lowered = error.message.toLowerCase()
        if (lowered.includes('failed to fetch') || lowered.includes('network')) {
            return new ApiRequestError(error.message, 'network')
        }
        return new ApiRequestError(error.message, 'unknown')
    }

    return new ApiRequestError('Unknown request error', 'unknown')
}

export function buildConnectionMessage(error: unknown): string {
    const requestError = toApiRequestError(error)
    const message = requestError.message.toLowerCase()

    if (browserOffline() || requestError.kind === 'network') {
        return 'Sin conexion a internet. No se pudo conectar con el servidor.'
    }

    if (
        requestError.status === 502
        || requestError.status === 503
        || requestError.status === 504
        || requestError.status === 500
        || message.includes('timeout')
        || message.includes('unavailable')
    ) {
        return 'El backend no esta disponible en este momento. Intenta nuevamente.'
    }

    return 'No se pudo completar la solicitud al servidor.'
}

export function isBackendUnavailableMessage(message: string | null | undefined): boolean {
    if (!message) {
        return false
    }
    return message.toLowerCase().includes('backend no esta disponible')
}

export function isConnectivityIssue(error: unknown): boolean {
    const requestError = toApiRequestError(error)
    return browserOffline()
        || requestError.kind === 'network'
        || requestError.status === 500
        || requestError.status === 502
        || requestError.status === 503
        || requestError.status === 504
}
