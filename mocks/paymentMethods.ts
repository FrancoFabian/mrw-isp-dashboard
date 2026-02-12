import type { PaymentMethod } from "@/types/paymentMethod"

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "PM-001",
    clientId: "CLT-001",
    type: "card",
    isDefault: true,
    cardholderName: "Carlos Martinez",
    brand: "Visa",
    last4: "4532",
    expiry: "08/27",
  },
  {
    id: "PM-002",
    clientId: "CLT-001",
    type: "card",
    isDefault: false,
    cardholderName: "Carlos Martinez",
    brand: "Mastercard",
    last4: "9912",
    expiry: "11/26",
  },
  {
    id: "PM-003",
    clientId: "CLT-001",
    type: "transfer",
    isDefault: false,
    bankName: "BBVA",
    accountLast4: "6021",
    beneficiary: "Carlos Martinez",
  },
]
