"use client";

import { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { registerGSAP } from "@/lib/gsap/register";

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface ChatAnimationCallbacks {
    onOpenComplete?: () => void;
    onCloseComplete?: () => void;
}

/**
 * MUST be called from a component that is already mounted in the DOM.
 * This guarantees overlayRef/panelRef are populated when useGSAP runs.
 */
export function useChatAnimations(
    open: boolean,
    callbacks?: ChatAnimationCallbacks,
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    /* ── Build timeline ONCE after mount (layout phase → before paint) ── */
    useGSAP(
        () => {
            registerGSAP();

            const overlay = overlayRef.current;
            const panel = panelRef.current;
            if (!overlay || !panel) return;

            const reduced = prefersReducedMotion();
            const dur = reduced ? 0.01 : undefined;

            // Hide elements before first paint (layout phase)
            gsap.set(overlay, { autoAlpha: 0 });
            gsap.set(panel, {
                autoAlpha: 0,
                y: 24,
                scale: 0.97,
                filter: reduced ? "blur(0px)" : "blur(8px)",
                rotateX: reduced ? 0 : -8,
                transformPerspective: 1000,
            });

            const tl = gsap.timeline({
                paused: true,
                onStart() {
                    if (!reduced) {
                        gsap.set(panel, { willChange: "transform, opacity, filter" });
                    }
                },
                onComplete() {
                    gsap.set(panel, { willChange: "auto" });
                    inputRef.current?.focus();
                    callbacks?.onOpenComplete?.();
                },
                onReverseComplete() {
                    gsap.set(panel, { willChange: "auto" });
                    callbacks?.onCloseComplete?.();
                },
            });

            // Overlay bloom
            tl.to(overlay, {
                autoAlpha: 1,
                duration: dur ?? 0.28,
                ease: "power2.out",
            }, 0);

            // Panel pop + lift
            tl.to(panel, {
                y: 0,
                scale: 1,
                autoAlpha: 1,
                filter: "blur(0px)",
                rotateX: 0,
                duration: dur ?? 0.55,
                ease: "expo.out",
            }, reduced ? 0 : 0.05);

            tlRef.current = tl;
        },
        { scope: containerRef, dependencies: [] },
    );

    /* ── Play / reverse based on `open` prop ── */
    useEffect(() => {
        const tl = tlRef.current;
        if (!tl) return;
        if (open) tl.play();
        else tl.reverse();
    }, [open]);

    /* ── New-message micro-animation (one-shot, self-cleaning) ── */
    const animateNewMessage = useCallback((el: HTMLElement | null) => {
        if (!el) return;
        const reduced = prefersReducedMotion();
        gsap.fromTo(
            el,
            { y: reduced ? 0 : 8, autoAlpha: 0 },
            {
                y: 0,
                autoAlpha: 1,
                duration: reduced ? 0.01 : 0.22,
                ease: "power2.out",
                clearProps: "all",
            },
        );
    }, []);

    return { containerRef, overlayRef, panelRef, inputRef, animateNewMessage };
}
