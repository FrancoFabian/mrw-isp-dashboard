import type { BillingSummary } from "@/types/billing"

export const mockBillingSummary: BillingSummary[] = [
  {
    clientId: "CLT-001",
    planId: "PLN-003",
    nextChargeDate: "2026-02-15",
    nextChargeAmount: 699,
    autopayEnabled: true,
    allowMethodUpdatesWhileSuspended: true,
    upgradePending: {
      targetPlanId: "PLN-004",
      priceDifference: 300,
      requestedAt: "2026-02-03",
    },
  },
  {
    clientId: "CLT-003",
    planId: "PLN-001",
    nextChargeDate: "2026-01-05",
    nextChargeAmount: 349,
    autopayEnabled: false,
    allowMethodUpdatesWhileSuspended: false,
  },
]
