/** Geographic coordinates */
export interface GeoLocation {
    lat: number
    lng: number
}

/** Named location with optional coordinates */
export interface NamedLocation {
    name: string
    address?: string
    city?: string
    state?: string
    geo?: GeoLocation
}
