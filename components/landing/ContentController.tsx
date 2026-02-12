"use client";

import { useEffect, useState, useRef } from "react";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGSAP } from "@/lib/gsap/register";
import { useLanding } from "@/stores/landing-context";
import { isInsideCoverage, distanceToCenterKm, COVERAGE_CENTER } from "@/lib/landing/geo";
import { plans } from "@/lib/landing/content";

import PlansIsland from "./PlansIsland";
import WorkInProgressNotice from "./WorkInProgressNotice";
import CookieBanner from "./CookieBanner";
import PlansSkeleton from "./PlansSkeleton";

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return function (...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

export default function ContentController() {
    const { cookieConsent, isZoneAvailable, setZoneAvailable } = useLanding();

    const [loading, setLoading] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    const previewPlans = false;

    useEffect(() => {
        registerGSAP();
        setHydrated(true);
    }, []);

    // Geo-check
    useEffect(() => {
        if (!hydrated) return;

        if (previewPlans) {
            setZoneAvailable(true);
            setLoading(false);
            return;
        }

        if (cookieConsent !== "accepted") {
            setLoading(false);
            return;
        }

        const SS_KEY = "vz-cache-geo";
        const CLIENT_TTL_HIT = 60 * 60;
        const CLIENT_TTL_MISS = 5 * 60;

        try {
            const cachedRaw = sessionStorage.getItem(SS_KEY);
            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw) as { v: boolean; ts: number; ttl: number };
                const now = Math.floor(Date.now() / 1000);
                if (now - cached.ts < cached.ttl) {
                    setZoneAvailable(Boolean(cached.v));
                    setLoading(false);
                    return;
                }
            }
        } catch { }

        setLoading(true);

        const handleSuccess = (pos: GeolocationPosition) => {
            const { latitude, longitude } = pos.coords;

            const d = distanceToCenterKm(latitude, longitude);
            console.log(
                "[Geo] Coords:",
                latitude,
                longitude,
                "| Centro:",
                COVERAGE_CENTER.lat,
                COVERAGE_CENTER.lon,
                "| Distancia:",
                d.toFixed(3),
                "km"
            );

            const val = isInsideCoverage(latitude, longitude);
            setZoneAvailable(val);

            try {
                sessionStorage.setItem(
                    SS_KEY,
                    JSON.stringify({
                        v: val,
                        ts: Math.floor(Date.now() / 1000),
                        ttl: val ? CLIENT_TTL_HIT : CLIENT_TTL_MISS,
                    })
                );
            } catch { }
            setLoading(false);
        };

        const handleError = () => {
            setZoneAvailable(false);
            setLoading(false);
        };

        if (!("geolocation" in navigator)) {
            handleError();
            return;
        }

        const ask = () => {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
                enableHighAccuracy: true,
                maximumAge: 60_000,
                timeout: 10_000,
            });
        };

        if ("permissions" in navigator && (navigator as unknown as { permissions?: { query: (o: { name: string }) => Promise<{ state: string }> } }).permissions?.query) {
            (navigator as unknown as { permissions: { query: (o: { name: string }) => Promise<{ state: string }> } }).permissions
                .query({ name: "geolocation" })
                .then((p) => (p.state === "denied" ? handleError() : ask()))
                .catch(ask);
        } else {
            ask();
        }
    }, [hydrated, cookieConsent, previewPlans, setZoneAvailable]);

    const showPlans = hydrated && cookieConsent === "accepted" && isZoneAvailable === true;
    const showNotice = hydrated && !loading && !showPlans;

    // Refresh on load
    useEffect(() => {
        if (!hydrated) return;
        const schedule = () => requestAnimationFrame(() => ScrollTrigger.refresh());
        window.addEventListener("load", schedule, { once: true });
        return () => window.removeEventListener("load", schedule);
    }, [hydrated]);

    // Refresh on resize
    useEffect(() => {
        if (!hydrated || !wrapperRef.current) return;
        const debouncedRefresh = debounce(() => ScrollTrigger.refresh(), 150);
        const obs = Observer.create({
            target: window,
            type: "resize",
            onChange: debouncedRefresh,
        });
        return () => obs?.kill();
    }, [hydrated]);

    return (
        <>
            <CookieBanner />

            <div ref={wrapperRef} data-gsap-clear="true" suppressHydrationWarning>
                <section
                    ref={sectionRef}
                    id="plans"
                    data-state={
                        !hydrated ? "ssr" : showPlans ? "plans" : loading ? "loading" : "notice"
                    }
                    className={`
            relative isolate z-0 mx-auto max-w-7xl px-4 md:px-6 lg:px-8 scroll-mt-24
            ${showPlans ? "py-10 min-h-[100vh]" : "min-h-[80vh] py-16"}
          `}
                    aria-busy={hydrated ? loading && !previewPlans : false}
                    data-gsap-clear="true"
                    suppressHydrationWarning
                    style={{ overflow: "visible" }}
                >
                    {!hydrated && (
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="h-8 w-64 mx-auto rounded bg-white/5 mb-4" />
                            <div className="h-4 w-80 mx-auto rounded bg-white/5" />
                        </div>
                    )}

                    {hydrated && (
                        <>
                            <PlansSkeleton
                                show={loading && !previewPlans}
                                variant={
                                    showPlans
                                        ? "plans"
                                        : cookieConsent === "unset" || cookieConsent === "denied"
                                            ? "cookies"
                                            : "unavailable"
                                }
                            />

                            {showPlans && (
                                <>
                                    <div className="text-center mb-10">
                                        <h2
                                            className="title-animate text-4xl md:text-5xl font-bold mb-4 text-gradient font-display"
                                            data-split="2,2,*"
                                            data-gsap-clear="true"
                                        >
                                            Planes Perfectos para Ti
                                        </h2>
                                        <p
                                            className="section-sub text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto"
                                            data-gsap-clear="true"
                                        >
                                            Disponible en San Martín Tilcajete
                                        </p>
                                    </div>

                                    <PlansIsland plans={plans} />
                                </>
                            )}

                            {showNotice && (
                                <div className="max-w-2xl mx-auto">
                                    <WorkInProgressNotice />
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </>
    );
}
