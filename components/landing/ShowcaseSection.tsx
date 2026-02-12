"use client";

import { landingCopy } from "@/lib/landing/copy";
import { SHOWCASE_ITEMS } from "@/lib/landing/constants";

export default function ShowcaseSection() {
  return (
    <section id="tecnologia" className="landing-section pt-2">
      <div className="landing-container">
        <div className="max-w-3xl">
          <span className="landing-kicker">Tecnologia</span>
          <h2 className="landing-headline mt-4 font-semibold">{landingCopy.showcase.headline}</h2>
          <p className="landing-subheadline mt-4">{landingCopy.showcase.subheadline}</p>
          <ul className="mt-5 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
            {landingCopy.showcase.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {SHOWCASE_ITEMS.map((item) => (
            <article key={item.id} className="landing-card overflow-hidden p-4">
              <div className="rounded-lg border border-slate-700/70 bg-slate-950/60 p-3">
                <div className="grid gap-3">
                  <div className="h-6 w-1/2 rounded-md bg-slate-800/90" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-20 rounded-md border border-slate-700/70 bg-slate-900/70" />
                    <div className="h-20 rounded-md border border-slate-700/70 bg-slate-900/70" />
                  </div>
                  <div className="h-24 rounded-md border border-slate-700/70 bg-slate-900/70" />
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-50">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{item.subtitle}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {item.chips.map((chip) => (
                  <li key={chip} className="landing-pill text-xs">
                    {chip}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
