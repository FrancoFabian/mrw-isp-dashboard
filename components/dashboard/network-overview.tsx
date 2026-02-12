import { mockNodes } from "@/mocks/network"
import { nodeStatusDotColors, nodeStatusLabels } from "@/types/network"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function NetworkOverview() {
  const online = mockNodes.filter((n) => n.status === "online").length
  const degraded = mockNodes.filter((n) => n.status === "degraded").length
  const offline = mockNodes.filter((n) => n.status === "offline").length

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Estado de la red</h3>
          <p className="text-xs text-muted-foreground">{mockNodes.length} nodos en total</p>
        </div>
        <Link
          href="/dashboard/network"
          className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
        >
          Ver todo
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Summary bar */}
      <div className="mb-4 flex gap-3">
        <div className="flex-1 rounded-lg bg-emerald-500/10 p-3 text-center">
          <p className="text-lg font-bold text-emerald-400">{online}</p>
          <p className="text-xs text-emerald-400/70">En linea</p>
        </div>
        <div className="flex-1 rounded-lg bg-amber-500/10 p-3 text-center">
          <p className="text-lg font-bold text-amber-400">{degraded}</p>
          <p className="text-xs text-amber-400/70">Degradado</p>
        </div>
        <div className="flex-1 rounded-lg bg-red-500/10 p-3 text-center">
          <p className="text-lg font-bold text-red-400">{offline}</p>
          <p className="text-xs text-red-400/70">Sin conexion</p>
        </div>
      </div>

      {/* Node list */}
      <div className="space-y-2">
        {mockNodes.slice(0, 5).map((node) => (
          <div
            key={node.id}
            className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              <span className={cn("h-2 w-2 rounded-full", nodeStatusDotColors[node.status])} />
              <span className="text-sm text-foreground">{node.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{node.clients} clientes</span>
              <span className="text-xs text-muted-foreground">{nodeStatusLabels[node.status]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
