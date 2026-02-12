"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  captiveCodeOptions,
  captiveAccessRules,
  type CaptivePlanTier,
} from "@/types/captive"
import {
  Globe,
  Wifi,
  Clock,
  CheckCircle,
  Ticket,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"

export default function CaptivePortalPage() {
  const [code, setCode] = useState("")
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState("")

  function handleConnect() {
    setError("")
    if (!code.trim()) {
      setError("Ingresa un codigo de acceso")
      return
    }
    if (code.startsWith("WIFI-")) {
      setConnected(true)
    } else {
      setError("Codigo invalido. Verifica e intenta de nuevo.")
    }
  }

  if (connected) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col items-center gap-4 pt-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <Wifi className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Conectado</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Estas conectado a internet a traves del portal cautivo. Tu sesion
            esta activa.
          </p>

          <div className="w-full max-w-sm space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Codigo</span>
              <span className="font-mono text-sm font-medium text-foreground">
                {code}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Estado</span>
              <span className="text-sm font-medium text-emerald-400">
                Sesion activa
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Tiempo restante
              </span>
              <span className="text-sm font-medium text-foreground">
                2h 45m
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setConnected(false)
              setCode("")
            }}
            className="rounded-lg bg-secondary px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            Desconectar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Portal Cautivo
        </h1>
        <p className="text-sm text-muted-foreground">
          Conectate a internet usando un codigo de acceso
        </p>
      </div>

      {/* Connect card */}
      <div className="glass-card mx-auto max-w-md space-y-5 p-5 sm:p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Ingresa tu codigo
          </h2>
          <p className="text-sm text-muted-foreground">
            Ingresa el codigo de acceso que recibiste para conectarte a internet
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: WIFI-8A3F-X1"
            className="h-12 w-full rounded-lg border border-input bg-secondary px-4 text-center font-mono text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}
          <button
            type="button"
            onClick={handleConnect}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Wifi className="h-4 w-4" />
            Conectar
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="glass-card mx-auto max-w-md p-5 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Como funciona
        </h3>
        <div className="space-y-4">
          {[
            {
              icon: <Ticket className="h-4 w-4" />,
              title: "Obtene un codigo",
              desc: "Compra un codigo de acceso con cualquier cobrador autorizado.",
            },
            {
              icon: <ArrowRight className="h-4 w-4" />,
              title: "Ingresa tu codigo",
              desc: "Escribe el codigo en el campo de arriba.",
            },
            {
              icon: <CheckCircle className="h-4 w-4" />,
              title: "Navega",
              desc: "Tu sesion se activara automaticamente por el tiempo adquirido.",
            },
          ].map((step, i) => (
            <div key={step.title} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {step.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing & discounts */}
      <div className="glass-card mx-auto max-w-md space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Precios y descuentos
          </h3>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Precios base (no clientes)
          </p>
          {captiveCodeOptions.map((opt) => (
            <div
              key={opt.duration}
              className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">{opt.duration}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                ${opt.price} MXN
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Descuentos para clientes ISP
          </p>
          {captiveAccessRules.map((rule) => (
            <div
              key={rule.plan}
              className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-2.5"
            >
              <span className="text-sm text-foreground">
                Plan {rule.plan}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  rule.discount === 100
                    ? "text-emerald-400"
                    : "text-primary"
                )}
              >
                {rule.discount === 100
                  ? "Gratis"
                  : `-${rule.discount}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
