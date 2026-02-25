export type OltState = "online" | "offline" | "degraded" | "unknown";

export interface OltIconProps {
    size?: number;
    state?: OltState;
    label?: string;
    className?: string;
    selected?: boolean;
    alarm?: boolean;
    animate?: "auto" | "always" | "never";
}

const OLT_CSS = `
  .olt-icon {
    display: inline-block;
    flex-shrink: 0;
    overflow: visible;
    --chassis-top: #1e2b3c;
    --chassis-front: #111a26;
    --chassis-right: #0a0f16;
    --cutout: #05080c;
    --metal-light: #475569;
    --metal-dark: #1e293b;
    transition: all 0.4s ease;
  }

  .olt--online {
    --pon-front: #10b981;
    --pon-top: #34d399;
    --pon-right: #047857;
    --led-cyan: #06b6d4;
    --led-green: #10b981;
    --led-yellow: #eab308;
    --state-ring: #08b67f;
    --state-glow: rgba(8, 182, 127, 0.4);
    --glow-cyan: drop-shadow(0 0 4px rgba(6, 182, 212, 0.8));
    --glow-green: drop-shadow(0 0 4px rgba(16, 185, 129, 0.8));
  }

  .olt--offline {
    --pon-front: #143622;
    --pon-top: #1c4a2f;
    --pon-right: #0a1f12;
    --led-cyan: #1e293b;
    --led-green: #1e293b;
    --led-yellow: #ef4444;
    --state-ring: #ff4d4f;
    --state-glow: rgba(255, 77, 79, 0.4);
    --glow-cyan: none;
    --glow-green: none;
  }

  .olt--degraded {
    --pon-front: #84cc16;
    --pon-top: #a3e635;
    --pon-right: #4d7c0f;
    --led-cyan: #eab308;
    --led-green: #10b981;
    --led-yellow: #f59e0b;
    --state-ring: #fadb14;
    --state-glow: rgba(250, 219, 20, 0.4);
    --glow-cyan: drop-shadow(0 0 4px rgba(234, 179, 8, 0.8));
    --glow-green: drop-shadow(0 0 4px rgba(16, 185, 129, 0.6));
  }

  .olt--unknown {
    --pon-front: #475569;
    --pon-top: #64748b;
    --pon-right: #334155;
    --led-cyan: #475569;
    --led-green: #475569;
    --led-yellow: #475569;
    --state-ring: #8c8c8c;
    --state-glow: rgba(100, 116, 139, 0.3);
    --glow-cyan: none;
    --glow-green: none;
    filter: grayscale(0.2) opacity(0.8);
  }

  .glow-cyan { filter: var(--glow-cyan); }
  .glow-green { filter: var(--glow-green); }

  @keyframes olt-ripple-anim {
    0% {
      transform: scale(0.1);
      opacity: 1;
      stroke-width: 6px;
    }
    100% {
      transform: scale(1);
      opacity: 0;
      stroke-width: 1px;
    }
  }

  .olt-ripple-ring {
    transform-box: fill-box;
    transform-origin: center;
    animation: olt-ripple-anim 3s cubic-bezier(0.1, 0.4, 0.3, 1) infinite;
  }

  .olt-ripple-delay {
    animation-delay: 1.5s;
  }
`;

function shouldAnimateRipple({
    animate,
    selected,
    alarm,
    state,
}: {
    animate: NonNullable<OltIconProps["animate"]>;
    selected: boolean;
    alarm: boolean;
    state: OltState;
}): boolean {
    if (animate === "always") return true;
    if (animate === "never") return false;
    return selected || alarm || state === "offline" || state === "degraded";
}

