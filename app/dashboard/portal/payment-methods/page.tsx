"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { mockClients } from "@/mocks/clients"
import { mockPlans } from "@/mocks/plans"
import { mockPaymentMethods } from "@/mocks/paymentMethods"
import { mockBillingSummary } from "@/mocks/billingSummary"
import type { BillingSummary } from "@/types/billing"
import type { PaymentMethod } from "@/types/paymentMethod"
import {
  clientStatusColors,
  clientStatusLabels,
} from "@/types/client"
import { PaymentMethodsSection } from "@/components/portal/payment-methods/payment-methods-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, CalendarDays, CreditCard, Zap } from "lucide-react"

const currentClient = mockClients[0]

function buildFallbackBilling(): BillingSummary {
  const plan = mockPlans.find((p) => p.id === currentClient.planId)

  return {
    clientId: currentClient.id,
    planId: currentClient.planId,
    nextChargeDate: currentClient.cutoffDate,
    nextChargeAmount: plan?.price ?? 0,
    autopayEnabled: currentClient.autopayEnabled ?? false,
    allowMethodUpdatesWhileSuspended: false,
  }
}

export default function ClientPaymentMethodsPage() {
  const billing =
    mockBillingSummary.find((item) => item.clientId === currentClient.id) ??
    buildFallbackBilling()

  const plan = mockPlans.find((p) => p.id === billing.planId)
  const upgradePlan = billing.upgradePending
    ? mockPlans.find((p) => p.id === billing.upgradePending?.targetPlanId)
    : null

  const initialMethods = useMemo<PaymentMethod[]>(
    () =>
      mockPaymentMethods.filter((method) => method.clientId === currentClient.id),
    []
  )

  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods)
  const [autopayEnabled, setAutopayEnabled] = useState<boolean>(
    billing.autopayEnabled
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Metodos de pago
          </h1>
          <p className="text-sm text-muted-foreground">
            Controla tus cobros automaticos y administra tus metodos guardados.
          </p>
        </div>
        <Badge className={cn("w-fit", clientStatusColors[currentClient.status])}>
          {clientStatusLabels[currentClient.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <PaymentMethodsSection
            clientId={currentClient.id}
            clientStatus={currentClient.status}
            lifecycleStatus={currentClient.lifecycleStatus}
            methods={methods}
            autopayEnabled={autopayEnabled}
            allowMethodUpdatesWhileSuspended={
              billing.allowMethodUpdatesWhileSuspended
            }
            onMethodsChange={setMethods}
            onAutopayChange={setAutopayEnabled}
          />
        </div>

        <div className="space-y-4">
          <div className="glass-card space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan actual</p>
                <p className="text-sm font-semibold text-foreground">
                  {plan?.name ?? "Plan no disponible"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {plan?.speed ?? "Sin velocidad asignada"}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-secondary/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">Mensualidad</p>
              <p className="text-base font-semibold text-foreground">
                ${billing.nextChargeAmount.toLocaleString()} MXN
              </p>
            </div>
          </div>

          <div className="glass-card space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <CalendarDays className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Proximo cobro</p>
                <p className="text-sm font-semibold text-foreground">
                  {billing.nextChargeDate}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-secondary/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">Metodo</p>
              <p className="text-sm font-medium text-foreground">
                {methods.find((method) => method.isDefault)
                  ? "Metodo principal asignado"
                  : "Sin metodo principal"}
              </p>
            </div>
          </div>

          {billing.upgradePending && upgradePlan && (
            <div className="glass-card border-primary/20 bg-primary/5 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Upgrade pendiente
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Plan destino: {upgradePlan.name} ({upgradePlan.speed})
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Diferencia por pagar hoy: $
                    {billing.upgradePending.priceDifference} MXN
                  </p>
                </div>
                <Button size="sm" className="shrink-0">
                  Pagar diferencia
                  <ArrowUpRight />
                </Button>
              </div>
            </div>
          )}

          <div className="glass-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
                <CreditCard className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pago automatico</p>
                <p className="text-sm font-semibold text-foreground">
                  {autopayEnabled ? "Activado" : "Desactivado"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Puedes activarlo o desactivarlo desde la seccion de metodos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
