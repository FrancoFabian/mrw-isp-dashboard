"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import type { ClientLifecycleStatus, ClientStatus } from "@/types/client"
import type { PaymentMethod } from "@/types/paymentMethod"
import { paymentMethodTypeLabels } from "@/types/paymentMethod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddEditPaymentMethodModal } from "@/components/portal/payment-methods/add-edit-payment-method-modal"
import { AutopayToggleRow } from "@/components/portal/payment-methods/autopay-toggle-row"
import { ConfirmDeleteDialog } from "@/components/portal/payment-methods/confirm-delete-dialog"
import { PaymentMethodCardRow } from "@/components/portal/payment-methods/payment-method-card-row"
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ShieldCheck,
} from "lucide-react"

const PRE_ACTIVATION_STATUSES: ClientLifecycleStatus[] = [
  "prospect",
  "installation_scheduled",
  "installation_confirmed",
  "installed",
]

interface PaymentMethodsSectionProps {
  clientId: string
  clientStatus: ClientStatus
  lifecycleStatus: ClientLifecycleStatus
  methods: PaymentMethod[]
  autopayEnabled: boolean
  allowMethodUpdatesWhileSuspended: boolean
  onMethodsChange: (methods: PaymentMethod[]) => void
  onAutopayChange: (enabled: boolean) => void
}

function formatPrimarySummary(method?: PaymentMethod) {
  if (!method) {
    return {
      title: "Sin metodo principal",
      subtitle: "Agrega uno para activar el pago automatico.",
      badge: "Sin definir",
    }
  }
  if (method.type === "card") {
    return {
      title: `${method.brand} •••• ${method.last4}`,
      subtitle: `Vence ${method.expiry} · ${method.cardholderName}`,
      badge: paymentMethodTypeLabels.card,
    }
  }
  if (method.type === "transfer") {
    return {
      title: `${method.bankName} •••• ${method.accountLast4}`,
      subtitle: `Beneficiario: ${method.beneficiary}`,
      badge: paymentMethodTypeLabels.transfer,
    }
  }
  return {
    title: "Efectivo",
    subtitle: method.note,
    badge: paymentMethodTypeLabels.cash,
  }
}

