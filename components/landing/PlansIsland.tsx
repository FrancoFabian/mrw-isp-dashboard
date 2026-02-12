"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGSAP } from "@/lib/gsap/register";
import { Check } from "lucide-react";
import { type Plan } from "@/lib/landing/content";

const WA_PHONE = "529512783064";
const INITIAL_INDEX = 0;

const CONF = {
    desktop: {
        baseX: 410, // Slightly wider offset to create more air between cards
        rotateY: 12,
        scaleMin: 0.85,
        opacityMin: 0.4,
        scrub: 0.5,
    },
    mobile: {
        baseX: 340, // Keep mobile spacing clear without breaking focus framing
        rotateY: 8,
        scaleMin: 0.85,
        opacityMin: 0.5,
        scrub: 0.25,
    },
};

export default function PlansIsland({ plans }: { plans: Plan[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
    const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
    const [isComplete, setIsComplete] = useState(false);
    const [pageURL, setPageURL] = useState<string>("");
    const indexRef = useRef(INITIAL_INDEX);
    const completeRef = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setPageURL(window.location.href);
        }
    }, []);

    const getCtaLabel = (p: Plan) =>
        p.price === 0 || /empres/i.test(p.name) ? "Solicitar cotización" : "Preguntar precio";

    const buildWhatsAppHref = (p: Plan) => {
        const city = "San Martín Tilcajete";
        const isBusiness = p.price === 0 || /empres/i.test(p.name);
        const mbpsRaw = p.price;
        const hasMbps = mbpsRaw !== undefined && mbpsRaw !== null && `${mbpsRaw}` !== "0";
        const mbps = hasMbps ? `${mbpsRaw} Mbps` : undefined;

        const start = isBusiness
            ? `Hola, quiero una cotización para "${p.name}". Estoy en ${city}.`
            : `Hola, estoy en ${city}. ¿Cuál es el precio del plan "${p.name}"${mbps ? ` (${mbps})` : ""}?`;

        const features = (p.items ?? []).slice(0, 3);
        const featureLines = features.length
            ? ["Me interesa que incluya:", ...features.map((f) => `- ${f}`)]
            : [];

        const extra = isBusiness
            ? [
                "",
                "Detalles para la cotización:",
                "- Velocidad deseada: ____ Mbps",
                "- Usuarios / equipos: ____",
                "- Uso principal: ____ (videollamadas, POS, cámaras, etc.)",
            ]
            : ["", "¿Hay costo y tiempo de instalación?", "¿Métodos de pago y plazo forzoso?"];

        const lines = [start, ...featureLines, ...extra, "", pageURL ? `Página: ${pageURL}` : ""].filter(
            Boolean
        );
        const text = encodeURIComponent(lines.join("\n"));
        return `https://wa.me/${WA_PHONE}?text=${text}`;
    };

    const openWhatsApp = (p: Plan) => {
        const href = buildWhatsAppHref(p);
        if (typeof window !== "undefined") {
            window.open(href, "_blank", "noopener,noreferrer");
        }
    };

    const addRef = (el: HTMLDivElement | null, i: number) => {
        cardsRef.current[i] = el;
    };

    useLayoutEffect(() => {
        const container = containerRef.current;
        const stage = stageRef.current;

        if (!container || !stage || !plans.length) return;

        registerGSAP();

        indexRef.current = INITIAL_INDEX;
        completeRef.current = false;
        setCurrentIndex(INITIAL_INDEX);
        setIsComplete(false);

        let orientationTimeout: number | undefined;
        let refreshTimeout: number | undefined;
        let raf1 = 0;
        let raf2 = 0;
        let scrollTrigger: ScrollTrigger | null = null;
        let resizeObserver: ResizeObserver | null = null;
        const cleanupFns: Array<() => void> = [];

        const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;
        const getConfig = () => (isMobile() ? CONF.mobile : CONF.desktop);

        const scheduleRefresh = (delay = 0) => {
            if (delay > 0) {
                window.clearTimeout(refreshTimeout);
                refreshTimeout = window.setTimeout(() => {
                    ScrollTrigger.refresh();
                }, delay);
                return;
            }

            if (raf1) cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);

            // Double-rAF waits for DOM/layout settle before forcing a ScrollTrigger refresh.
            raf1 = requestAnimationFrame(() => {
                raf2 = requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });
        };

        const ctx = gsap.context(() => {
            const totalCards = plans.length;

            const animateCards = (exactIndex: number) => {
                const config = getConfig();

                cardsRef.current.forEach((card, i) => {
                    if (!card) return;

                    const distance = i - exactIndex;
                    const absDistance = Math.abs(distance);
                    const isFocused = absDistance < 0.1;

                    const x = distance * config.baseX;
                    const scale = isFocused ? 1 : Math.max(config.scaleMin, 1 - absDistance * 0.3);
                    const opacity = isFocused ? 1 : Math.max(config.opacityMin, 1 - absDistance * 0.5);
                    const rotateY = Math.min(Math.max(distance * config.rotateY, -40), 40);
                    const zIndex = isFocused ? 100 : 10;

                    gsap.set(card, {
                        x,
                        scale,
                        opacity,
                        rotateY,
                        zIndex,
                        transformOrigin: "center center",
                        force3D: true,
                        willChange: "transform, opacity",
                        backfaceVisibility: "hidden",
                    });

                    gsap.to(card, {
                        borderColor: isFocused ? "#3b82f6" : "transparent", // Blue when focused, transparent otherwise
                        duration: 0.3,
                        ease: "power2.out",
                        overwrite: "auto",
                    });

                    const ribbon = card.querySelector(".ribbon") as HTMLElement | null;
                    if (ribbon) {
                        gsap.to(ribbon, {
                            opacity: isFocused ? 1 : 0,
                            duration: 0.2,
                            overwrite: "auto",
                        });
                    }
                });
            };

            const calculateScrollDistance = () => {
                if (totalCards <= 1) return window.innerHeight;

                const firstCard = cardsRef.current[0];
                const measuredHeight = firstCard?.getBoundingClientRect().height ?? 0;
                const cardHeight = measuredHeight > 0 ? measuredHeight : isMobile() ? 600 : 700;
                const tailHeight = isMobile() ? 300 : 400;

                return Math.max(window.innerHeight, totalCards * cardHeight + tailHeight);
            };

            const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

            scrollTrigger = ScrollTrigger.create({
                trigger: container,
                start: "top top",
                end: () => `+=${calculateScrollDistance()}`,
                pin: true,
                pinSpacing: true,
                pinType: isiOS || !!ScrollTrigger.isTouch ? "transform" : "fixed",
                scrub: getConfig().scrub,
                anticipatePin: 1,
                invalidateOnRefresh: true,

                onUpdate: (self) => {
                    if (totalCards <= 1) return;

                    const progress = self.progress;
                    const exactIndex = progress * (totalCards - 1);
                    const newIndex = Math.min(Math.max(Math.round(exactIndex), 0), totalCards - 1);

                    if (newIndex !== indexRef.current) {
                        indexRef.current = newIndex;
                        setCurrentIndex(newIndex);
                    }

                    animateCards(exactIndex);

                    const complete = progress >= 0.95;
                    if (complete !== completeRef.current) {
                        completeRef.current = complete;
                        setIsComplete(complete);
                    }
                },

                onRefresh: (self) => {
                    if (totalCards <= 1) return;
                    const exactIndex = self.progress * (totalCards - 1);
                    animateCards(exactIndex);
                },
            });

            animateCards(INITIAL_INDEX);
            scheduleRefresh();

            const handleOrientationChange = () => {
                window.clearTimeout(orientationTimeout);
                orientationTimeout = window.setTimeout(() => {
                    scheduleRefresh();
                }, 280);
            };

            window.addEventListener("orientationchange", handleOrientationChange, { passive: true });

            if ("ResizeObserver" in window) {
                resizeObserver = new ResizeObserver(() => {
                    scheduleRefresh();
                });
                resizeObserver.observe(stage);
                const firstCard = cardsRef.current[0];
                if (firstCard) resizeObserver.observe(firstCard);
            }

            cleanupFns.push(() => {
                window.removeEventListener("orientationchange", handleOrientationChange);
                resizeObserver?.disconnect();
                resizeObserver = null;
            });
        }, container);

        return () => {
            window.clearTimeout(orientationTimeout);
            window.clearTimeout(refreshTimeout);
            if (raf1) cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);

            scrollTrigger?.kill();
            scrollTrigger = null;
            ctx.revert();
            cleanupFns.forEach((fn) => fn());

            cardsRef.current = [];
        };
    }, [plans.length]);

    if (!plans.length) return null;

    return (
        <section
            ref={containerRef}
            className="min-h-[100svh] flex items-center justify-center bg-section-plans relative z-0 overflow-hidden"
            style={{ perspective: "1000px" }}
            data-gsap-clear
            data-gsap-keep
            suppressHydrationWarning
        >
            <div ref={stageRef} className="plans-carousel-viewport relative w-full max-w-7xl h-full flex items-center justify-center">
                <div className="relative w-full max-w-[320px] md:max-w-[450px] h-[580px]">
                    {plans.map((p, i) => {
                        const isPersonal = p.id === "4d";
                        const isPlus = p.id === "3d"; // Identify Plus plan

                        return (
                            <div
                                key={p.id}
                                ref={(el) => addRef(el, i)}
                                className="plan-card absolute top-0 left-0 w-full h-full rounded-2xl shadow-2xl border border-transparent bg-zinc-950 overflow-hidden"
                                style={{
                                    transformStyle: "preserve-3d",
                                    zIndex: i === INITIAL_INDEX ? 100 : 10,
                                    opacity: i === INITIAL_INDEX ? 1 : 0,
                                    backfaceVisibility: "hidden",
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)", // Deep shadow
                                }}
                            >
                                {/* Header Panel (Inner Card) */}
                                <div
                                    className={`relative rounded-xl mx-4 mt-4 p-6 ${p.popular
                                        ? "shadow-lg border-t border-white/20 border-b border-black/10"
                                        : isPlus
                                            ? "shadow-lg border-t border-white/20 border-b border-black/10"
                                            : "bg-zinc-900 border border-white/5 shadow-inner"
                                        }`}
                                    style={{
                                        background: p.popular
                                            ? "linear-gradient(135deg, #06b6d4 0%, #2563eb 50%, #4f46e5 100%)" // Cyan -> Blue -> Indigo
                                            : isPlus
                                                ? "linear-gradient(135deg, #d4d4d8 0%, #71717a 50%, #3f3f46 100%)" // Silver gradient
                                                : undefined,
                                    }}
                                >
                                    {/* Radial highlight for Popular/Plus card */}
                                    {(p.popular || isPlus) && (
                                        <div
                                            className="absolute inset-0 rounded-xl pointer-events-none"
                                            style={{
                                                background: "radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 60%)",
                                                mixBlendMode: "overlay"
                                            }}
                                        />
                                    )}

                                    {/* Popular Badge for Standard Plan */}
                                    {p.popular && (
                                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
                                            MÁS POPULAR
                                        </div>
                                    )}

                                    {/* Chip with Bevel */}
                                    <div
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 relative z-10 ${p.popular
                                            ? "bg-white text-blue-900 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.2)]"
                                            : isPlus
                                                ? "bg-white text-zinc-800 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.2)]"
                                                : "bg-zinc-800 text-zinc-300 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                            }`}
                                    >
                                        {p.name}
                                    </div>

                                    {/* Mbps Display */}
                                    <div className="text-center relative z-10">
                                        <div className={`font-bold leading-none ${p.popular || isPlus ? "text-white drop-shadow-sm" : "text-white"}`}>
                                            <span className={`${isPersonal ? "text-3xl" : "text-6xl"}`}>
                                                {isPersonal ? "Empresarial" : p.price}
                                            </span>
                                            {!isPersonal && (
                                                <span className={`text-2xl ml-1 font-medium ${p.popular || isPlus ? "text-white/90" : "text-zinc-400"}`}>
                                                    Mbps
                                                </span>
                                            )}
                                        </div>

                                        {!isPersonal && (
                                            <p className={`text-sm mt-3 font-medium ${p.popular || isPlus ? "text-white/80" : "text-zinc-500"}`}>
                                                Fibra óptica dedicada
                                            </p>
                                        )}
                                        {isPersonal && (
                                            <p className={`text-sm mt-3 font-medium ${p.popular || isPlus ? "text-white/80" : "text-zinc-500"}`}>
                                                Velocidad a medida
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Features & CTA Section (dark background) */}
                                <div className="p-6 pt-5 flex flex-col justify-between flex-grow">
                                    <ul className="space-y-4 mb-6 text-left">
                                        {(p.items ?? []).map((f, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className={`mt-0.5 rounded-full p-0.5 ${p.popular ? "bg-blue-500/20" : isPlus ? "bg-zinc-700/50" : "bg-zinc-800"}`}>
                                                    <Check size={14} className={p.popular ? "text-blue-400" : isPlus ? "text-white" : "text-zinc-500"} strokeWidth={3} />
                                                </div>
                                                <span className="text-sm font-medium leading-relaxed text-zinc-300">
                                                    {f}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        onClick={() => openWhatsApp(p)}
                                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg ${p.popular
                                            ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_4px_14px_0_rgba(0,118,255,0.39),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-blue-400 hover:to-blue-500 border-t border-blue-400"
                                            : "bg-zinc-900 text-zinc-300 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-zinc-800 hover:text-white"
                                            }`}
                                        aria-label={`WhatsApp: ${getCtaLabel(p)} del plan ${p.name}`}
                                    >
                                        {getCtaLabel(p)} por WhatsApp
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Progress indicators */}
            <div
                className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3"
                aria-hidden="true"
            >
                {plans.map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${i === currentIndex ? "scale-150" : ""
                            }`}
                        style={{
                            background:
                                i === currentIndex
                                    ? "var(--primary)"
                                    : "color-mix(in oklch, var(--border) 70%, transparent)",
                        }}
                    />
                ))}
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                <div
                    className={`text-sm font-medium transition-all duration-500 ${isComplete ? "animate-pulse" : "animate-bounce"
                        }`}
                    style={{ color: "var(--muted-foreground)" }}
                >
                    {isComplete ? "Continúa scrolleando ↓" : "Scroll para ver más planes"}
                </div>
            </div>
        </section>
    );
}
