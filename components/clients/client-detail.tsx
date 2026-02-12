'use client';

import { cn } from "@/lib/utils"
import type { Client } from "@/types/client"
import { clientStatusLabels, clientStatusColors } from "@/types/client"
import { mockPlans } from "@/mocks/plans"
import { mockPayments } from "@/mocks/payments"
import { paymentStatusLabels, paymentStatusColors } from "@/types/payment"
import {
  X,
  User,
  MapPin,
  Phone,
  Mail,
  Wifi,
  CreditCard,
  Calendar,
} from "lucide-react"

interface ClientDetailProps {
  client: Client
  onClose: () => void
}

export function ClientDetail({ client, onClose }: ClientDetailProps) {
  const plan = mockPlans.find((p) => p.id === client.planId)
  const payments = mockPayments
    .filter((p) => p.clientId === client.id)
    .slice(0, 5)

  return (
    <div className="glass-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {client.firstName[0]}
            {client.lastName[0]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {client.firstName} {client.lastName}
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                clientStatusColors[client.status]
              )}
            >
              {clientStatusLabels[client.status]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Contact info */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Datos de contacto
        </h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground">{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground">{client.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground">
              {client.address}, {client.city}
            </span>
          </div>
        </div>
      </div>

      {/* Plan info */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Plan contratado
        </h4>
        <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{plan?.name ?? "N/A"}</span>
            <span className="text-sm font-bold text-primary">
              ${plan?.price.toLocaleString() ?? "0"} /mes
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3" />
            <span>{plan?.speed ?? "N/A"} de descarga</span>
          </div>
        </div>
      </div>

      {/* Network info */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Conexion
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary/50 p-2.5">
            <p className="text-xs text-muted-foreground">Direccion IP</p>
            <p className="text-sm font-medium text-foreground">{client.ip}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2.5">
            <p className="text-xs text-muted-foreground">Nodo</p>
            <p className="text-sm font-medium text-foreground">{client.node}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2.5">
            <p className="text-xs text-muted-foreground">Fecha de corte</p>
            <p className="text-sm font-medium text-foreground">{client.cutoffDate}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2.5">
            <p className="text-xs text-muted-foreground">Registrado</p>
            <p className="text-sm font-medium text-foreground">{client.registeredAt}</p>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Historial de pagos
        </h4>
        {payments.length > 0 ? (
          <div className="space-y-1.5">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    ${payment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {payment.date || payment.dueDate}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      paymentStatusColors[payment.status]
                    )}
                  >
                    {paymentStatusLabels[payment.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Acciones rapidas
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {client.status === "active" ? (
            <button
              type="button"
              className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              Suspender
            </button>
          ) : (
            <button
              type="button"
              className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              Reactivar
            </button>
          )}
          <button
            type="button"
            className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            Cambiar plan
          </button>
        </div>
      </div>
    </div>
  )
}
