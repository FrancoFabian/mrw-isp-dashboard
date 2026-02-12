export type LeadSegment = "residencial" | "negocio" | "concesion" | "software";

export type OpenLeadModal = (
  source: string,
  segment?: LeadSegment,
  planId?: string,
) => void;

export interface Plan {
  id: string;
  name: string;
  speedLabel: string;
  summary: string;
  bullets: string[];
  popular?: boolean;
  whatsappText: string;
}

export interface BentoItem {
  id: string;
  title: string;
  impact: string;
  bullets: string[];
  cta: string;
  segment?: LeadSegment;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ContactChannel {
  id: string;
  audience: string;
  label: string;
  value: string;
  href: string;
}

export interface CoverageZone {
  id: string;
  name: string;
  status: "Disponible" | "Proximamente";
}

export interface TrustItem {
  id: string;
  title: string;
  value: string;
  detail: string;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  chips: string[];
}
