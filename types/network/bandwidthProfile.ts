/** Bandwidth profile / service plan configuration */
export interface BandwidthProfile {
    id: string
    name: string
    /** Download speed in Mbps */
    downMbps: number
    /** Upload speed in Mbps */
    upMbps: number
    /** Burst download speed (optional) */
    burstDownMbps?: number
    /** Burst upload speed (optional) */
    burstUpMbps?: number
    /** QoS priority (1-8, higher = more priority) */
    priority?: number
    /** VLAN ID for this profile (optional) */
    vlanId?: number
    /** Whether service is suspended when billing is overdue */
    suspendOnOverdue: boolean
    /** Grace period in days before suspension */
    gracePeriodDays: number
    /** Whether this profile is active and assignable */
    isActive: boolean
    /** Human-readable description */
    description?: string
    createdAt: string
    updatedAt: string
}

/** Profile with usage statistics */
export interface BandwidthProfileWithStats extends BandwidthProfile {
    /** Number of ONUs using this profile */
    onuCount: number
    /** Number of active customers with this profile */
    activeCustomerCount: number
}

/** Format speed for display */
export function formatSpeed(mbps: number): string {
    if (mbps >= 1000) {
        return `${(mbps / 1000).toFixed(1)} Gbps`
    }
    return `${mbps} Mbps`
}

/** Format profile speed range */
export function formatProfileSpeed(profile: BandwidthProfile): string {
    return `${formatSpeed(profile.downMbps)} / ${formatSpeed(profile.upMbps)}`
}
