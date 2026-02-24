const R = 6_371_000 // Earth radius in meters
const TO_RAD = Math.PI / 180

/**
 * Haversine distance between two points in meters.
 * Pure function, no dependencies.
 */
export function haversineMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
): number {
    const dLat = (lat2 - lat1) * TO_RAD
    const dLng = (lng2 - lng1) * TO_RAD
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * TO_RAD) * Math.cos(lat2 * TO_RAD) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
