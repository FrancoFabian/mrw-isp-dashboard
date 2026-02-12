// File: components/chat/MessageBubble.tsx
import React from "react";
import type { Message } from "./types";

interface Props {
    message: Message;
    /** data-msg-id for GSAP targeting on new messages */
    isMsgNew: boolean;
}

function MessageBubbleInner({ message, isMsgNew }: Props) {
    const isUser = message.role === "user";

    return (
        <div
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            role="listitem"
            {...(isMsgNew ? { "data-msg-id": message.id } : {})}
            style={isMsgNew ? { visibility: "hidden" } : undefined} /* GSAP autoAlpha reveals */
        >
            <div
                className={
                    isUser ? "chat-bubble chat-bubble-user" : "chat-bubble chat-bubble-bot"
                }
            >
                <p>{message.text}</p>
                <time
                    className={`block text-[9px] mt-2 opacity-40 ${isUser ? "text-right" : "text-left"}`}
                    dateTime={message.timestamp}
                >
                    {message.timestamp}
                </time>
            </div>
        </div>
    );
}

const MessageBubble = React.memo(MessageBubbleInner);
MessageBubble.displayName = "MessageBubble";
export default MessageBubble;
