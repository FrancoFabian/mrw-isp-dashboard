import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Selection = Set<string>;
export type SelectWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "auto" | "full";

export interface SelectItemProps {
    keyId: string;
    label: string;
}

export interface ModernSelectTailwindProps {
    items: SelectItemProps[];
    multiple?: boolean;
    width?: SelectWidth;
    variant?: "default" | "embedded";
    className?: string;
    name?: string;
    id?: string;
    placeholder?: string;
    displayValue?: React.ReactNode;
    icon?: React.ReactNode;
    defaultSelectedKeys?: string[];
    onSelectionChange?: (selectedKeys: string[]) => void;
}

const WIDTH_MAP: Record<SelectWidth, string> = {
    sm: "120px",
    md: "160px",
    lg: "200px",
    xl: "260px",
    "2xl": "320px",
    auto: "max-content",
    full: "100%"
};

export function ModernSelectTailwind({
    items,
    multiple = false,
    width = "md",
    variant = "default",
    className,
    name,
    id,
    placeholder = "Select an option",
    displayValue,
    icon,
    defaultSelectedKeys = [],
    onSelectionChange,
}: ModernSelectTailwindProps) {
    const [selectedKeys, setSelectedKeys] = useState<Selection>(
        () => new Set(defaultSelectedKeys)
    );
    const [animatingKey, setAnimatingKey] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (
            defaultSelectedKeys.length !== selectedKeys.size ||
            defaultSelectedKeys.some((k) => !selectedKeys.has(k))
        ) {
            queueMicrotask(() => setSelectedKeys(new Set(defaultSelectedKeys)));
        }
    }, [defaultSelectedKeys]); // Removed selectedKeys from dependencies to prevent infinite loops if defaultSelectedKeys changes reference

    const reactId = useId();
    const baseId = id ?? `select-${reactId}`;
    const triggerId = baseId;
    const popoverId = `${baseId}-popover`;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const popover = popoverRef.current;
        const trigger = triggerRef.current;
        if (!popover || !trigger) return;

        const updatePosition = () => {
            const rect = trigger.getBoundingClientRect();
            // Optional: calculate if it should go above or below
            popover.style.top = `${rect.bottom + 5}px`;
            popover.style.left = `${rect.left}px`;
            popover.style.minWidth = `${rect.width}px`;
            popover.style.width = `max-content`;
        };

        const handleToggle = (event: Event) => {
            const e = event as ToggleEvent;
            if (e.newState === "open") {
                setIsOpen(true);
                updatePosition();
                window.addEventListener("resize", updatePosition);
                window.addEventListener("scroll", updatePosition, { capture: true });
            } else {
                setIsOpen(false);
                setAnimatingKey(null);
                window.removeEventListener("resize", updatePosition);
                window.removeEventListener("scroll", updatePosition, { capture: true });
            }
        };

        popover.addEventListener("toggle", handleToggle);
        return () => {
            popover.removeEventListener("toggle", handleToggle);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, { capture: true });
        };
    }, []);

    const selectedValue = useMemo(() => {
        if (selectedKeys.size === 0) return placeholder;

        return Array.from(selectedKeys)
            .map((key) => items.find((item) => item.keyId === key)?.label)
            .filter(Boolean)
            .join(", ");
    }, [selectedKeys, items, placeholder]);

    const handleSelect = (key: string) => {
        if (multiple) {
            const next = new Set(selectedKeys);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
                setAnimatingKey(key);
            }

            if (next.size > 0) {
                setSelectedKeys(next);
                onSelectionChange?.(Array.from(next));
            }
        } else {
            const next = new Set([key]);
            if (!selectedKeys.has(key)) {
                setAnimatingKey(key);
            }
            setSelectedKeys(next);
            onSelectionChange?.(Array.from(next));
        }
    };

    const isSelected = (key: string) => selectedKeys.has(key);

    return (
        <div
            className={cn("relative", className)}
            style={
                {
                    "--trigger-width": width === "auto" ? "max-content" : WIDTH_MAP[width] || "auto",
                    "--select-bg": "#0f0f0f",
                    "--select-border": "#222222",
                    "--select-hover": "#1a1a1a",
                    "--select-text": "#e4e4e7",
                    "--select-text-sub": "#71717a",
                    "--select-primary": "#2f68f6",
                    "--select-primary-light": "rgba(47, 104, 246, 0.1)",
                    "--select-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                    "--select-radius": "0.5rem",
                } as React.CSSProperties
            }
        >
            <button
                ref={triggerRef}
                id={triggerId}
                type="button"
                className={cn(
                    "inline-flex min-w-0 items-center justify-between",
                    width === "auto" ? "w-[var(--trigger-width)] max-w-[var(--trigger-width)]" : "w-[var(--trigger-width)] max-w-[var(--trigger-width)]",
                    variant === "default"
                        ? "gap-2 cursor-pointer rounded-[var(--select-radius)] border border-[var(--select-border)] bg-[var(--select-bg)] px-3 py-2 text-sm font-medium text-[var(--select-text)] transition-[border-color,transform,background-color] duration-200 hover:border-[var(--select-text-sub)] hover:bg-[var(--select-hover)] active:scale-[0.98]"
                        : "gap-1 cursor-pointer rounded-none border-0 bg-transparent px-0 py-0 text-[0.82rem] font-normal leading-tight text-[var(--select-text)] transition-colors duration-200 hover:bg-transparent md:text-[0.88rem]"
                )}
                aria-haspopup="listbox"
                aria-controls={popoverId}
                // @ts-ignore
                popoverTarget={popoverId}
            >
                <div className="grid flex-1 items-center text-left">
                    {/* Hidden elements to force width dynamically */}
                    {variant === "default" && !displayValue && items.map((item) => (
                        <span key={`ghost-${item.keyId}`} className="invisible flex items-center gap-2 col-start-1 row-start-1 whitespace-nowrap overflow-hidden pr-2 pointer-events-none w-max" aria-hidden="true">
                            {icon && <span className="shrink-0">{icon}</span>}
                            <span>{item.label}</span>
                        </span>
                    ))}
                    {variant === "default" && !displayValue && placeholder && (
                        <span className="invisible flex items-center gap-2 col-start-1 row-start-1 whitespace-nowrap overflow-hidden pr-2 pointer-events-none w-max" aria-hidden="true">
                            {icon && <span className="shrink-0">{icon}</span>}
                            <span>{placeholder}</span>
                        </span>
                    )}
                    {variant === "default" && displayValue && (
                        <span className="invisible flex items-center gap-2 col-start-1 row-start-1 whitespace-nowrap overflow-hidden pr-2 pointer-events-none w-max" aria-hidden="true">
                            {icon && <span className="shrink-0">{icon}</span>}
                            <span>{displayValue}</span>
                        </span>
                    )}

                    <span className="col-start-1 row-start-1 flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        {icon && <span className="shrink-0">{icon}</span>}
                        <span className="truncate">{displayValue || selectedValue}</span>
                    </span>
                </div>

                <svg
                    className={`h-4 w-4 shrink-0 text-[var(--select-text-sub)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            <div
                ref={popoverRef}
                id={popoverId}
                className="fixed m-0 z-50 overflow-hidden rounded-[var(--select-radius)] border border-[var(--select-border)] bg-[var(--select-bg)] p-1 text-[var(--select-text)] shadow-[var(--select-shadow)] opacity-0 [inset:auto] [transform:translateY(-8px)_scale(0.98)] [transition:opacity_0.2s_ease-out,transform_0.2s_cubic-bezier(0.65,0,0.45,1),display_0.2s_allow-discrete,overlay_0.2s_allow-discrete] [&:popover-open]:opacity-100 [&:popover-open]:[transform:translateY(0)_scale(1)]"
                // @ts-ignore
                popover="auto"
                role="listbox"
                aria-multiselectable={multiple || undefined}
            >
                <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                    {items.map((item) => {
                        const selected = isSelected(item.keyId);

                        return (
                            <li
                                key={item.keyId}
                                className={`flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors ${selected
                                    ? "bg-[var(--select-primary-light)] font-semibold text-[var(--select-primary)]"
                                    : "text-[var(--select-text)] hover:bg-[var(--select-hover)]"
                                    }`}
                                data-selected={selected}
                                onClick={() => handleSelect(item.keyId)}
                                role="option"
                                aria-selected={selected}
                            >
                                <span className="mr-2 flex-1 whitespace-nowrap">
                                    {item.label}
                                </span>

                                {selected && (
                                    <svg
                                        className={`h-[16px] w-[16px] shrink-0 text-[var(--select-primary)] [stroke-dasharray:24] ${item.keyId === animatingKey
                                            ? "[stroke-dashoffset:24] [animation:check-draw_0.3s_cubic-bezier(0.65,0,0.45,1)_forwards]"
                                            : "[stroke-dashoffset:0]"
                                            }`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <polyline points="4 12 9 17 20 6" />
                                    </svg>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {name &&
                Array.from(selectedKeys).map((key) => (
                    <input key={key} type="hidden" name={name} value={key} />
                ))}

            <style>{`
        @keyframes check-draw {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
        </div>
    );
}
