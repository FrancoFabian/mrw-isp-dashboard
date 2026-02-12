"use client"

import { cn } from "@/lib/utils"
import type { InvoiceStatus } from "@/types/invoice"
import { invoiceStatusLabels, invoiceStatusColors } from "@/types/invoice"

interface InvoiceStatusBadgeProps {
    status: InvoiceStatus
    className?: string
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                invoiceStatusColors[status],
                className
            )}
        >
            {invoiceStatusLabels[status]}
        </span>
    )
}
