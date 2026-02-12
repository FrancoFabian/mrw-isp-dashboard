"use client";

import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGSAP } from "@/lib/gsap/register";

export default function HeroIsland() {
    const rootRef = useRef<HTMLElement | null>(null);
    const [mounted, setMounted] = useState(false);

    // Mark as mounted after hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    useLayoutEffect(() => {
        if (!mounted) return;

        const hero = rootRef.current;
        if (!hero) return;

        registerGSAP();

        const q = <T extends HTMLElement = HTMLElement>(sel: string) =>
            hero.querySelector(sel) as T | null;

        const title = q(".hero-title");
        const sub = q(".hero-subtitle");
        const cta = q(".hero-cta");
        const webgl = q("#hero-webgl");

        if (!title) return;

        const prefersReduced =
            window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

        const ctx = gsap.context(() => {
            // Simple entrance animation - elements start visible
            if (!prefersReduced) {
                gsap.fromTo(
                    [title, sub, cta].filter(Boolean),
                    { y: 30, opacity: 0.5 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.out",
                        stagger: 0.1,
                    }
                );
            }

            // Scroll-based parallax effect (does NOT hide elements completely)
            const mm = gsap.matchMedia();
            mm.add(
                {
                    isDesktop: "(min-width: 1024px)",
                    isMobile: "(max-width: 1023px)",
                },
                (context) => {
                    const { isDesktop } = context.conditions!;

                    // Parallax on scroll - just moves elements, keeps them visible until out of view
                    ScrollTrigger.create({
                        id: "hero-parallax",
                        trigger: hero,
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                        onUpdate: (self) => {
                            const progress = self.progress;
                            const moveX = progress * (isDesktop ? 150 : 100);
                            const fade = Math.max(0, 1 - progress * 1.5);

                            if (title) gsap.set(title, { x: moveX, opacity: fade });
                            if (sub) gsap.set(sub, { x: moveX * 0.85, opacity: fade });
                            if (cta) gsap.set(cta, { x: moveX * 0.7, opacity: fade });
                        },
                    });

                    // Mouse parallax on WebGL
                    if (webgl && !prefersReduced && isDesktop) {
                        const onMove = (e: MouseEvent) => {
                            const r = hero.getBoundingClientRect();
                            const mx = (e.clientX - r.left) / r.width - 0.5;
                            const my = (e.clientY - r.top) / r.height - 0.5;
                            gsap.to(webgl, {
                                x: mx * 12,
                                y: my * -12,
                                duration: 0.4,
                                ease: "power2.out",
                            });
                        };
                        hero.addEventListener("mousemove", onMove, { passive: true });
                        return () => hero.removeEventListener("mousemove", onMove);
                    }
                }
            );

            return () => mm.revert();
        }, rootRef);

        return () => ctx.revert();
    }, [mounted]);

    // Lazy load WebGL
    useEffect(() => {
        if (!mounted) return;

        const host = document.getElementById("hero-webgl");
        if (!host || !("IntersectionObserver" in window)) return;

        const io = new IntersectionObserver(
            async ([entry], o) => {
                if (!entry.isIntersecting) return;
                o.disconnect();
                const { mountThreeNetwork } = await import("@/lib/three-network");
                await mountThreeNetwork(host as HTMLElement);
            },
            { rootMargin: "200px" }
        );

        io.observe(host);
        return () => io.disconnect();
    }, [mounted]);

    return (
        <section
            ref={rootRef}
            id="home"
            className="gradient-hero min-h-screen grid place-items-center relative overflow-hidden"
        >
            {/* WebGL Background */}
            <div
                id="hero-webgl"
                className="absolute inset-0 z-0 pointer-events-none select-none"
                data-points="140"
                data-dot-size="26"
                data-line-width="2.2"
                data-line-glow="2.6"
                data-link-dist="150"
            />

            {/* Gradient Overlay for better text legibility */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,0,0,0.3), transparent 70%)",
                }}
            />

            {/* Content */}
            <div className="container-lg text-center relative z-10 pt-20 font-sans">
                <span className="badge mb-6 inline-block">
                    🚀 La Velocidad Más Rápida del Mercado
                </span>
                <h1 className="hero-title title-animate text-5xl md:text-7xl font-bold mb-6 text-gradient font-display">
                    La Mejor Opción de Internet
                </h1>
                <p className="hero-subtitle section-sub text-xl md:text-2xl text-[var(--muted-foreground)] mb-8 max-w-3xl mx-auto">
                    Experimenta velocidades ultrarrápidas, conexión estable y el mejor
                    servicio al cliente.
                </p>
                <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#features" className="btn btn-primary text-lg px-8 py-4">
                        Comenzar Ahora <span className="ml-2 text-2xl">➜</span>
                    </a>
                    <a href="#plans" className="btn btn-outline text-lg px-8 py-4">
                        Ver Planes
                    </a>
                </div>
            </div>
        </section>
    );
}
