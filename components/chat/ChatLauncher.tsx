"use client";

import { MessageSquare } from "lucide-react";
import dynamic from "next/dynamic";
import type { ChatLabels, ChatCallbacks } from "./types";
import { useChat } from "./useChat";

/* Lazy-load ChatPanel — fetched only on first open */
const ChatPanel = dynamic(() => import("./ChatPanel"), {
    ssr: false,
    loading: () => null,
});

/* ─── Props ─── */
export interface ChatLauncherProps {
    labels?: Partial<ChatLabels>;
    callbacks?: ChatCallbacks;
}

export default function ChatLauncher({ labels, callbacks }: ChatLauncherProps) {
    const chat = useChat({ labels, callbacks });

    return (
        <>
            {/* ── FAB ── */}
            <button
                ref={chat.launcherRef}
                type="button"
                onClick={chat.handleOpen}
                className="chat-fab landing-focus fixed bottom-6 right-6 z-60 sm:bottom-8 sm:right-8"
                aria-label="Abrir asistente MRW"
                aria-expanded={chat.isMounted}
                aria-haspopup="dialog"
                style={{ display: chat.isMounted ? "none" : undefined }}
            >
                <span className="chat-fab-sweep" aria-hidden="true" />
                <MessageSquare size={26} strokeWidth={1.8} aria-hidden="true" />
                <span className="chat-fab-ring" aria-hidden="true" />
            </button>

            {/* ── ChatPanel (mounted while isMounted, animated via open prop) ── */}
            {chat.isMounted && (
                <ChatPanel
                    open={chat.isOpen}
                    messages={chat.messages}
                    input={chat.input}
                    isTyping={chat.isTyping}
                    labels={chat.labels}
                    lastMsgId={chat.lastMsgId}
                    scrollAnchorRef={chat.scrollAnchorRef}
                    setInput={chat.setInput}
                    onClose={chat.handleClose}
                    onCloseComplete={chat.onAnimationCloseComplete}
                    onSend={chat.handleSend}
                />
            )}
        </>
    );
}
