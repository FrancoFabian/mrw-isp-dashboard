'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <>
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-zinc-700/90 bg-[#0b0b0b] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out',
        'hover:border-zinc-500/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        'disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-white data-[state=checked]:bg-white',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-black">
        <svg
          className="h-4 w-4 [stroke-dasharray:24] [stroke-dashoffset:24] [animation:checkbox-check-draw_0.26s_cubic-bezier(0.65,0,0.45,1)_forwards]"
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
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    <style jsx>{`
      @keyframes checkbox-check-draw {
        from {
          stroke-dashoffset: 24;
        }
        to {
          stroke-dashoffset: 0;
        }
      }
    `}</style>
  </>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
