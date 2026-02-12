/**
 * Extracts a short title from a message for task display
 * @param message - Full user message
 * @param maxLength - Maximum characters (default 60)
 * @returns Truncated title ending at word boundary
 */
export function deriveTitleFromMessage(message: string, maxLength = 60): string {
    const trimmed = message.trim()

    if (trimmed.length <= maxLength) {
        return trimmed
    }

    // Find the last space before maxLength to avoid cutting words
    const truncated = trimmed.slice(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')

    if (lastSpace > maxLength * 0.5) {
        return truncated.slice(0, lastSpace) + '...'
    }

    return truncated + '...'
}
