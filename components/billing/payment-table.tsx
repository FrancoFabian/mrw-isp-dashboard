"use client"

import { cn } from "@/lib/utils"
import type { Payment, PaymentStatus } from "@/types/payment"
import { paymentStatusLabels, paymentStatusColors } from "@/types/payment"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertCircle } from "lucide-react"

interface PaymentTableProps {
  payments: Payment[]
}

export function PaymentTable({ payments }: PaymentTableProps) {
  return (
    <TooltipProvider>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                  Cliente
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                  Monto
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                  Vencimiento
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Metodo
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                  Estado
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Referencia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition-colors hover:bg-secondary/30"
                >
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-sm font-medium text-foreground">
                      {payment.clientName}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-sm font-semibold text-foreground">
                      ${payment.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-sm text-muted-foreground">
                      {payment.dueDate}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {payment.method || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium sm:px-2.5",
                          paymentStatusColors[payment.status]
                        )}
                      >
                        {paymentStatusLabels[payment.status]}
                      </span>
                      {payment.status === "overdue" && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs border-border bg-card text-card-foreground">
                            <p className="text-xs">
                              Este cliente no ha pagado. Su servicio puede ser
                              suspendido automaticamente si no se realiza el pago
                              antes de la proxima fecha de corte.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="font-mono text-sm text-muted-foreground">
                      {payment.reference || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  )
}
