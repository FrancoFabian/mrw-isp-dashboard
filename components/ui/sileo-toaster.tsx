"use client"

import { Toaster } from "sileo"

export function SileoToaster() {
    return (
        <Toaster
            position="top-right"
            theme="dark"
            options={{
                fill: "#0b0f16",
                styles: {
                    title: "text-slate-100",
                    description: "text-slate-300",
                    button: "text-slate-100 hover:text-white",
                },
            }}
        />
    )
}
