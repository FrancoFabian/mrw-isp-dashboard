"use client"

import { useState } from "react"
import { mockPlans } from "@/mocks/plans"
import { cn } from "@/lib/utils"
import { Wifi, Users, Zap, Edit, Plus, Trash2 } from "lucide-react"
import type { Plan } from "@/types/plan"
import { PlanFormSheet, type PlanFormData } from "./plan-form-sheet"

export function PlansGrid() {
  const [plans, setPlans] = useState<Plan[]>(mockPlans)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const handleEdit = (plan: Plan) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setEditingPlan(plan)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setEditingPlan(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    // Prevent default so we don't accidentally trigger parent clicks if this was part of an anchor
    e.preventDefault();
    if (confirm("¿Estás seguro de que deseas eliminar este plan?")) {
      setPlans(plans.filter((p) => p.id !== id))
    }
  }

  const handleSave = (data: PlanFormData) => {
    if (editingPlan) {
      setPlans(
        plans.map((p) =>
          p.id === editingPlan.id
            ? { ...p, ...data, speed: `${data.downloadSpeed} Mbps` }
            : p
        )
      )
    } else {
      const newPlan: Plan = {
        id: `PLN-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        speed: `${data.downloadSpeed} Mbps`,
      }
      setPlans([...plans, newPlan])
    }
  }

  // Helper fns for styling exactly like landing
  const getHeaderGradient = (name: string, isPopular: boolean) => {
    const isPlus = name.toLowerCase().includes("plus")
    const isBusiness = name.toLowerCase().includes("empresarial")
    if (isPopular) return "linear-gradient(118deg, rgba(0, 225, 255, 1) 0%, rgba(3, 7, 255, 1) 89%)"
    if (isPlus) return "linear-gradient(118deg, rgba(245, 245, 245, 1) 0%, rgba(91, 91, 94, 1) 68%)"
    if (isBusiness) return "linear-gradient(118deg, rgba(4, 0, 125, 1) 0%, rgba(34, 3, 51, 1) 68%)"
    return undefined
  }

  const getHeaderBorderClass = (name: string, isPopular: boolean) => {
    const isPlus = name.toLowerCase().includes("plus")
    const isBusiness = name.toLowerCase().includes("empresarial")
    if (isPopular) return "border-white/15 border-b-black/20 border-t-white/35"
    if (isPlus) return "border-white/30 border-b-zinc-600/40 border-t-white/50"
    if (isBusiness) return "border-purple-300/30 border-b-purple-900/40 border-t-purple-200/50"
    return "border-white/6 bg-zinc-900"
  }

  const getActiveColor = (name: string, isPopular: boolean) => {
    const isPlus = name.toLowerCase().includes("plus")
    const isBusiness = name.toLowerCase().includes("empresarial")
    let activeColor = "#3b82f6" // fallback primary blue
    if (isPopular) activeColor = "#3b82f6" // Blue
    if (isPlus) activeColor = "#94a3b8" // Slate
    if (isBusiness) activeColor = "#a855f7" // Purple
    return activeColor
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2 pb-8">
        {plans.map((plan) => {
          const isPlus = plan.name.toLowerCase().includes("plus")
          const isBusiness = plan.name.toLowerCase().includes("empresarial")
          const hasGradient = plan.isPopular || isPlus || isBusiness
          const activeColor = getActiveColor(plan.name, plan.isPopular)

          return (
            <div
              key={plan.id}
              className="group relative border border-white/10 rounded-2xl bg-zinc-950 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                "--active-color": activeColor,
                borderColor: "rgba(255,255,255,0.1)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              } as React.CSSProperties}
            >
              {/* Edit Actions - Hidden by default, visible on group hover */}
              <div className="absolute top-2 right-2 z-30 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(plan)}
                  className="rounded-full bg-zinc-800/90 p-2.5 text-zinc-300 hover:bg-zinc-700 hover:text-white backdrop-blur-sm transition-all shadow-xl hover:scale-105"
                  title="Editar plan"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(plan.id, e)}
                  className="rounded-full bg-zinc-800/90 p-2.5 text-zinc-400 hover:bg-red-500/90 hover:text-white backdrop-blur-sm transition-all shadow-xl hover:scale-105"
                  title="Eliminar plan"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <style>{
                `.group:hover { border-color: var(--active-color) !important; box-shadow: 0 0 0 1px var(--active-color), 0 0 20px var(--active-color) !important; }`
              }</style>

              {/* Glowing hover shadow element base */}
              <div
                className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.15] pointer-events-none"
                style={{ backgroundColor: activeColor }}
              />

              {/* Header con gradiente */}
              <div
                className={cn(
                  "relative mx-4 mt-4 rounded-xl border p-6 z-10",
                  getHeaderBorderClass(plan.name, plan.isPopular)
                )}
                style={{
                  background: getHeaderGradient(plan.name, plan.isPopular),
                  boxShadow: hasGradient
                    ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
                    : undefined
                }}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 right-4 rounded-full border border-white/20 bg-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white tracking-widest shadow-sm backdrop-blur-md">
                    POPULAR
                  </div>
                )}

                <span
                  className={cn(
                    "inline-block rounded-full px-4 py-1.5 font-bold text-sm",
                    plan.isPopular
                      ? "bg-white text-blue-900 shadow-sm"
                      : isPlus
                        ? "bg-slate-900 text-white shadow-md border border-slate-700"
                        : isBusiness
                          ? "bg-white/90 text-purple-900 shadow-sm"
                          : "border border-white/10 bg-zinc-800 text-zinc-300"
                  )}
                >
                  {plan.name}
                </span>

                <div className="mt-6 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={cn(
                        "text-5xl font-bold tracking-tight",
                        isPlus || hasGradient ? "text-white drop-shadow-md" : "text-slate-50"
                      )}
                      >
                        ${plan.price.toLocaleString()}
                      </span>
                      <span className={cn(
                        "text-lg font-medium",
                        isPlus || hasGradient ? "text-white/80" : "text-zinc-400"
                      )}
                      >
                        /mes
                      </span>
                    </div>
                    {plan.scheduledPrice && plan.scheduledDate && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 shadow-sm" title="Cambio de tarifa programado por normativa">
                        <span>⏳</span>
                        Cambiará a ${plan.scheduledPrice} el {new Date(plan.scheduledDate + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col px-6 pb-6 pt-5">
                <p className="text-sm text-zinc-400 mb-6 min-h-[40px] leading-relaxed">
                  {plan.description}
                </p>

                <ul className="space-y-4 text-left">
                  <li className="flex items-center gap-3">
                    <span className={cn(
                      "rounded-full p-2",
                      plan.isPopular ? "bg-blue-500/25 text-blue-300"
                        : isPlus ? "bg-slate-500/25 text-slate-300"
                          : isBusiness ? "bg-purple-500/25 text-purple-300"
                            : "bg-zinc-800 text-zinc-400"
                    )}
                    >
                      <Wifi size={16} strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-medium text-zinc-300">
                      <strong className="text-white">{plan.downloadSpeed} Mbps</strong> Bajada
                    </span>
                  </li>

                  <li className="flex items-center gap-3">
                    <span className={cn(
                      "rounded-full p-2",
                      plan.isPopular ? "bg-blue-500/25 text-blue-300"
                        : isPlus ? "bg-slate-500/25 text-slate-300"
                          : isBusiness ? "bg-purple-500/25 text-purple-300"
                            : "bg-zinc-800 text-zinc-400"
                    )}
                    >
                      <Zap size={16} strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-medium text-zinc-300">
                      <strong className="text-white">{plan.uploadSpeed} Mbps</strong> Subida
                    </span>
                  </li>

                  <li className="flex items-center gap-3">
                    <span className={cn(
                      "rounded-full p-2",
                      plan.isPopular ? "bg-blue-500/25 text-blue-300"
                        : isPlus ? "bg-slate-500/25 text-slate-300"
                          : isBusiness ? "bg-purple-500/25 text-purple-300"
                            : "bg-zinc-800 text-zinc-400"
                    )}
                    >
                      <Users size={16} strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-medium text-zinc-300">
                      <strong className="text-white">{plan.clientCount}</strong> Clientes Activos
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )
        })}

        {/* Add New Plan Card */}
        <button
          onClick={handleCreate}
          className="group flex min-h-[460px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5 hover:shadow-[0_0_30px_-5px_var(--tw-shadow-color)] hover:shadow-primary/20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-lg">
            <Plus className="h-8 w-8 text-zinc-500 group-hover:text-primary transition-colors" />
          </div>
          <p className="mt-5 text-lg font-semibold text-zinc-400 group-hover:text-primary transition-colors">
            Añadir Nuevo Plan
          </p>
          <p className="mt-2 text-sm text-zinc-500/80 px-8 text-center leading-relaxed">
            Crea una nueva oferta de conectividad de alta velocidad para tus clientes
          </p>
        </button>
      </div>

      <PlanFormSheet
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingPlan}
        onSave={handleSave}
      />
    </>
  )
}
