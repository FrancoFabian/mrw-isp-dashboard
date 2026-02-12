"use client";

import Image from "next/image";

import { landingCopy } from "@/lib/landing/copy";
import { CONTACT_CHANNELS } from "@/lib/landing/constants";
import type { OpenLeadModal } from "@/lib/landing/types";

interface LandingFooterProps {
  onOpenLead: OpenLeadModal;
}

export default function LandingFooter({ onOpenLead }: LandingFooterProps) {
  const [residential, partnerships, b2b] = CONTACT_CHANNELS;

  return (
    <footer id="contacto" className="relative z-20 border-t border-slate-700/65 py-14">
      <div className="landing-container">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/landing/MrwOpticalA.svg"
                alt="MRW ISP"
                width={54}
                height={54}
                className="h-10 w-auto"
              />
              <div>
                <p className="text-lg font-semibold text-slate-50">{landingCopy.footer.headline}</p>
                <p className="text-sm text-slate-400">{landingCopy.footer.subheadline}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <a
                href={residential.href}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-card landing-card-hover p-4"
              >
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">
                  {residential.audience}
                </p>
                <p className="mt-2 text-sm text-slate-200">{residential.label}</p>
                <p className="text-sm font-semibold text-slate-50">{residential.value}</p>
              </a>

              <a href={partnerships.href} className="landing-card landing-card-hover p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">
                  {partnerships.audience}
                </p>
                <p className="mt-2 text-sm text-slate-200">{partnerships.label}</p>
                <p className="text-sm font-semibold text-slate-50">{partnerships.value}</p>
              </a>

              <button
                type="button"
                onClick={() => onOpenLead("footer-b2b", "concesion")}
                className="landing-card landing-card-hover landing-focus p-4 text-left"
              >
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{b2b.audience}</p>
                <p className="mt-2 text-sm text-slate-200">{b2b.label}</p>
                <p className="text-sm font-semibold text-slate-50">{b2b.value}</p>
              </button>
            </div>
          </div>

          <div className="landing-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
              {landingCopy.footer.legalTitle}
            </h3>
            <div className="mt-4 grid gap-2 text-sm">
              {landingCopy.footer.legalLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="landing-focus text-slate-200 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs text-slate-500">{landingCopy.footer.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
