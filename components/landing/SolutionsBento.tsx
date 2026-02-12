"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight } from "lucide-react";

import { registerGSAP } from "@/lib/gsap/register";
import { landingCopy } from "@/lib/landing/copy";
import { SOLUTIONS_BENTO } from "@/lib/landing/constants";
import type { OpenLeadModal } from "@/lib/landing/types";

interface SolutionsBentoProps {
  onOpenLead: OpenLeadModal;
}

export default function SolutionsBento({ onOpenLead }: SolutionsBentoProps) {
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
        "[data-bento-card]",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
          },
        },
      );
    }, section);

    return () => {
      ScrollTrigger.refresh();
      ctx.revert();
    };
  }, []);

  return (
    <section id="soluciones" ref={sectionRef} className="landing-section">
      <div className="landing-container">
        <div className="max-w-3xl">
          <span className="landing-kicker">Soluciones</span>
          <h2 className="landing-headline mt-4 font-semibold">{landingCopy.solutions.headline}</h2>
          <p className="landing-subheadline mt-4">{landingCopy.solutions.subheadline}</p>
          <ul className="mt-5 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
            {landingCopy.solutions.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SOLUTIONS_BENTO.map((item, index) => (
            <article
              key={item.id}
              data-bento-card
              className={`landing-card landing-card-hover p-5 ${
                index === 2 ? "md:col-span-2 xl:col-span-1" : ""
              }`}
            >
              <h3 className="text-xl font-semibold text-slate-50">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.impact}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onOpenLead(`bento-${item.id}`, item.segment)}
                className="landing-focus mt-5 inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-sky-400/70 hover:text-white"
              >
                {item.cta}
                <ChevronRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
