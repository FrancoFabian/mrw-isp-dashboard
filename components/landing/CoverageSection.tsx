"use client";

import { FormEvent, useState } from "react";

import { toast } from "@/hooks/use-toast";
import { landingCopy } from "@/lib/landing/copy";
import { COVERAGE_ZONES } from "@/lib/landing/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CoverageSection() {
  const [colony, setColony] = useState("");
  const [street, setStreet] = useState("");
  const [references, setReferences] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      colony,
      street,
      references,
      source: "coverage-form",
      createdAt: new Date().toISOString(),
    };

    console.log("[Landing Coverage Lead]", payload);
    setSubmitted(true);
    toast({
      title: landingCopy.coverage.successTitle,
      description: landingCopy.coverage.successBody,
    });
  }

  return (
    <section id="cobertura" className="landing-section">
      <div className="landing-container">
        <div className="max-w-3xl">
          <span className="landing-kicker">Cobertura</span>
          <h2 className="landing-headline mt-4 font-semibold">{landingCopy.coverage.headline}</h2>
          <p className="landing-subheadline mt-4">{landingCopy.coverage.subheadline}</p>
          <ul className="mt-5 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
            {landingCopy.coverage.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="landing-card overflow-hidden">
            <div className="relative h-80 border-b border-slate-700/70 bg-slate-950/70 p-5">
              <div className="landing-grid-pattern absolute inset-0" />
              <div className="relative z-10 h-full rounded-xl border border-slate-700/70 bg-slate-900/65 p-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{landingCopy.coverage.mapTitle}</span>
                  <span className="rounded-full border border-slate-600 px-2 py-0.5 text-[11px]">
                    {landingCopy.coverage.mapBadge}
                  </span>
                </div>

                <div className="relative mt-4 h-56 rounded-lg border border-slate-700/80 bg-[radial-gradient(circle_at_35%_40%,rgba(56,189,248,0.3),transparent_42%),radial-gradient(circle_at_70%_58%,rgba(37,99,235,0.22),transparent_45%),linear-gradient(160deg,#0b1220_0%,#0b1020_100%)]">
                  <div className="absolute left-[34%] top-[38%] h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_0_7px_rgba(56,189,248,0.18)]" />
                  <div className="absolute left-[63%] top-[54%] h-3 w-3 rounded-full bg-blue-400 shadow-[0_0_0_7px_rgba(59,130,246,0.15)]" />
                  <div className="absolute left-[48%] top-[66%] h-3 w-3 rounded-full bg-slate-300 shadow-[0_0_0_7px_rgba(148,163,184,0.12)]" />
                </div>
              </div>
            </div>

            <div className="grid gap-2 p-5 text-sm">
              {COVERAGE_ZONES.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2"
                >
                  <span className="text-slate-200">{zone.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      zone.status === "Disponible"
                        ? "border border-cyan-400/40 bg-cyan-500/12 text-cyan-200"
                        : "border border-slate-500/70 bg-slate-700/40 text-slate-300"
                    }`}
                  >
                    {zone.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="landing-card p-5">
            <h3 className="text-xl font-semibold text-slate-50">{landingCopy.coverage.formTitle}</h3>
            <p className="mt-2 text-sm text-slate-300">{landingCopy.coverage.formBody}</p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="coverage-colony">{landingCopy.coverage.colonyLabel}</Label>
                <Input
                  id="coverage-colony"
                  value={colony}
                  onChange={(event) => setColony(event.target.value)}
                  className="border-slate-700 bg-slate-950/70 text-slate-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage-street">{landingCopy.coverage.streetLabel}</Label>
                <Input
                  id="coverage-street"
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  className="border-slate-700 bg-slate-950/70 text-slate-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage-references">{landingCopy.coverage.referencesLabel}</Label>
                <Textarea
                  id="coverage-references"
                  value={references}
                  onChange={(event) => setReferences(event.target.value)}
                  className="min-h-24 border-slate-700 bg-slate-950/70 text-slate-100"
                  placeholder={landingCopy.coverage.referencesPlaceholder}
                />
              </div>

              <Button type="submit" className="landing-btn-primary landing-focus h-11 w-full">
                {landingCopy.coverage.cta}
              </Button>
            </form>

            {submitted && (
              <div className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                <p className="font-semibold">{landingCopy.coverage.successTitle}</p>
                <p className="mt-1 text-cyan-100/90">{landingCopy.coverage.successBody}</p>
                <p className="mt-2 text-cyan-100/85">{landingCopy.coverage.outOfZone}</p>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