export function PaymentMethodsSection({
  clientId,
  clientStatus,
  lifecycleStatus,
  methods,
  autopayEnabled,
  allowMethodUpdatesWhileSuspended,
  onMethodsChange,
  onAutopayChange,
}: PaymentMethodsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)

  const isPreActivation = PRE_ACTIVATION_STATUSES.includes(lifecycleStatus)
  const isSuspended =
    clientStatus === "suspended" || lifecycleStatus === "suspended"
  const canManageMethods =
    !isPreActivation && (!isSuspended || allowMethodUpdatesWhileSuspended)
  const hasPrimary = methods.some((method) => method.isDefault)
  const primaryMethod = methods.find((method) => method.isDefault)
  const maxReached = methods.length >= 3

  const summary = useMemo(
    () => formatPrimarySummary(primaryMethod),
    [primaryMethod]
  )

  const openAddModal = () => {
    setModalMode("add")
    setEditingMethod(null)
    setModalOpen(true)
  }

  const openEditModal = (method: PaymentMethod) => {
    setModalMode("edit")
    setEditingMethod(method)
    setModalOpen(true)
  }

  const handleSave = (nextMethod: PaymentMethod) => {
    const isEdit = modalMode === "edit" && editingMethod
    const nextMethods = isEdit
      ? methods.map((method) =>
          method.id === nextMethod.id ? nextMethod : method
        )
      : [...methods, nextMethod]

    const normalized = nextMethod.isDefault
      ? nextMethods.map((method) => ({
          ...method,
          isDefault: method.id === nextMethod.id,
        }))
      : nextMethods

    if (!normalized.some((method) => method.isDefault) && autopayEnabled) {
      onAutopayChange(false)
    }

    onMethodsChange(normalized)
    setModalOpen(false)
    setEditingMethod(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) {
      return
    }
    const nextMethods = methods.filter(
      (method) => method.id !== deleteTarget.id
    )
    if (!nextMethods.some((method) => method.isDefault) && autopayEnabled) {
      onAutopayChange(false)
    }
    onMethodsChange(nextMethods)
    setDeleteTarget(null)
  }

  const handleMakeDefault = (methodId: string) => {
    const nextMethods = methods.map((method) => ({
      ...method,
      isDefault: method.id === methodId,
    }))
    onMethodsChange(nextMethods)
  }

  const disabledReason = isPreActivation
    ? "Disponible solo despues de instalacion validada."
    : isSuspended && !allowMethodUpdatesWhileSuspended
      ? "Tu cuenta esta suspendida. Regulariza el pago para actualizar."
      : undefined

  return (
    <div className="space-y-4">
      {isPreActivation && (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertTitle>Metodos de pago en espera</AlertTitle>
          <AlertDescription>
            Disponible solo despues de instalacion validada. Cuando tu servicio
            quede activo podras agregar y gestionar tus metodos.
            <div className="mt-3">
              <Button asChild size="sm" variant="secondary">
                <Link href="/dashboard/portal">Ver estado de instalacion</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isSuspended && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertTitle>Servicio suspendido</AlertTitle>
          <AlertDescription>
            Puedes pagar tu saldo para reactivar el servicio.{" "}
            {allowMethodUpdatesWhileSuspended
              ? "Tambien puedes actualizar tu metodo principal."
              : "Tu metodo de pago no puede modificarse mientras estes suspendido."}
            <div className="mt-3">
              <Button size="sm">
                Pagar ahora
                <ArrowUpRight />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="glass-card space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Metodos guardados
            </h2>
            <p className="text-xs text-muted-foreground">
              Gestiona tus metodos de pago y define el principal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{methods.length}/3</Badge>
            <Button
              type="button"
              size="sm"
              onClick={openAddModal}
              disabled={!canManageMethods || maxReached}
            >
              <Plus />
              Agregar metodo
            </Button>
          </div>
        </div>

        {maxReached && (
          <p className="text-xs text-muted-foreground">
            Has alcanzado el maximo de metodos permitidos por ahora.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-200">
                Metodo principal
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {summary.title}
            </p>
            <p className="text-xs text-muted-foreground">{summary.subtitle}</p>
            <Badge variant="secondary" className="mt-3">
              {summary.badge}
            </Badge>
          </div>
          <div
            className={cn(
              "rounded-lg border border-border/50 bg-secondary/30 p-4",
              !hasPrimary && "border-amber-500/30"
            )}
          >
            <p className="text-xs text-muted-foreground">Estado de cobro</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {autopayEnabled ? "Pago automatico activo" : "Pago manual"}
            </p>
            <p className="text-xs text-muted-foreground">
              {autopayEnabled
                ? "Se cobrara automaticamente con tu metodo principal."
                : "Activalo para no olvidar tu fecha de corte."}
            </p>
          </div>
        </div>

        <div className={cn("space-y-2", !canManageMethods && "opacity-70")}>
          {methods.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                Aun no tienes metodos registrados
              </p>
              <p className="text-xs text-muted-foreground">
                Agrega uno para activar el cobro automatico.
              </p>
            </div>
          )}
          {methods.map((method) => (
            <PaymentMethodCardRow
              key={method.id}
              method={method}
              disabled={!canManageMethods}
              onMakeDefault={handleMakeDefault}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      </div>

      <AutopayToggleRow
        enabled={autopayEnabled}
        hasPrimaryMethod={hasPrimary}
        disabled={!canManageMethods}
        disabledReason={disabledReason}
        onChange={(next) => {
          if (!canManageMethods || !hasPrimary) {
            return
          }
          onAutopayChange(next)
        }}
      />

      <AddEditPaymentMethodModal
        open={modalOpen}
        mode={modalMode}
        clientId={clientId}
        method={editingMethod}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        methodLabel={deleteTarget ? formatPrimarySummary(deleteTarget).title : ""}
        onConfirm={handleDelete}
      />
    </div>
  )
}
