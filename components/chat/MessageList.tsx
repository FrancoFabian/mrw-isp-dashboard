// File: components/chat/MessageList.tsx
import React from "react";
import { Activity } from "lucide-react";
import type { Message, ChatLabels } from "./types";
import MessageBubble from "./MessageBubble";

interface Props {
    messages: Message[];
    labels: ChatLabels;
    isTyping: boolean;
    lastMsgId: number | null;
    scrollAnchorRef: React.RefObject<HTMLDivElement | null>;
}

function MessageListInner({ messages, labels, isTyping, lastMsgId, scrollAnchorRef }: Props) {
    return (
        <div
            className="flex-1 overflow-y-auto p-5 space-y-3 chat-scroll"
            role="list"
            aria-label="Mensajes del chat"
        >
            {messages.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMsgNew={msg.id === lastMsgId}
                />
            ))}

            {/* ── Typing indicator ── */}
            {isTyping && (
                <div className="flex justify-start" role="listitem" aria-label="Escribiendo…">
                    <div className="chat-bubble chat-bubble-bot chat-typing-bubble">
                        <span className="chat-typing-dots" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </span>
                    </div>
                </div>
            )}

            {/* ── Infra Status Widget ── */}
            <div className="chat-infra-status mt-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold" style={{ color: "var(--landing-accent)" }}>
                        {labels.infraStatusTitle}
                    </span>
                    <Activity
                        size={13}
                        className="chat-pulse-icon"
                        style={{ color: "var(--landing-accent)" }}
                        aria-hidden="true"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="chat-infra-chip">
                        <span className="block text-[10px] uppercase" style={{ color: "var(--landing-text-muted)" }}>
                            {labels.infraUptime}
                        </span>
                        <span className="block text-xs font-bold" style={{ color: "var(--landing-text-primary)" }}>
                            {labels.infraUptimeValue}
                        </span>
                    </div>
                    <div className="chat-infra-chip">
                        <span className="block text-[10px] uppercase" style={{ color: "var(--landing-text-muted)" }}>
                            {labels.infraLatency}
                        </span>
                        <span className="block text-xs font-bold text-emerald-400">
                            {labels.infraLatencyValue}
                        </span>
                    </div>
                </div>
            </div>

            {/* scroll anchor */}
            <div ref={scrollAnchorRef} aria-hidden="true" />
        </div>
    );
}

const MessageList = React.memo(MessageListInner);
MessageList.displayName = "MessageList";
export default MessageList;
