"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PaymentMethod } from "@/types/paymentMethod"
import {
  CreditCard,
  Landmark,
  Banknote,
  Star,
  Pencil,
  Trash2,
} from "lucide-react"

interface PaymentMethodCardRowProps {
  method: PaymentMethod
  disabled?: boolean
  onMakeDefault: (methodId: string) => void
  onEdit: (method: PaymentMethod) => void
  onDelete: (method: PaymentMethod) => void
}

function getMethodTitle(method: PaymentMethod) {
  if (method.type === "card") {
    return `${method.brand} •••• ${method.last4}`
  }
  if (method.type === "transfer") {
    return `${method.bankName} •••• ${method.accountLast4}`
  }
  return "Pago en efectivo"
}

function getMethodSubtitle(method: PaymentMethod) {
  if (method.type === "card") {
    return `Titular: ${method.cardholderName} · Vence ${method.expiry}`
  }
  if (method.type === "transfer") {
    return `Beneficiario: ${method.beneficiary}`
  }
  return method.note
}

function getMethodIcon(method: PaymentMethod) {
  if (method.type === "card") {
    return CreditCard
  }
  if (method.type === "transfer") {
    return Landmark
  }
  return Banknote
}

export function PaymentMethodCardRow({
  method,
  disabled,
  onMakeDefault,
  onEdit,
  onDelete,
}: PaymentMethodCardRowProps) {
  const Icon = getMethodIcon(method)

  return (
    <div
      className={cn(
        "glass-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {getMethodTitle(method)}
            </p>
            {method.isDefault && (
              <Badge className="gap-1 bg-primary/15 text-primary">
                <Star className="h-3 w-3" />
                Principal
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {getMethodSubtitle(method)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!method.isDefault && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onMakeDefault(method.id)}
            disabled={disabled}
          >
            Marcar como principal
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onEdit(method)}
          disabled={disabled}
        >
          <Pencil />
          Editar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(method)}
          disabled={disabled}
        >
          <Trash2 />
          Eliminar
        </Button>
      </div>
    </div>
  )
}
