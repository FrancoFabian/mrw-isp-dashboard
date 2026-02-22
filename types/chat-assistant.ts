import type { UserRole } from '@/types/roles'
import type { RoleTag, TaskPriority, TaskType } from '@/types/task'

export interface AssistantChatRequest {
    message: string
    route: string
    sectionTag: string
    role: UserRole
    roleTag: RoleTag
    taskId: string
    taskType: TaskType
    priority: TaskPriority
    userName?: string
    isGeneralMode: boolean
    modelPreference?: 'default' | 'gpt-5-mini'
}

export interface AssistantUsageMetrics {
    promptTokens: number
    completionTokens: number
    cachedPromptTokens: number
    totalTokens: number
    estimatedCostUsd: number
}

export interface AssistantChatResponse {
    reply: string
    provider: 'mock' | 'openai'
    model: string
    requestId?: string
    usage?: AssistantUsageMetrics
    questions?: string[]
}

export interface ImproveMessageRequest {
    message: string
    route: string
    sectionTag: string
    role: UserRole
    roleTag: RoleTag
    taskType: TaskType
    priority: TaskPriority
    userName?: string
    isGeneralMode: boolean
    modelPreference?: 'default' | 'gpt-5-mini'
}

export interface ImproveMessageResponse {
    improvedMessage: string
    provider: 'mock' | 'openai'
    model: string
    requestId?: string
    usage?: AssistantUsageMetrics
}

export interface UsageByModelSummary {
    model: string
    eventCount: number
    promptTokens: number
    completionTokens: number
    cachedPromptTokens: number
    totalTokens: number
    estimatedCostUsd: number
}

export interface UsageTotalsSummary {
    eventCount: number
    promptTokens: number
    completionTokens: number
    cachedPromptTokens: number
    totalTokens: number
    estimatedCostUsd: number
}

export interface UsageSummaryResponse {
    requestId?: string
    currency: 'USD' | string
    totals: UsageTotalsSummary
    byModel: UsageByModelSummary[]
}
