import { mockPlans } from "@/mocks/plans"
import { cn } from "@/lib/utils"
import { Wifi, Users, Zap } from "lucide-react"

export function PlansGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {mockPlans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "glass-card-hover relative p-5 space-y-4",
            plan.isPopular && "border-primary/40"
          )}
        >
          {plan.isPopular && (
            <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
              Popular
            </span>
          )}
          <div>
            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
            <p className="text-xs text-muted-foreground">{plan.description}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              ${plan.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">/mes</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-foreground">{plan.downloadSpeed} Mbps</span>{" "}
              descarga
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-foreground">{plan.uploadSpeed} Mbps</span>{" "}
              subida
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-foreground">{plan.clientCount}</span>{" "}
              clientes
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
