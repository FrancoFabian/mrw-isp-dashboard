"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mockClients } from "@/mocks/clients"
import { mockPlans } from "@/mocks/plans"
import {
  lifecycleStatusLabels,
  lifecycleStatusColors,
  type ClientLifecycleStatus,
} from "@/types/client"
import type { Plan } from "@/types/plan"
import {
  Signal,
  CheckCircle,
  Clock,
  Calendar,
  Wrench,
  CreditCard,
  Zap,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
  WifiOff,
  X,
} from "lucide-react"

// The "logged in" client — CLT-001 Carlos Martinez (active)
const currentClient = mockClients[0]
const currentPlan = mockPlans.find((p) => p.id === currentClient.planId)
const upgradePlans = mockPlans.filter(
  (p) => currentPlan && p.price > currentPlan.price
)

export default function ClientPortalPage() {
  // Allow toggling lifecycle for demo purposes
  const [lifecycle, setLifecycle] = useState<ClientLifecycleStatus>(
    currentClient.lifecycleStatus
  )
  const [upgradeTarget, setUpgradeTarget] = useState<Plan | null>(null)
  const [upgraded, setUpgraded] = useState(false)
  const [activePlan, setActivePlan] = useState(currentPlan)

  if (lifecycle === "suspended") {
    return <SuspendedView onSimulate={setLifecycle} />
  }

  if (lifecycle === "prospect" || lifecycle === "installation_scheduled") {
    return <ProspectView lifecycle={lifecycle} onSimulate={setLifecycle} />
  }

  if (lifecycle === "installation_confirmed") {
    return <InstallationInProgressView onSimulate={setLifecycle} />
  }

  if (lifecycle === "installed") {
    return <PostInstallationView onSimulate={setLifecycle} />
  }

  // Active client - full portal
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Hola, {currentClient.firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu servicio de internet esta funcionando correctamente
          </p>
        </div>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
            lifecycleStatusColors[lifecycle]
          )}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {lifecycleStatusLabels[lifecycle]}
        </span>
      </div>

      {/* Service summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tu plan</p>
              <p className="text-sm font-bold text-foreground">
                {activePlan?.name} - {activePlan?.speed}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Signal className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="text-sm font-bold text-emerald-400">Conectado</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Proximo cobro</p>
              <p className="text-sm font-bold text-foreground">
                {currentClient.cutoffDate}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mensualidad</p>
              <p className="text-sm font-bold text-foreground">
                ${activePlan?.price.toLocaleString()} MXN
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Plan details */}
        <div className="glass-card space-y-4 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-foreground">
            Detalles de tu plan
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Velocidad de descarga</span>
              <span className="text-sm font-medium text-foreground">
                {activePlan?.downloadSpeed} Mbps
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Velocidad de subida</span>
              <span className="text-sm font-medium text-foreground">
                {activePlan?.uploadSpeed} Mbps
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Fecha de corte</span>
              <span className="text-sm font-medium text-foreground">
                Dia {currentClient.cutoffDate.slice(8)} de cada mes
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Pago automatico</span>
              <span
                className={cn(
                  "text-sm font-medium",
                  currentClient.autopayEnabled
                    ? "text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                {currentClient.autopayEnabled ? "Activado" : "Desactivado"}
              </span>
            </div>
          </div>
        </div>

        {/* Consumption simplified */}
        <div className="glass-card space-y-4 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-foreground">
            Tu consumo este mes
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descarga</span>
                <span className="font-medium text-foreground">128.5 GB</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: "65%" }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Sin limite de datos en tu plan
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subida</span>
                <span className="font-medium text-foreground">24.2 GB</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: "30%" }}
                />
              </div>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-muted-foreground">
                  Tu velocidad promedio esta semana:{" "}
                  <span className="font-medium text-foreground">
                    {activePlan
                      ? Math.round(activePlan.downloadSpeed * 0.92)
                      : 0}{" "}
                    Mbps
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade plan section */}
      {upgradePlans.length > 0 && !upgraded && (
        <div className="glass-card space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Mejora tu plan
              </h2>
              <p className="text-sm text-muted-foreground">
                Obtene mas velocidad al instante
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {upgradePlans.map((plan) => {
              const priceDiff = activePlan ? plan.price - activePlan.price : plan.price
              const daysLeft = 15
              const prorated = Math.round((priceDiff * daysLeft) / 30)

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setUpgradeTarget(plan)}
                  className="glass-card-hover space-y-2 p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <span className="text-xs font-medium text-primary">
                      {plan.speed}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /mes
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +${priceDiff}/mes vs tu plan actual -- Prorrateo hoy: $
                    {prorated}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {upgraded && (
        <div className="glass-card border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Plan actualizado exitosamente
              </p>
              <p className="text-xs text-muted-foreground">
                Tu nuevo plan {activePlan?.name} - {activePlan?.speed} ya esta
                activo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade confirmation modal */}
      {upgradeTarget && (
        <UpgradeModal
          target={upgradeTarget}
          currentPlan={activePlan!}
          onConfirm={() => {
            setActivePlan(upgradeTarget)
            setUpgradeTarget(null)
            setUpgraded(true)
          }}
          onCancel={() => setUpgradeTarget(null)}
        />
      )}

      {/* Lifecycle demo switcher */}
      <LifecycleDemo current={lifecycle} onChange={setLifecycle} />
    </div>
  )
}

// ---- Upgrade modal ----
function UpgradeModal({
  target,
  currentPlan: current,
  onConfirm,
  onCancel,
}: {
  target: Plan
  currentPlan: Plan
  onConfirm: () => void
  onCancel: () => void
}) {
  const priceDiff = target.price - current.price
  const daysLeft = 15
  const prorated = Math.round((priceDiff * daysLeft) / 30)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Confirmar cambio de plan
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Current vs New */}
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg bg-secondary/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Plan actual</p>
              <p className="text-sm font-semibold text-foreground">
                {current.name}
              </p>
              <p className="text-xs text-muted-foreground">{current.speed}</p>
              <p className="text-base font-bold text-foreground">
                ${current.price}/mes
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1 rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
              <p className="text-xs text-primary">Nuevo plan</p>
              <p className="text-sm font-semibold text-foreground">
                {target.name}
              </p>
              <p className="text-xs text-muted-foreground">{target.speed}</p>
              <p className="text-base font-bold text-primary">
                ${target.price}/mes
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 rounded-lg bg-secondary/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Diferencia mensual</span>
              <span className="font-medium text-foreground">
                +${priceDiff}/mes
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Dias restantes este ciclo
              </span>
              <span className="font-medium text-foreground">{daysLeft}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  Pago proporcional hoy
                </span>
                <span className="font-bold text-primary">${prorated} MXN</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            El cambio se aplica de forma inmediata. Tu nuevo precio mensual sera
            de ${target.price} MXN a partir del proximo ciclo de facturacion.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Pagar ${prorated} y activar
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Sub-views for different lifecycle stages ----

function ProspectView({
  lifecycle,
  onSimulate,
}: {
  lifecycle: ClientLifecycleStatus
  onSimulate: (s: ClientLifecycleStatus) => void
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Bienvenido, {currentClient.firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu cita de instalacion esta siendo procesada
        </p>
      </div>

      {/* Status banner */}
      <div className="glass-card flex flex-col items-center gap-4 p-6 text-center sm:p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <Clock className="h-8 w-8 text-amber-400" />
        </div>
        <div>
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-sm font-medium",
              lifecycleStatusColors[lifecycle]
            )}
          >
            {lifecycleStatusLabels[lifecycle]}
          </span>
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Tu cita de instalacion
          </h2>
          <p className="text-sm text-muted-foreground">
            Un tecnico de nuestro equipo visitara tu domicilio para instalar el
            servicio de internet. Te avisaremos cuando tu cita sea confirmada.
          </p>
        </div>

        {/* Appointment details */}
        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Fecha</span>
            <span className="text-sm font-medium text-foreground">
              7 de febrero, 2026
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Horario</span>
            <span className="text-sm font-medium text-foreground">
              09:00 - 11:00
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Plan elegido</span>
            <span className="text-sm font-medium text-primary">
              {currentPlan?.name} - {currentPlan?.speed}
            </span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="glass-card p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-medium text-foreground">
          Pasos para activar tu servicio
        </h3>
        <div className="space-y-3">
          {[
            {
              step: 1,
              label: "Agendar cita",
              done: true,
            },
            {
              step: 2,
              label: "Confirmacion de cita",
              done: lifecycle !== "prospect",
            },
            { step: 3, label: "Instalacion", done: false },
            { step: 4, label: "Elegir plan y metodo de pago", done: false },
            { step: 5, label: "Servicio activo", done: false },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  s.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {s.done ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  s.step
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  s.done
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <LifecycleDemo current={lifecycle} onChange={onSimulate} />
    </div>
  )
}

function InstallationInProgressView({
  onSimulate,
}: {
  onSimulate: (s: ClientLifecycleStatus) => void
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Instalacion en curso
        </h1>
        <p className="text-sm text-muted-foreground">
          Nuestro tecnico esta preparando tu servicio
        </p>
      </div>

      <div className="glass-card flex flex-col items-center gap-4 p-6 text-center sm:p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">
          <Wrench className="h-8 w-8 text-cyan-400" />
        </div>
        <div>
          <span className="inline-flex rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-medium text-cyan-400">
            Instalacion confirmada
          </span>
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Tu instalacion esta programada
          </h2>
          <p className="text-sm text-muted-foreground">
            Un tecnico visitara tu domicilio para instalar el servicio. Te notificaremos
            cuando este en camino.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Tecnico</span>
            <span className="text-sm font-medium text-foreground">
              Luis Ramirez
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Fecha</span>
            <span className="text-sm font-medium text-foreground">
              6 de febrero, 2026
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Horario</span>
            <span className="text-sm font-medium text-foreground">
              09:00 - 11:00
            </span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-lg border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Que puedes hacer ahora
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Por el momento puedes ver el estado de tu instalacion. Una vez
              completada, podras elegir tu plan de internet y metodo de pago.
            </p>
          </div>
        </div>
      </div>

      <LifecycleDemo current="installation_confirmed" onChange={onSimulate} />
    </div>
  )
}

function PostInstallationView({
  onSimulate,
}: {
  onSimulate: (s: ClientLifecycleStatus) => void
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Instalacion completada
        </h1>
        <p className="text-sm text-muted-foreground">
          Ya casi estas listo para navegar
        </p>
      </div>

      <div className="glass-card flex flex-col items-center gap-4 p-6 text-center sm:p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Tu equipo fue instalado correctamente
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Para activar tu servicio, elige tu plan de internet y agrega un metodo
          de pago. Tu primer cobro sera al dia siguiente de la activacion.
        </p>
      </div>

      {/* Plan selection */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Elige tu plan
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {mockPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "glass-card-hover cursor-pointer space-y-3 p-4",
                plan.isPopular && "border-primary/30 ring-1 ring-primary/20"
              )}
            >
              {plan.isPopular && (
                <span className="inline-flex rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                  Recomendado
                </span>
              )}
              <h3 className="text-base font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="text-2xl font-bold text-foreground">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /mes
                </span>
              </p>
              <p className="text-sm text-primary">{plan.speed}</p>
              <p className="text-xs text-muted-foreground">
                {plan.description}
              </p>
              <button
                type="button"
                className={cn(
                  "w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  plan.isPopular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div className="glass-card space-y-4 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-foreground">
          Agrega un metodo de pago
        </h2>
        <p className="text-sm text-muted-foreground">
          Para activar tu servicio necesitas agregar al menos un metodo de pago.
          Podras cambiarlo en cualquier momento desde tu portal.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Tarjeta de credito/debito", desc: "Visa, Mastercard" },
            { label: "OXXO", desc: "Pago en tienda" },
            { label: "Transferencia bancaria", desc: "SPEI" },
          ].map((method) => (
            <button
              key={method.label}
              type="button"
              className="glass-card-hover flex items-center gap-3 p-4 text-left"
            >
              <CreditCard className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {method.label}
                </p>
                <p className="text-xs text-muted-foreground">{method.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <LifecycleDemo current="installed" onChange={onSimulate} />
    </div>
  )
}

function SuspendedView({
  onSimulate,
}: {
  onSimulate: (s: ClientLifecycleStatus) => void
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Tu servicio esta pausado
        </h1>
      </div>

      <div className="glass-card flex flex-col items-center gap-4 p-6 text-center sm:p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <WifiOff className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Tu servicio esta pausado por falta de pago
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          No te preocupes, puedes reactivar tu servicio inmediatamente realizando
          el pago pendiente. Tu conexion se restaurara automaticamente.
        </p>

        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Monto pendiente</span>
            <span className="text-sm font-bold text-foreground">
              ${currentPlan?.price.toLocaleString()} MXN
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Fecha de vencimiento
            </span>
            <span className="text-sm font-medium text-red-400">
              {currentClient.cutoffDate}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="text-sm font-medium text-foreground">
              {currentPlan?.name} - {currentPlan?.speed}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSimulate("active")}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <CreditCard className="h-4 w-4" />
          Pagar ahora - ${currentPlan?.price.toLocaleString()} MXN
        </button>

        <p className="text-xs text-muted-foreground">
          Al pagar, tu servicio se reactiva automaticamente
        </p>
      </div>

      <div className="glass-card p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-medium text-foreground">
          Metodos de pago disponibles
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            "Tarjeta de credito/debito",
            "Pago en OXXO",
            "Transferencia bancaria",
          ].map((method) => (
            <div
              key={method}
              className="flex items-center gap-2 rounded-lg bg-secondary/30 px-4 py-3"
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{method}</span>
            </div>
          ))}
        </div>
      </div>

      <LifecycleDemo current="suspended" onChange={onSimulate} />
    </div>
  )
}

// --- Demo lifecycle switcher (for testing different states) ---
function LifecycleDemo({
  current,
  onChange,
}: {
  current: ClientLifecycleStatus
  onChange: (s: ClientLifecycleStatus) => void
}) {
  const stages: ClientLifecycleStatus[] = [
    "prospect",
    "installation_scheduled",
    "installation_confirmed",
    "installed",
    "active",
    "suspended",
  ]

  return (
    <div className="glass-card border-dashed border-primary/20 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-primary">
        Demo: simular estado del cliente
      </p>
      <div className="flex flex-wrap gap-2">
        {stages.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              current === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {lifecycleStatusLabels[s]}
          </button>
        ))}
      </div>
    </div>
  )
}
