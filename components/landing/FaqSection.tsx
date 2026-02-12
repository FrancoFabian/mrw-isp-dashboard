"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { landingCopy } from "@/lib/landing/copy";
import { FAQ_ITEMS } from "@/lib/landing/constants";

export default function FaqSection() {
  return (
    <section className="landing-section pt-2">
      <div className="landing-container">
        <div className="max-w-3xl">
          <span className="landing-kicker">{landingCopy.faq.kicker}</span>
          <h2 className="landing-headline mt-4 font-semibold">{landingCopy.faq.headline}</h2>
          <p className="landing-subheadline mt-4">{landingCopy.faq.subheadline}</p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-700/70 bg-slate-950/65 px-5 md:px-7">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-slate-700/70 text-slate-100"
              >
                <AccordionTrigger className="landing-focus text-left text-base hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-6 text-slate-300">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
