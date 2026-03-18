"use client"

import { PlansGrid } from "@/components/billing/plans-grid"

export default function BillingPlansPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Planes de internet
        </h2>
        <PlansGrid />
      </div>
    </div>
  )
}
