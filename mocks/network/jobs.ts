import type { ProvisioningJob, ProvisioningStep, ProvisioningLog } from "@/types/network"

function createSteps(status: ProvisioningJob["status"]): ProvisioningStep[] {
    const baseSteps: ProvisioningStep[] = [
        { id: "step-1", order: 1, name: "Validar cliente", description: "Verificar datos del cliente", status: "pending" },
        { id: "step-2", order: 2, name: "Reservar puerto", description: "Reservar puerto NAP seleccionado", status: "pending" },
        { id: "step-3", order: 3, name: "Registrar ONU", description: "Registrar ONU en OLT", status: "pending" },
        { id: "step-4", order: 4, name: "Configurar perfil", description: "Aplicar perfil de velocidad", status: "pending" },
        { id: "step-5", order: 5, name: "Activar servicio", description: "Habilitar tráfico de datos", status: "pending" },
    ]

    if (status === "pending") {
        return baseSteps
    }

    if (status === "running") {
        baseSteps[0].status = "success"
        baseSteps[1].status = "success"
        baseSteps[2].status = "running"
        return baseSteps
    }

    if (status === "success") {
        return baseSteps.map(step => ({ ...step, status: "success" as const }))
    }

    if (status === "failed") {
        baseSteps[0].status = "success"
        baseSteps[1].status = "success"
        baseSteps[2].status = "failed"
        baseSteps[2].errorMessage = "Error al comunicarse con el OLT: timeout"
        baseSteps[3].status = "skipped"
        baseSteps[4].status = "skipped"
        return baseSteps
    }

    return baseSteps
}

// Deterministic base date
const BASE_DATE = new Date("2026-02-01T12:00:00Z").getTime()

function createLogs(status: ProvisioningJob["status"]): ProvisioningLog[] {
    const logs: ProvisioningLog[] = [
        { timestamp: new Date(BASE_DATE - 10 * 60 * 1000).toISOString(), level: "info", message: "Job iniciado" },
        { timestamp: new Date(BASE_DATE - 9 * 60 * 1000).toISOString(), level: "info", message: "Cliente validado correctamente", stepId: "step-1" },
    ]

    if (status !== "pending") {
        logs.push({ timestamp: new Date(BASE_DATE - 8 * 60 * 1000).toISOString(), level: "info", message: "Puerto NAP-002-PORT-09 reservado", stepId: "step-2" })
    }

    if (status === "failed") {
        logs.push({ timestamp: new Date(BASE_DATE - 7 * 60 * 1000).toISOString(), level: "info", message: "Intentando registrar ONU en OLT...", stepId: "step-3" })
        logs.push({ timestamp: new Date(BASE_DATE - 6 * 60 * 1000).toISOString(), level: "warn", message: "Reintentando conexión al OLT (intento 1/3)", stepId: "step-3" })
        logs.push({ timestamp: new Date(BASE_DATE - 5 * 60 * 1000).toISOString(), level: "warn", message: "Reintentando conexión al OLT (intento 2/3)", stepId: "step-3" })
        logs.push({ timestamp: new Date(BASE_DATE - 4 * 60 * 1000).toISOString(), level: "error", message: "Error: No se pudo conectar al OLT después de 3 intentos", stepId: "step-3" })
        logs.push({ timestamp: new Date(BASE_DATE - 3 * 60 * 1000).toISOString(), level: "error", message: "Job fallido - revisar conectividad con OLT" })
    }

    if (status === "success") {
        logs.push({ timestamp: new Date(BASE_DATE - 7 * 60 * 1000).toISOString(), level: "info", message: "ONU registrada en OLT", stepId: "step-3" })
        logs.push({ timestamp: new Date(BASE_DATE - 6 * 60 * 1000).toISOString(), level: "info", message: "Perfil Premium 100 aplicado", stepId: "step-4" })
        logs.push({ timestamp: new Date(BASE_DATE - 5 * 60 * 1000).toISOString(), level: "info", message: "Tráfico habilitado - servicio activo", stepId: "step-5" })
        logs.push({ timestamp: new Date(BASE_DATE - 4 * 60 * 1000).toISOString(), level: "info", message: "Provisioning completado exitosamente" })
    }

    return logs
}

