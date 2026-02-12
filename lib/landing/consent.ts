// lib/landing/consent.ts
export const CONSENT_KEY = "cookie-consent";
export const LAST_VISIT_KEY = "mrw:last-visit";
export const RESET_FLAG_KEY = "mrw:consent-reset-done";
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export function getConsent(): "unset" | "accepted" | "denied" {
    if (typeof window === "undefined") return "unset";
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "denied" ? v : "unset";
}

export function setConsent(v: "accepted" | "denied") {
    if (typeof window === "undefined") return;
    localStorage.setItem(CONSENT_KEY, v);
}

export function resetConsentAndReload() {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(LAST_VISIT_KEY);
        sessionStorage.removeItem("vz-cache-geo");
        if (!sessionStorage.getItem(RESET_FLAG_KEY)) {
            sessionStorage.setItem(RESET_FLAG_KEY, "1");
            window.location.reload();
        }
    } catch {
        window.location.reload();
    }
}

export function markLastVisit() {
    if (typeof window === "undefined") return;
    localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
}

/**
 * Enforces 2h TTL for users outside coverage zone.
 * If > 2h since last visit, resets consent and reloads.
 */
export function enforceTwoHourTTL(shouldApply: boolean) {
    if (typeof window === "undefined") return;
    if (!shouldApply) return;

    const now = Date.now();
    const last = Number(localStorage.getItem(LAST_VISIT_KEY) || "0");
    const elapsed = now - last;

    if (Number.isFinite(last) && elapsed >= TWO_HOURS_MS) {
        resetConsentAndReload();
        return;
    }
    const remaining = Math.max(TWO_HOURS_MS - (Number.isFinite(last) ? elapsed : 0), 0);
    if (remaining === 0) return;

    const id = window.setTimeout(() => {
        resetConsentAndReload();
    }, remaining);

    return () => window.clearTimeout(id);
}
