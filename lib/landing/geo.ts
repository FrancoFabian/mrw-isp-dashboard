// lib/landing/geo.ts
const DEG2RAD = Math.PI / 180;

// Coverage center coordinates
export const COVERAGE_CENTER = { lat: 16.8590272, lon: -96.6914114 };

// Coverage radius in kilometers
export const RADIUS_KM = 3.0;

/** Haversine distance in KM */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * DEG2RAD;
    const dLon = (lon2 - lon1) * DEG2RAD;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/** Distance from user to coverage center */
export function distanceToCenterKm(lat: number, lon: number): number {
    return haversineKm(lat, lon, COVERAGE_CENTER.lat, COVERAGE_CENTER.lon);
}

/** Is user inside coverage (3 km radius)? */
export function isInsideCoverage(lat: number, lon: number): boolean {
    const d = distanceToCenterKm(lat, lon);
    return d <= RADIUS_KM;
}

/** Debug helper */
export function debugCoverage(lat: number, lon: number) {
    const d = distanceToCenterKm(lat, lon);
    console.log(
        `[Geo] Coords: ${lat.toFixed(6)}, ${lon.toFixed(6)} | ` +
        `Center: ${COVERAGE_CENTER.lat}, ${COVERAGE_CENTER.lon} | ` +
        `Distance: ${d.toFixed(3)} km | Inside?: ${d <= RADIUS_KM}`
    );
}
