"use client"

import React, { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type {
  BillingModel,
  BillingProfile,
  UplinkClient,
  UplinkHandoff,
  UplinkType,
  UpstreamCarrier,
} from "@/types/uplink-client"
import {
  uplinkHandoffLabels,
  uplinkStatusColors,
  uplinkStatusLabels,
  uplinkTypeLabels,
  upstreamCarrierLabels,
} from "@/types/uplink-client"
import { computeHealth, formatBillingSummary, formatUplinkType } from "@/lib/uplink-billing"
import { AlertCircle, ArrowLeft, CalendarClock, Check, ChevronDown, Edit2, Mail, MapPin, Network, Phone, ReceiptText, Router, Timer, X } from "lucide-react"
import { ModernSelectTailwind } from "@/components/ui/selection-modern"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CreateFlowStepper,
  CreateModeInfo,
  editSectionContainerClass,
  EditFieldCard,
  EmbeddedDateCard,
  EmbeddedSelectCard,
  embeddedValueClass,
  getItemLabel,
  IconEditFieldCard,
  toSelectItems,
} from "@/components/clients/detail-edit-fields"
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

interface UplinkClientDetailProps {
  client: UplinkClient
  onClose: () => void
  onSaveClient?: (updatedClient: UplinkClient) => void
  mode?: "view" | "create"
}

const carrierOptions: UpstreamCarrier[] = ["telmex", "totalplay", "axtel", "cogent", "lumen", "other"]
const uplinkTypeOptions: UplinkType[] = ["l2", "l3", "mpls", "gre", "ipsec", "vlan", "unknown"]
const handoffOptions: UplinkHandoff[] = ["ethernet", "sfp", "sfp+", "unknown"]
const billingModelOptions: BillingModel[] = ["capacity_fee", "retainer_sla", "custom"]
const billingCycleOptions: BillingProfile["invoicingCycle"][] = ["monthly", "quarterly", "annual"]
const billingStatusOptions: BillingProfile["status"][] = ["active", "paused"]

const billingModelLabels: Record<BillingModel, string> = {
  capacity_fee: "Capacity Fee",
  retainer_sla: "Retainer + SLA",
  custom: "Custom",
}

const carrierItems = toSelectItems(carrierOptions as string[], upstreamCarrierLabels)
const uplinkTypeItems = toSelectItems(uplinkTypeOptions as string[], uplinkTypeLabels)
const handoffItems = toSelectItems(handoffOptions as string[], uplinkHandoffLabels)
const billingModelItems = toSelectItems(billingModelOptions as string[], billingModelLabels)
const billingCycleItems = toSelectItems(billingCycleOptions as string[], {
  monthly: "Mensual",
  quarterly: "Trimestral",
  annual: "Anual",
})
const billingStatusItems = toSelectItems(billingStatusOptions as string[], {
  active: "Activo",
  paused: "Pausado",
})
const currencyItems = toSelectItems(["MXN", "USD"])
const createSteps = [
  { id: "client", title: "Cliente", helper: "Contacto y alta" },
  { id: "circuit", title: "Circuito", helper: "Carrier, POP y capacidad" },
  { id: "technical", title: "Tecnico", helper: "Routing, SLA y monitoreo" },
  { id: "billing", title: "Billing", helper: "Modelo comercial" },
] as const
type CreateStepId = (typeof createSteps)[number]["id"]

function clampMin(value: number, min: number) {
  if (Number.isNaN(value)) return min
  return value < min ? min : value
}

function normalizeBilling(billing: BillingProfile): BillingProfile {
  return {
    ...billing,
    committedMbps:
      typeof billing.committedMbps === "number" ? clampMin(billing.committedMbps, 0) : billing.committedMbps,
    burstMbps: typeof billing.burstMbps === "number" ? clampMin(billing.burstMbps, 0) : billing.burstMbps,
    baseFee: billing.baseFee ? { ...billing.baseFee, amount: clampMin(billing.baseFee.amount, 0) } : billing.baseFee,
    ratePerMbps: billing.ratePerMbps
      ? { ...billing.ratePerMbps, amount: clampMin(billing.ratePerMbps.amount, 0) }
      : billing.ratePerMbps,
  }
}

function toPrefixesText(prefixes?: string[]) {
  if (!prefixes || prefixes.length === 0) return ""
  return prefixes.join("\n")
}

