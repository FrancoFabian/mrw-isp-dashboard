
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Client, ClientLifecycleStatus, ClientStatus } from "@/types/client";
import {
  clientStatusColors,
  clientStatusLabels,
  lifecycleStatusColors,
} from "@/types/client";
import { mockPlans } from "@/mocks/plans";
import { mockPayments } from "@/mocks/payments";
import { paymentStatusColors, paymentStatusLabels } from "@/types/payment";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Router,
  Wifi,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreateFlowStepper,
  CreateModeInfo,
  EditFieldCard,
  EmbeddedDateCard,
  EmbeddedSelectCard,
  editSectionContainerClass,
  embeddedValueClass,
  IconEditFieldCard,
  toSelectItems,
} from "@/components/clients/detail-edit-fields";

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
  onSaveClient?: (client: Client) => void;
  mode?: "view" | "create";
}

const lifecycleSelectLabels: Record<ClientLifecycleStatus, string> = {
  prospect: "Alta manual / por agendar",
  installation_scheduled: "Instalacion programada",
  installation_confirmed: "Instalacion confirmada",
  installed: "Instalado pendiente de activacion",
  active: "Activo",
  suspended: "Suspendido",
};

const lifecycleItems = toSelectItems(
  ["prospect", "installation_scheduled", "installation_confirmed", "installed", "active", "suspended"],
  lifecycleSelectLabels
);
const statusItems = toSelectItems(["active", "suspended", "at_risk"], clientStatusLabels as Record<string, string>);
const autopayItems = [
  { keyId: "disabled", label: "Manual" },
  { keyId: "enabled", label: "Autopay" },
];
const createSteps = [
  { id: "contact", title: "Cliente", helper: "Nombre, contacto y ubicacion" },
  { id: "service", title: "Servicio", helper: "Plan, fecha de alta y cobro" },
  { id: "provision", title: "Provision", helper: "Datos tecnicos si ya existen" },
] as const;
type CreateStepId = (typeof createSteps)[number]["id"];

function getInitialEditModes(isCreateMode: boolean) {
  return {
    header: isCreateMode,
    contact: isCreateMode,
    plan: isCreateMode,
    connection: isCreateMode,
  };
}

function normalizeClientDraft(client: Client): Client {
  const normalizedStatus = client.lifecycleStatus === "suspended" ? "suspended" : client.status;
  const normalizedLifecycle = normalizedStatus === "suspended" ? "suspended" : client.lifecycleStatus;

  return {
    ...client,
    firstName: client.firstName.trim(),
    lastName: client.lastName.trim(),
    address: client.address.trim(),
    city: client.city.trim(),
    state: client.state.trim(),
    node: client.node.trim(),
    ip: client.ip.trim(),
    status: normalizedStatus,
    lifecycleStatus: normalizedLifecycle,
    connectedDevices: Math.max(0, client.connectedDevices ?? 0),
    paymentMethod: client.paymentMethod?.trim() || "",
    wifiName: client.wifiName?.trim() || "",
    wifiPassword: client.wifiPassword?.trim() || "",
  };
}

function getCreateIssues(client: Client) {
  const issues: string[] = [];

  if (!client.firstName.trim()) issues.push("nombre");
  if (!client.lastName.trim()) issues.push("apellido");
  if (!client.email.trim()) issues.push("correo");
  if (!client.phone.trim()) issues.push("telefono");
  if (!client.address.trim()) issues.push("direccion");
  if (!client.city.trim()) issues.push("ciudad");
  if (!client.state.trim()) issues.push("estado");
  if (!client.planId) issues.push("plan");
  if (!client.registeredAt) issues.push("fecha de alta");

  if (client.autopayEnabled && !client.paymentMethod?.trim()) {
    issues.push("metodo de pago para autopay");
  }

  return issues;
}

