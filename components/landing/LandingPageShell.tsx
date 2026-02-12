"use client";

import { useCallback, useState } from "react";

import type { LeadSegment, OpenLeadModal } from "@/lib/landing/types";
import { Toaster } from "@/components/ui/toaster";

import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import SolutionsBento from "@/components/landing/SolutionsBento";
import PlansSection from "@/components/landing/PlansSection";
import CoverageSection from "@/components/landing/CoverageSection";
import B2BSection from "@/components/landing/B2BSection";
import FaqSection from "@/components/landing/FaqSection";
import LandingFooter from "@/components/landing/LandingFooter";
import LeadModal from "@/components/landing/LeadModal";
import { ChatLauncher } from "@/components/chat";

type LeadModalState = {
  open: boolean;
  source: string;
  segment?: LeadSegment;
  planId?: string;
};

const initialState: LeadModalState = {
  open: false,
  source: "landing",
};

export default function LandingPageShell() {
  const [leadModal, setLeadModal] = useState<LeadModalState>(initialState);

  const onOpenLead = useCallback<OpenLeadModal>((source, segment, planId) => {
    setLeadModal({ open: true, source, segment, planId });
  }, []);

  return (
    <div className="landing-shell min-h-screen font-sans">
      <LandingNavbar onOpenLead={onOpenLead} />

      <main className="overflow-x-clip">
        <HeroSection onOpenLead={onOpenLead} />
        <SolutionsBento onOpenLead={onOpenLead} />
        <PlansSection onOpenLead={onOpenLead} />
        <CoverageSection />
        <B2BSection onOpenLead={onOpenLead} />
        <FaqSection />
      </main>

      <LandingFooter onOpenLead={onOpenLead} />

      <LeadModal
        open={leadModal.open}
        source={leadModal.source}
        defaultSegment={leadModal.segment}
        planId={leadModal.planId}
        onOpenChange={(open) => {
          if (!open) {
            setLeadModal((prev) => ({ ...prev, open: false }));
            return;
          }
          setLeadModal((prev) => ({ ...prev, open: true }));
        }}
      />

      <ChatLauncher />
      <Toaster />
    </div>
  );
}
