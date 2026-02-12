"use client";

import { useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { useLanding } from "@/stores/landing-context";

export default function CookieBanner() {
    const { showCookieBanner, acceptCookies, denyCookies } = useLanding();

    if (!showCookieBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-md">
            <div className="p-4 bg-card/95 backdrop-blur-md border border-border shadow-lg rounded-lg">
                <div className="flex items-start gap-4">
                    <Cookie className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm text-card-foreground mb-2">Uso de Cookies</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Utilizamos cookies para verificar la disponibilidad de planes en tu zona.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={acceptCookies} className="btn btn-primary">
                                Aceptar
                            </button>
                            <button onClick={denyCookies} className="btn btn-outline">
                                Rechazar
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={denyCookies}
                        className="p-1 rounded-md text-muted-foreground hover:bg-white/10"
                        aria-label="Cerrar banner de cookies"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