export const mockProvisioningJobs: ProvisioningJob[] = [
    {
        id: "JOB-001",
        type: "new_installation",
        status: "pending",
        customerId: "CLT-NEW-001",
        oltId: "OLT-001",
        ponId: "PON-001-2",
        napId: "NAP-004",
        portId: "NAP-004-PORT-12",
        onuSerial: "HUAW12345678",
        onuVendor: "Huawei",
        onuModel: "HG8145V5",
        profileId: "PROF-002",
        vlanId: 110,
        steps: createSteps("pending"),
        logs: [{ timestamp: new Date(BASE_DATE).toISOString(), level: "info", message: "Job creado, esperando inicio" }],
        createdBy: "USR-001",
        createdAt: new Date(BASE_DATE - 5 * 60 * 1000).toISOString(),
        updatedAt: new Date(BASE_DATE).toISOString(),
    },
    {
        id: "JOB-002",
        type: "new_installation",
        status: "running",
        customerId: "CLT-NEW-002",
        oltId: "OLT-002",
        ponId: "PON-002-1",
        napId: "NAP-006",
        portId: "NAP-006-PORT-14",
        onuSerial: "ZTE987654321",
        onuVendor: "ZTE",
        onuModel: "F670L",
        profileId: "PROF-003",
        vlanId: 120,
        steps: createSteps("running"),
        logs: createLogs("running"),
        createdBy: "USR-001",
        createdAt: new Date(BASE_DATE - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(BASE_DATE - 2 * 60 * 1000).toISOString(),
    },
    {
        id: "JOB-003",
        type: "new_installation",
        status: "success",
        customerId: "CLT-010",
        targetOnuId: "ONU-010",
        oltId: "OLT-001",
        ponId: "PON-001-1",
        napId: "NAP-001",
        portId: "NAP-001-PORT-10",
        onuSerial: "VSOL55667788",
        onuVendor: "VSOL",
        onuModel: "V2801F",
        profileId: "PROF-003",
        vlanId: 105,
        steps: createSteps("success"),
        logs: createLogs("success"),
        createdBy: "USR-010",
        createdAt: new Date(BASE_DATE - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(BASE_DATE - 1 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(BASE_DATE - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "JOB-004",
        type: "new_installation",
        status: "success",
        customerId: "CLT-009",
        targetOnuId: "ONU-009",
        oltId: "OLT-002",
        ponId: "PON-002-2",
        napId: "NAP-008",
        portId: "NAP-008-PORT-05",
        onuSerial: "TPLINK112233",
        onuVendor: "TP-Link",
        onuModel: "XZ400-G3",
        profileId: "PROF-002",
        vlanId: 108,
        steps: createSteps("success"),
        logs: createLogs("success"),
        createdBy: "USR-010",
        createdAt: new Date(BASE_DATE - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(BASE_DATE - 23 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(BASE_DATE - 23 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "JOB-005",
        type: "new_installation",
        status: "failed",
        customerId: "CLT-NEW-003",
        oltId: "OLT-003",
        ponId: "PON-003-1",
        napId: "NAP-010",
        portId: "NAP-010-PORT-11",
        onuSerial: "HUAW99887766",
        onuVendor: "Huawei",
        onuModel: "HG8546M",
        profileId: "PROF-002",
        vlanId: 115,
        steps: createSteps("failed"),
        logs: createLogs("failed"),
        createdBy: "USR-001",
        createdAt: new Date(BASE_DATE - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(BASE_DATE - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "JOB-006",
        type: "port_move",
        status: "success",
        customerId: "CLT-007",
        targetOnuId: "ONU-007",
        oltId: "OLT-002",
        ponId: "PON-002-1",
        napId: "NAP-007",
        portId: "NAP-007-PORT-08",
        onuSerial: "ZTE445566778",
        onuVendor: "ZTE",
        onuModel: "F660",
        profileId: "PROF-003",
        vlanId: 107,
        steps: createSteps("success"),
        logs: createLogs("success"),
        createdBy: "USR-010",
        createdAt: new Date(BASE_DATE - 48 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(BASE_DATE - 47 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(BASE_DATE - 47 * 60 * 60 * 1000).toISOString(),
    },
]

/** Get jobs by status */
export function getJobsByStatus(status: ProvisioningJob["status"]): ProvisioningJob[] {
    return mockProvisioningJobs.filter(job => job.status === status)
}

/** Get pending jobs count */
export function getPendingJobsCount(): number {
    return mockProvisioningJobs.filter(job => job.status === "pending").length
}

/** Get running jobs count */
export function getRunningJobsCount(): number {
    return mockProvisioningJobs.filter(job => job.status === "running").length
}

/** Get job by ID */
export function getJobById(id: string): ProvisioningJob | undefined {
    return mockProvisioningJobs.find(job => job.id === id)
}