export function OltIcon({
    size = 48,
    state = "online",
    label,
    className = "",
    selected = false,
    alarm = false,
    animate = "auto",
}: OltIconProps) {
    const rippleOn = shouldAnimateRipple({ animate, selected, alarm, state });
    const ariaProps = label
        ? ({ role: "img", "aria-label": label } as const)
        : ({ "aria-hidden": true } as const);

    const originX = 60;
    const originY = 120;
    const proj = (x: number, y: number, z: number): [number, number] => {
        const px = originX + x + z * 0.9;
        const py = originY + x * 0.1 + y - z * 0.6;
        return [px, py];
    };

    const pts = (...points: [number, number][]) => points.map((p) => `${p[0]},${p[1]}`).join(" ");

    const drawBlock = (x: number, y: number, w: number, h: number, zDepth: number, zOffset = 0) => {
        const front = pts(proj(x, y, zOffset), proj(x + w, y, zOffset), proj(x + w, y + h, zOffset), proj(x, y + h, zOffset));
        const top = pts(proj(x, y, zOffset + zDepth), proj(x + w, y, zOffset + zDepth), proj(x + w, y, zOffset), proj(x, y, zOffset));
        const right = pts(proj(x + w, y, zOffset), proj(x + w, y, zOffset + zDepth), proj(x + w, y + h, zOffset + zDepth), proj(x + w, y + h, zOffset));
        return { front, top, right };
    };

    const baseGlowOpacity = rippleOn ? 1 : 0.35;
    const staticRingOpacity = rippleOn ? 0.3 : 0.15;
    const radarCenterOpacity = rippleOn ? 0.4 : 0.2;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 420 200"
            width={size}
            className={`olt-icon olt--${state} ${className}`.trim()}
            {...ariaProps}
        >
            <style>{OLT_CSS}</style>

            <defs>
                <filter id="chassis-shadow" x="-10%" y="-10%" width="120%" height="150%">
                    <feGaussianBlur stdDeviation="6" />
                </filter>
                <filter id="map-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" />
                </filter>
            </defs>

            <g className="map-marker-base">
                <ellipse cx="227" cy="141" rx="150" ry="50" fill="var(--state-glow)" opacity={baseGlowOpacity} filter="url(#map-glow)" />
                {rippleOn ? (
                    <>
                        <ellipse cx="227" cy="141" rx="150" ry="50" fill="transparent" stroke="var(--state-ring)" className="olt-ripple-ring" />
                        <ellipse cx="227" cy="141" rx="150" ry="50" fill="transparent" stroke="var(--state-ring)" className="olt-ripple-ring olt-ripple-delay" />
                    </>
                ) : null}
                <ellipse cx="227" cy="141" rx="150" ry="50" fill="transparent" stroke="var(--state-ring)" strokeWidth="2" opacity={staticRingOpacity} />
                <ellipse cx="227" cy="141" rx="20" ry="6" fill="var(--state-ring)" opacity={radarCenterOpacity} />
            </g>

            <polygon
                points={pts(proj(-5, 25, 0), proj(285, 25, 0), proj(285, 25, 60), proj(-5, 25, 60))}
                fill="rgba(0,0,0,0.7)"
                transform="translate(0, 10)"
                filter="url(#chassis-shadow)"
            />

            <g className="olt-chassis">
                <polygon points={pts(proj(0, 0, 0), proj(280, 0, 0), proj(280, 0, 60), proj(0, 0, 60))} fill="var(--chassis-top)" />
                <polygon points={pts(proj(280, 0, 0), proj(280, 0, 60), proj(280, 25, 60), proj(280, 25, 0))} fill="var(--chassis-right)" />
                <polygon points={pts(proj(0, 0, 0), proj(280, 0, 0), proj(280, 25, 0), proj(0, 25, 0))} fill="var(--chassis-front)" />

                <g fill="var(--cutout)">
                    {[5, 12, 19, 26, 33, 40, 47, 54].map((z) => (
                        <polygon key={z} points={pts(proj(280, 5, z), proj(280, 5, z + 2), proj(280, 20, z + 2), proj(280, 20, z))} opacity="0.6" />
                    ))}
                </g>
            </g>

            <g className="olt-ears" fill="var(--chassis-right)">
                <polygon points={pts(proj(-12, 0, 0), proj(0, 0, 0), proj(0, 25, 0), proj(-12, 25, 0))} fill="var(--chassis-front)" />
                <polygon points={pts(proj(-12, 0, 0), proj(0, 0, 0), proj(0, 0, 5), proj(-12, 0, 5))} fill="var(--chassis-top)" />
                <polygon points={pts(proj(-8, 5, 0), proj(-4, 5, 0), proj(-4, 9, 0), proj(-8, 9, 0))} fill="var(--cutout)" />
                <polygon points={pts(proj(-8, 16, 0), proj(-4, 16, 0), proj(-4, 20, 0), proj(-8, 20, 0))} fill="var(--cutout)" />

                <polygon points={pts(proj(280, 0, 0), proj(292, 0, 0), proj(292, 25, 0), proj(280, 25, 0))} fill="var(--chassis-front)" />
                <polygon points={pts(proj(280, 0, 0), proj(292, 0, 0), proj(292, 0, 5), proj(280, 0, 5))} fill="var(--chassis-top)" />
            </g>

            <g className="olt-faceplate-details">
                <polygon points={drawBlock(5, 6, 12, 13, 0).front} fill="var(--chassis-top)" stroke="var(--cutout)" strokeWidth="0.5" />
                <polygon points={drawBlock(7, 8, 8, 9, 0).front} fill="var(--cutout)" />

                {[24, 28, 32, 36].map((x) => (
                    <g key={`leds-l-${x}`}>
                        <polygon points={drawBlock(x, 7, 2.5, 2.5, 0).front} fill="var(--led-cyan)" className="glow-cyan" />
                        <polygon points={drawBlock(x, 15, 2.5, 2.5, 0).front} fill="var(--led-cyan)" className="glow-cyan" />
                    </g>
                ))}

                {[52, 74, 96, 118, 140, 162].map((x) => {
                    const block = drawBlock(x, 7, 18, 11, 12, -12);
                    return (
                        <g key={`pon-${x}`}>
                            <polygon points={drawBlock(x + 2, 4, 3, 2, 0).front} fill="var(--led-cyan)" />
                            <polygon points={drawBlock(x + 13, 4, 3, 2, 0).front} fill="var(--led-cyan)" />
                            <polygon points={block.top} fill="var(--pon-top)" />
                            <polygon points={block.right} fill="var(--pon-right)" />
                            <polygon points={block.front} fill="var(--pon-front)" />
                            <polygon points={drawBlock(x + 2, 10, 6, 5, 0, -12.1).front} fill="var(--cutout)" />
                            <polygon points={drawBlock(x + 10, 10, 6, 5, 0, -12.1).front} fill="var(--cutout)" />
                        </g>
                    );
                })}

                {[192, 212, 232, 252].map((x) => {
                    const rj = drawBlock(x, 6, 16, 13, 2, -2);
                    return (
                        <g key={`rj45-${x}`}>
                            <polygon points={drawBlock(x + 2, 4, 3, 2, 0).front} fill="var(--led-green)" className="glow-green" />
                            <polygon points={drawBlock(x + 11, 4, 3, 2, 0).front} fill="var(--led-yellow)" />
                            <polygon points={rj.top} fill="var(--metal-light)" />
                            <polygon points={rj.right} fill="var(--metal-dark)" />
                            <polygon points={rj.front} fill="var(--metal-light)" />
                            <polygon points={drawBlock(x + 2, 8, 12, 9, 0, -2.1).front} fill="var(--cutout)" />
                            {[3, 5, 7, 9, 11].map((px) => (
                                <polygon key={px} points={drawBlock(x + px, 8, 0.8, 3, 0, -2.2).front} fill="#fbbf24" />
                            ))}
                        </g>
                    );
                })}

                {[270, 274].map((x) => (
                    <g key={`leds-r-${x}`}>
                        <polygon points={drawBlock(x, 6, 2.5, 2.5, 0).front} fill="var(--led-cyan)" className="glow-cyan" />
                        <polygon points={drawBlock(x, 11, 2.5, 2.5, 0).front} fill="var(--led-cyan)" className="glow-cyan" />
                        <polygon points={drawBlock(x, 16, 2.5, 2.5, 0).front} fill="var(--led-cyan)" className="glow-cyan" />
                    </g>
                ))}
            </g>
        </svg>
    );
}
