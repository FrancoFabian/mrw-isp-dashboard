"use client"

import React, { useState, useEffect, useRef, useId } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ModernDatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    width?: "auto" | "sm" | "md" | "lg" | "full";
    variant?: "default" | "embedded";
    iconPosition?: "left" | "right";
    clearable?: boolean;
}

const WIDTH_MAP = {
    auto: "max-content",
    sm: "160px",
    md: "240px",
    lg: "320px",
    full: "100%",
};

export function ModernDatePicker({
    value,
    onChange,
    placeholder = "Seleccionar fecha",
    className,
    width = "auto",
    variant = "default",
    iconPosition = "left",
    clearable = true,
}: ModernDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value || new Date());
    const reactId = useId();
    const baseId = `datepicker-${reactId}`;
    const triggerId = baseId;
    const popoverId = `${baseId}-popover`;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Sync viewDate when value changes
    useEffect(() => {
        if (value) {
            setViewDate(value);
        }
    }, [value]);

    useEffect(() => {
        const popover = popoverRef.current;
        const trigger = triggerRef.current;
        if (!popover || !trigger) return;

        const updatePosition = () => {
            const viewportPadding = 8;
            const popoverGap = 6;
            const rect = trigger.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Keep default desktop size while preventing horizontal overflow on mobile.
            const maxPopoverWidth = Math.max(220, viewportWidth - viewportPadding * 2);
            popover.style.width = `${Math.min(288, maxPopoverWidth)}px`;

            const popoverRect = popover.getBoundingClientRect();
            const popoverWidth = popoverRect.width || Math.min(288, maxPopoverWidth);
            const popoverHeight = popoverRect.height || 320;

            const spaceBelow = viewportHeight - rect.bottom - popoverGap - viewportPadding;
            const spaceAbove = rect.top - popoverGap - viewportPadding;

            let top = rect.bottom + popoverGap;
            if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
                top = rect.top - popoverHeight - popoverGap;
            }

            const maxTop = viewportHeight - popoverHeight - viewportPadding;
            top = Math.max(viewportPadding, Math.min(top, maxTop));

            const maxLeft = viewportWidth - popoverWidth - viewportPadding;
            const left = Math.max(viewportPadding, Math.min(rect.left, maxLeft));

            popover.style.top = `${Math.round(top)}px`;
            popover.style.left = `${Math.round(left)}px`;
        };

        const handleToggle = (event: Event) => {
            const e = event as ToggleEvent;
            if (e.newState === "open") {
                setIsOpen(true);
                updatePosition();
                window.requestAnimationFrame(updatePosition);
                window.addEventListener("resize", updatePosition);
                window.addEventListener("scroll", updatePosition, { capture: true });
            } else {
                setIsOpen(false);
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

    const closePopover = () => {
        if (popoverRef.current) {
            // @ts-ignore
            popoverRef.current.hidePopover();
        }
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        onChange(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
        closePopover();
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        closePopover();
    };

    const formatDate = (date: Date) => {
        return `${date.getDate()} de ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
    };

    const triggerWidth = WIDTH_MAP[width];

    const isSelectedDate = (day: number) => {
        if (!value) return false;
        return value.getDate() === day &&
            value.getMonth() === viewDate.getMonth() &&
            value.getFullYear() === viewDate.getFullYear();
    };

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayIndex = getFirstDayOfMonth(year, month);

        const days = [];

        for (let i = 0; i < firstDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const isSelected = isSelectedDate(i);

            days.push(
                <button
                    key={i}
                    onClick={() => handleDateSelect(i)}
                    type="button"
                    className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-sm text-sm transition-colors",
                        isSelected
                            ? "bg-[var(--select-primary-light)] text-[var(--select-primary)] font-semibold"
                            : "text-[var(--select-text)] hover:bg-[var(--select-hover)]"
                    )}
                >
                    {i}
                </button>
            );
        }

        return days;
    };

    return (
        <div
            className={cn("relative font-sans", width === "full" ? "w-full" : "inline-block", className)}
            style={{
                "--select-bg": "#0f0f0f",
                "--select-border": "#222",
                "--select-text": "#e4e4e7",
                "--select-text-sub": "#71717a",
                "--select-hover": "rgba(255,255,255,0.03)",
                "--select-primary": "#a1a1aa", // matching zinc-400 roughly
                "--select-primary-light": "rgba(255,255,255,0.1)",
                "--select-radius": "0.5rem",
                "--select-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
                "--trigger-width": triggerWidth,
            } as React.CSSProperties}
        >
            <button
                ref={triggerRef}
                id={triggerId}
                type="button"
                // @ts-ignore
                popoverTarget={popoverId}
                className={cn(
                    "group relative flex items-center justify-between gap-2",
                    variant === "default"
                        ? "px-3 py-2 bg-[var(--select-bg)] border border-[var(--select-border)] rounded-[var(--select-radius)] text-sm text-[var(--select-text)] hover:bg-[var(--select-hover)] hover:border-[var(--select-text-sub)] focus:outline-none focus:ring-1 focus:ring-[var(--select-text-sub)] transition-all duration-200 shadow-inner"
                        : "px-0 py-0 bg-transparent border-0 rounded-none text-[0.82rem] leading-tight text-[var(--select-text)] hover:bg-transparent focus:outline-none transition-colors duration-200 md:text-[0.88rem]",
                    "cursor-pointer disabled:opacity-50",
                    width === "auto" ? "w-max" : "w-[var(--trigger-width)] max-w-[var(--trigger-width)]"
                )}
            >
                <div className={cn("flex items-center gap-2 overflow-hidden w-full", iconPosition === "right" && "justify-between")}>
                    {iconPosition === "left" && <CalendarIcon size={16} className="text-[var(--select-text-sub)] shrink-0" />}
                    <span className={cn("truncate", iconPosition === "right" && "min-w-0 flex-1 text-left")}>
                        {value ? formatDate(value) : placeholder}
                    </span>
                    {iconPosition === "right" && <CalendarIcon size={18} className="text-[var(--select-text-sub)] shrink-0" />}
                </div>
                {clearable && value && (
                    <div
                        onClick={handleClear}
                        className="p-0.5 rounded-sm hover:bg-[var(--select-hover)] text-[var(--select-text-sub)] hover:text-[var(--select-text)] shrink-0 transition-colors"
                        title="Clear date"
                    >
                        <X size={14} />
                    </div>
                )}
            </button>

            <div
                ref={popoverRef}
                id={popoverId}
                className={cn(
                    "fixed m-0 z-50 w-72 max-w-[calc(100vw-1rem)] p-4 outline-none",
                    "bg-[var(--select-bg)] border border-[var(--select-border)] rounded-[var(--select-radius)]",
                    "shadow-[var(--select-shadow)]",
                    "opacity-0 [inset:auto] [transform:translateY(-8px)_scale(0.98)] [transition:opacity_0.2s_ease-out,transform_0.2s_cubic-bezier(0.65,0,0.45,1),display_0.2s_allow-discrete,overlay_0.2s_allow-discrete] [&:popover-open]:opacity-100 [&:popover-open]:[transform:translateY(0)_scale(1)]"
                )}
                // @ts-ignore
                popover="auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 px-1">
                    <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-[var(--select-hover)] rounded-md text-[var(--select-text-sub)] hover:text-[var(--select-text)] transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-semibold text-[var(--select-text)] tracking-wider">
                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-[var(--select-hover)] rounded-md text-[var(--select-text-sub)] hover:text-[var(--select-text)] transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-y-2 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="w-8 flex justify-center text-xs font-semibold text-[var(--select-text-sub)]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-7 gap-y-2 justify-items-center">
                    {renderCalendarDays()}
                </div>
            </div>
        </div>
    );
}
