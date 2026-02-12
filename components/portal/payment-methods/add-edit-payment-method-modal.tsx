"use client"

import { useEffect, useMemo, useState } from "react"

import type {
  CardBrand,
  PaymentMethod,
  PaymentMethodType,
} from "@/types/paymentMethod"
import { cardBrandLabels, paymentMethodTypeLabels } from "@/types/paymentMethod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ModalMode = "add" | "edit"

interface PaymentMethodFormState {
  type: PaymentMethodType
  cardholderName: string
  last4: string
  expiry: string
  brand: CardBrand
  bankName: string
  accountLast4: string
  beneficiary: string
  cashNote: string
  setAsDefault: boolean
}

const emptyFormState: PaymentMethodFormState = {
  type: "card",
  cardholderName: "",
  last4: "",
  expiry: "",
  brand: "Visa",
  bankName: "",
  accountLast4: "",
  beneficiary: "",
  cashNote: "",
  setAsDefault: false,
}

interface AddEditPaymentMethodModalProps {
  open: boolean
  mode: ModalMode
  clientId: string
  method?: PaymentMethod | null
  onClose: () => void
  onSave: (method: PaymentMethod) => void
}

function buildFormState(method?: PaymentMethod | null): PaymentMethodFormState {
  if (!method) {
    return { ...emptyFormState }
  }
  if (method.type === "card") {
    return {
      type: "card",
      cardholderName: method.cardholderName,
      last4: method.last4,
      expiry: method.expiry,
      brand: method.brand,
      bankName: "",
      accountLast4: "",
      beneficiary: "",
      cashNote: "",
      setAsDefault: method.isDefault,
    }
  }
  if (method.type === "transfer") {
    return {
      type: "transfer",
      cardholderName: "",
      last4: "",
      expiry: "",
      brand: "Visa",
      bankName: method.bankName,
      accountLast4: method.accountLast4,
      beneficiary: method.beneficiary,
      cashNote: "",
      setAsDefault: method.isDefault,
    }
  }
  return {
    type: "cash",
    cardholderName: "",
    last4: "",
    expiry: "",
    brand: "Visa",
    bankName: "",
    accountLast4: "",
    beneficiary: "",
    cashNote: method.note,
    setAsDefault: method.isDefault,
  }
}

function buildPaymentMethod(
  clientId: string,
  mode: ModalMode,
  formState: PaymentMethodFormState,
  existing?: PaymentMethod | null
): PaymentMethod {
  const id =
    mode === "edit" && existing ? existing.id : `PM-${Date.now().toString()}`
  const isDefault =
    mode === "edit" && existing ? existing.isDefault : formState.setAsDefault

  if (formState.type === "card") {
    return {
      id,
      clientId,
      type: "card",
      isDefault,
      cardholderName: formState.cardholderName.trim() || "Titular no definido",
      brand: formState.brand,
      last4: formState.last4.padStart(4, "0").slice(-4),
      expiry: formState.expiry || "MM/YY",
    }
  }
  if (formState.type === "transfer") {
    return {
      id,
      clientId,
      type: "transfer",
      isDefault,
      bankName: formState.bankName.trim() || "Banco",
      accountLast4: formState.accountLast4.padStart(4, "0").slice(-4),
      beneficiary: formState.beneficiary.trim() || "Beneficiario",
    }
  }
  return {
    id,
    clientId,
    type: "cash",
    isDefault,
    note: formState.cashNote.trim() || "Registro interno de efectivo",
  }
}

export function AddEditPaymentMethodModal({
  open,
  mode,
  clientId,
  method,
  onClose,
  onSave,
}: AddEditPaymentMethodModalProps) {
  const [formState, setFormState] = useState<PaymentMethodFormState>(
    emptyFormState
  )

  useEffect(() => {
    if (open) {
      setFormState(buildFormState(method))
    }
  }, [open, method])

  const isEdit = mode === "edit"
  const isCard = formState.type === "card"
  const isTransfer = formState.type === "transfer"
  const isCash = formState.type === "cash"

  const typeOptions = useMemo<PaymentMethodType[]>(
    () => ["card", "transfer", "cash"],
    []
  )

  const brandOptions = useMemo<CardBrand[]>(
    () => ["Visa", "Mastercard", "Amex"],
    []
  )

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar metodo de pago" : "Agregar metodo de pago"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos permitidos de tu metodo guardado."
              : "Registra un nuevo metodo para tus cobros mensuales."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="payment-type">Tipo de metodo</Label>
            <Select
              value={formState.type}
              onValueChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  type: value as PaymentMethodType,
                }))
              }
              disabled={isEdit}
            >
              <SelectTrigger id="payment-type">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {paymentMethodTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCard && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="cardholder">Nombre del titular</Label>
                <Input
                  id="cardholder"
                  value={formState.cardholderName}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      cardholderName: event.target.value,
                    }))
                  }
                  placeholder="Como aparece en la tarjeta"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card-last4">Ultimos 4</Label>
                <Input
                  id="card-last4"
                  value={formState.last4}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      last4: event.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  placeholder="1234"
                  disabled={isEdit}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card-expiry">Vencimiento</Label>
                <Input
                  id="card-expiry"
                  value={formState.expiry}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      expiry: event.target.value,
                    }))
                  }
                  placeholder="MM/YY"
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>Marca</Label>
                <Select
                  value={formState.brand}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      brand: value as CardBrand,
                    }))
                  }
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marca de tarjeta" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {cardBrandLabels[brand]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isTransfer && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="bank-name">Banco</Label>
                <Input
                  id="bank-name"
                  value={formState.bankName}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      bankName: event.target.value,
                    }))
                  }
                  placeholder="Banco emisor"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="account-last4">Ultimos 4</Label>
                <Input
                  id="account-last4"
                  value={formState.accountLast4}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      accountLast4: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4),
                    }))
                  }
                  placeholder="9876"
                  disabled={isEdit}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="beneficiary">Beneficiario</Label>
                <Input
                  id="beneficiary"
                  value={formState.beneficiary}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      beneficiary: event.target.value,
                    }))
                  }
                  placeholder="Nombre del titular"
                />
              </div>
            </div>
          )}

          {isCash && (
            <div className="grid gap-2">
              <Label htmlFor="cash-note">Nota interna</Label>
              <Input
                id="cash-note"
                value={formState.cashNote}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    cashNote: event.target.value,
                  }))
                }
                placeholder="Ej. Pago en oficina o cobrador"
              />
              <p className="text-xs text-muted-foreground">
                Solo para registro interno. No habilita cobro automatico.
              </p>
            </div>
          )}

          {!isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Establecer como principal
                </p>
                <p className="text-xs text-muted-foreground">
                  Se usara para pagos automaticos.
                </p>
              </div>
              <Switch
                checked={formState.setAsDefault}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({
                    ...prev,
                    setAsDefault: checked,
                  }))
                }
              />
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => {
              const nextMethod = buildPaymentMethod(
                clientId,
                mode,
                formState,
                method
              )
              onSave(nextMethod)
            }}
          >
            {isEdit ? "Guardar cambios" : "Agregar metodo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
