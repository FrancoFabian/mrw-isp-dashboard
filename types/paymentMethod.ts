export type PaymentMethodType = "card" | "transfer" | "cash"

export type CardBrand = "Visa" | "Mastercard" | "Amex"

export interface BasePaymentMethod {
  id: string
  clientId: string
  type: PaymentMethodType
  isDefault: boolean
  nickname?: string
}

export interface CardPaymentMethod extends BasePaymentMethod {
  type: "card"
  cardholderName: string
  brand: CardBrand
  last4: string
  expiry: string
}

export interface TransferPaymentMethod extends BasePaymentMethod {
  type: "transfer"
  bankName: string
  accountLast4: string
  beneficiary: string
}

export interface CashPaymentMethod extends BasePaymentMethod {
  type: "cash"
  note: string
}

export type PaymentMethod =
  | CardPaymentMethod
  | TransferPaymentMethod
  | CashPaymentMethod

export const paymentMethodTypeLabels: Record<PaymentMethodType, string> = {
  card: "Tarjeta",
  transfer: "Transferencia",
  cash: "Efectivo",
}

export const cardBrandLabels: Record<CardBrand, string> = {
  Visa: "Visa",
  Mastercard: "Mastercard",
  Amex: "American Express",
}