export function ClientDetail({
  client: initialClient,
  onClose,
  onSaveClient,
  mode = "view",
}: ClientDetailProps) {
  const isCreateMode = mode === "create";
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [activeSection, setActiveSection] = useState<"plan" | "connection" | "history" | "">(
    isCreateMode ? "" : "plan"
  );
  const [createStep, setCreateStep] = useState<CreateStepId>("contact");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [customer, setCustomer] = useState(initialClient);
  const [editModes, setEditModes] = useState(getInitialEditModes(isCreateMode));
  const [editForm, setEditForm] = useState(initialClient);
  const [editFormName, setEditFormName] = useState(`${initialClient.firstName} ${initialClient.lastName}`.trim());
  const [createAttempted, setCreateAttempted] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const plan = mockPlans.find((p) => p.id === (isCreateMode ? editForm.planId : customer.planId));
  const payments = mockPayments.filter((p) => p.clientId === customer.id);
  const totalPages = Math.max(1, Math.ceil(payments.length / itemsPerPage));
  const paginatedHistory = payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const createIssues = useMemo(() => getCreateIssues(editForm), [editForm]);
  const createStepIndex = createSteps.findIndex((step) => step.id === createStep);
  const isLastCreateStep = createStepIndex === createSteps.length - 1;

  useEffect(() => {
    setCustomer(initialClient);
    setEditForm(initialClient);
    setEditFormName(`${initialClient.firstName} ${initialClient.lastName}`.trim());
    setEditModes(getInitialEditModes(mode === "create"));
    setActiveSection(mode === "create" ? "" : "plan");
    setCreateStep("contact");
    setCreateAttempted(false);
    if (mode === "create") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [initialClient, mode]);

  const toggleSection = (section: "plan" | "connection" | "history") => {
    setActiveSection(activeSection === section ? "" : section);
    if (section === "history" && activeSection !== "history") {
      setCurrentPage(1);
    }
  };

  const persistClient = (next: Client) => {
    const normalized = normalizeClientDraft(next);
    setCustomer(normalized);
    setEditForm(normalized);
    onSaveClient?.(normalized);
  };

  const handleEditClick = (section: keyof typeof editModes) => {
    setEditForm(customer);
    if (section === "header") {
      setEditFormName(`${customer.firstName} ${customer.lastName}`.trim());
    }
    if (section === "plan" || section === "connection") {
      setActiveSection(section);
    }
    setEditModes((prev) => ({ ...prev, [section]: true }));
  };

  const handleCancelEdit = (section: keyof typeof editModes) => {
    setEditForm(customer);
    setEditModes((prev) => ({ ...prev, [section]: false }));
  };

  const handleSaveEdit = (section: keyof typeof editModes) => {
    if (section === "header") {
      const parts = editFormName.trim().split(/\s+/);
      const firstName = parts[0] || customer.firstName;
      const lastName = parts.slice(1).join(" ") || customer.lastName;
      persistClient({ ...customer, firstName, lastName });
    } else {
      persistClient(editForm);
    }

    setEditModes((prev) => ({ ...prev, [section]: false }));
  };

  const handleChange = <K extends keyof Client>(field: K, value: Client[K]) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLifecycleChange = (value: string) => {
    const lifecycleStatus = value as ClientLifecycleStatus;
    setEditForm((prev) => ({
      ...prev,
      lifecycleStatus,
      status: lifecycleStatus === "suspended" ? "suspended" : prev.status,
    }));
  };

  const handleCreateClient = () => {
    setCreateAttempted(true);
    if (createIssues.length > 0) return;

    persistClient({
      ...editForm,
      status: "active",
      lifecycleStatus: editForm.node.trim() || editForm.ip.trim() || editForm.cutoffDate ? "active" : "prospect",
      paymentMethod: editForm.autopayEnabled ? editForm.paymentMethod : "",
    });
  };

  const handleRequestClose = () => {
    if (isCreateMode) {
      setShowCloseConfirm(true);
      return;
    }
    onClose();
  };

  const goToPreviousCreateStep = () => {
    if (createStepIndex <= 0) return;
    setCreateStep(createSteps[createStepIndex - 1].id);
  };

  const goToNextCreateStep = () => {
    if (isLastCreateStep) {
      handleCreateClient();
      return;
    }

    setCreateStep(createSteps[createStepIndex + 1].id);
  };

  const initialsSource = isCreateMode ? editForm : customer;
  const initials = `${initialsSource.firstName?.[0] || ""}${initialsSource.lastName?.[0] || ""}`.toUpperCase() || "NC";
  const fullName = `${customer.firstName} ${customer.lastName}`.trim() || "Nuevo cliente";
  const createPreviewName = `${editForm.firstName} ${editForm.lastName}`.trim() || "Nuevo cliente";
  const currentStatus = (isCreateMode ? editForm.status : customer.status) as ClientStatus;
  const currentLifecycle = isCreateMode ? editForm.lifecycleStatus : customer.lifecycleStatus;
  const showPlanEditor = editModes.plan;
  const showConnectionEditor = editModes.connection;
  const showCreateWarning = createAttempted && createIssues.length > 0;
  const createSectionContainerClass = cn(editSectionContainerClass, "bg-none from-transparent to-transparent");

  const ProfileSkeleton = () => (
    <div className="flex flex-col h-full animate-pulse">
      <header className="flex items-start justify-between p-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 rounded-full bg-zinc-800/60 border border-zinc-700/30"></div>
          <div className="flex flex-col gap-2.5 w-full">
            <div className="h-5 bg-zinc-800/60 rounded-md w-48"></div>
            <div className="h-4 bg-zinc-800/60 rounded-md w-20"></div>
          </div>
        </div>
      </header>
      <div className="p-6 space-y-6 flex-1">
        <div className="h-24 bg-zinc-800/30 rounded-xl"></div>
        <div className="h-24 bg-zinc-800/30 rounded-xl"></div>
        <div className="h-24 bg-zinc-800/30 rounded-xl"></div>
      </div>
      <div className="p-6 border-t border-zinc-800/50 bg-black/20 flex gap-3 mt-auto">
        <div className="flex-1 h-10 bg-[#1a1a1a] rounded-lg"></div>
        <div className="flex-[2] h-10 bg-blue-900/20 rounded-lg"></div>
      </div>
    </div>
  );

  const renderCreateStep = () => {
    if (createStep === "contact") {
      return (
        <section className={createSectionContainerClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-100">Datos del cliente</h3>
            <CreateModeInfo
              title="Datos del cliente"
              description="Captura la identidad del titular y la direccion donde se dara seguimiento al servicio."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <IconEditFieldCard label="Nombre" required icon={<Mail size={16} />}>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={embeddedValueClass()}
                autoFocus
              />
            </IconEditFieldCard>
            <IconEditFieldCard label="Apellido" required icon={<Mail size={16} />}>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={embeddedValueClass()}
              />
            </IconEditFieldCard>
          </div>
          <IconEditFieldCard label="Correo electronico" required icon={<Mail size={16} />}>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={embeddedValueClass()}
            />
          </IconEditFieldCard>
          <IconEditFieldCard label="Telefono" required icon={<Phone size={16} />}>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={embeddedValueClass()}
            />
          </IconEditFieldCard>
          <IconEditFieldCard label="Direccion" required icon={<MapPin size={16} />}>
            <textarea
              value={editForm.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
              className={cn(embeddedValueClass("resize-none min-h-[56px] leading-6"))}
            />
          </IconEditFieldCard>
          <div className="grid grid-cols-2 gap-2">
            <IconEditFieldCard label="Ciudad" required icon={<MapPin size={16} />}>
              <input
                type="text"
                value={editForm.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={embeddedValueClass()}
              />
            </IconEditFieldCard>
            <IconEditFieldCard label="Estado" required icon={<MapPin size={16} />}>
              <input
                type="text"
                value={editForm.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className={embeddedValueClass()}
              />
            </IconEditFieldCard>
          </div>
        </section>
      );
    }

    if (createStep === "service") {
      return (
        <section className={createSectionContainerClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-100">Servicio y cobro</h3>
            <CreateModeInfo
              title="Servicio y cobro"
              description="Define el plan y como se cobrara. El estado del cliente queda implicito y se ajusta despues si hace falta."
            />
          </div>
          <div className="space-y-2">
            {mockPlans.map((candidatePlan) => (
              <button
                key={candidatePlan.id}
                type="button"
                onClick={() => handleChange("planId", candidatePlan.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all",
                  editForm.planId === candidatePlan.id
                    ? "border-[#2f68f6] bg-[#2f68f6]/10 shadow-inner"
                    : "border-[#333] bg-[#1a1a1a] hover:border-[#444]"
                )}
              >
                <div>
                  <h4
                    className={cn(
                      "text-sm font-semibold",
                      editForm.planId === candidatePlan.id ? "text-[#2f68f6]" : "text-zinc-200"
                    )}
                  >
                    {candidatePlan.name}
                  </h4>
                  <p className="mt-0.5 text-xs text-zinc-500">{candidatePlan.speed}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-zinc-300">${candidatePlan.price}</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      editForm.planId === candidatePlan.id ? "border-[#2f68f6]" : "border-zinc-600"
                    )}
                  >
                    {editForm.planId === candidatePlan.id ? <div className="h-2 w-2 rounded-full bg-[#2f68f6]" /> : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <EmbeddedDateCard
              label="Fecha de alta"
              required
              value={editForm.registeredAt}
              onChange={(value) => handleChange("registeredAt", value ?? "")}
            />
            <EmbeddedSelectCard
              label="Cobro"
              required
              items={autopayItems}
              selectedKey={editForm.autopayEnabled ? "enabled" : "disabled"}
              onChange={(value) => handleChange("autopayEnabled", value === "enabled")}
            />
          </div>
          {editForm.autopayEnabled ? (
            <EditFieldCard label="Metodo de pago" required>
              <input
                type="text"
                value={editForm.paymentMethod ?? ""}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                placeholder="Tarjeta, transferencia, efectivo"
                className={embeddedValueClass()}
              />
            </EditFieldCard>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-xs leading-5 text-zinc-500">
              Si el cliente pagara manualmente, deja el metodo vacio. Podras capturarlo despues cuando se confirme.
            </div>
          )}
        </section>
      );
    }

    return (
      <section className={createSectionContainerClass}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-100">Provision y operacion</h3>
          <CreateModeInfo
            title="Provision y operacion"
            description="Este paso acepta captura parcial. Si el cliente aun no tiene cita o no esta provisionado, deja estos campos pendientes."
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <EmbeddedDateCard
            label="Fecha de corte"
            value={editForm.cutoffDate}
            onChange={(value) => handleChange("cutoffDate", value ?? "")}
          />
          <EmbeddedDateCard
            label="Ultimo pago"
            value={editForm.lastPaymentDate ?? undefined}
            onChange={(value) => handleChange("lastPaymentDate", value ?? null)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <IconEditFieldCard label="Nodo" icon={<Router size={16} />}>
            <input
              type="text"
              value={editForm.node}
              onChange={(e) => handleChange("node", e.target.value)}
              placeholder="Pendiente o nodo asignado"
              className={embeddedValueClass()}
            />
          </IconEditFieldCard>
          <IconEditFieldCard label="Direccion IP" icon={<Wifi size={16} />}>
            <input
              type="text"
              value={editForm.ip}
              onChange={(e) => handleChange("ip", e.target.value)}
              placeholder="Pendiente o IP provisionada"
              className={embeddedValueClass()}
            />
          </IconEditFieldCard>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <EditFieldCard label="Dispositivos conectados">
            <input
              type="number"
              min="0"
              value={editForm.connectedDevices ?? 0}
              onChange={(e) => handleChange("connectedDevices", e.target.value === "" ? 0 : Number(e.target.value))}
              className={embeddedValueClass()}
            />
          </EditFieldCard>
          <div className="rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-xs leading-5 text-zinc-500">
            Si capturas nodo, IP o corte, el cliente se guardara como listo para operacion.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <IconEditFieldCard label="SSID WiFi" icon={<Wifi size={16} />}>
            <input
              type="text"
              value={editForm.wifiName ?? ""}
              onChange={(e) => handleChange("wifiName", e.target.value)}
              placeholder="Opcional"
              className={embeddedValueClass()}
            />
          </IconEditFieldCard>
          <IconEditFieldCard label="Password WiFi" icon={<Wifi size={16} />}>
            <input
              type="text"
              value={editForm.wifiPassword ?? ""}
              onChange={(e) => handleChange("wifiPassword", e.target.value)}
              placeholder="Opcional"
              className={embeddedValueClass()}
            />
          </IconEditFieldCard>
        </div>
      </section>
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[600px] text-zinc-100">
      {isLoading ? <ProfileSkeleton /> : (
        <>
          <header className="flex items-start justify-between p-6 border-b border-zinc-800/50 relative">
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 flex items-center justify-center text-lg font-semibold flex-shrink-0 shadow-inner">
                {initials}
              </div>
              <div className="flex-1 w-full relative group">
                {isCreateMode ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="min-w-0 truncate text-base font-semibold tracking-tight text-white leading-tight">{createPreviewName}</h2>
                    <CreateModeInfo
                      description="Usa alta manual cuando el cliente no viene del flujo de agenda. Si todavia no hay cita o provision, deja IP, nodo y corte pendientes."
                    />
                  </div>
                ) : editModes.header ? (
                  <div className="space-y-2 mb-1">
                    <input
                      type="text"
                      value={editFormName}
                      onChange={(e) => setEditFormName(e.target.value)}
                      placeholder="Nombre completo"
                      className="bg-[#0f0f0f] border border-[#2f68f6] text-white text-xl font-bold rounded-lg px-2 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-[#2f68f6] shadow-inner"
                      autoFocus={isCreateMode}
                      onKeyDown={(e) => e.key === "Enter" && !isCreateMode && handleSaveEdit("header")}
                    />
                    {!isCreateMode && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("header")}
                          className="p-1.5 bg-white text-black hover:bg-zinc-200 rounded-md transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleCancelEdit("header")}
                          className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-md transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-white leading-tight">{fullName}</h2>
                    <button
                      onClick={() => handleEditClick("header")}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-300 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
                {!isCreateMode && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/5",
                        clientStatusColors[currentStatus]
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          currentStatus === "active"
                            ? "bg-emerald-400"
                            : currentStatus === "suspended"
                              ? "bg-red-400"
                              : "bg-amber-400"
                        )}
                      ></span>
                      {clientStatusLabels[currentStatus]}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/5",
                        lifecycleStatusColors[currentLifecycle]
                      )}
                    >
                      {lifecycleSelectLabels[currentLifecycle]}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleRequestClose}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a] p-2 rounded-full transition-colors flex-shrink-0"
            >
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
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Datos de Contacto</h3>
                {!editModes.contact && (
                  <button
                    onClick={() => handleEditClick("contact")}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                )}
              </div>
              <div className={editSectionContainerClass}>
                {editModes.contact ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <IconEditFieldCard label="Nombre" required icon={<Mail size={16} />}>
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                          className={embeddedValueClass()}
                        />
                      </IconEditFieldCard>
                      <IconEditFieldCard label="Apellido" required icon={<Mail size={16} />}>
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                          className={embeddedValueClass()}
                        />
                      </IconEditFieldCard>
                    </div>
                    <IconEditFieldCard label="Correo electronico" required icon={<Mail size={16} />}>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={embeddedValueClass()}
                      />
                    </IconEditFieldCard>
                    <IconEditFieldCard label="Telefono" required icon={<Phone size={16} />}>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className={embeddedValueClass()}
                      />
                    </IconEditFieldCard>
                    <IconEditFieldCard label="Direccion" required icon={<MapPin size={16} />}>
                      <textarea
                        value={editForm.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        rows={2}
                        className={cn(embeddedValueClass("resize-none min-h-[56px] leading-6"))}
                      />
                    </IconEditFieldCard>
                    <div className="grid grid-cols-2 gap-2">
                      <IconEditFieldCard label="Ciudad" required icon={<MapPin size={16} />}>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                          className={embeddedValueClass()}
                        />
                      </IconEditFieldCard>
                      <IconEditFieldCard label="Estado" required icon={<MapPin size={16} />}>
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) => handleChange("state", e.target.value)}
                          className={embeddedValueClass()}
                        />
                      </IconEditFieldCard>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleCancelEdit("contact")} className="px-3 py-1 text-xs text-zinc-400">
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit("contact")}
                        className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-zinc-200">{fullName}</div>
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
                      <span className="text-sm">
                        {customer.address}, {customer.city}, {customer.state}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => !showPlanEditor && toggleSection("plan")}
                  className="flex-1 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors cursor-pointer outline-none group"
                >
                  <span>Plan y Ciclo de Vida</span>
                  {!showPlanEditor && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 text-zinc-500 group-hover:text-zinc-300 ${activeSection === "plan" ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
                {activeSection === "plan" && !editModes.plan && (
                  <button
                    onClick={() => handleEditClick("plan")}
                    className="ml-4 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                )}
              </div>
              {(activeSection === "plan" || showPlanEditor) && (
                <div
                  className={`mt-3 transition-all ${
                    showPlanEditor
                      ? "pt-2"
                      : "bg-gradient-to-b from-[#18181b] to-[#0f0f0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_5px_rgba(0,0,0,0.5)] rounded-xl p-4"
                  }`}
                >
                  {showPlanEditor ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {mockPlans.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleChange("planId", p.id)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${
                              editForm.planId === p.id
                                ? "bg-[#2f68f6]/10 border-[#2f68f6] shadow-inner"
                                : "bg-[#1a1a1a] border-[#333] hover:border-[#444]"
                            }`}
                          >
                            <div>
                              <h4
                                className={`font-semibold text-sm ${
                                  editForm.planId === p.id ? "text-[#2f68f6]" : "text-zinc-200"
                                }`}
                              >
                                {p.name}
                              </h4>
                              <p className="text-xs text-zinc-500 mt-0.5">{p.speed}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-zinc-300">${p.price}</span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  editForm.planId === p.id ? "border-[#2f68f6]" : "border-zinc-600"
                                }`}
                              >
                                {editForm.planId === p.id && <div className="w-2 h-2 rounded-full bg-[#2f68f6]" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <EmbeddedSelectCard
                          label="Ciclo de vida"
                          required
                          items={lifecycleItems}
                          selectedKey={editForm.lifecycleStatus}
                          onChange={handleLifecycleChange}
                        />
                        <EmbeddedSelectCard
                          label="Estado de cuenta"
                          required
                          items={statusItems}
                          selectedKey={editForm.status}
                          onChange={(value) => handleChange("status", value as ClientStatus)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <EmbeddedSelectCard
                          label="Cobro"
                          required
                          items={autopayItems}
                          selectedKey={editForm.autopayEnabled ? "enabled" : "disabled"}
                          onChange={(value) => handleChange("autopayEnabled", value === "enabled")}
                        />
                        <EditFieldCard label="Metodo de pago">
                          <input
                            type="text"
                            value={editForm.paymentMethod ?? ""}
                            onChange={(e) => handleChange("paymentMethod", e.target.value)}
                            placeholder="Tarjeta, transferencia, efectivo"
                            className={embeddedValueClass()}
                          />
                        </EditFieldCard>
                      </div>
                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-800/50">
                        <button
                          onClick={() => handleCancelEdit("plan")}
                          className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit("plan")}
                          className="px-3 py-1.5 text-xs font-medium bg-white text-black rounded-md hover:bg-zinc-200 transition-colors"
                        >
                          Actualizar plan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-zinc-200 text-base">{plan?.name || "N/A"}</h4>
                        <div className="flex items-center gap-2 mt-1 text-zinc-400">
                          <Wifi size={14} />
                          <span className="text-[13px]">{plan?.speed || "N/A"}</span>
                        </div>
                      </div>
                      <div className="text-right flex items-baseline gap-1">
                        <span className="text-xl font-bold text-zinc-100 tracking-tight">
                          ${plan?.price?.toLocaleString() || "0"}
                        </span>
                        <span className="text-zinc-500 text-[13px]">/ mes</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => !showConnectionEditor && toggleSection("connection")}
                  className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 hover:text-zinc-200 transition-colors cursor-pointer outline-none group"
                >
                  <span>Provision y Operacion</span>
                  {!showConnectionEditor && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-600 font-normal">Editable</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 text-zinc-500 group-hover:text-zinc-300 ${activeSection === "connection" ? "rotate-180" : ""}`}
                      />
                    </div>
                  )}
                </button>
                {activeSection === "connection" && !editModes.connection && (
                  <button
                    onClick={() => handleEditClick("connection")}
                    className="ml-4 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                )}
              </div>
              {(activeSection === "connection" || showConnectionEditor) && (
                <div
                  className={cn(
                    "mt-3",
                    showConnectionEditor
                      ? editSectionContainerClass
                      : "bg-[#0f0f0f] border border-[#222] shadow-inner rounded-xl overflow-hidden opacity-90 p-0"
                  )}
                >
                  {showConnectionEditor ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <EmbeddedDateCard
                          label="Fecha de alta"
                          required
                          value={editForm.registeredAt}
                          onChange={(value) => handleChange("registeredAt", value ?? "")}
                        />
                        <EmbeddedDateCard
                          label="Fecha de corte"
                          value={editForm.cutoffDate}
                          onChange={(value) => handleChange("cutoffDate", value ?? "")}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <IconEditFieldCard label="Nodo" icon={<Router size={16} />}>
                          <input
                            type="text"
                            value={editForm.node}
                            onChange={(e) => handleChange("node", e.target.value)}
                            placeholder="Pendiente o nodo asignado"
                            className={embeddedValueClass()}
                          />
                        </IconEditFieldCard>
                        <IconEditFieldCard label="Direccion IP" icon={<Wifi size={16} />}>
                          <input
                            type="text"
                            value={editForm.ip}
                            onChange={(e) => handleChange("ip", e.target.value)}
                            placeholder="Pendiente o IP provisionada"
                            className={embeddedValueClass()}
                          />
                        </IconEditFieldCard>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <EmbeddedDateCard
                          label="Ultimo pago"
                          value={editForm.lastPaymentDate ?? undefined}
                          onChange={(value) => handleChange("lastPaymentDate", value ?? null)}
                        />
                        <EditFieldCard label="Dispositivos conectados">
                          <input
                            type="number"
                            min="0"
                            value={editForm.connectedDevices ?? 0}
                            onChange={(e) =>
                              handleChange("connectedDevices", e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            className={embeddedValueClass()}
                          />
                        </EditFieldCard>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <IconEditFieldCard label="SSID WiFi" icon={<Wifi size={16} />}>
                          <input
                            type="text"
                            value={editForm.wifiName ?? ""}
                            onChange={(e) => handleChange("wifiName", e.target.value)}
                            placeholder="Opcional"
                            className={embeddedValueClass()}
                          />
                        </IconEditFieldCard>
                        <IconEditFieldCard label="Password WiFi" icon={<Wifi size={16} />}>
                          <input
                            type="text"
                            value={editForm.wifiPassword ?? ""}
                            onChange={(e) => handleChange("wifiPassword", e.target.value)}
                            placeholder="Opcional"
                            className={embeddedValueClass()}
                          />
                        </IconEditFieldCard>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleCancelEdit("connection")}
                          className="px-3 py-1 text-xs text-zinc-400"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit("connection")}
                          className="px-3 py-1 text-xs bg-white text-black rounded-md hover:bg-zinc-200 transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 divide-x divide-y divide-zinc-800/50">
                      <div className="p-4 hover:bg-white/[0.02] transition-colors">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Direccion IP</p>
                        <p className="text-sm font-medium text-zinc-200">{customer.ip || "Pendiente"}</p>
                      </div>
                      <div className="p-4 hover:bg-white/[0.02] transition-colors">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Nodo</p>
                        <p className="text-sm font-medium text-zinc-200">{customer.node || "Pendiente"}</p>
                      </div>
                      <div className="p-4 hover:bg-white/[0.02] transition-colors">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Fecha de corte</p>
                        <p className="text-sm font-medium text-zinc-200">{customer.cutoffDate || "Pendiente"}</p>
                      </div>
                      <div className="p-4 hover:bg-white/[0.02] transition-colors">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Registrado</p>
                        <p className="text-sm font-medium text-zinc-200">{customer.registeredAt || "Pendiente"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

              <section>
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => toggleSection("history")}
                    className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 hover:text-zinc-200 transition-colors cursor-pointer outline-none group"
                  >
                    <span>Historial de Pagos</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-600 font-normal">Solo lectura</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 text-zinc-500 group-hover:text-zinc-300 ${activeSection === "history" ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                </div>
                {activeSection === "history" && (
                  <div className="mt-3 bg-[#0f0f0f] border border-[#222] shadow-inner rounded-xl p-3 flex flex-col gap-1 opacity-90">
                    {payments.length > 0 ? (
                      paginatedHistory.map((payment) => (
                        <div
                          key={payment.id}
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-[#222] transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#1a1a1a] border border-[#222] text-zinc-400 rounded-lg group-hover:text-zinc-200 transition-colors">
                              <CreditCard size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">${payment.amount}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{payment.date || payment.dueDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/5",
                                paymentStatusColors[payment.status]
                              )}
                            >
                              {paymentStatusLabels[payment.status]}
                            </span>
                            <button
                              className="text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                              title="Descargar comprobante"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500 p-2 relative text-center">Sin pagos registrados</p>
                    )}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-2 pt-4 pb-1 border-t border-zinc-800/50">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                            currentPage === 1
                              ? "bg-[#111] text-[#444] cursor-not-allowed"
                              : "bg-[#161618] text-zinc-400 hover:bg-[#222] hover:text-zinc-200 border border-transparent hover:border-zinc-800/50"
                          }`}
                        >
                          Previous
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#e5e5e5] text-black text-sm font-semibold flex items-center justify-center shadow-sm">
                          {currentPage}
                        </div>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                            currentPage === totalPages
                              ? "bg-[#111] text-[#444] cursor-not-allowed"
                              : "bg-[#161618] text-zinc-400 hover:bg-[#222] hover:text-zinc-200 border border-transparent hover:border-zinc-800/50"
                          }`}
                        >
                          Next
                        </button>
                      </div>
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
                {showCreateWarning ? (
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
                  <AlertCircle size={16} /> Suspender
                </button>
                <button
                  onClick={() => {
                    if (!editModes.plan) {
                      toggleSection("plan");
                      setTimeout(() => handleEditClick("plan"), 100);
                    }
                  }}
                  className="flex-[2] py-2.5 px-4 rounded-lg text-sm font-medium text-black bg-white hover:bg-zinc-200 transition-colors outline-none shadow-lg shadow-zinc-900/20"
                >
                  Cambiar plan
                </button>
              </div>
            )}
          </div>
        </>
      )}
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
  );
}
