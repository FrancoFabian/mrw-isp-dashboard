"use client";

import Image from "next/image";
import Link from "next/link";
import { MrwOpticalLogo } from "@/components/icons/mrw-optical-logo";
import { Menu, X } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { registerGSAP } from "@/lib/gsap/register";
import { landingCopy } from "@/lib/landing/copy";
import type { OpenLeadModal } from "@/lib/landing/types";

interface LandingNavbarProps {
  onOpenLead: OpenLeadModal;
}

export default function LandingNavbar({ onOpenLead }: LandingNavbarProps) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerGSAP();
    gsap.registerPlugin(ScrollTrigger);

    const header = headerRef.current;
    const bar = barRef.current;
    if (!header || !bar) return;

    let mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
      },
      (context) => {
        const { isDesktop } = context.conditions as {
          isDesktop: boolean;
          isMobile: boolean;
        };

        // Initial state
        gsap.set(bar, {
          width: isDesktop ? "83.333333%" : "100%",
          borderRadius: 16,
          border: "1px solid transparent",
          backdropFilter: "blur(0px)",
          backgroundColor: "rgba(10, 10, 30, 0)", // Same color base, 0 opacity
          boxShadow: "none",
        });

        const tl = gsap.timeline({ paused: true });

        if (isDesktop) {
          tl.to(bar, {
            width: "68%",
            borderRadius: 9999,
            borderColor: "transparent",
            backgroundColor: "rgba(10, 10, 30, 0.25)", // Reduced opacity
            backdropFilter: "blur(24px) saturate(1.4)", // Softer effect
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 24px rgba(100,120,255,0.05)",
            duration: 0.8,
            ease: "power2.inOut",
          });
        } else {
          tl.to(bar, {
            width: "92%",
            borderRadius: 24,
            borderColor: "transparent",
            backgroundColor: "rgba(10, 10, 30, 0.48)",
            backdropFilter: "blur(30px) saturate(1.5)",
            boxShadow:
              "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 20px rgba(100,120,255,0.06)",
            duration: 0.8,
            ease: "power2.inOut",
          });
        }

        ScrollTrigger.create({
          trigger: document.documentElement,
          start: "top+=50 top", // Start earlier for better fluidity
          end: 99999,
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });
      },
      header,
    );

    return () => mm.revert();
  }, []);

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 pointer-events-none pt-3">
      <div className="flex justify-center px-4">
        <div
          ref={barRef}
          className="pointer-events-auto mx-auto px-4 py-1.5 md:px-5 border border-transparent"
          style={{ WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center justify-between gap-4 transition-all duration-700 ease-out">
            <Link
              href="#inicio"
              className="landing-focus shrink-0 inline-flex items-center gap-2 rounded-lg"
              aria-label="Ir a inicio"
            >
              <MrwOpticalLogo className="h-20 w-auto md:h-14" />
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {landingCopy.navbar.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="landing-focus rounded-md text-sm text-slate-300 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <a
                href="/dashboard/portal"
                className="landing-btn-secondary landing-focus px-4 py-2 text-sm"
              >
                {landingCopy.navbar.portalCta}
              </a>
              <button
                type="button"
                onClick={() => onOpenLead("navbar-cta", "residencial")}
                className="landing-btn-primary landing-focus px-4 py-2 text-sm"
                aria-label={landingCopy.navbar.primaryCta}
              >
                {landingCopy.navbar.primaryCta}
              </button>
            </div>

            <button
              type="button"
              className="landing-focus inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/70 text-slate-200 md:hidden"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-label={open ? "Cerrar menu" : "Abrir menu"}
              aria-controls="landing-mobile-nav"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open && (
            <div id="landing-mobile-nav" className="mt-4 border-t border-slate-700/60 pt-4 md:hidden">
              <nav className="grid gap-2">
                {landingCopy.navbar.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="landing-focus rounded-md px-2 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <a
                  href="/dashboard/portal"
                  className="landing-btn-secondary landing-focus px-3 py-2 text-center text-sm"
                >
                  {landingCopy.navbar.portalCta}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenLead("navbar-mobile-cta", "residencial");
                  }}
                  className="landing-btn-primary landing-focus px-3 py-2 text-sm"
                >
                  {landingCopy.navbar.primaryCta}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
