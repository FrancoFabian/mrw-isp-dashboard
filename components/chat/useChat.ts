// File: components/chat/useChat.ts
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Message, ChatLabels, ChatCallbacks } from "./types";
import { DEFAULT_LABELS } from "./types";

/* ─── Helpers ─── */
const ts = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

let _nextId = 1;
const nextId = () => _nextId++;

/* ─── Hook ─── */
export interface UseChatOptions {
    labels?: Partial<ChatLabels>;
    callbacks?: ChatCallbacks;
}

export function useChat(opts: UseChatOptions = {}) {
    const labels: ChatLabels = { ...DEFAULT_LABELS, ...opts.labels };
    const cb = opts.callbacks;

    /* ── State ── */
    /** isOpen = logical open state (user intent) */
    const [isOpen, setIsOpen] = useState(false);
    /** isMounted = DOM presence (stays true during close animation) */
    const [isMounted, setIsMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => [
        {
            id: nextId(),
            role: "assistant",
            text: labels.welcomeMessage,
            timestamp: ts(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    /** ID of the last message added (for micro-animation targeting) */
    const [lastMsgId, setLastMsgId] = useState<number | null>(null);

    /* ── Refs ── */
    const launcherRef = useRef<HTMLButtonElement>(null);
    const scrollAnchorRef = useRef<HTMLDivElement>(null);
    const prevLenRef = useRef(messages.length);

    /* ── Auto-scroll (only when messages grow or typing changes) ── */
    useEffect(() => {
        if (!isMounted) return;
        if (messages.length > prevLenRef.current || isTyping) {
            scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        prevLenRef.current = messages.length;
    }, [messages.length, isMounted, isTyping]);

    /* ── Actions ── */
    const handleOpen = useCallback(() => {
        setIsOpen(true);
        setIsMounted(true); // panel enters DOM → GSAP plays
        cb?.onOpen?.();
    }, [cb]);

    /**
     * handleClose: signals the GSAP timeline to reverse.
     * The actual unmount happens in onAnimationCloseComplete.
     */
    const handleClose = useCallback(() => {
        setIsOpen(false);
        // isMounted stays true — panel remains in DOM for reverse animation
        cb?.onClose?.();
    }, [cb]);

    /** Called by GSAP onReverseComplete — safe to unmount now */
    const onAnimationCloseComplete = useCallback(() => {
        setIsMounted(false);
        // Restore focus to launcher button
        launcherRef.current?.focus();
    }, []);

    /* ── Keyboard: Escape closes ── */
    useEffect(() => {
        if (!isMounted) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    /* ── Send ── */
    const handleSend = useCallback(
        (text?: string) => {
            const body = (text ?? input).trim();
            if (!body) return;

            const userMsg: Message = {
                id: nextId(),
                role: "user",
                text: body,
                timestamp: ts(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setLastMsgId(userMsg.id);
            setInput("");
            setIsTyping(true);
            cb?.onSend?.(body);

            // Simulated bot response — future: replace with /api/chat + streaming
            setTimeout(() => {
                const botMsg: Message = {
                    id: nextId(),
                    role: "assistant",
                    text: labels.fallbackResponse,
                    timestamp: ts(),
                };
                setIsTyping(false);
                setMessages((prev) => [...prev, botMsg]);
                setLastMsgId(botMsg.id);
            }, 1200);
        },
        [input, cb, labels.fallbackResponse],
    );

    return {
        isOpen,
        isMounted,
        isTyping,
        messages,
        input,
        labels,
        lastMsgId,
        launcherRef,
        scrollAnchorRef,
        setInput,
        handleOpen,
        handleClose,
        handleSend,
        onAnimationCloseComplete,
    } as const;
}