function fromPrefixesText(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function getInitialEditModes(isCreateMode: boolean) {
  return {
    header: isCreateMode,
    contact: isCreateMode,
    circuit: isCreateMode,
    routing: isCreateMode,
    monitoring: isCreateMode,
    sla: isCreateMode,
    billing: isCreateMode,
  }
}

function getCreateIssues(client: UplinkClient) {
  const issues: string[] = []

  if (!client.customerName.trim()) issues.push("nombre del cliente")
  if (!client.email.trim()) issues.push("correo")
  if (!client.phone.trim()) issues.push("telefono")
  if (!client.registeredAt) issues.push("fecha de alta")

  if (client.billing.model === "capacity_fee" && !client.billing.committedMbps) issues.push("committed Mbps")
  if (client.billing.model === "capacity_fee" && !client.billing.ratePerMbps?.amount) issues.push("rate por Mbps")
  if (client.billing.model === "retainer_sla" && !client.billing.baseFee?.amount) issues.push("retainer")
  if (client.routing?.bgp && !client.routing.asn) issues.push("ASN")

  return issues
}

export function UplinkClientDetail({
  client: initialClient,
  onClose,
  onSaveClient,
  mode = "view",
}: UplinkClientDetailProps) {
  const isCreateMode = mode === "create"
  const initialEditModes = getInitialEditModes(isCreateMode)
  const [createAttempted, setCreateAttempted] = useState(false)

  const [isLoading, setIsLoading] = useState(!isCreateMode)
  const [activeSection, setActiveSection] = useState("billing")
  const [createStep, setCreateStep] = useState<CreateStepId>("client")
  const [customer, setCustomer] = useState(initialClient)
  const [editForm, setEditForm] = useState(initialClient)
  const [editModes, setEditModes] = useState(initialEditModes)
  const [editFormName, setEditFormName] = useState(initialClient.customerName)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const createIssues = useMemo(() => getCreateIssues(editForm), [editForm])
  const createStepIndex = createSteps.findIndex((step) => step.id === createStep)
  const isLastCreateStep = createStepIndex === createSteps.length - 1
  const createSectionContainerClass = cn(editSectionContainerClass, "bg-none from-transparent to-transparent")

  useEffect(() => {
    setCustomer(initialClient)
    setEditForm(initialClient)
    setEditFormName(initialClient.customerName)
    setEditModes(initialEditModes)
    setActiveSection(mode === "create" ? "" : "billing")
    setCreateStep("client")
    setCreateAttempted(false)
    if (mode === "create") {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [initialClient, mode])

  const health = useMemo(() => computeHealth(customer.monitoring), [customer.monitoring])

  const saveClient = (next: UplinkClient) => {
    setCustomer(next)
    setEditForm(next)
    onSaveClient?.(next)
  }

  const handleSaveEdit = (section: keyof typeof editModes) => {
    let next = editForm
    if (section === "header") next = { ...customer, customerName: editFormName.trim() || customer.customerName }
    if (section === "billing") next = { ...editForm, billing: normalizeBilling(editForm.billing) }
    saveClient(next)
    setEditModes((prev) => ({ ...prev, [section]: false }))
  }

  const handleCreateClient = () => {
    setCreateAttempted(true)
    if (createIssues.length > 0) return

    saveClient({
      ...editForm,
      customerName: editFormName.trim() || editForm.customerName,
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

  const setSectionEdit = (section: keyof typeof editModes) => {
    setEditForm(customer)
    if (section === "header") setEditFormName(customer.customerName)
    setEditModes((prev) => ({ ...prev, [section]: true }))
    if (section !== "header" && activeSection !== section) setActiveSection(section)
  }

  const changeField = <K extends keyof UplinkClient>(key: K, value: UplinkClient[K]) => {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  const changeRouting = <K extends keyof NonNullable<UplinkClient["routing"]>>(
    key: K,
    value: NonNullable<UplinkClient["routing"]>[K]
  ) => {
    setEditForm((prev) => ({
      ...prev,
      routing: {
        ...(prev.routing ?? {}),
        [key]: value,
      },
    }))
  }

  const changeMonitoring = <K extends keyof NonNullable<UplinkClient["monitoring"]>>(
    key: K,
    value: NonNullable<UplinkClient["monitoring"]>[K]
  ) => {
    setEditForm((prev) => ({
      ...prev,
      monitoring: {
        ...(prev.monitoring ?? {}),
        [key]: value,
      },
    }))
  }

  const changeSla = <K extends keyof NonNullable<UplinkClient["sla"]>>(
    key: K,
    value: NonNullable<UplinkClient["sla"]>[K]
  ) => {
    setEditForm((prev) => ({
      ...prev,
      sla: {
        ...(prev.sla ?? {}),
        [key]: value,
      },
    }))
  }

  const changeContract = <K extends keyof NonNullable<UplinkClient["contract"]>>(
    key: K,
    value: NonNullable<UplinkClient["contract"]>[K]
  ) => {
    setEditForm((prev) => ({
      ...prev,
      contract: {
        ...(prev.contract ?? {}),
        [key]: value,
      },
    }))
  }

  const changeBilling = <K extends keyof BillingProfile>(key: K, value: BillingProfile[K]) => {
    setEditForm((prev) => ({ ...prev, billing: { ...prev.billing, [key]: value } }))
  }

  const changeBillingMoney = (field: "baseFee" | "ratePerMbps", key: "amount" | "currency", value: number | string) => {
    setEditForm((prev) => {
      const current = prev.billing[field] ?? { amount: 0, currency: "MXN" as const }
      return {
        ...prev,
        billing: {
          ...prev.billing,
          [field]:
            key === "amount"
              ? { ...current, amount: Number(value) }
              : { ...current, currency: value as "MXN" | "USD" },
        },
      }
    })
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
    if (createStep === "client") {
      return (
        <section className={createSectionContainerClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-100">Cliente y alta</h3>
            <CreateModeInfo
              title="Cliente y alta"
              description="Registra la razon comercial y el contacto operativo. El estado del uplink se administra despues."
            />
          </div>
          <EditFieldCard label="Cliente" required>
            <input
              value={editForm.customerName}
              onChange={(e) => {
                setEditFormName(e.target.value)
                changeField("customerName", e.target.value)
              }}
              className={embeddedValueClass()}
              autoFocus
            />
          </EditFieldCard>
          <IconEditFieldCard label="Nombre contacto" icon={<Mail size={16} />}>
            <input value={editForm.contactName ?? ""} onChange={(e) => changeField("contactName", e.target.value)} className={embeddedValueClass()} />
          </IconEditFieldCard>
          <div className="grid grid-cols-2 gap-2">
            <IconEditFieldCard label="Correo electronico" required icon={<Mail size={16} />}>
              <input value={editForm.email} onChange={(e) => changeField("email", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
            <IconEditFieldCard label="Telefono" required icon={<Phone size={16} />}>
              <input value={editForm.phone} onChange={(e) => changeField("phone", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <IconEditFieldCard label="Ciudad" icon={<MapPin size={16} />}>
              <input value={editForm.city ?? ""} onChange={(e) => changeField("city", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
            <IconEditFieldCard label="Estado" icon={<MapPin size={16} />}>
              <input value={editForm.state ?? ""} onChange={(e) => changeField("state", e.target.value)} className={embeddedValueClass()} />
            </IconEditFieldCard>
          </div>
          <EmbeddedDateCard
            label="Fecha de alta"
            required
            value={editForm.registeredAt}
            onChange={(value) => changeField("registeredAt", value ?? "")}
          />
        </section>
      )
    }

    if (createStep === "circuit") {
      return (
        <section className={createSectionContainerClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-100">Circuito</h3>
            <CreateModeInfo
              title="Circuito"
              description="Captura los datos fisicos o deja pendiente lo que todavia no te entregue el carrier."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <EmbeddedSelectCard label="Carrier" required items={carrierItems} selectedKey={editForm.upstreamCarrier} onChange={(value) => changeField("upstreamCarrier", value as UpstreamCarrier)} />
            <EmbeddedSelectCard label="Tipo uplink" required items={uplinkTypeItems} selectedKey={editForm.uplinkType} onChange={(value) => changeField("uplinkType", value as UplinkType)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <EmbeddedSelectCard label="Handoff" required items={handoffItems} selectedKey={editForm.handoff} onChange={(value) => changeField("handoff", value as UplinkHandoff)} />
            <EditFieldCard label="Circuit ID">
              <input value={editForm.circuitId ?? ""} onChange={(e) => changeField("circuitId", e.target.value)} className={embeddedValueClass()} />
            </EditFieldCard>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="POP A">
              <input value={editForm.popA ?? ""} onChange={(e) => changeField("popA", e.target.value)} className={embeddedValueClass()} />
            </EditFieldCard>
            <EditFieldCard label="POP B">
              <input value={editForm.popB ?? ""} onChange={(e) => changeField("popB", e.target.value)} className={embeddedValueClass()} />
            </EditFieldCard>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="Committed Mbps">
              <input type="number" min="0" value={editForm.committedMbps ?? 0} onChange={(e) => changeField("committedMbps", Number(e.target.value))} className={embeddedValueClass()} />
            </EditFieldCard>
            <EditFieldCard label="Burst Mbps">
              <input type="number" min="0" value={editForm.burstMbps ?? 0} onChange={(e) => changeField("burstMbps", Number(e.target.value))} className={embeddedValueClass()} />
            </EditFieldCard>
          </div>
        </section>
      )
    }

    if (createStep === "technical") {
      return (
        <section className={createSectionContainerClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-100">Routing, SLA y monitoreo</h3>
            <CreateModeInfo
              title="Routing, SLA y monitoreo"
              description="Este paso es opcional, pero permite dejar el uplink listo si la informacion tecnica ya existe."
            />
          </div>
          <EditFieldCard label="BGP habilitado">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
              <Checkbox checked={Boolean(editForm.routing?.bgp)} onCheckedChange={(checked) => changeRouting("bgp", checked === true)} />
              {editForm.routing?.bgp ? "Si" : "No"}
            </label>
          </EditFieldCard>
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="ASN">
              <input type="number" min="0" value={editForm.routing?.asn ?? ""} onChange={(e) => changeRouting("asn", e.target.value === "" ? undefined : Number(e.target.value))} className={embeddedValueClass()} />
            </EditFieldCard>
            <EmbeddedDateCard label="Ultimo check" value={editForm.monitoring?.lastCheckAt} onChange={(value) => changeMonitoring("lastCheckAt", value)} />
          </div>
          <EditFieldCard label="Prefijos publicos (uno por linea)">
            <textarea rows={3} value={toPrefixesText(editForm.routing?.publicPrefixes)} onChange={(e) => changeRouting("publicPrefixes", fromPrefixesText(e.target.value))} className={cn(embeddedValueClass("resize-none min-h-[80px]"))} />
          </EditFieldCard>
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="Disponibilidad SLA (%)">
              <input type="number" min="0" max="100" value={editForm.sla?.availabilityPct ?? ""} onChange={(e) => changeSla("availabilityPct", e.target.value === "" ? undefined : Number(e.target.value))} className={embeddedValueClass()} />
            </EditFieldCard>
            <EditFieldCard label="Respuesta SLA (horas)">
              <input type="number" min="0" value={editForm.sla?.responseHours ?? ""} onChange={(e) => changeSla("responseHours", e.target.value === "" ? undefined : Number(e.target.value))} className={embeddedValueClass()} />
            </EditFieldCard>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="Folio contrato">
              <input value={editForm.contract?.folio ?? ""} onChange={(e) => changeContract("folio", e.target.value)} className={embeddedValueClass()} />
            </EditFieldCard>
            <EmbeddedDateCard label="Inicio" value={editForm.contract?.startDate} onChange={(value) => changeContract("startDate", value)} />
          </div>
          <EmbeddedDateCard label="Fin" value={editForm.contract?.endDate} onChange={(value) => changeContract("endDate", value)} />
        </section>
      )
    }

    return (
      <section className={createSectionContainerClass}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-100">Billing</h3>
          <CreateModeInfo
            title="Billing"
            description="El billing nace activo por default. Solo pide lo que define el acuerdo economico."
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <EmbeddedSelectCard label="Modelo de cobro" required items={billingModelItems} selectedKey={editForm.billing.model} onChange={(value) => changeBilling("model", value as BillingModel)} />
          <EmbeddedSelectCard label="Ciclo de facturacion" required items={billingCycleItems} selectedKey={editForm.billing.invoicingCycle} onChange={(value) => changeBilling("invoicingCycle", value as BillingProfile["invoicingCycle"])} />
        </div>
        {editForm.billing.model === "capacity_fee" && (
          <div className="grid grid-cols-2 gap-2">
            <EditFieldCard label="Committed Mbps" required>
              <input type="number" min="0" value={editForm.billing.committedMbps ?? 0} onChange={(e) => changeBilling("committedMbps", Number(e.target.value))} className={embeddedValueClass()} />
            </EditFieldCard>
            <EditFieldCard label="Burst Mbps">
              <input type="number" min="0" value={editForm.billing.burstMbps ?? 0} onChange={(e) => changeBilling("burstMbps", Number(e.target.value))} className={embeddedValueClass()} />
            </EditFieldCard>
          </div>
        )}
        {editForm.billing.model === "capacity_fee" && (
          <EditFieldCard label="Rate por Mbps" required>
            <div className="flex items-center gap-2">
              <input type="number" min="0" value={editForm.billing.ratePerMbps?.amount ?? 0} onChange={(e) => changeBillingMoney("ratePerMbps", "amount", Number(e.target.value))} className={embeddedValueClass("flex-1 min-w-0")} />
              <div className="h-5 w-px bg-white/10" />
              <ModernSelectTailwind items={currencyItems} width="auto" variant="embedded" className="shrink-0" defaultSelectedKeys={[editForm.billing.ratePerMbps?.currency ?? "MXN"]} onSelectionChange={(keys) => {
                if (keys.length > 0) changeBillingMoney("ratePerMbps", "currency", keys[0])
              }} />
            </div>
          </EditFieldCard>
        )}
        {editForm.billing.model === "retainer_sla" && (
          <EditFieldCard label="Retainer base" required>
            <div className="flex items-center gap-2">
              <input type="number" min="0" value={editForm.billing.baseFee?.amount ?? 0} onChange={(e) => changeBillingMoney("baseFee", "amount", Number(e.target.value))} className={embeddedValueClass("flex-1 min-w-0")} />
              <div className="h-5 w-px bg-white/10" />
              <ModernSelectTailwind items={currencyItems} width="auto" variant="embedded" className="shrink-0" defaultSelectedKeys={[editForm.billing.baseFee?.currency ?? "MXN"]} onSelectionChange={(keys) => {
                if (keys.length > 0) changeBillingMoney("baseFee", "currency", keys[0])
              }} />
            </div>
          </EditFieldCard>
        )}
        <EmbeddedDateCard label="Proxima factura" value={editForm.billing.nextInvoiceDate} onChange={(value) => changeBilling("nextInvoiceDate", value)} />
        <EditFieldCard label="Notas billing">
          <textarea value={editForm.billing.notes ?? ""} onChange={(e) => changeBilling("notes", e.target.value)} rows={2} className={cn(embeddedValueClass("min-h-[64px] resize-none leading-6"))} />
        </EditFieldCard>
      </section>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[600px] text-zinc-100">
      <header className="flex items-start justify-between p-6 border-b border-zinc-800/50 relative">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 flex items-center justify-center text-lg font-semibold">
            {(isCreateMode ? editForm.customerName : customer.customerName).slice(0, 2).toUpperCase() || "NC"}
          </div>
          <div className="flex-1 w-full relative group">
            {isCreateMode ? (
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="min-w-0 truncate text-base font-semibold tracking-tight text-white leading-tight">{editForm.customerName || "Nuevo uplink"}</h2>
                <CreateModeInfo
                  description="El alta manual acepta captura parcial o completa. Si el carrier aun no confirma circuito, routing o billing final, deja los campos opcionales para despues."
                />
              </div>
            ) : editModes.header ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="bg-[#0f0f0f] border border-[#2f68f6] text-white text-xl font-bold rounded-lg px-2 py-0.5 w-full focus:outline-none"
                />
                <button onClick={() => handleSaveEdit("header")} className="p-1.5 bg-white text-black rounded-md">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditModes((prev) => ({ ...prev, header: false }))} className="p-1.5 text-zinc-500 rounded-md">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="min-w-0 truncate text-lg font-semibold tracking-tight text-white leading-tight">{customer.customerName}</h2>
                <button onClick={() => setSectionEdit("header")} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500">
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            {!isCreateMode && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/5",
                    uplinkStatusColors[customer.status]
                  )}
                >
                  {uplinkStatusLabels[customer.status]}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border",
                    health === "ok" ? "border-emerald-500/30 text-emerald-400" : "border-amber-500/30 text-amber-400"
                  )}
                >
                  Health {health === "ok" ? "OK" : "Degraded"}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border",
                    customer.billing.status === "active" ? "border-emerald-500/30 text-emerald-400" : "border-zinc-700 text-zinc-400"
                  )}
                >
                  Billing {customer.billing.status}
                </span>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleRequestClose} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a] p-2 rounded-full">
          <X size={18} />
        </button>
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
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contacto</h3>
            {!editModes.contact && (
              <button onClick={() => setSectionEdit("contact")} className="text-zinc-500 hover:text-zinc-300 text-[11px] font-medium">
                Editar
              </button>
            )}
          </div>
          <div className={editSectionContainerClass}>
            {editModes.contact ? (
              <>
                <IconEditFieldCard label="Nombre contacto" icon={<Mail size={16} />}>
                  <input value={editForm.contactName ?? ""} onChange={(e) => changeField("contactName", e.target.value)} className={embeddedValueClass()} />
                </IconEditFieldCard>
                <IconEditFieldCard label="Correo electronico" required icon={<Mail size={16} />}>
                  <input value={editForm.email} onChange={(e) => changeField("email", e.target.value)} className={embeddedValueClass()} />
                </IconEditFieldCard>
                <IconEditFieldCard label="Telefono" required icon={<Phone size={16} />}>
                  <input value={editForm.phone} onChange={(e) => changeField("phone", e.target.value)} className={embeddedValueClass()} />
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
                  <div className="rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-xs leading-5 text-zinc-500">
                    El estado operativo se define despues de crear el uplink.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-zinc-500" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-zinc-500" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-zinc-500" />
                  <span className="text-sm">{[customer.city, customer.state].filter(Boolean).join(", ") || "Sin ubicacion"}</span>
                </div>
                <div className="text-xs text-zinc-500">{customer.contactName ?? "Sin contacto asignado"}</div>
              </>
            )}
            {editModes.contact && (
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditModes((p) => ({ ...p, contact: false }))} className="px-3 py-1 text-xs text-zinc-400">
                  Cancelar
                </button>
                <button onClick={() => handleSaveEdit("contact")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
                  Guardar
                </button>
              </div>
            )}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === "circuit" ? "" : "circuit")}
              className="flex-1 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider"
            >
              <span>Circuito</span>
              <ChevronDown size={16} className={activeSection === "circuit" ? "rotate-180" : ""} />
            </button>
            {activeSection === "circuit" && !editModes.circuit && (
              <button onClick={() => setSectionEdit("circuit")} className="ml-4 text-zinc-500 text-[11px] font-medium">
                Editar
              </button>
            )}
          </div>
          {(activeSection === "circuit" || editModes.circuit) && (
            <div className={cn("mt-3", editSectionContainerClass)}>
              {editModes.circuit ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <EmbeddedSelectCard
                      label="Carrier"
                      required
                      items={carrierItems}
                      selectedKey={editForm.upstreamCarrier}
                      onChange={(value) => changeField("upstreamCarrier", value as UpstreamCarrier)}
                    />
                    <EmbeddedSelectCard
                      label="Tipo uplink"
                      required
                      items={uplinkTypeItems}
                      selectedKey={editForm.uplinkType}
                      onChange={(value) => changeField("uplinkType", value as UplinkType)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <EmbeddedSelectCard
                      label="Handoff"
                      required
                      items={handoffItems}
                      selectedKey={editForm.handoff}
                      onChange={(value) => changeField("handoff", value as UplinkHandoff)}
                    />
                    <EditFieldCard label="Circuit ID">
                      <input value={editForm.circuitId ?? ""} onChange={(e) => changeField("circuitId", e.target.value)} className={embeddedValueClass()} />
                    </EditFieldCard>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="POP A">
                      <input value={editForm.popA ?? ""} onChange={(e) => changeField("popA", e.target.value)} className={embeddedValueClass()} />
                    </EditFieldCard>
                    <EditFieldCard label="POP B">
                      <input value={editForm.popB ?? ""} onChange={(e) => changeField("popB", e.target.value)} className={embeddedValueClass()} />
                    </EditFieldCard>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="Committed Mbps">
                      <input
                        type="number"
                        min="0"
                        value={editForm.committedMbps ?? 0}
                        onChange={(e) => changeField("committedMbps", Number(e.target.value))}
                        className={embeddedValueClass()}
                      />
                    </EditFieldCard>
                    <EditFieldCard label="Burst Mbps">
                      <input
                        type="number"
                        min="0"
                        value={editForm.burstMbps ?? 0}
                        onChange={(e) => changeField("burstMbps", Number(e.target.value))}
                        className={embeddedValueClass()}
                      />
                    </EditFieldCard>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditModes((p) => ({ ...p, circuit: false }))} className="px-3 py-1 text-xs text-zinc-400">
                      Cancelar
                    </button>
                    <button onClick={() => handleSaveEdit("circuit")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Network size={14} className="text-zinc-500" />
                    <span className="text-sm">{upstreamCarrierLabels[customer.upstreamCarrier]}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-sm">{formatUplinkType(customer.uplinkType, customer.handoff)}</span>
                  </div>
                  <p className="text-xs text-zinc-500">Circuito: {customer.circuitId ?? "Sin ID"}</p>
                  <p className="text-xs text-zinc-500">
                    {customer.popA ?? "N/A"} {"->"} {customer.popB ?? "N/A"} | {customer.committedMbps ?? 0}/{customer.burstMbps ?? 0} Mbps
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === "routing" ? "" : "routing")}
              className="flex-1 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider"
            >
              <span>Routing</span>
              <ChevronDown size={16} className={activeSection === "routing" ? "rotate-180" : ""} />
            </button>
            {activeSection === "routing" && !editModes.routing && (
              <button onClick={() => setSectionEdit("routing")} className="ml-4 text-zinc-500 text-[11px] font-medium">
                Editar
              </button>
            )}
          </div>
          {(activeSection === "routing" || editModes.routing) && (
            <div className={cn("mt-3", editSectionContainerClass)}>
              {editModes.routing ? (
                <>
                  <EditFieldCard label="BGP habilitado">
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
                      <Checkbox
                        checked={Boolean(editForm.routing?.bgp)}
                        onCheckedChange={(checked) => changeRouting("bgp", checked === true)}
                      />
                      {editForm.routing?.bgp ? "Si" : "No"}
                    </label>
                  </EditFieldCard>
                  <EditFieldCard label="ASN">
                    <input
                      type="number"
                      min="0"
                      value={editForm.routing?.asn ?? ""}
                      onChange={(e) => changeRouting("asn", e.target.value === "" ? undefined : Number(e.target.value))}
                      className={embeddedValueClass()}
                    />
                  </EditFieldCard>
                  <EditFieldCard label="Prefijos publicos (uno por linea)">
                    <textarea
                      rows={3}
                      value={toPrefixesText(editForm.routing?.publicPrefixes)}
                      onChange={(e) => changeRouting("publicPrefixes", fromPrefixesText(e.target.value))}
                      className={cn(embeddedValueClass("resize-none min-h-[80px]"))}
                    />
                  </EditFieldCard>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditModes((p) => ({ ...p, routing: false }))} className="px-3 py-1 text-xs text-zinc-400">
                      Cancelar
                    </button>
                    <button onClick={() => handleSaveEdit("routing")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Router size={14} className="text-zinc-500" />
                    <span className="text-sm">BGP: {customer.routing?.bgp ? "Habilitado" : "No"}</span>
                  </div>
                  <p className="text-xs text-zinc-500">ASN: {customer.routing?.asn ?? "N/A"}</p>
                  <p className="text-xs text-zinc-500">Prefijos: {customer.routing?.publicPrefixes?.join(", ") ?? "Sin prefijos"}</p>
                </>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === "monitoring" ? "" : "monitoring")}
              className="flex-1 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider"
            >
              <span>Monitoring</span>
              <ChevronDown size={16} className={activeSection === "monitoring" ? "rotate-180" : ""} />
            </button>
            {activeSection === "monitoring" && !editModes.monitoring && (
              <button onClick={() => setSectionEdit("monitoring")} className="ml-4 text-zinc-500 text-[11px] font-medium">
                Editar
              </button>
            )}
          </div>
          {(activeSection === "monitoring" || editModes.monitoring) && (
            <div className={cn("mt-3", editSectionContainerClass)}>
              {editModes.monitoring ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="Latencia (ms)">
                      <input
                        type="number"
                        min="0"
                        value={editForm.monitoring?.latencyMs ?? ""}
                        onChange={(e) => changeMonitoring("latencyMs", e.target.value === "" ? undefined : Number(e.target.value))}
                        className={embeddedValueClass()}
                      />
                    </EditFieldCard>
                    <EditFieldCard label="Perdida (%)">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editForm.monitoring?.lossPct ?? ""}
                        onChange={(e) => changeMonitoring("lossPct", e.target.value === "" ? undefined : Number(e.target.value))}
                        className={embeddedValueClass()}
                      />
                    </EditFieldCard>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="Jitter (ms)">
                      <input
                        type="number"
                        min="0"
                        value={editForm.monitoring?.jitterMs ?? ""}
                        onChange={(e) => changeMonitoring("jitterMs", e.target.value === "" ? undefined : Number(e.target.value))}
                        className={embeddedValueClass()}
                      />
                    </EditFieldCard>
                    <EmbeddedDateCard
                      label="Ultimo check"
                      value={editForm.monitoring?.lastCheckAt}
                      onChange={(value) => changeMonitoring("lastCheckAt", value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditModes((p) => ({ ...p, monitoring: false }))} className="px-3 py-1 text-xs text-zinc-400">
                      Cancelar
                    </button>
                    <button onClick={() => handleSaveEdit("monitoring")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Timer size={14} className="text-zinc-500" />
                    <span className="text-sm">
                      Lat {customer.monitoring?.latencyMs ?? "N/A"} ms · Loss {customer.monitoring?.lossPct ?? "N/A"}% · Jitter{" "}
                      {customer.monitoring?.jitterMs ?? "N/A"} ms
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">Ultimo check: {customer.monitoring?.lastCheckAt ?? "N/A"}</p>
                </>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === "sla" ? "" : "sla")}
              className="flex-1 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider"
            >
              <span>SLA / Contrato</span>
              <ChevronDown size={16} className={activeSection === "sla" ? "rotate-180" : ""} />
            </button>
            {activeSection === "sla" && !editModes.sla && (
              <button onClick={() => setSectionEdit("sla")} className="ml-4 text-zinc-500 text-[11px] font-medium">
                Editar
              </button>
            )}
          </div>
          {(activeSection === "sla" || editModes.sla) && (
            <div className={cn("mt-3", editSectionContainerClass)}>
              {editModes.sla ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="Disponibilidad SLA (%)">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.sla?.availabilityPct ?? ""}
                        onChange={(e) => changeSla("availabilityPct", e.target.value === "" ? undefined : Number(e.target.value))}
                        className={embeddedValueClass()}
                      />
                    </EditFieldCard>
                    <EditFieldCard label="Respuesta SLA (horas)">
                      <input
                        type="number"
                        min="0"
                        value={editForm.sla?.responseHours ?? ""}
                        onChange={(e) => changeSla("responseHours", e.target.value === "" ? undefined : Number(e.target.value))}
                        className={embeddedValueClass()}
                      />
                    </EditFieldCard>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <EditFieldCard label="Folio contrato">
                      <input value={editForm.contract?.folio ?? ""} onChange={(e) => changeContract("folio", e.target.value)} className={embeddedValueClass()} />
                    </EditFieldCard>
                    <EmbeddedDateCard label="Inicio" value={editForm.contract?.startDate} onChange={(value) => changeContract("startDate", value)} />
                  </div>
                  <EmbeddedDateCard label="Fin" value={editForm.contract?.endDate} onChange={(value) => changeContract("endDate", value)} />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditModes((p) => ({ ...p, sla: false }))} className="px-3 py-1 text-xs text-zinc-400">
                      Cancelar
                    </button>
                    <button onClick={() => handleSaveEdit("sla")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    SLA {customer.sla?.availabilityPct ?? "N/A"}% · {customer.sla?.responseHours ?? "N/A"}h
                  </p>
                  <p className="text-xs text-zinc-500">
                    Contrato {customer.contract?.folio ?? "Sin folio"} | {customer.contract?.startDate ?? "N/A"} - {customer.contract?.endDate ?? "N/A"}
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === "billing" ? "" : "billing")}
              className="flex-1 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider"
            >
              <span>Billing</span>
              <ChevronDown size={16} className={activeSection === "billing" ? "rotate-180" : ""} />
            </button>
            {activeSection === "billing" && !editModes.billing && (
              <button onClick={() => setSectionEdit("billing")} className="ml-4 text-zinc-500 text-[11px] font-medium">
                Editar
              </button>
            )}
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

                  {editForm.billing.model === "capacity_fee" && (
                    <div className="grid grid-cols-2 gap-2">
                      <EditFieldCard label="Committed Mbps" required>
                        <input
                          type="number"
                          min="0"
                          value={editForm.billing.committedMbps ?? 0}
                          onChange={(e) => changeBilling("committedMbps", Number(e.target.value))}
                          className={embeddedValueClass()}
                        />
                      </EditFieldCard>
                      <EditFieldCard label="Burst Mbps">
                        <input
                          type="number"
                          min="0"
                          value={editForm.billing.burstMbps ?? 0}
                          onChange={(e) => changeBilling("burstMbps", Number(e.target.value))}
                          className={embeddedValueClass()}
                        />
                      </EditFieldCard>
                      <EditFieldCard label="Rate por Mbps" required>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editForm.billing.ratePerMbps?.amount ?? 0}
                            onChange={(e) => changeBillingMoney("ratePerMbps", "amount", Number(e.target.value))}
                            className={embeddedValueClass("flex-1 min-w-0")}
                          />
                          <div className="h-5 w-px bg-white/10" />
                          <ModernSelectTailwind
                            items={currencyItems}
                            width="auto"
                            variant="embedded"
                            className="shrink-0"
                            defaultSelectedKeys={[editForm.billing.ratePerMbps?.currency ?? "MXN"]}
                            onSelectionChange={(keys) => {
                              if (keys.length > 0) changeBillingMoney("ratePerMbps", "currency", keys[0])
                            }}
                          />
                        </div>
                      </EditFieldCard>
                    </div>
                  )}

                  {editForm.billing.model === "retainer_sla" && (
                    <EditFieldCard label="Retainer base" required>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editForm.billing.baseFee?.amount ?? 0}
                          onChange={(e) => changeBillingMoney("baseFee", "amount", Number(e.target.value))}
                          className={embeddedValueClass("flex-1 min-w-0")}
                        />
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
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <EmbeddedDateCard
                      label="Proxima factura"
                      value={editForm.billing.nextInvoiceDate}
                      onChange={(value) => changeBilling("nextInvoiceDate", value)}
                    />
                    <EmbeddedSelectCard
                      label="Estado billing"
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
                  <EmbeddedDateCard
                    label="Ultima facturacion"
                    value={editForm.billing.lastInvoicedAt}
                    onChange={(value) => changeBilling("lastInvoicedAt", value)}
                  />
                  <EditFieldCard label="Notas billing">
                    <textarea
                      value={editForm.billing.notes ?? ""}
                      onChange={(e) => changeBilling("notes", e.target.value)}
                      rows={2}
                      className={cn(embeddedValueClass("min-h-[64px] resize-none leading-6"))}
                    />
                  </EditFieldCard>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditModes((p) => ({ ...p, billing: false }))} className="px-3 py-1 text-xs text-zinc-400">
                      Cancelar
                    </button>
                    <button onClick={() => handleSaveEdit("billing")} className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ReceiptText size={14} />
                      <span className="text-sm">{formatBillingSummary(customer.billing)}</span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border",
                        customer.billing.status === "active" ? "border-emerald-500/30 text-emerald-400" : "border-zinc-700 text-zinc-400"
                      )}
                    >
                      {customer.billing.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Modelo: {billingModelLabels[customer.billing.model]} | Ciclo: {getItemLabel(billingCycleItems, customer.billing.invoicingCycle)}
                  </p>
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
            <button
              onClick={goToNextCreateStep}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-black bg-white hover:bg-zinc-200 transition-colors outline-none shadow-lg shadow-zinc-900/20"
            >
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
              <AlertCircle size={16} />
              {customer.status === "paused" ? "Reactivar" : "Pausar"}
            </button>
            <button
              onClick={() => setSectionEdit("billing")}
              className="flex-[2] py-2.5 px-4 rounded-lg text-sm font-medium text-black bg-white hover:bg-zinc-200 transition-colors outline-none shadow-lg shadow-zinc-900/20"
            >
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
