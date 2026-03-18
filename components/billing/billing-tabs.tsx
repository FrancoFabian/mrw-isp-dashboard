"use client"

import { usePathname, useRouter } from "next/navigation"
import { ModernTabs } from "@/components/ui/tabs-modern"

export function BillingTabs() {
    const router = useRouter()
    const pathname = usePathname()

    // Determine the active tab based on the current URL
    let activeTab = "facturas"
    if (pathname.includes("/dashboard/billing/invoices")) {
        activeTab = "facturas"
    } else if (pathname.includes("/dashboard/billing/payments")) {
        activeTab = "pagos"
    } else if (pathname.includes("/dashboard/billing/plans")) {
        activeTab = "planes"
    }

    const handleTabChange = (id: string) => {
        if (id === "facturas") {
            router.push("/dashboard/billing/invoices")
        } else if (id === "pagos") {
            router.push("/dashboard/billing/payments")
        } else if (id === "planes") {
            router.push("/dashboard/billing/plans")
        }
    }

    return (
        <ModernTabs
            tabs={[
                { id: "facturas", label: "Facturas" },
                { id: "pagos", label: "Pagos y Conciliación" },
                { id: "planes", label: "Planes de internet" },
            ]}
            value={activeTab}
            onChange={handleTabChange}
        />
    )
}
