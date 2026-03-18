"use client"

import React, { useState, memo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MiniMenuProps {
    active?: boolean;
    onViewDetails?: () => void;
    onExport?: () => void;
    onSetAlert?: () => void;
}

export const MiniMenu = memo(({ active, onViewDetails, onExport, onSetAlert }: MiniMenuProps) => {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen((v) => !v);

    return (
        <div className="relative z-50">
            <button
                type="button"
                onClick={toggle}
                className={cn(
                    "p-1 rounded transition-colors border",
                    active || open
                        ? "bg-zinc-800 border-white/10 text-zinc-200"
                        : "border-transparent text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                )}
            >
                <MoreHorizontal size={14} />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-white/5 bg-[#121212] shadow-2xl">
                    <button
                        onClick={() => {
                            onViewDetails?.();
                            setOpen(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                        Ver detalle
                    </button>
                </div>
            )}
        </div>
    );
});
MiniMenu.displayName = "MiniMenu";
