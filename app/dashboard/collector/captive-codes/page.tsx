"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "@/components/dashboard/metric-card"
import { mockCaptiveCodes } from "@/mocks/captiveAccess"
import {
  captiveCodeOptions,
  captiveAccessRules,
  captiveCodeStatusLabels,
  captiveCodeStatusColors,
  captiveUserTypeLabels,
  captiveUserTypeColors,
  type CaptiveCode,
  type CaptiveUserType,
  type CaptivePlanTier,
} from "@/types/captive"
import {
  Ticket,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  X,
  ShieldCheck,
  Search,
} from "lucide-react"

export default function CollectorCaptiveCodesPage() {
  const [codes, setCodes] = useState<CaptiveCode[]>(mockCaptiveCodes)
  const [showSellModal, setShowSellModal] = useState(false)

  const todayCodes = codes.filter(
    (c) => c.soldAt.startsWith("2026-02-06")
  )
  const todayRevenue = todayCodes.reduce(
    (sum, c) => sum + (c.discountedPrice ?? c.price),
    0
  )
  const activeCodes = codes.filter((c) => c.status === "active")

  function handleSell(newCode: CaptiveCode) {
    setCodes((prev) => [newCode, ...prev])
    setShowSellModal(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Venta de codigos cautivo
          </h1>
          <p className="text-sm text-muted-foreground">
            Genera y vende codigos de acceso para el portal cautivo
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSellModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Ticket className="h-4 w-4" />
          Vender codigo
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          title="Vendidos hoy"
          value={String(todayCodes.length)}
          icon={<Ticket className="h-5 w-5" />}
          iconColor="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Ingreso hoy"
          value={`$${todayRevenue}`}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-400"
        />
        <MetricCard
          title="Codigos activos"
          value={String(activeCodes.length)}
          icon={<CheckCircle className="h-5 w-5" />}
          iconColor="bg-cyan-500/10 text-cyan-400"
        />
        <MetricCard
          title="Total generados"
          value={String(codes.length)}
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-amber-500/10 text-amber-400"
        />
      </div>

      {/* Pricing rules reference */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Reglas de precios
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {captiveAccessRules.map((rule) => (
            <div
              key={rule.plan}
              className="rounded-lg bg-secondary/30 px-3 py-2"
            >
              <p className="text-xs font-medium text-foreground">
                Plan {rule.plan}
              </p>
              <p
                className={cn(
                  "text-xs",
                  rule.discount === 100
                    ? "font-medium text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                {rule.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent codes table */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-foreground">
            Codigos recientes
          </h2>
        </div>
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Codigo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Duracion
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cobrado
                </th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr
                  key={code.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-sm text-foreground">
                    {code.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {code.duration}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        captiveUserTypeColors[code.userType]
                      )}
                    >
                      {captiveUserTypeLabels[code.userType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {code.clientName || "---"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        captiveCodeStatusColors[code.status]
                      )}
                    >
                      {captiveCodeStatusLabels[code.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {(code.discountedPrice ?? code.price) === 0
                      ? "Gratis"
                      : `$${code.discountedPrice ?? code.price}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="space-y-px sm:hidden">
          {codes.map((code) => (
            <div
              key={code.id}
              className="flex items-center justify-between border-b border-border/50 px-4 py-3 last:border-0"
            >
              <div>
                <p className="font-mono text-sm font-medium text-foreground">
                  {code.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {code.duration} -- {captiveUserTypeLabels[code.userType]}
                  {code.clientName ? ` -- ${code.clientName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    captiveCodeStatusColors[code.status]
                  )}
                >
                  {captiveCodeStatusLabels[code.status]}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {(code.discountedPrice ?? code.price) === 0
                    ? "Gratis"
                    : `$${code.discountedPrice ?? code.price}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sell modal */}
      {showSellModal && (
        <SellCodeModal
          onSell={handleSell}
          onClose={() => setShowSellModal(false)}
          codeCount={codes.length}
        />
      )}
    </div>
  )
}

// ---- Sell code modal ----
function SellCodeModal({
  onSell,
  onClose,
  codeCount,
}: {
  onSell: (code: CaptiveCode) => void
  onClose: () => void
  codeCount: number
}) {
  const [userType, setUserType] = useState<CaptiveUserType>("NON_CLIENT")
  const [selectedDuration, setSelectedDuration] = useState(0)
  const [clientPlan, setClientPlan] = useState<CaptivePlanTier | "">("")
  const [clientName, setClientName] = useState("")

  const durationOption = captiveCodeOptions[selectedDuration]
  const basePrice = durationOption.price

  let finalPrice = basePrice
  let discountLabel = ""

  if (userType === "ISP_CLIENT" && clientPlan) {
    const rule = captiveAccessRules.find((r) => r.plan === clientPlan)
    if (rule) {
      if (rule.discount === 100) {
        finalPrice = 0
        discountLabel = "Acceso gratuito"
      } else {
        finalPrice = Math.round(basePrice * (1 - rule.discount / 100))
        discountLabel = `-${rule.discount}% descuento`
      }
    }
  }

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let result = "WIFI-"
    for (let i = 0; i < 4; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    result += "-"
    for (let i = 0; i < 2; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  }

  function handleConfirm() {
    const newCode: CaptiveCode = {
      id: `CAP-${String(codeCount + 1).padStart(3, "0")}`,
      code: generateCode(),
      duration: durationOption.duration,
      durationMinutes: durationOption.durationMinutes,
      price: basePrice,
      discountedPrice: userType === "ISP_CLIENT" ? finalPrice : undefined,
      userType,
      clientPlan: userType === "ISP_CLIENT" && clientPlan ? clientPlan as CaptivePlanTier : undefined,
      clientName: userType === "ISP_CLIENT" ? clientName || undefined : undefined,
      soldAt: new Date().toISOString(),
      soldBy: "STF-003",
      paymentMethod: "cash",
      status: "active",
    }
    onSell(newCode)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Vender codigo de acceso
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* User type */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tipo de usuario
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["NON_CLIENT", "ISP_CLIENT"] as CaptiveUserType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setUserType(t)
                    setClientPlan("")
                    setClientName("")
                  }}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    userType === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {captiveUserTypeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {/* ISP Client details */}
          {userType === "ISP_CLIENT" && (
            <div className="space-y-3 rounded-lg border border-border/50 bg-secondary/20 p-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Nombre del cliente
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Maria Lopez"
                  className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Plan del cliente
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["BASICO", "HOGAR", "PLUS", "EMPRESARIAL"] as CaptivePlanTier[]).map(
                    (plan) => {
                      const rule = captiveAccessRules.find(
                        (r) => r.plan === plan
                      )
                      return (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => setClientPlan(plan)}
                          className={cn(
                            "rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                            clientPlan === plan
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span>{plan}</span>
                          {rule && (
                            <span className="block text-[10px] opacity-80">
                              {rule.discount === 100
                                ? "Gratis"
                                : `-${rule.discount}%`}
                            </span>
                          )}
                        </button>
                      )
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Duracion
            </label>
            <div className="grid grid-cols-2 gap-2">
              {captiveCodeOptions.map((opt, i) => (
                <button
                  key={opt.duration}
                  type="button"
                  onClick={() => setSelectedDuration(i)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-left transition-colors",
                    selectedDuration === i
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-medium",
                      selectedDuration === i
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {opt.duration}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${opt.price} MXN
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Price summary */}
          <div className="space-y-2 rounded-lg bg-secondary/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Precio base</span>
              <span className="font-medium text-foreground">
                ${basePrice} MXN
              </span>
            </div>
            {discountLabel && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span className="font-medium text-emerald-400">
                  {discountLabel}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  Total a cobrar
                </span>
                <span className="text-lg font-bold text-primary">
                  {finalPrice === 0 ? "Gratis" : `$${finalPrice} MXN`}
                </span>
              </div>
            </div>
          </div>

          {finalPrice > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Pago en efectivo
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={userType === "ISP_CLIENT" && !clientPlan}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {finalPrice === 0
              ? "Generar codigo gratis"
              : `Cobrar $${finalPrice} y generar`}
          </button>
        </div>
      </div>
    </div>
  )
}
