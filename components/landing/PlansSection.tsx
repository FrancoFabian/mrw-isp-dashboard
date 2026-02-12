/** Plans 3D Carousel - Fixed with proper GSAP context and original styles */
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { registerGSAP } from "@/lib/gsap/register";
import { landingCopy } from "@/lib/landing/copy";
import { LANDING_PLANS } from "@/lib/landing/constants";
import type { OpenLeadModal } from "@/lib/landing/types";

interface PlansSectionProps {
  onOpenLead: OpenLeadModal;
}

const WHATSAPP_BASE = "https://wa.me/529512783064?text=";
const INITIAL_INDEX = 0;

// Configuración EXACTA de landing-mrw
const CONF = {
  desktop: {
    baseX: 420,
    rotateY: 18,
    scaleMin: 0.68,
    opacityMin: 0.28,
    scrub: 0.5
  },
  mobile: {
    baseX: 280,
    rotateY: 12,
    scaleMin: 0.74,
    opacityMin: 0.34,
    scrub: 0.25
  }
};

function buildWhatsAppHref(text: string): string {
  return `${WHATSAPP_BASE}${encodeURIComponent(text)}`;
}

export default function PlansSection({ onOpenLead }: PlansSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const indexRef = useRef(INITIAL_INDEX);
  const initRef = useRef(false); // Protección StrictMode
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const [isComplete, setIsComplete] = useState(false);

  const addRef = (el: HTMLDivElement | null, i: number) => {
    if (el) cardsRef.current[i] = el;
  };

  useLayoutEffect(() => {
    // Protección contra doble inicialización (StrictMode)
    if (initRef.current) return;
    initRef.current = true;

    registerGSAP();

    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage || !LANDING_PLANS.length) return;

    // Delay para asegurar que el layout está estable
    const initAnimation = () => {
      const ctx = gsap.context(() => {
        const isMobile = window.matchMedia("(max-width: 1023px)").matches;
        const config = isMobile ? CONF.mobile : CONF.desktop;
        const totalCards = LANDING_PLANS.length;

        // Función para animar las cards - EXACTA de landing-mrw
        const animateCards = (exactIndex: number) => {
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
              backfaceVisibility: "hidden"
            });

            // Determinar color según el plan
            const plan = LANDING_PLANS[i];
            const isPlus = plan.id === "plan-200";
            const isBusiness = plan.id === "plan-empresarial";

            let activeColor = "#1e40af"; // Azul oscuro por defecto (Basic/Standard)
            if (isPlus) activeColor = "#94a3b8"; // Plateado
            if (isBusiness) activeColor = "#7e22ce"; // Purple

            // Borde activo del color específico, inactivo transparente
            gsap.to(card, {
              borderColor: isFocused ? activeColor : "transparent",
              // Sombra correspondiente al color
              boxShadow: isFocused
                ? `0 0 0 1px ${activeColor}, 0 0 20px ${activeColor}40, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
                : "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto"
            });

            // Ribbon de popularidad
            const ribbon = card.querySelector(".ribbon") as HTMLElement | null;
            if (ribbon) {
              gsap.to(ribbon, {
                opacity: isFocused ? 1 : 0,
                duration: 0.2,
                overwrite: "auto"
              });
            }
          });
        };

        // Estado inicial
        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          const distance = i - INITIAL_INDEX;
          const absDistance = Math.abs(distance);

          gsap.set(card, {
            x: distance * config.baseX,
            scale: absDistance < 0.1 ? 1 : Math.max(config.scaleMin, 1 - absDistance * 0.3),
            opacity: absDistance < 0.1 ? 1 : Math.max(config.opacityMin, 1 - absDistance * 0.5),
            rotateY: Math.min(Math.max(distance * config.rotateY, -40), 40),
            zIndex: absDistance < 0.1 ? 100 : 10,
            transformOrigin: "center center",
            force3D: true,
            backfaceVisibility: "hidden"
          });
        });

        // Calcular distancia de scroll
        const calculateScrollDistance = () => {
          if (totalCards <= 1) return window.innerHeight;
          const firstCard = cardsRef.current[0];
          const cardHeight = firstCard?.getBoundingClientRect().height ?? (isMobile ? 600 : 700);
          return totalCards * cardHeight + (isMobile ? 300 : 400);
        };

        const scrollDistance = calculateScrollDistance();
        const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // ScrollTrigger
        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: () => `+=${scrollDistance}`,
          pin: true,
          pinSpacing: true,
          pinType: isiOS ? "transform" : "fixed",
          scrub: config.scrub,
          anticipatePin: 0,
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
            setIsComplete(progress >= 0.95);
          },

          onRefresh: (self) => {
            if (totalCards <= 1) return;
            animateCards(self.progress * (totalCards - 1));
          }
        });

        animateCards(INITIAL_INDEX);

        requestAnimationFrame(() => ScrollTrigger.refresh());

      }, container);

      return ctx;
    };

    // Delay para mediciones estables
    const rafId = requestAnimationFrame(() => {
      const ctx = initAnimation();

      // Cleanup
      return () => {
        ctx?.revert();
      };
    });

    return () => {
      cancelAnimationFrame(rafId);
      initRef.current = false;
    };
  }, []);

  if (!LANDING_PLANS.length) return null;

  return (
    <section id="planes" className="landing-section">
      {/* Header fuera del área pinned */}
      <div className="landing-container pb-8">
        <div className="max-w-3xl">
          <span className="landing-kicker">Planes B2C</span>
          <h2 className="landing-headline mt-4 font-semibold">{landingCopy.plans.headline}</h2>
          <p className="landing-subheadline mt-4">{landingCopy.plans.subheadline}</p>
        </div>
      </div>

      {/* Área pinned del carrusel */}
      <div
        ref={containerRef}
        className="min-h-svh flex items-center justify-center bg-zinc-950 relative z-0 overflow-hidden font-display"
        style={{ perspective: "1000px" }}
        data-gsap-clear
        data-gsap-keep
        suppressHydrationWarning
      >
        <div ref={stageRef} className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-96 h-[530px] max-w-[90vw]">
            {LANDING_PLANS.map((plan, i) => {
              const isPopular = Boolean(plan.popular);
              const isPlus = plan.id === "plan-200";
              const isBusiness = plan.id === "plan-empresarial";

              // Gradientes refinados
              const getHeaderGradient = () => {
                if (isPopular) return "linear-gradient(118deg, rgba(0, 225, 255, 1) 0%, rgba(3, 7, 255, 1) 89%)";
                // Gris elegante con gradiente
                if (isPlus) return "linear-gradient(118deg, rgba(245, 245, 245, 1) 0%, rgba(91, 91, 94, 1) 68%)";
                // Morado elegante
                if (isBusiness) return "linear-gradient(118deg, rgba(4, 0, 125, 1) 0%, rgba(34, 3, 51, 1) 68%)";
                return undefined;
              };

              // Bordes
              const getHeaderBorderClass = () => {
                if (isPopular) return "border-white/15 border-b-black/20 border-t-white/35";
                if (isPlus) return "border-white/30 border-b-zinc-600/40 border-t-white/50";
                if (isBusiness) return "border-purple-300/30 border-b-purple-900/40 border-t-purple-200/50";
                return "border-white/6 bg-zinc-900";
              };

              const hasGradient = isPopular || isPlus || isBusiness;

              // Definir color activo
              let activeColor = "#1e40af"; // Azul oscuro (Basic/Standard)
              if (isPlus) activeColor = "#94a3b8"; // Plateado
              if (isBusiness) activeColor = "#7e22ce"; // Purple

              return (
                <div
                  key={plan.id}
                  ref={(el) => addRef(el, i)}
                  className="plan-card absolute top-0 left-0 w-full h-full border-2 rounded-2xl bg-zinc-950 overflow-hidden"
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex: i === INITIAL_INDEX ? 100 : 10,
                    opacity: i === INITIAL_INDEX ? 1 : 0,
                    backfaceVisibility: "hidden",
                    // Box shadow dinámico según plan
                    boxShadow: i === INITIAL_INDEX
                      ? `0 0 0 1px ${activeColor}, 0 0 20px ${activeColor}40, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
                      : "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    // Force border color logic
                    borderColor: i === INITIAL_INDEX ? activeColor : "transparent"
                  }}
                >
                  {/* Header con gradiente */}
                  <div
                    className={`relative mx-4 mt-4 rounded-xl border p-6 ${getHeaderBorderClass()}`}
                    style={{
                      background: getHeaderGradient(),
                      boxShadow: hasGradient
                        ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
                        : undefined
                    }}
                  >
                    {isPopular && (
                      <div
                        className="ribbon absolute transform translate-x-5/4 rounded-full border border-white/20 bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white tracking-wide shadow-sm z-10"
                        style={{ top: "10px" }} // Posición explícita según petición
                      >
                        POPULAR
                      </div>
                    )}

                    <span
                      className={`inline-block rounded-full px-3 py-1 font-bold ${
                        // Aumentar fuente para los primeros 3 planes (no Business)
                        isBusiness ? "text-xs" : "text-sm"
                        } ${isPopular
                          ? "bg-white text-blue-900 shadow-sm mt-3" // Margen top para no chocar si fuera necesario, pero el chip popular está absolute top:4px
                          : isPlus
                            ? "bg-slate-900 text-white shadow-md border border-slate-700"
                            : isBusiness
                              ? "bg-white/90 text-purple-900 shadow-sm"
                              : "border border-white/10 bg-zinc-800 text-zinc-300"
                        }`}
                    >
                      {plan.name}
                    </span>

                    <div className="mt-6 text-center">
                      <div className={`font-bold leading-none ${isPlus
                        ? "text-white drop-shadow-md"
                        : hasGradient
                          ? "text-white drop-shadow-md"
                          : "text-slate-50"
                        } ${
                        // Aumentar fuente solo para planes residenciales (no Business)
                        isBusiness ? "text-5xl" : "text-7xl"
                        }`}>
                        {isBusiness ? "Empresarial" : plan.speedLabel.replace(" Mbps", "")}
                        {!isBusiness && (
                          <span className={`ml-1 text-3xl font-medium ${isPlus ? "text-white/90" : hasGradient ? "text-white/90" : "text-white/80"
                            }`}>
                            Mbps
                          </span>
                        )}
                      </div>
                      <p className={`mt-3 text-sm ${isPlus ? "text-white/90 font-medium text-shadow-sm" : hasGradient ? "text-white/90 font-medium text-shadow-sm" : "text-zinc-400"
                        }`}>
                        {plan.summary}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex h-full flex-col px-6 pb-6 pt-5" style={{ maxHeight: "calc(100% - 180px)" }}>
                    <ul className="mb-6 space-y-3 text-left">
                      {plan.bullets.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <span className={`mt-0.5 rounded-full p-0.5 ${isPopular ? "bg-blue-500/25" : isPlus ? "bg-slate-500/25" : isBusiness ? "bg-purple-500/25" : "bg-zinc-800"
                            }`}>
                            <Check size={14} strokeWidth={3} className={
                              isPopular ? "text-blue-200" : isPlus ? "text-slate-400" : isBusiness ? "text-purple-300" : "text-zinc-400"
                            } />
                          </span>
                          <span className="text-sm leading-relaxed text-zinc-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto grid gap-2">
                      {/* Botones */}
                      <button
                        type="button"
                        onClick={() => onOpenLead(`plan-${plan.id}-coverage`, isBusiness ? "negocio" : "residencial", plan.id)}
                        className="landing-focus w-full rounded-xl py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: isPopular
                            ? "linear-gradient(to bottom, #3b82f6, #2563eb)"
                            : isPlus
                              ? "linear-gradient(to bottom, #e2e8f0, #94a3b8)" // Botón plata claro
                              : isBusiness
                                ? "linear-gradient(to bottom, #a855f7, #7e22ce)" // Morado
                                : undefined,
                          color: isPopular || isBusiness ? "white" : isPlus ? "#1e293b" : undefined,
                          fontWeight: isPlus || isBusiness ? 700 : undefined,
                          boxShadow: hasGradient
                            ? "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 6px rgba(0,0,0,0.3)"
                            : undefined,
                          border: !hasGradient ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.15)",
                          textShadow: isPopular || isBusiness ? "0 1px 2px rgba(0,0,0,0.3)" : undefined
                        }}
                      >
                        {isBusiness ? landingCopy.plans.requestQuoteCta : landingCopy.plans.coverageCta}
                      </button>
                      <a
                        href={buildWhatsAppHref(plan.whatsappText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="landing-focus w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 py-3 text-center text-sm font-semibold text-zinc-200 transition-colors hover:border-cyan-500/65 hover:text-white"
                      >
                        {landingCopy.plans.whatsappCta}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3" aria-hidden="true">
          {LANDING_PLANS.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${i === currentIndex ? "scale-150 bg-cyan-400" : "bg-slate-600"
                }`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div className={`text-sm font-medium text-slate-400 ${isComplete ? "animate-pulse" : "animate-bounce"}`}>
            {isComplete ? "Continúa scrolleando ↓" : "Scroll para ver más planes"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="landing-container pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">{landingCopy.plans.disclaimer}</p>
          <button
            type="button"
            onClick={() => onOpenLead("plans-agendar-instalacion", "residencial")}
            className="landing-focus inline-flex items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 transition-colors hover:border-cyan-500/60 hover:text-white"
          >
            {landingCopy.plans.scheduleCta}
          </button>
        </div>
      </div>
    </section>
  );
}
