import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import LandingPageShell from "@/components/landing/LandingPageShell";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "MRW ISP | Conectividad e infraestructura",
  description:
    "Hub corporativo de soluciones MRW ISP: conectividad FTTH, concesiones, plataforma de gestion y soporte especializado.",
};

export default function LandingPage() {
  return (
    <main className={`${spaceGrotesk.variable} font-sans`}>
      <LandingPageShell />
    </main>
  );
}
