"use client"

import { cn } from "@/lib/utils"
import type { PaymentSource } from "@/types/payment"
import { paymentSourceLabels, paymentSourceColors } from "@/types/payment"
import { User, Truck, Shield } from "lucide-react"

interface PaymentSourceBadgeProps {
    source: PaymentSource
    className?: string
}

const sourceIcons: Record<PaymentSource, React.ElementType> = {
    client: User,
    collector: Truck,
    admin: Shield,
}

export function PaymentSourceBadge({ source, className }: PaymentSourceBadgeProps) {
    const Icon = sourceIcons[source]

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                paymentSourceColors[source],
                className
            )}
        >
            <Icon className="h-3 w-3" />
            {paymentSourceLabels[source]}
        </span>
    )
}
