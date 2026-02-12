"use client";

import { FormEvent, useState } from "react";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { landingCopy } from "@/lib/landing/copy";
import { CONCESSION_SCOPE, SOFTWARE_SCOPE } from "@/lib/landing/constants";
import type { OpenLeadModal } from "@/lib/landing/types";

interface B2BSectionProps {
  onOpenLead: OpenLeadModal;
}

export default function B2BSection({ onOpenLead }: B2BSectionProps) {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submitDossier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      company,
      email,
      segment: "concesion",
      source: "b2b-dossier",
      createdAt: new Date().toISOString(),
    };

    console.log("[Landing B2B Dossier]", payload);
    setSent(true);
    toast({
      title: "Recibimos tu solicitud",
      description: "Enviaremos el dossier al contacto registrado.",
    });
  }

  return (
    <section id="b2b" className="landing-section">
      <div className="landing-container">
        <div className="max-w-3xl">
          <span className="landing-kicker">B2B</span>
          <h2 className="landing-headline mt-4 font-semibold">{landingCopy.b2b.headline}</h2>
          <p className="landing-subheadline mt-4">{landingCopy.b2b.subheadline}</p>
          <ul className="mt-5 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
            {landingCopy.b2b.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="landing-card p-5">
            <h3 className="text-2xl font-semibold text-slate-50">{landingCopy.b2b.concessionTitle}</h3>
            <p className="mt-2 text-sm text-slate-300">{landingCopy.b2b.concessionSubtitle}</p>

            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {CONCESSION_SCOPE.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <form className="mt-5 space-y-3" onSubmit={submitDossier}>
              <div className="space-y-2">
                <Label htmlFor="dossier-company">Empresa</Label>
                <Input
                  id="dossier-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="border-slate-700 bg-slate-950/70 text-slate-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dossier-email">Correo corporativo</Label>
                <Input
                  id="dossier-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border-slate-700 bg-slate-950/70 text-slate-100"
                  required
                />
              </div>
              <Button type="submit" className="landing-btn-primary landing-focus h-11 w-full">
                {landingCopy.b2b.concessionCta}
              </Button>
            </form>

            {sent && (
              <p className="mt-3 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                {landingCopy.b2b.dossierSuccess}
              </p>
            )}
          </article>

          <article className="landing-card p-5">
            <h3 className="text-2xl font-semibold text-slate-50">{landingCopy.b2b.softwareTitle}</h3>
            <p className="mt-2 text-sm text-slate-300">{landingCopy.b2b.softwareSubtitle}</p>

            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {SOFTWARE_SCOPE.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                className="landing-btn-primary landing-focus h-11"
                onClick={() => onOpenLead("b2b-demo", "software")}
              >
                {landingCopy.b2b.softwareCta}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="landing-focus h-11 border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800/70"
                onClick={() => onOpenLead("b2b-advisor", "negocio")}
              >
                {landingCopy.b2b.advisorCta}
              </Button>
            </div>

            <p className="mt-3 text-sm text-slate-400">{landingCopy.b2b.softwareNote}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
