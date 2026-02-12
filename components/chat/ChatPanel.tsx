"use client";

import { useCallback, useMemo, useEffect, useRef, type FormEvent } from "react";
import { Zap, X, Send, Wifi, Globe, ShieldCheck, Cpu } from "lucide-react";
import type { QuickActionItem, ChatLabels, Message } from "./types";
import MessageList from "./MessageList";
import QuickActions from "./QuickActions";
import { useChatAnimations } from "./useChatAnimations";

/* ─── Props ─── */
export interface ChatPanelProps {
    open: boolean;
    messages: Message[];
    input: string;
    isTyping: boolean;
    labels: ChatLabels;
    lastMsgId: number | null;
    scrollAnchorRef: React.RefObject<HTMLDivElement | null>;
    setInput: (v: string) => void;
    onClose: () => void;
    onCloseComplete: () => void;
    onSend: (text?: string) => void;
}

/* ─── Quick actions ─── */
const DEFAULT_ACTIONS: QuickActionItem[] = [
    {
        id: "cobertura",
        icon: Globe,
        label: "Cobertura de Fibra",
        description: "Consulta disponibilidad en tu zona.",
        message: "Quiero cotizar cobertura en mi ubicación",
    },
    {
        id: "portal",
        icon: ShieldCheck,
        label: "Portal Cautivo",
        description: "Ayuda con acceso y autenticación.",
        message: "Tengo problemas con el portal cautivo",
    },
    {
        id: "soporte",
        icon: Cpu,
        label: "Soporte Técnico",
        description: "Reportar fallo o lentitud de nodo.",
        message: "Necesito soporte técnico especializado",
    },
];

export default function ChatPanel({
    open,
    messages,
    input,
    isTyping,
    labels,
    lastMsgId,
    scrollAnchorRef,
    setInput,
    onClose,
    onCloseComplete,
    onSend,
}: ChatPanelProps) {
    /* ── GSAP (called HERE — refs guaranteed because this component is mounted) ── */
    const anim = useChatAnimations(open, {
        onCloseComplete,
    });

    /* ── Animate new messages ── */
    const prevMsgIdRef = useRef<number | null>(lastMsgId);

    useEffect(() => {
        if (lastMsgId !== null && lastMsgId !== prevMsgIdRef.current) {
            prevMsgIdRef.current = lastMsgId;
            requestAnimationFrame(() => {
                const el = anim.containerRef.current?.querySelector(
                    `[data-msg-id="${lastMsgId}"]`,
                ) as HTMLElement | null;
                anim.animateNewMessage(el);
            });
        }
    }, [lastMsgId, anim]);

    /* ── Handlers ── */
    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            onSend();
        },
        [onSend],
    );

    const handleQuickAction = useCallback(
        (text: string) => onSend(text),
        [onSend],
    );

    const canSend = useMemo(() => input.trim().length > 0, [input]);

    return (
        <div ref={anim.containerRef} className="fixed inset-0 z-60">
            {/* ── Overlay bloom ── */}
            <div
                ref={anim.overlayRef}
                className="chat-overlay"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ── Panel ── */}
            <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8">
                <div
                    ref={anim.panelRef}
                    className="chat-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-label={labels.headerTitle}
                >
                    {/* Header */}
                    <header className="chat-header">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="chat-header-icon">
                                    <Zap size={18} strokeWidth={1.8} aria-hidden="true" />
                                </div>
                                <span className="chat-status-dot" aria-label="En línea" />
                            </div>
                            <div>
                                <h2
                                    className="text-[13px] font-bold tracking-wide"
                                    style={{ color: "var(--landing-text-primary)" }}
                                >
                                    {labels.headerTitle}
                                </h2>
                                <p
                                    className="text-[10px] font-medium uppercase tracking-widest"
                                    style={{ color: "var(--landing-accent)", opacity: 0.8 }}
                                >
                                    {labels.headerSubtitle}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="chat-close-btn landing-focus"
                            aria-label="Cerrar chat"
                        >
                            <X size={18} strokeWidth={2} />
                        </button>
                    </header>

                    {/* Messages */}
                    <MessageList
                        messages={messages}
                        labels={labels}
                        isTyping={isTyping}
                        lastMsgId={lastMsgId}
                        scrollAnchorRef={scrollAnchorRef}
                    />

                    {/* Quick actions */}
                    <QuickActions
                        items={DEFAULT_ACTIONS}
                        title={labels.quickActionsTitle}
                        onSelect={handleQuickAction}
                    />

                    {/* Input */}
                    <footer className="chat-footer">
                        <form onSubmit={handleSubmit} className="relative flex items-center">
                            <Wifi
                                size={15}
                                className="absolute left-4 pointer-events-none"
                                style={{ color: "var(--landing-text-muted)" }}
                                aria-hidden="true"
                            />
                            <input
                                ref={anim.inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={labels.inputPlaceholder}
                                className="chat-input landing-focus"
                                aria-label={labels.inputPlaceholder}
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                className="chat-send-btn landing-focus"
                                aria-label="Enviar mensaje"
                            >
                                <Send size={15} strokeWidth={2} />
                            </button>
                        </form>
                        <p
                            className="text-[10px] text-center mt-3 italic"
                            style={{ color: "var(--landing-text-muted)", opacity: 0.5 }}
                        >
                            {labels.footerText}
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
