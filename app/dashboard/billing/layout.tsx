import React from "react"
import { BillingTabs } from "@/components/billing/billing-tabs"

export default function BillingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <BillingTabs />
            {children}
        </div>
    )
}
