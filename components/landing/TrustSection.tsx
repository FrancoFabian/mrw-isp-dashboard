"use client";

import { landingCopy } from "@/lib/landing/copy";
import { TRUST_ITEMS } from "@/lib/landing/constants";

export default function TrustSection() {
  return (
    <section className="landing-section pt-2">
      <div className="landing-container">
        <div className="max-w-3xl">
          <span className="landing-kicker">Confianza</span>
          <h2 className="landing-headline mt-4 font-semibold">{landingCopy.trust.headline}</h2>
          <p className="landing-subheadline mt-4">{landingCopy.trust.subheadline}</p>
          <ul className="mt-5 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
            {landingCopy.trust.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <article key={item.id} className="landing-card p-5">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-400">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{item.value}</p>
              <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
