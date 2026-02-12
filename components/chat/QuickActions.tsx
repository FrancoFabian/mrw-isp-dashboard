import React, { useCallback } from "react";
import { ChevronRight } from "lucide-react";
import type { QuickActionItem } from "./types";

interface Props {
    items: QuickActionItem[];
    title: string;
    onSelect: (message: string) => void;
}

function QuickActionsInner({ items, title, onSelect }: Props) {
    return (
        <div className="pt-2 px-5 pb-3" role="group" aria-label={title}>
            <p
                className="text-[10px] font-bold uppercase mb-3 px-1 tracking-wider"
                style={{ color: "var(--landing-text-muted)" }}
            >
                {title}
            </p>
            {items.map((item) => (
                <QuickActionRow key={item.id} item={item} onSelect={onSelect} />
            ))}
        </div>
    );
}

/* ── Individual row (memoised) ── */
interface RowProps {
    item: QuickActionItem;
    onSelect: (message: string) => void;
}

function QuickActionRowInner({ item, onSelect }: RowProps) {
    const Icon = item.icon;

    const handleClick = useCallback(() => {
        onSelect(item.message);
    }, [onSelect, item.message]);

    return (
        <button
            type="button"
            onClick={handleClick}
            className="chat-quick-action landing-focus"
            aria-label={item.label}
        >
            <div className="chat-qa-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
                <span
                    className="block text-[13px] font-semibold truncate"
                    style={{ color: "var(--landing-text-primary)" }}
                >
                    {item.label}
                </span>
                <span
                    className="block text-[11px] truncate"
                    style={{ color: "var(--landing-text-muted)" }}
                >
                    {item.description}
                </span>
            </div>
            <ChevronRight
                size={14}
                className="shrink-0 opacity-30 group-hover:opacity-70 transition-opacity"
                style={{ color: "var(--landing-accent)" }}
                aria-hidden="true"
            />
        </button>
    );
}

const QuickActionRow = React.memo(QuickActionRowInner);
QuickActionRow.displayName = "QuickActionRow";

const QuickActions = React.memo(QuickActionsInner);
QuickActions.displayName = "QuickActions";
export default QuickActions;
