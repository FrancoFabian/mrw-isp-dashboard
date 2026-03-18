"use client"

import React from "react"
import { CircleHelp } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModernDatePicker } from "@/components/ui/date-picker-modern"
import { ModernSelectTailwind } from "@/components/ui/selection-modern"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const editSectionContainerClass =
  "rounded-xl bg-gradient-to-b from-[#1a1a1f] to-[#050505] p-4 shadow-inner space-y-3"

export const toSelectItems = (values: string[], labels?: Record<string, string>) =>
  values.map((value) => ({
    keyId: value,
    label: labels?.[value] ?? value,
  }))

export const getItemLabel = (items: { keyId: string; label: string }[], key: string) =>
  items.find((item) => item.keyId === key)?.label ?? key

export function toDate(value?: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split("-").map((part) => Number(part))
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function toIsoDate(value: Date | null): string | undefined {
  if (!value) return undefined
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, "0")
  const d = String(value.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function embeddedValueClass(extra?: string) {
  return cn(
    "w-full bg-transparent border-0 p-0 text-[0.82rem] leading-tight text-slate-100 md:text-[0.88rem]",
    "placeholder:text-slate-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
    extra
  )
}

export function EditFieldCard({
  label,
  required,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 py-2 transition-all",
        "focus-within:border-[#2f68f6]/80 focus-within:ring-1 focus-within:ring-[#2f68f6]/60",
        className
      )}
    >
      <label className="mb-0.5 block text-[10px] font-semibold text-slate-400">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
    </div>
  )
}

export function IconEditFieldCard({
  label,
  required,
  icon,
  children,
  className,
}: {
  label: string
  required?: boolean
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <EditFieldCard label={label} required={required} className={cn("relative pr-10", className)}>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
        {icon}
      </span>
      {children}
    </EditFieldCard>
  )
}

export function EmbeddedSelectCard({
  label,
  required,
  items,
  selectedKey,
  onChange,
  displayValue,
}: {
  label: string
  required?: boolean
  items: { keyId: string; label: string }[]
  selectedKey: string
  onChange: (value: string) => void
  displayValue?: React.ReactNode
}) {
  return (
    <EditFieldCard label={label} required={required}>
      <ModernSelectTailwind
        items={items}
        width="full"
        variant="embedded"
        displayValue={displayValue}
        defaultSelectedKeys={[selectedKey]}
        onSelectionChange={(keys) => {
          if (keys.length > 0) onChange(keys[0])
        }}
      />
    </EditFieldCard>
  )
}

export function EmbeddedDateCard({
  label,
  required,
  value,
  onChange,
}: {
  label: string
  required?: boolean
  value?: string
  onChange: (value: string | undefined) => void
}) {
  return (
    <EditFieldCard label={label} required={required}>
      <ModernDatePicker
        value={toDate(value)}
        onChange={(date) => onChange(toIsoDate(date))}
        placeholder="Seleccionar"
        width="full"
        variant="embedded"
        iconPosition="right"
        clearable={false}
      />
    </EditFieldCard>
  )
}

export function CreateFlowStepper({
  steps,
  currentStep,
  onStepChange,
}: {
  steps: { id: string; title: string; helper?: string }[]
  currentStep: string
  onStepChange: (stepId: string) => void
}) {
  const currentStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStep)
  )

  return (
    <div className="w-full">
      <div className="flex items-end gap-3">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isComplete = index <= currentStepIndex

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={cn(
                "min-w-0 flex-1 text-left transition-colors",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <div className={cn("text-sm font-semibold leading-tight", isActive ? "text-white" : isComplete ? "text-zinc-200" : "text-zinc-500")}>
                {step.title}
              </div>
              <div
                className={cn(
                  "mt-3 h-3 rounded-full transition-all",
                  isComplete ? "bg-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "bg-white/10"
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CreateModeInfo({
  title = "Alta manual",
  description,
}: {
  title?: string
  description: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.03] text-zinc-500 transition-colors hover:text-zinc-200"
            aria-label={title}
          >
            <CircleHelp size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="max-w-[280px] rounded-2xl border-white/10 bg-[#101011] px-3 py-2 text-xs leading-5 text-zinc-300 shadow-2xl"
        >
          <div className="space-y-1">
            <p className="font-semibold text-white">{title}</p>
            <div>{description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
