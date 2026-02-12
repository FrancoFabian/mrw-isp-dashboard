"use client";

import { useMemo, useState, useEffect } from "react";
import { useLanding } from "@/stores/landing-context";
import { featuresFiber, featuresStandard, type Feature } from "@/lib/landing/content";
import { Zap, Shield, Headphones, Globe } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    F1: Zap,
    F2: Shield,
    F3: Globe,
    F4: Headphones,
    S1: Zap,
    S2: Globe,
    S3: Shield,
    S4: Headphones,
};

export default function FeaturesSection() {
    const { cookieConsent, isZoneAvailable } = useLanding();

    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    const effective = useMemo(() => {
        if (!hydrated) return featuresStandard;
        return cookieConsent === "accepted" && isZoneAvailable ? featuresFiber : featuresStandard;
    }, [hydrated, cookieConsent, isZoneAvailable]);

    return (
        <section id="features" className="py-20 relative z-[20] isolate">
            <div className="container-lg">
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient font-display">
                            ¿Por Qué Somos la Mejor Opción?
                        </h2>
                        <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
                            Tecnología de vanguardia
                        </p>
                    </div>

                    <div id="features-grid" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {effective.map((feature) => {
                            const Icon = iconMap[feature.id] || Zap;
                            return (
                                <article
                                    key={feature.id}
                                    className="feature-card card gradient-card transition-colors duration-300 group"
                                >
                                    <header className="card-head text-center">
                                        <div className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4 bg-blue-950/30">
                                            <Icon className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                                    </header>
                                    <div className="card-body">
                                        <p className="text-center text-[var(--muted-foreground)]">{feature.desc}</p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
