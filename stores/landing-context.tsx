"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { getConsent, setConsent as persistConsent, CONSENT_KEY } from "@/lib/landing/consent";

type ConsentState = "unset" | "accepted" | "denied";

interface LandingContextValue {
    // Cookie consent
    cookieConsent: ConsentState;
    acceptCookies: () => void;
    denyCookies: () => void;

    // Zone availability
    isZoneAvailable: boolean;
    setZoneAvailable: (value: boolean) => void;

    // Cookie banner visibility
    showCookieBanner: boolean;
    setShowCookieBanner: (value: boolean) => void;
}

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
    const [cookieConsent, setCookieConsent] = useState<ConsentState>("unset");
    const [isZoneAvailable, setZoneAvailable] = useState(false);
    const [showCookieBanner, setShowCookieBanner] = useState(true);

    // Load consent from localStorage on mount
    useEffect(() => {
        const stored = getConsent();
        if (stored !== "unset") {
            setCookieConsent(stored);
            setShowCookieBanner(false);
        }
    }, []);

    const acceptCookies = useCallback(() => {
        persistConsent("accepted");
        setCookieConsent("accepted");
        setShowCookieBanner(false);
    }, []);

    const denyCookies = useCallback(() => {
        persistConsent("denied");
        setCookieConsent("denied");
        setShowCookieBanner(false);
    }, []);

    return (
        <LandingContext.Provider
            value={{
                cookieConsent,
                acceptCookies,
                denyCookies,
                isZoneAvailable,
                setZoneAvailable,
                showCookieBanner,
                setShowCookieBanner,
            }}
        >
            {children}
        </LandingContext.Provider>
    );
}

export function useLanding() {
    const context = useContext(LandingContext);
    if (!context) {
        throw new Error("useLanding must be used within a LandingProvider");
    }
    return context;
}
