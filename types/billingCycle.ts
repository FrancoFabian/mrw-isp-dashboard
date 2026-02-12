export type BillingFrequency = "monthly" | "bimonthly" | "quarterly" | "annual"

export interface BillingCycle {
    id: string
    customerId: string
    planId: string
    planName: string
    frequency: BillingFrequency
    amount: number
    startDate: string
    nextDueDate: string
    gracePeriodDays: number
    autoSuspend: boolean
    isActive: boolean
}

export const billingFrequencyLabels: Record<BillingFrequency, string> = {
    monthly: "Mensual",
    bimonthly: "Bimestral",
    quarterly: "Trimestral",
    annual: "Anual",
}
