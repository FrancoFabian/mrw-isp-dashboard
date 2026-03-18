"use client"

import React, { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type {
  BillingModel,
  BillingProfile,
  ConcessionClient,
  ConcessionType,
} from "@/types/concession-client"
import {
  billingModelLabels,
  concessionClientStatusColors,
  concessionClientStatusLabels,
  concessionTypeLabels,
} from "@/types/concession-client"
import { formatBillingSummary } from "@/lib/concession-billing"
import { AlertCircle, ArrowLeft, CalendarClock, Check, ChevronDown, Edit2, Mail, MapPin, Phone, ReceiptText, X } from "lucide-react"
import { ModernSelectTailwind } from "@/components/ui/selection-modern"
import { ModernDatePicker } from "@/components/ui/date-picker-modern"
import { CreateFlowStepper, CreateModeInfo, IconEditFieldCard } from "@/components/clients/detail-edit-fields"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConcessionClientDetailProps {
  client: ConcessionClient
  onClose: () => void
  onSaveClient?: (updatedClient: ConcessionClient) => void
  mode?: "view" | "create"
}

const concessionTypeOptions: ConcessionType[] = ["ift", "municipal", "internal", "unknown"]
const billingModelOptions: BillingModel[] = ["retainer_sla", "revenue_share", "capacity_fee", "custom"]
const billingCycleOptions: BillingProfile["invoicingCycle"][] = ["monthly", "quarterly", "annual"]
const billingStatusOptions: BillingProfile["status"][] = ["active", "paused"]
const slaTierOptions: NonNullable<BillingProfile["slaTier"]>[] = ["bronze", "silver", "gold"]

const toSelectItems = (values: string[], labels?: Record<string, string>) =>
  values.map((value) => ({
    keyId: value,
    label: labels?.[value] ?? value,
  }))

const getItemLabel = (items: { keyId: string; label: string }[], key: string) =>
  items.find((item) => item.keyId === key)?.label ?? key

const concessionTypeItems = toSelectItems(concessionTypeOptions, concessionTypeLabels)
const billingModelItems = toSelectItems(billingModelOptions, billingModelLabels)
const billingCycleItems = toSelectItems(billingCycleOptions as string[], {
  monthly: "Mensual",
  quarterly: "Trimestral",
  annual: "Anual",
})
const billingStatusItems = toSelectItems(billingStatusOptions as string[], {
  active: "Activo",
  paused: "Pausado",
})
const slaTierItems = toSelectItems(slaTierOptions as string[], {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
})
const currencyItems = toSelectItems(["MXN", "USD"])
const createSteps = [
  { id: "company", title: "Empresa", helper: "Razon social y contacto" },
  { id: "concession", title: "Operacion", helper: "Concesion, contrato y SLA" },
  { id: "billing", title: "Billing", helper: "Modelo comercial y facturacion" },
] as const
type CreateStepId = (typeof createSteps)[number]["id"]
const editSectionContainerClass =
  "rounded-xl bg-gradient-to-b from-[#1a1a1f] to-[#050505] p-4 shadow-inner space-y-3"

function EditFieldCard({
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

function embeddedValueClass(extra?: string) {
  return cn(
    "w-full bg-transparent border-0 p-0 text-[0.82rem] leading-tight text-slate-100 md:text-[0.88rem]",
    "placeholder:text-slate-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
    extra
  )
}

function EmbeddedSelectCard({
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

function EmbeddedDateCard({
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

function clampMin(value: number, min: number) {
  if (Number.isNaN(value)) return min
  return value < min ? min : value
}

function clampPct(value: number) {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function normalizeBilling(billing: BillingProfile): BillingProfile {
  return {
    ...billing,
    revenueSharePct:
      typeof billing.revenueSharePct === "number" ? clampPct(billing.revenueSharePct) : billing.revenueSharePct,
    committedMbps:
      typeof billing.committedMbps === "number" ? clampMin(billing.committedMbps, 0) : billing.committedMbps,
    burstMbps: typeof billing.burstMbps === "number" ? clampMin(billing.burstMbps, 0) : billing.burstMbps,
    baseFee: billing.baseFee ? { ...billing.baseFee, amount: clampMin(billing.baseFee.amount, 0) } : billing.baseFee,
    perIncidentFee: billing.perIncidentFee
      ? { ...billing.perIncidentFee, amount: clampMin(billing.perIncidentFee.amount, 0) }
      : billing.perIncidentFee,
  }
}

function toDate(value?: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split("-").map((part) => Number(part))
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toIsoDate(value: Date | null): string | undefined {
  if (!value) return undefined
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, "0")
  const d = String(value.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getInitialEditModes(isCreateMode: boolean) {
  return {
    header: isCreateMode,
    contact: isCreateMode,
    concession: isCreateMode,
    billing: isCreateMode,
  }
}

function getCreateIssues(client: ConcessionClient) {
  const issues: string[] = []

  if (!client.legalName.trim()) issues.push("razon social")
  if (!client.email.trim()) issues.push("correo")
  if (!client.phone.trim()) issues.push("telefono")
  if (!client.registeredAt) issues.push("fecha de alta")

  if (client.billing.model === "retainer_sla" && !client.billing.baseFee?.amount) issues.push("retainer")
  if (client.billing.model === "revenue_share" && !Number.isFinite(client.billing.revenueSharePct)) issues.push("revenue share")
  if (client.billing.model === "capacity_fee" && !client.billing.committedMbps) issues.push("capacidad comprometida")

  return issues
}

export function ConcessionClientDetail({
  client: initialClient,
  onClose,
  onSaveClient,
  mode = "view",
}: ConcessionClientDetailProps) {
  const isCreateMode = mode === "create"
  const initialEditModes = getInitialEditModes(isCreateMode)
  const [isLoading, setIsLoading] = useState(!isCreateMode)
  const [activeSection, setActiveSection] = useState("billing")
  const [createStep, setCreateStep] = useState<CreateStepId>("company")
  const [customer, setCustomer] = useState(initialClient)
  const [editForm, setEditForm] = useState(initialClient)
  const [editModes, setEditModes] = useState(initialEditModes)
  const [editFormName, setEditFormName] = useState(initialClient.legalName)
  const [createAttempted, setCreateAttempted] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const createIssues = useMemo(() => getCreateIssues(editForm), [editForm])
  const createStepIndex = createSteps.findIndex((step) => step.id === createStep)
  const isLastCreateStep = createStepIndex === createSteps.length - 1
  const createSectionContainerClass = cn(editSectionContainerClass, "bg-none from-transparent to-transparent")

  useEffect(() => {
    setCustomer(initialClient)
    setEditForm(initialClient)
    setEditFormName(initialClient.legalName)
    setEditModes(initialEditModes)
    setActiveSection(mode === "create" ? "" : "billing")
    setCreateStep("company")
    setCreateAttempted(false)
    if (mode === "create") {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [initialClient, mode])

  const saveClient = (next: ConcessionClient) => {
    setCustomer(next)
    setEditForm(next)
    onSaveClient?.(next)
  }

  const handleSaveEdit = (section: keyof typeof editModes) => {
    let next = editForm
    if (section === "header") next = { ...customer, legalName: editFormName.trim() || customer.legalName }
    if (section === "billing") next = { ...editForm, billing: normalizeBilling(editForm.billing) }
    saveClient(next)
    setEditModes((prev) => ({ ...prev, [section]: false }))
  }

  const setSectionEdit = (section: keyof typeof editModes) => {
    setEditForm(customer)
    if (section === "header") setEditFormName(customer.legalName)
    setEditModes((prev) => ({ ...prev, [section]: true }))
    if ((section === "concession" || section === "billing") && activeSection !== section) setActiveSection(section)
  }

  const changeField = <K extends keyof ConcessionClient>(key: K, value: ConcessionClient[K]) => {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  const changeBilling = <K extends keyof BillingProfile>(key: K, value: BillingProfile[K]) => {
    setEditForm((prev) => ({ ...prev, billing: { ...prev.billing, [key]: value } }))
  }

  const changeBillingMoney = (field: "baseFee" | "perIncidentFee", key: "amount" | "currency", value: number | string) => {
    setEditForm((prev) => {
      const current = prev.billing[field] ?? { amount: 0, currency: "MXN" as const }
      return {
        ...prev,
        billing: {
          ...prev.billing,
          [field]: key === "amount" ? { ...current, amount: Number(value) } : { ...current, currency: value as "MXN" | "USD" },
        },
      }
    })
  }

  const handleCreateClient = () => {
    setCreateAttempted(true)
    if (createIssues.length > 0) return

    saveClient({
      ...editForm,
      legalName: editFormName.trim() || editForm.legalName,
      billing: normalizeBilling(editForm.billing),
    })
  }

  const handleRequestClose = () => {
    if (isCreateMode) {
      setShowCloseConfirm(true)
      return
    }
    onClose()
  }

  const goToPreviousCreateStep = () => {
    if (createStepIndex <= 0) return
    setCreateStep(createSteps[createStepIndex - 1].id)
  }

  const goToNextCreateStep = () => {
    if (isLastCreateStep) {
      handleCreateClient()
      return
    }

    setCreateStep(createSteps[createStepIndex + 1].id)
  }

  const DetailSkeleton = () => (
    <div className="flex h-full flex-col animate-pulse">
      <header className="flex items-start justify-between border-b border-zinc-800/50 p-6">
        <div className="flex w-full items-center gap-4">
          <div className="h-12 w-12 rounded-full border border-zinc-700/30 bg-zinc-800/60" />
          <div className="flex w-full flex-col gap-2.5">
            <div className="h-5 w-52 rounded-md bg-zinc-800/60" />
            <div className="h-4 w-24 rounded-md bg-zinc-800/60" />
          </div>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-6">
        <div className="h-24 rounded-xl bg-zinc-800/30" />
        <div className="h-24 rounded-xl bg-zinc-800/30" />
        <div className="h-24 rounded-xl bg-zinc-800/30" />
      </div>
      <div className="mt-auto flex gap-3 border-t border-zinc-800/50 bg-black/20 p-6">
        <div className="h-10 flex-1 rounded-lg bg-[#1a1a1a]" />
        <div className="h-10 flex-[2] rounded-lg bg-blue-900/20" />
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[600px] text-zinc-100">
        <DetailSkeleton />
      </div>
    )
  }

  const renderCreateStep = () => {
    if (createStep === "company") {
      return (
        <section className={createSectionContainerClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-100">Empresa y contacto</h3>
            <CreateModeInfo
              title="Empresa y contacto"
              description="Registra la razon social y el contacto principal. El estado operativo se administra despues."
            />
          </div>
          <EditFieldCard label="Razon social" required>
            <input
              value={editForm.legalName}
              onChange={(e) => {
                setEditFormName(e.target.value)
                changeField("legalName", e.target.value)
              }}
              className={embeddedValueClass()}
              autoFocus
            />
          </EditFieldCard>
          <div className="grid grid-cols-2 gap-2">
            <IconEditFieldCard label="Contacto principal" icon={<Mail size={16} />}>
              <input value={editForm.contactName ?? ""} onChange={(e) => changeField("contactName", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
            <IconEditFieldCard label="RFC" icon={<Mail size={16} />}>
              <input value={editForm.rfc ?? ""} onChange={(e) => changeField("rfc", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
          </div>
          <IconEditFieldCard label="Correo electronico" required icon={<Mail size={16} />}>
            <input value={editForm.email} onChange={(e) => changeField("email", e.target.value)} className={embeddedValueClass()} />
          </IconEditFieldCard>
          <div className="grid grid-cols-2 gap-2">
            <IconEditFieldCard label="Telefono" required icon={<Phone size={16} />}>
              <input value={editForm.phone} onChange={(e) => changeField("phone", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
            <EmbeddedDateCard
              label="Fecha de alta"
              required
              value={editForm.registeredAt}
              onChange={(value) => changeField("registeredAt", value ?? "")}
            />
          </div>
          <IconEditFieldCard label="Direccion" icon={<MapPin size={16} />}>
            <input value={editForm.address ?? ""} onChange={(e) => changeField("address", e.target.value)} className={embeddedValueClass()} />
          </IconEditFieldCard>
          <div className="grid grid-cols-2 gap-2">
            <IconEditFieldCard label="Ciudad" icon={<MapPin size={16} />}>
              <input value={editForm.city ?? ""} onChange={(e) => changeField("city", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
            <IconEditFieldCard label="Estado" icon={<MapPin size={16} />}>
              <input value={editForm.state ?? ""} onChange={(e) => changeField("state", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
          </div>
        </section>
      )
    }

    if (createStep === "concession") {
      return (
        <section className={createSectionContainerClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-100">Concesion y acuerdo</h3>
            <CreateModeInfo
              title="Concesion y acuerdo"
              description="Deja contrato y SLA listos si ya existen; si no, puedes capturarlos mas adelante."
            />
          </div>
          <EmbeddedSelectCard
            label="Tipo de concesion"
            required
            items={concessionTypeItems}
            selectedKey={editForm.concessionType}
            onChange={(value) => changeField("concessionType", value as ConcessionType)}
          />
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="Zona de cobertura">
              <input value={editForm.coverageZone ?? ""} onChange={(e) => changeField("coverageZone", e.target.value)} placeholder="Ej. Monterrey Centro" className={embeddedValueClass()} />
            </EditFieldCard>
            <EmbeddedDateCard
              label="Fecha de corte"
              value={editForm.cutoffDate}
              onChange={(value) => changeField("cutoffDate", value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="Folio de contrato">
              <input value={editForm.contract?.folio ?? ""} onChange={(e) => changeField("contract", { ...(editForm.contract ?? {}), folio: e.target.value })} placeholder="Ej. IFT-2024-04" className={embeddedValueClass()} />
            </EditFieldCard>
            <EmbeddedDateCard
              label="Inicio de contrato"
              value={editForm.contract?.startDate}
              onChange={(value) => changeField("contract", { ...(editForm.contract ?? {}), startDate: value })}
            />
          </div>
          <EmbeddedDateCard
            label="Fin de contrato"
            value={editForm.contract?.endDate}
            onChange={(value) => changeField("contract", { ...(editForm.contract ?? {}), endDate: value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="SLA disponibilidad (%)">
              <input type="number" min="0" max="100" value={editForm.sla?.availabilityPct ?? ""} onChange={(e) => changeField("sla", { ...(editForm.sla ?? {}), availabilityPct: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="Ej. 99.9" className={embeddedValueClass()} />
            </EditFieldCard>
            <EditFieldCard label="SLA respuesta (horas)">
              <input type="number" min="0" value={editForm.sla?.responseHours ?? ""} onChange={(e) => changeField("sla", { ...(editForm.sla ?? {}), responseHours: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="Ej. 8" className={embeddedValueClass()} />
            </EditFieldCard>
          </div>
        </section>
      )
    }

    return (
      <section className={createSectionContainerClass}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-100">Billing B2B</h3>
          <CreateModeInfo
            title="Billing B2B"
            description="El billing se crea activo por default. Solo pide los datos que definen el acuerdo comercial."
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <EmbeddedSelectCard
            label="Modelo de cobro"
            required
            items={billingModelItems}
            selectedKey={editForm.billing.model}
            onChange={(value) => changeBilling("model", value as BillingModel)}
          />
          <EmbeddedSelectCard
            label="Ciclo de facturacion"
            required
            items={billingCycleItems}
            selectedKey={editForm.billing.invoicingCycle}
            onChange={(value) => changeBilling("invoicingCycle", value as BillingProfile["invoicingCycle"])}
          />
        </div>
        {editForm.billing.model === "retainer_sla" && (
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="Retainer base" required>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={editForm.billing.baseFee?.amount ?? 0} onChange={(e) => changeBillingMoney("baseFee", "amount", Number(e.target.value))} placeholder="Ej. 12000" className={embeddedValueClass("flex-1 min-w-0")} />
                <div className="h-5 w-px bg-white/10" />
                <ModernSelectTailwind
                  items={currencyItems}
                  width="auto"
                  variant="embedded"
                  className="shrink-0"
                  defaultSelectedKeys={[editForm.billing.baseFee?.currency ?? "MXN"]}
                  onSelectionChange={(keys) => {
                    if (keys.length > 0) changeBillingMoney("baseFee", "currency", keys[0])
                  }}
                />
              </div>
            </EditFieldCard>
            <EmbeddedSelectCard
              label="Tier SLA"
              required
              items={slaTierItems}
              selectedKey={editForm.billing.slaTier ?? "silver"}
              onChange={(value) => changeBilling("slaTier", value as BillingProfile["slaTier"])}
            />
          </div>
        )}
        {editForm.billing.model === "revenue_share" && (
          <EditFieldCard label="Revenue share (%)" required>
            <input type="number" min="0" max="100" value={editForm.billing.revenueSharePct ?? 0} onChange={(e) => changeBilling("revenueSharePct", Number(e.target.value))} placeholder="Ej. 12" className={embeddedValueClass()} />
          </EditFieldCard>
        )}
        {editForm.billing.model === "capacity_fee" && (
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="Capacidad comprometida (Mbps)" required>
              <input type="number" min="0" value={editForm.billing.committedMbps ?? 0} onChange={(e) => changeBilling("committedMbps", Number(e.target.value))} placeholder="Ej. 200" className={embeddedValueClass()} />
            </EditFieldCard>
            <EditFieldCard label="Burst (Mbps)">
              <input type="number" min="0" value={editForm.billing.burstMbps ?? 0} onChange={(e) => changeBilling("burstMbps", Number(e.target.value))} placeholder="Ej. 300" className={embeddedValueClass()} />
            </EditFieldCard>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <EditFieldCard label="Costo por incidente" required>
            <div className="flex items-center gap-2">
              <input type="number" min="0" value={editForm.billing.perIncidentFee?.amount ?? 0} onChange={(e) => changeBillingMoney("perIncidentFee", "amount", Number(e.target.value))} placeholder="Ej. 900" className={embeddedValueClass("flex-1 min-w-0")} />
              <div className="h-5 w-px bg-white/10" />
              <ModernSelectTailwind
                items={currencyItems}
                width="auto"
                variant="embedded"
                className="shrink-0"
                defaultSelectedKeys={[editForm.billing.perIncidentFee?.currency ?? "MXN"]}
                onSelectionChange={(keys) => {
                  if (keys.length > 0) changeBillingMoney("perIncidentFee", "currency", keys[0])
                }}
              />
            </div>
          </EditFieldCard>
          <EmbeddedDateCard
            label="Proxima factura"
            value={editForm.billing.nextInvoiceDate}
            onChange={(value) => changeBilling("nextInvoiceDate", value)}
          />
        </div>
        <EditFieldCard label="Notas de billing">
          <textarea value={editForm.billing.notes ?? ""} onChange={(e) => changeBilling("notes", e.target.value)} rows={2} placeholder="Introduzca notas internas del acuerdo..." className={cn(embeddedValueClass("min-h-[64px] resize-none leading-6"))} />
        </EditFieldCard>
      </section>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[600px] text-zinc-100">
      <header className="flex items-start justify-between p-6 border-b border-zinc-800/50 relative">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 flex items-center justify-center text-lg font-semibold">{(isCreateMode ? editForm.legalName : customer.legalName).slice(0, 2).toUpperCase() || "NC"}</div>
          <div className="flex-1 w-full relative group">
            {isCreateMode ? (
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="min-w-0 truncate text-base font-semibold tracking-tight text-white leading-tight">{editForm.legalName || "Nuevo cliente empresarial"}</h2>
                <CreateModeInfo
                  description="El alta manual cubre captura parcial o completa. Si todavia no existe contrato o billing final, deja los campos opcionales y completa el registro despues."
                />
              </div>
            ) : editModes.header ? (
              <div className="flex items-center gap-2 mb-1">
                <input value={editFormName} onChange={(e) => setEditFormName(e.target.value)} className="bg-[#0f0f0f] border border-[#2f68f6] text-white text-xl font-bold rounded-lg px-2 py-0.5 w-full focus:outline-none" />
                <button onClick={() => handleSaveEdit("header")} className="p-1.5 bg-white text-black rounded-md"><Check size={16} /></button>
                <button onClick={() => setEditModes((prev) => ({ ...prev, header: false }))} className="p-1.5 text-zinc-500 rounded-md"><X size={16} /></button>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="min-w-0 truncate text-lg font-semibold tracking-tight text-white leading-tight">{customer.legalName}</h2>
                <button onClick={() => setSectionEdit("header")} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500"><Edit2 size={14} /></button>
              </div>
            )}
            {!isCreateMode && (
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/5", concessionClientStatusColors[customer.status])}>
                  {concessionClientStatusLabels[customer.status]}
                </span>
                <span className={cn("text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border", customer.billing.status === "active" ? "border-emerald-500/30 text-emerald-400" : "border-zinc-700 text-zinc-400")}>
                  Billing {customer.billing.status}
                </span>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleRequestClose} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a] p-2 rounded-full"><X size={18} /></button>
      </header>

      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        {isCreateMode ? (
          <>
            {createStepIndex > 0 ? (
              <button
                type="button"
                onClick={goToPreviousCreateStep}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft size={14} />
                Regresar
              </button>
            ) : null}
            {renderCreateStep()}
          </>
        ) : (
          <>
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Datos de Contacto</h3>
            {!editModes.contact && <button onClick={() => setSectionEdit("contact")} className="text-zinc-500 hover:text-zinc-300 text-[11px] font-medium">Editar</button>}
          </div>
          <div className={editSectionContainerClass}>
            {editModes.contact ? (
              <>
                <IconEditFieldCard label="Contacto principal" icon={<Mail size={16} />}>
                  <input value={editForm.contactName ?? ""} onChange={(e) => changeField("contactName", e.target.value)} className={embeddedValueClass()} />
                </IconEditFieldCard>
                <IconEditFieldCard label="RFC" icon={<Mail size={16} />}>
                  <input value={editForm.rfc ?? ""} onChange={(e) => changeField("rfc", e.target.value)} className={embeddedValueClass()} />
                </IconEditFieldCard>
                <IconEditFieldCard label="Correo electronico" required icon={<Mail size={16} />}>
                  <input value={editForm.email} onChange={(e) => changeField("email", e.target.value)} className={embeddedValueClass()} />
                </IconEditFieldCard>
                <IconEditFieldCard label="Telefono" required icon={<Phone size={16} />}>
                  <input value={editForm.phone} onChange={(e) => changeField("phone", e.target.value)} className={embeddedValueClass()} />
                </IconEditFieldCard>
                <IconEditFieldCard label="Direccion" icon={<MapPin size={16} />}>
                  <input value={editForm.address ?? ""} onChange={(e) => changeField("address", e.target.value)} className={embeddedValueClass()} />
                </IconEditFieldCard>
                <div className="grid grid-cols-2 gap-2">
                  <IconEditFieldCard label="Ciudad" icon={<MapPin size={16} />}>
                    <input value={editForm.city ?? ""} onChange={(e) => changeField("city", e.target.value)} className={embeddedValueClass()} />
                  </IconEditFieldCard>
                  <IconEditFieldCard label="Estado" icon={<MapPin size={16} />}>
                    <input value={editForm.state ?? ""} onChange={(e) => changeField("state", e.target.value)} className={embeddedValueClass()} />
                  </IconEditFieldCard>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <EmbeddedDateCard
                    label="Fecha de alta"
                    required
                    value={editForm.registeredAt}
                    onChange={(value) => changeField("registeredAt", value ?? "")}
                  />
                  <EmbeddedDateCard
                    label="Fecha de corte"
                    value={editForm.cutoffDate}
                    onChange={(value) => changeField("cutoffDate", value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2"><Mail size={14} className="text-zinc-500" /><span className="text-sm">{customer.email}</span></div>
                <div className="flex items-center gap-2"><Phone size={14} className="text-zinc-500" /><span className="text-sm">{customer.phone}</span></div>
                <div className="flex items-center gap-2"><MapPin size={14} className="text-zinc-500" /><span className="text-sm">{[customer.address, customer.city, customer.state].filter(Boolean).join(", ") || "Sin direccion"}</span></div>
                <div className="text-xs text-zinc-500">{customer.contactName ?? "Sin contacto asignado"}{customer.rfc ? ` | RFC ${customer.rfc}` : ""}</div>
              </>
            )}
            {editModes.contact && <div className="flex justify-end gap-2"><button onClick={() => setEditModes((p) => ({ ...p, contact: false }))} className="px-3 py-1 text-xs text-zinc-400">Cancelar</button><button onClick={() => handleSaveEdit("contact")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">Guardar</button></div>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-1">
            <button type="button" onClick={() => setActiveSection(activeSection === "concession" ? "" : "concession")} className="flex-1 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider"><span>Datos de Concesion</span><ChevronDown size={16} className={activeSection === "concession" ? "rotate-180" : ""} /></button>
            {activeSection === "concession" && !editModes.concession && <button onClick={() => setSectionEdit("concession")} className="ml-4 text-zinc-500 text-[11px] font-medium">Editar</button>}
          </div>
          {(activeSection === "concession" || editModes.concession) && (
            <div className={cn("mt-3", editSectionContainerClass)}>
              {editModes.concession ? (
                <>
                  <EmbeddedSelectCard
                    label="Tipo de concesion"
                    required
                    items={concessionTypeItems}
                    selectedKey={editForm.concessionType}
                    onChange={(value) => changeField("concessionType", value as ConcessionType)}
                  />
                  <EditFieldCard label="Zona de cobertura">
                    <input value={editForm.coverageZone ?? ""} onChange={(e) => changeField("coverageZone", e.target.value)} placeholder="Ej. Monterrey Centro" className={embeddedValueClass()} />
                  </EditFieldCard>
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="Folio de contrato">
                      <input value={editForm.contract?.folio ?? ""} onChange={(e) => changeField("contract", { ...(editForm.contract ?? {}), folio: e.target.value })} placeholder="Ej. IFT-2024-04" className={embeddedValueClass()} />
                    </EditFieldCard>
                    <EmbeddedDateCard
                      label="Inicio de contrato"
                      value={editForm.contract?.startDate}
                      onChange={(value) => changeField("contract", { ...(editForm.contract ?? {}), startDate: value })}
                    />
                    <EmbeddedDateCard
                      label="Fin de contrato"
                      value={editForm.contract?.endDate}
                      onChange={(value) => changeField("contract", { ...(editForm.contract ?? {}), endDate: value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="SLA disponibilidad (%)">
                      <input type="number" min="0" max="100" value={editForm.sla?.availabilityPct ?? ""} onChange={(e) => changeField("sla", { ...(editForm.sla ?? {}), availabilityPct: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="Ej. 99.9" className={embeddedValueClass()} />
                    </EditFieldCard>
                    <EditFieldCard label="SLA respuesta (horas)">
                      <input type="number" min="0" value={editForm.sla?.responseHours ?? ""} onChange={(e) => changeField("sla", { ...(editForm.sla ?? {}), responseHours: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="Ej. 8" className={embeddedValueClass()} />
                    </EditFieldCard>
                  </div>
                  <div className="flex justify-end gap-2"><button onClick={() => setEditModes((p) => ({ ...p, concession: false }))} className="px-3 py-1 text-xs text-zinc-400">Cancelar</button><button onClick={() => handleSaveEdit("concession")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">Guardar</button></div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between"><span className="text-sm">{concessionTypeLabels[customer.concessionType]}</span><span className="text-xs text-zinc-500">{customer.coverageZone ?? "Sin zona"}</span></div>
                  <p className="text-xs text-zinc-500">Contrato: {customer.contract?.folio ?? "Sin folio"} | {customer.contract?.startDate ?? "N/A"} - {customer.contract?.endDate ?? "N/A"}</p>
                </>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-1">
            <button type="button" onClick={() => setActiveSection(activeSection === "billing" ? "" : "billing")} className="flex-1 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider"><span>Billing B2B</span><ChevronDown size={16} className={activeSection === "billing" ? "rotate-180" : ""} /></button>
            {activeSection === "billing" && !editModes.billing && <button onClick={() => setSectionEdit("billing")} className="ml-4 text-zinc-500 text-[11px] font-medium">Editar</button>}
          </div>
          {(activeSection === "billing" || editModes.billing) && (
            <div className={cn("mt-3", editSectionContainerClass)}>
              {editModes.billing ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <EmbeddedSelectCard
                      label="Modelo de cobro"
                      required
                      items={billingModelItems}
                      selectedKey={editForm.billing.model}
                      onChange={(value) => changeBilling("model", value as BillingModel)}
                    />
                    <EmbeddedSelectCard
                      label="Ciclo de facturacion"
                      required
                      items={billingCycleItems}
                      selectedKey={editForm.billing.invoicingCycle}
                      onChange={(value) => changeBilling("invoicingCycle", value as BillingProfile["invoicingCycle"])}
                    />
                  </div>
                  {editForm.billing.model === "retainer_sla" && (
                    <div className="grid grid-cols-2 gap-2">
                      <EditFieldCard label="Retainer base" required>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" value={editForm.billing.baseFee?.amount ?? 0} onChange={(e) => changeBillingMoney("baseFee", "amount", Number(e.target.value))} placeholder="Ej. 12000" className={embeddedValueClass("flex-1 min-w-0")} />
                          <div className="h-5 w-px bg-white/10" />
                          <ModernSelectTailwind
                            items={currencyItems}
                            width="auto"
                            variant="embedded"
                            className="shrink-0"
                            defaultSelectedKeys={[editForm.billing.baseFee?.currency ?? "MXN"]}
                            onSelectionChange={(keys) => {
                              if (keys.length > 0) changeBillingMoney("baseFee", "currency", keys[0])
                            }}
                          />
                        </div>
                      </EditFieldCard>
                      <EmbeddedSelectCard
                        label="Tier SLA"
                        required
                        items={slaTierItems}
                        selectedKey={editForm.billing.slaTier ?? "silver"}
                        onChange={(value) => changeBilling("slaTier", value as BillingProfile["slaTier"])}
                      />
                    </div>
                  )}
                  {editForm.billing.model === "revenue_share" && (
                    <EditFieldCard label="Revenue share (%)" required>
                      <input type="number" min="0" max="100" value={editForm.billing.revenueSharePct ?? 0} onChange={(e) => changeBilling("revenueSharePct", Number(e.target.value))} placeholder="Ej. 12" className={embeddedValueClass()} />
                    </EditFieldCard>
                  )}
                  {editForm.billing.model === "capacity_fee" && (
                    <div className="grid grid-cols-2 gap-2">
                      <EditFieldCard label="Capacidad comprometida (Mbps)" required>
                        <input type="number" min="0" value={editForm.billing.committedMbps ?? 0} onChange={(e) => changeBilling("committedMbps", Number(e.target.value))} placeholder="Ej. 200" className={embeddedValueClass()} />
                      </EditFieldCard>
                      <EditFieldCard label="Burst (Mbps)">
                        <input type="number" min="0" value={editForm.billing.burstMbps ?? 0} onChange={(e) => changeBilling("burstMbps", Number(e.target.value))} placeholder="Ej. 300" className={embeddedValueClass()} />
                      </EditFieldCard>
                      <EditFieldCard label="Cuota base">
                        <input type="number" min="0" value={editForm.billing.baseFee?.amount ?? 0} onChange={(e) => changeBillingMoney("baseFee", "amount", Number(e.target.value))} placeholder="Ej. 18000" className={embeddedValueClass()} />
                      </EditFieldCard>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="Costo por incidente" required>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" value={editForm.billing.perIncidentFee?.amount ?? 0} onChange={(e) => changeBillingMoney("perIncidentFee", "amount", Number(e.target.value))} placeholder="Ej. 900" className={embeddedValueClass("flex-1 min-w-0")} />
                          <div className="h-5 w-px bg-white/10" />
                        <ModernSelectTailwind
                          items={currencyItems}
                          width="auto"
                          variant="embedded"
                          className="shrink-0"
                          defaultSelectedKeys={[editForm.billing.perIncidentFee?.currency ?? "MXN"]}
                          onSelectionChange={(keys) => {
                            if (keys.length > 0) changeBillingMoney("perIncidentFee", "currency", keys[0])
                          }}
                        />
                      </div>
                    </EditFieldCard>
                    <EmbeddedSelectCard
                      label="Estado de billing"
                      required
                      items={billingStatusItems}
                      selectedKey={editForm.billing.status}
                      displayValue={
                        <span className={editForm.billing.status === "paused" ? "text-amber-400" : "text-slate-100"}>
                          {getItemLabel(billingStatusItems, editForm.billing.status)}
                        </span>
                      }
                      onChange={(value) => changeBilling("status", value as BillingProfile["status"])}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <EmbeddedDateCard
                      label="Proxima factura"
                      required
                      value={editForm.billing.nextInvoiceDate}
                      onChange={(value) => changeBilling("nextInvoiceDate", value)}
                    />
                    <EmbeddedDateCard
                      label="Ultima facturacion"
                      required
                      value={editForm.billing.lastInvoicedAt}
                      onChange={(value) => changeBilling("lastInvoicedAt", value)}
                    />
                  </div>
                  <EditFieldCard label="Notas de billing">
                    <textarea value={editForm.billing.notes ?? ""} onChange={(e) => changeBilling("notes", e.target.value)} rows={2} placeholder="Introduzca notas internas del acuerdo..." className={cn(embeddedValueClass("min-h-[64px] resize-none leading-6"))} />
                  </EditFieldCard>
                  <div className="flex justify-end gap-2"><button onClick={() => setEditModes((p) => ({ ...p, billing: false }))} className="px-3 py-1 text-xs text-zinc-400">Cancelar</button><button onClick={() => handleSaveEdit("billing")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">Guardar</button></div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ReceiptText size={14} /><span className="text-sm">{formatBillingSummary(customer.billing)}</span></div><span className={cn("text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border", customer.billing.status === "active" ? "border-emerald-500/30 text-emerald-400" : "border-zinc-700 text-zinc-400")}>{customer.billing.status}</span></div>
                  <p className="text-xs text-zinc-500">Modelo: {billingModelLabels[customer.billing.model]} | Ciclo: {customer.billing.invoicingCycle}</p>
                </>
              )}
            </div>
          )}
        </section>
          </>
        )}
      </div>

      <div className="p-6 border-t border-zinc-800/50 bg-black/20 mt-auto">
        {isCreateMode ? (
          <div className="flex w-full flex-col gap-3">
            {createAttempted && createIssues.length > 0 ? (
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <CalendarClock size={14} />
                Falta capturar: {createIssues.join(", ")}.
              </div>
            ) : null}
            <button onClick={goToNextCreateStep} className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-black bg-white hover:bg-zinc-200 transition-colors outline-none shadow-lg shadow-zinc-900/20">
              {isLastCreateStep ? "Crear cliente" : "Siguiente"}
            </button>
            <CreateFlowStepper
              steps={createSteps as unknown as { id: string; title: string; helper?: string }[]}
              currentStep={createStep}
              onStepChange={(stepId) => setCreateStep(stepId as CreateStepId)}
            />
          </div>
        ) : (
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-zinc-400 bg-[#1a1a1a] hover:bg-[#222] hover:text-rose-400 border border-[#222] hover:border-rose-500/30 transition-all outline-none">
              <AlertCircle size={16} /> Suspender
            </button>
            <button onClick={() => setSectionEdit("billing")} className="flex-[2] py-2.5 px-4 rounded-lg text-sm font-medium text-black bg-white hover:bg-zinc-200 transition-colors outline-none shadow-lg shadow-zinc-900/20">
              Editar billing
            </button>
          </div>
        )}
      </div>
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Esta segura de salir?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Si cierras el formulario se perdera la informacion capturada en este alta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100">
              Seguir capturando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onClose}
              className="bg-white text-black hover:bg-zinc-200"
            >
              Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
