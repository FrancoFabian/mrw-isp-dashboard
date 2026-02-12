export interface BillingUpgradePending {
  targetPlanId: string
  priceDifference: number
  requestedAt: string
}

export interface BillingSummary {
  clientId: string
  planId: string
  nextChargeDate: string
  nextChargeAmount: number
  autopayEnabled: boolean
  allowMethodUpdatesWhileSuspended: boolean
  upgradePending?: BillingUpgradePending
}
