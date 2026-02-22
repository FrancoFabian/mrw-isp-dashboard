export function buildMediaUrl(mediaPath: string): string {
    const normalizedPath = mediaPath.replace(/^\/+/, '')
    const base = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '').replace(/\/+$/, '')
    if (base.length === 0) {
        return `/media/${normalizedPath}`
    }
    return `${base}/media/${normalizedPath}`
}
