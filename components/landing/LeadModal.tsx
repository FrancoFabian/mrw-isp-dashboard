"use client";

import { FormEvent, useEffect, useState } from "react";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { landingCopy } from "@/lib/landing/copy";
import { LEAD_SEGMENTS } from "@/lib/landing/constants";
import type { LeadSegment } from "@/lib/landing/types";

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSegment?: LeadSegment;
  source: string;
  planId?: string;
}

export default function LeadModal({
  open,
  onOpenChange,
  defaultSegment,
  source,
  planId,
}: LeadModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [segment, setSegment] = useState<LeadSegment>(defaultSegment ?? "residencial");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    if (defaultSegment) setSegment(defaultSegment);
  }, [open, defaultSegment]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      source,
      planId: planId ?? null,
      segment,
      name,
      address,
      whatsApp,
      createdAt: new Date().toISOString(),
    };

    console.log("[Landing Lead Modal]", payload);
    setSubmitted(true);
    toast({
      title: landingCopy.leadModal.submitted,
      description: landingCopy.leadModal.submittedBody,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-slate-700 bg-slate-950 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-slate-50">{landingCopy.leadModal.title}</DialogTitle>
          <DialogDescription className="text-slate-300">
            {landingCopy.leadModal.description}
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="lead-name">{landingCopy.leadModal.fields.name}</Label>
              <Input
                id="lead-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="border-slate-700 bg-slate-900/80 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-address">{landingCopy.leadModal.fields.address}</Label>
              <Input
                id="lead-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                className="border-slate-700 bg-slate-900/80 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-whatsapp">{landingCopy.leadModal.fields.whatsapp}</Label>
              <Input
                id="lead-whatsapp"
                value={whatsApp}
                onChange={(event) => setWhatsApp(event.target.value)}
                required
                className="border-slate-700 bg-slate-900/80 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label>{landingCopy.leadModal.fields.segment}</Label>
              <Select value={segment} onValueChange={(value) => setSegment(value as LeadSegment)}>
                <SelectTrigger className="border-slate-700 bg-slate-900/80 text-slate-100">
                  <SelectValue placeholder={landingCopy.leadModal.fields.segmentPlaceholder} />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900 text-slate-100">
                  {LEAD_SEGMENTS.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="focus:bg-slate-800">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="landing-btn-primary landing-focus h-11 w-full">
              {landingCopy.leadModal.submit}
            </Button>
          </form>
        ) : (
          <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            <p className="font-semibold">{landingCopy.leadModal.submitted}</p>
            <p className="mt-2">{landingCopy.leadModal.submittedBody}</p>
            <p className="mt-2 text-cyan-100/90">
              Si tu ubicacion esta fuera de zona, podemos evaluar expansion o alternativas.
            </p>
            <Button
              type="button"
              variant="outline"
              className="landing-focus mt-3 border-cyan-500/40 bg-transparent text-cyan-100 hover:bg-cyan-500/15"
              onClick={() => onOpenChange(false)}
            >
              {landingCopy.leadModal.close}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
