"use client";

import { useMemo, useState } from "react";
import { useLanding } from "@/stores/landing-context";
import {
    Info,
    Zap,
    Wifi,
    ShieldCheck,
    Rocket,
    Search,
    MapPin,
    Cookie as CookieIcon,
    Globe2,
    RefreshCcw,
    Trash2,
    ChevronDown,
} from "lucide-react";
import { isInsideCoverage } from "@/lib/landing/geo";
import { resetConsentAndReload } from "@/lib/landing/consent";

export default function WorkInProgressNotice() {
    const { cookieConsent, isZoneAvailable, setShowCookieBanner, setZoneAvailable } = useLanding();

    const [showCookieHelp, setShowCookieHelp] = useState(false);
    const [showLocationHelp, setShowLocationHelp] = useState(false);

    const handleReopenBanner = () => setShowCookieBanner(true);

    const tryGeolocation = () => {
        if (!("geolocation" in navigator)) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const ok = isInsideCoverage(pos.coords.latitude, pos.coords.longitude);
                setZoneAvailable(ok);
                try {
                    const ttl = ok ? 3600 : 300;
                    sessionStorage.setItem(
                        "vz-cache-geo",
                        JSON.stringify({ v: ok, ts: Math.floor(Date.now() / 1000), ttl })
                    );
                } catch { }
            },
            () => setZoneAvailable(false),
            { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
        );
    };

    const waHref = useMemo(() => {
        const waPhone = "529512783064";
        const waMessage = encodeURIComponent(
            [
                "Hola, vi su sitio.",
                "En mi zona no aparece la opción de fibra. ¿Qué planes disponibles (no fibra) me recomiendan?",
                "",
                "Interesado en:",
                "- Velocidad estable para streaming y trabajo remoto",
                "- Buen ping para gaming",
                "- Instalación rápida",
                "",
                "Ubicación:",
                "Colonia: ________",
                "CP: ________",
                "",
                "Gracias.",
            ].join("\n")
        );
        return `https://wa.me/${waPhone}?text=${waMessage}`;
    }, []);

    let title = "",
        message = "";
    let showCookieButton = false,
        showWhatsAppCtas = false,
        showGeoButton = false,
        showResetButton = false,
        showHowTos = false;

    if (cookieConsent === "unset" || cookieConsent === "denied") {
        title = "Activa las cookies para continuar";
        message = "Usamos cookies y tu ubicación para verificar la disponibilidad en tu zona.";
        showCookieButton = true;
        showHowTos = true;
    } else {
        title = "¿Quieres ver si ya hay fibra en tu domicilio?";
        message = "Permite tu ubicación y validamos de inmediato.";
        showGeoButton = true;
        showWhatsAppCtas = true;
        showResetButton = true;
        showHowTos = true;
    }

    return (
        <div className="wip-notice-container my-10">
            <div
                className="wip-notice-card max-w-2xl mx-auto p-6 text-center rounded-lg"
                style={{
                    background: "color-mix(in oklch, var(--secondary) 15%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
                }}
            >
                <div
                    className="w-12 h-12 mx-auto mb-4 grid place-items-center rounded-full"
                    style={{ background: "color-mix(in oklch, var(--primary) 80%, black 0%)" }}
                >
                    <Info className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
                </div>

                <h3 className="text-xl font-bold text-card-foreground mb-2">{title}</h3>
                <p className="text-[var(--muted-foreground)]">{message}</p>

                {showWhatsAppCtas && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-primary">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1">
                            <Zap className="h-4 w-4" /> Rápidos
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1">
                            <Wifi className="h-4 w-4" /> Cobertura local
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1">
                            <ShieldCheck className="h-4 w-4" /> Estables
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1">
                            <Rocket className="h-4 w-4" /> Instalación ágil
                        </span>
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    {showCookieButton && (
                        <button
                            onClick={handleReopenBanner}
                            className="btn btn-outline inline-flex items-center gap-2"
                        >
                            <Search className="h-5 w-5" />
                            Configurar Cookies
                        </button>
                    )}

                    {showGeoButton && (
                        <button
                            onClick={tryGeolocation}
                            className="inline-flex items-center gap-2 rounded-md px-4 py-2 border border-[var(--border)] hover:bg-[var(--muted)] transition"
                        >
                            <MapPin className="h-5 w-5" />
                            Activar ubicación
                        </button>
                    )}

                    {showWhatsAppCtas && (
                        <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md px-4 py-2 border border-transparent bg-[var(--primary)] text-primary-foreground hover:opacity-90 transition"
                            aria-label="Preguntar por planes disponibles vía WhatsApp"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.671.15-.198.297-.768.967-.941 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.521-.074-.149-.671-1.612-.919-2.206-.242-.579-.487-.5-.671-.51-.173-.009-.372-.011-.571-.011-.198 0-.52.074-.792.372s-1.04 1.017-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.078 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.005 22.998h-.003c-1.887 0-3.741-.506-5.366-1.462l-.386-.229-3.985 1.041 1.064-3.867-.251-.397c-1.02-1.642-1.56-3.534-1.56-5.486 0-5.694 4.636-10.33 10.338-10.33 2.761 0 5.356 1.076 7.303 3.023 1.948 1.947 3.021 4.54 3.019 7.301 0 5.694-4.636 10.33-10.333 10.33M20.52 3.477C18.257 1.213 15.227 0 12 0 5.372 0 .005 5.367 0 11.998c0 2.118.553 4.189 1.604 6.005L0 24l6.124-1.606c1.757.957 3.739 1.463 5.877 1.463h.005c6.63 0 12-5.367 12.004-11.998C24 7.737 22.756 4.702 20.52 3.477" />
                            </svg>
                            Preguntar
                        </a>
                    )}

                    {showResetButton && (
                        <button
                            onClick={resetConsentAndReload}
                            className="inline-flex items-center gap-2 rounded-md px-4 py-2 border border-[var(--border)] hover:bg-[var(--muted)] transition"
                        >
                            <RefreshCcw className="h-5 w-5" />
                            Reiniciar cookies y recargar
                        </button>
                    )}
                </div>

                {showHowTos && (
                    <div className="mt-6 text-left">
                        <button
                            onClick={() => setShowCookieHelp((v) => !v)}
                            className="w-full flex items-center justify-between rounded-md px-4 py-3 border border-[var(--border)] hover:bg-[var(--muted)]"
                            aria-expanded={showCookieHelp}
                        >
                            <span className="inline-flex items-center gap-2 font-medium">
                                <CookieIcon className="h-5 w-5 text-primary" />
                                ¿Cómo activar las cookies?
                            </span>
                            <ChevronDown
                                className={`h-5 w-5 transition-transform ${showCookieHelp ? "rotate-180" : ""}`}
                            />
                        </button>
                        {showCookieHelp && (
                            <div className="px-4 py-3 text-sm text-[var(--muted-foreground)] space-y-3">
                                <div className="rounded-lg border border-[var(--border)] p-3">
                                    <div className="font-medium mb-1 inline-flex items-center gap-2">
                                        <Globe2 className="h-4 w-4" /> Chrome (Escritorio)
                                    </div>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>
                                            Abre <b>Configuración</b> → <b>Privacidad y seguridad</b>.
                                        </li>
                                        <li>
                                            En <b>Cookies</b>, permite <b>Cookies de terceros</b>.
                                        </li>
                                    </ol>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={handleReopenBanner}
                                        className="btn btn-primary inline-flex items-center gap-2"
                                    >
                                        <CookieIcon className="h-4 w-4" /> Abrir &quot;Configurar Cookies&quot;
                                    </button>
                                    <button
                                        onClick={resetConsentAndReload}
                                        className="btn btn-outline inline-flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" /> Borrar cookies y recargar
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-3" />
                        <button
                            onClick={() => setShowLocationHelp((v) => !v)}
                            className="w-full flex items-center justify-between rounded-md px-4 py-3 border border-[var(--border)] hover:bg-[var(--muted)]"
                            aria-expanded={showLocationHelp}
                        >
                            <span className="inline-flex items-center gap-2 font-medium">
                                <MapPin className="h-5 w-5 text-primary" />
                                ¿Cómo activar la ubicación para este sitio?
                            </span>
                            <ChevronDown
                                className={`h-5 w-5 transition-transform ${showLocationHelp ? "rotate-180" : ""}`}
                            />
                        </button>
                        {showLocationHelp && (
                            <div className="px-4 py-3 text-sm text-[var(--muted-foreground)] space-y-3">
                                <div className="rounded-lg border border-[var(--border)] p-3">
                                    <div className="font-medium mb-1 inline-flex items-center gap-2">
                                        <Globe2 className="h-4 w-4" /> Chrome (Escritorio)
                                    </div>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Haz clic en el candado en la barra de direcciones.</li>
                                        <li>
                                            <b>Permisos del sitio</b> → <b>Ubicación</b> en <b>Permitir</b>.
                                        </li>
                                        <li>Recarga la página.</li>
                                    </ol>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={tryGeolocation}
                                        className="btn btn-primary inline-flex items-center gap-2"
                                    >
                                        <MapPin className="h-4 w-4" /> Activar ubicación
                                    </button>
                                    <button
                                        onClick={resetConsentAndReload}
                                        className="btn btn-outline inline-flex items-center gap-2"
                                    >
                                        <RefreshCcw className="h-4 w-4" /> Reiniciar y reintentar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
