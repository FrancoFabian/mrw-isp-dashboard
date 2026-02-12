"use client";

import Image from "next/image";

export default function LandingHeader() {
    return (
        <header className="fixed top-0 w-full z-50 bg-glass border-b border-slate-800">
            <div className="container-lg flex items-center justify-between py-2">
                <a href="#hero" className="flex items-center gap-2 group" aria-label="Ir a inicio">
                    <Image
                        src="/landing/MrwOpticalA.svg"
                        alt="MRW - Logo"
                        width={64}
                        height={64}
                        className="h-16 w-auto"
                        priority
                    />
                </a>
                <nav className="hidden md:flex gap-8">
                    <a
                        href="#features"
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                        Características
                    </a>
                    <a
                        href="#plans"
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                        Planes
                    </a>
                    <a
                        href="#contact"
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                        Contacto
                    </a>
                </nav>
                <a href="#plans" className="btn btn-primary">
                    Contratar Ahora
                </a>
            </div>
        </header>
    );
}
