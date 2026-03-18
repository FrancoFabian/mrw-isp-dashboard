import { useEffect, useState } from "react"

/**
 * Reactive media-query hook.
 * Returns `true` when the query matches (e.g. `"(max-width: 1439px)"`).
 * SSR-safe: defaults to `false` until hydrated.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const mql = window.matchMedia(query)
        const onChange = () => setMatches(mql.matches)
        mql.addEventListener("change", onChange)
        setMatches(mql.matches)
        return () => mql.removeEventListener("change", onChange)
    }, [query])

    return matches
}

/* ── Pre-built NOC breakpoint hooks ── */

/** Below 1440px → sidebar should auto-collapse to rail */
export function useIsNocCompact(): boolean {
    return useMediaQuery("(max-width: 1439px)")
}

/** Below 1280px → toolbar overflow, health card pill */
export function useIsNocPressure(): boolean {
    return useMediaQuery("(max-width: 1279px)")
}

/** Below 1024px → bottom drawer mode */
export function useIsNocSmallLaptop(): boolean {
    return useMediaQuery("(max-width: 1023px)")
}

/** Below 768px → mobile layout */
export function useIsMobile(): boolean {
    return useMediaQuery("(max-width: 767px)")
}

/** 768px–1023px → tablet layout */
export function useIsTablet(): boolean {
    return useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
}
