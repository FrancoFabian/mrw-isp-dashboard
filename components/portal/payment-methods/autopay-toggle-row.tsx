"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface AutopayToggleRowProps {
  enabled: boolean
  hasPrimaryMethod: boolean
  disabled?: boolean
  disabledReason?: string
  onChange: (next: boolean) => void
}

export function AutopayToggleRow({
  enabled,
  hasPrimaryMethod,
  disabled,
  disabledReason,
  onChange,
}: AutopayToggleRowProps) {
  const blockedByMissingPrimary = !hasPrimaryMethod
  const isDisabled = disabled || blockedByMissingPrimary
  const hint = blockedByMissingPrimary
    ? "Agrega un metodo principal para activarlo."
    : disabledReason

  return (
    <div className={cn("glass-card p-4 sm:p-5", isDisabled && "opacity-60")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Pago automatico mensual
            </h3>
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "ON" : "OFF"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Cobraremos el importe del plan en la fecha de corte.
          </p>
          {hint && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onChange}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}
