"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import { registerGSAP } from "@/lib/gsap/register";
import { landingCopy } from "@/lib/landing/copy";
import type { OpenLeadModal } from "@/lib/landing/types";
import ShinyText from "@/components/ui/shiny-text";

interface HeroSectionProps {
  onOpenLead: OpenLeadModal;
}

export default function HeroSection({ onOpenLead }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    registerGSAP();

    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-item]",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.08,
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="inicio"
      ref={sectionRef}
      className="landing-section overflow-hidden pt-32 md:pt-36"
      aria-label="Hero principal"
    >
      <div className="landing-container">
        <div className="relative overflow-hidden rounded-3xl px-6 py-12 md:px-12 md:py-16 font-display">
          <div className="absolute inset-0 opacity-10">
            <div className="landing-grid-pattern h-full w-full" />
          </div>
          <div className="flex justify-center" data-hero-item>
            {/* Modificar colores: color (base) y shineColor (brillo) */}
            <ShinyText
              text={landingCopy.hero.kicker}
              color="#2563eb"
              shineColor="#06b6d4"
              speed={3}
              className="text-lg font-bold uppercase tracking-wider"
            />
          </div>
          <h1 data-hero-item className="landing-headline text-center text-7xl mt-5 font-bold text-transparent bg-clip-text bg-linear-to-b from-white to-slate-400">
            {landingCopy.hero.headline}
          </h1>
          <p data-hero-item className="landing-subheadline mt-5 mx-auto max-w-2xl text-center text-base md:text-lg text-slate-300">
            {landingCopy.hero.subheadline}
          </p>

          <div data-hero-item className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <button
              type="button"
              onClick={() => onOpenLead("hero-cotizar", "residencial")}
              className="landing-btn-primary landing-focus px-6 py-3 text-sm md:text-base"
            >
              {landingCopy.hero.primaryCta}
            </button>
            <a
              href="#soluciones"
              className="landing-btn-secondary landing-focus inline-flex items-center justify-center px-6 py-3 text-sm md:text-base"
            >
              {landingCopy.hero.secondaryCta}
            </a>
          </div>

          <div data-hero-item className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                text: landingCopy.hero.bullets[0], // Soporte
                img: "/soporte-tecnico.webp",
                delay: 0.1
              },
              {
                text: landingCopy.hero.bullets[1], // Monitoreo
                img: "/monitoreo.webp",
                delay: 0.2
              },
              {
                text: landingCopy.hero.bullets[2], // Instalacion
                img: "/agendar-intalacion.webp", // Note: preserved typo from filename
                delay: 0.3
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-slate-900/60"
              >
                <div className="relative h-20 w-full overflow-hidden rounded-lg">
                  <Image
                    src={feature.img}
                    alt={feature.text}
                    fill
                    className="object-contain object-center transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
