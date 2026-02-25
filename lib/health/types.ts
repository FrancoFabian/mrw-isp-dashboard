/* ── Global network status ── */
export type NetworkStatus = "OK" | "WARNING" | "CRITICAL"

export const NETWORK_STATUS_LABELS: Record<NetworkStatus, string> = {
    OK: "Operando",
    WARNING: "Alertas",
    CRITICAL: "Crítico",
}

/* ── Health summary ── */
export interface NetworkHealthSummary {
    totalNodes: number
    online: number
    offline: number
    degraded: number
    unknown: number
    healthScore: number   // 0–100
    status: NetworkStatus
}

/* ── Configurable weights ── */
export interface HealthWeights {
    online: number
    degraded: number
    offline: number
    unknown: number
}

export interface HealthThresholds {
    ok: number       // score >= ok → OK
    warning: number  // score >= warning → WARNING, else CRITICAL
}

export interface HealthConfig {
    weights: HealthWeights
    thresholds: HealthThresholds
}

export const DEFAULT_HEALTH_CONFIG: HealthConfig = {
    weights: {
        online: 1.0,
        degraded: 0.5,
        offline: 0.0,
        unknown: 0.25,
    },
    thresholds: {
        ok: 90,
        warning: 70,
    },
}
