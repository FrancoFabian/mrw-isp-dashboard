"use client";

interface PlansSkeletonProps {
    show?: boolean;
    variant?: "plans" | "cookies" | "unavailable";
}

export default function PlansSkeleton({ show = false, variant = "plans" }: PlansSkeletonProps) {
    return (
        <div
            className={`
        pointer-events-none absolute inset-0 z-10
        transition-opacity duration-300
        ${show ? "opacity-100 visible" : "opacity-0 invisible"}
      `}
            aria-hidden={!show}
        >
            <div className="h-full w-full flex items-center justify-center px-4">
                {variant === "plans" && (
                    <div className="max-w-6xl w-full">
                        <div className="text-center mb-10">
                            <div className="mx-auto h-9 w-[280px] md:w-[360px] rounded bg-white/5" />
                            <div className="mx-auto mt-3 h-5 w-[380px] md:w-[520px] rounded bg-white/5" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 relative overflow-hidden"
                                    style={{ height: 360 }}
                                >
                                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                        <div className="animate-[shimmer_2s_infinite] absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                    </div>
                                    <div className="space-y-3 relative">
                                        <div className="h-7 w-1/2 bg-white/10 rounded" />
                                        <div className="h-4 w-2/3 bg-white/5 rounded" />
                                        <div className="h-4 w-1/3 bg-white/5 rounded" />
                                        <div className="mt-5 h-10 w-36 bg-white/10 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {variant === "cookies" && (
                    <div
                        className="max-w-md w-full p-6 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm text-center relative overflow-hidden"
                        style={{ height: 280 }}
                    >
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                            <div className="animate-[shimmer_2s_infinite] absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>
                        <div className="space-y-4 relative">
                            <div className="mx-auto h-10 w-10 rounded-full bg-white/10" />
                            <div className="h-6 w-3/4 mx-auto bg-white/10 rounded" />
                            <div className="h-4 w-2/3 mx-auto bg-white/5 rounded" />
                            <div className="mt-6 h-10 w-40 mx-auto bg-white/10 rounded-lg" />
                        </div>
                    </div>
                )}

                {variant === "unavailable" && (
                    <div
                        className="max-w-lg w-full p-6 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm text-center relative overflow-hidden"
                        style={{ height: 240 }}
                    >
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                            <div className="animate-[shimmer_2s_infinite] absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>
                        <div className="space-y-4 relative">
                            <div className="h-6 w-1/2 mx-auto bg-white/10 rounded" />
                            <div className="h-4 w-3/4 mx-auto bg-white/5 rounded" />
                            <div className="mt-4 h-8 w-32 mx-auto bg-white/10 rounded-lg" />
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-20%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[shimmer_2s_infinite\\] {
            animation: none;
          }
        }
      `}</style>
        </div>
    );
}
