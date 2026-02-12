/** Provisioning job status */
export type ProvisioningJobStatus = "pending" | "running" | "success" | "failed" | "cancelled"

/** Provisioning step status */
export type ProvisioningStepStatus = "pending" | "running" | "success" | "failed" | "skipped"

/** Provisioning job type */
export type ProvisioningJobType = "new_installation" | "port_move" | "reprovision" | "decommission"

/** Individual step in a provisioning job */
export interface ProvisioningStep {
    id: string
    order: number
    name: string
    description: string
    status: ProvisioningStepStatus
    startedAt?: string
    completedAt?: string
    errorMessage?: string
}

/** Log entry for provisioning job */
export interface ProvisioningLog {
    timestamp: string
    level: "info" | "warn" | "error"
    message: string
    stepId?: string
}

/** Provisioning job entity */
export interface ProvisioningJob {
    id: string
    type: ProvisioningJobType
    status: ProvisioningJobStatus
    /** Target customer ID */
    customerId: string
    /** Target ONU ID (created during job) */
    targetOnuId?: string
    /** Desired OLT ID */
    oltId: string
    /** Desired PON port ID */
    ponId: string
    /** Desired NAP ID */
    napId: string
    /** Desired NAP port ID */
    portId: string
    /** ONU serial to register */
    onuSerial: string
    /** ONU vendor */
    onuVendor: string
    /** ONU model */
    onuModel: string
    /** Desired bandwidth profile ID */
    profileId: string
    /** VLAN ID to assign */
    vlanId?: number
    /** PPPoE credentials */
    pppoeUser?: string
    pppoePassword?: string
    steps: ProvisioningStep[]
    logs: ProvisioningLog[]
    /** User who created the job */
    createdBy: string
    createdAt: string
    updatedAt: string
    completedAt?: string
}

/** Provisioning job with display names */
export interface ProvisioningJobWithDetails extends ProvisioningJob {
    customerName: string
    oltName: string
    napName: string
    profileName: string
}

export const provisioningJobStatusLabels: Record<ProvisioningJobStatus, string> = {
    pending: "Pendiente",
    running: "En progreso",
    success: "Completado",
    failed: "Fallido",
    cancelled: "Cancelado",
}

export const provisioningJobStatusColors: Record<ProvisioningJobStatus, string> = {
    pending: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    running: "bg-primary/20 text-primary border-primary/30",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    cancelled: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

export const provisioningJobTypeLabels: Record<ProvisioningJobType, string> = {
    new_installation: "Nueva instalación",
    port_move: "Cambio de puerto",
    reprovision: "Reprovisionamiento",
    decommission: "Baja de servicio",
}

/** Default steps for new installation */
export const newInstallationSteps: Omit<ProvisioningStep, "id">[] = [
    { order: 1, name: "Validar cliente", description: "Verificar datos del cliente", status: "pending" },
    { order: 2, name: "Reservar puerto", description: "Reservar puerto NAP seleccionado", status: "pending" },
    { order: 3, name: "Registrar ONU", description: "Registrar ONU en OLT", status: "pending" },
    { order: 4, name: "Configurar perfil", description: "Aplicar perfil de velocidad", status: "pending" },
    { order: 5, name: "Activar servicio", description: "Habilitar tráfico de datos", status: "pending" },
]
