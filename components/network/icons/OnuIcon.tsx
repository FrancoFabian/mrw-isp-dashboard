export type OnuState = "online" | "offline" | "degraded" | "unknown";

export interface OnuIconProps {
  /** Tamaño del ancho/alto del icono en píxeles. Default: 48 */
  size?: number;
  /** Estado del ONU (define colores del anillo del mapa, LEDs y puertos). Default: "online" */
  state?: OnuState;
  /** Texto para accesibilidad. Si se omite, se usa aria-hidden="true" */
  label?: string;
  className?: string;
  /** Si es true, el nodo está seleccionado en el mapa. Default: false */
  selected?: boolean;
  /** Si es true, fuerza el estado de alarma visual. Default: false */
  alarm?: boolean;
  /** Controla cuándo se muestra la animación (ripple). Default: "auto" */
  animate?: "auto" | "always" | "never";
  /** Variante visual mínima del equipo. Default: "ont" */
  variant?: "ont" | "onu";
}

/**
 * CSS inyectado para los colores base y los estados del ONU.
 * Utiliza un chasis claro (blanco/gris) típico de equipos CPE de cliente,
 * contrastando con los colores de estado oscuros del mapa NOC.
 */
const ONU_CSS = `
  .onu-icon {
    display: inline-block;
    flex-shrink: 0;
    overflow: visible;
    
    /* Colores del Chasis (Blanco / Gris Claro estilo premium) */
    --chassis-top: #f8fafc;
    --chassis-front: #e2e8f0;
    --chassis-right: #cbd5e1;
    --chassis-dark: #64748b;
    --panel-glass: #0f172a;
    
    /* Puertos y detalles */
    --rj45-outer: #94a3b8;
    --rj45-inner: #020617;
    --cutout: #020617;
    --antenna: #f1f5f9;
    --antenna-dark: #94a3b8;
    
    /* Cable de fibra */
    --fiber-cable: #eab308;
    --fiber-cable-dark: #a16207;

    transition: all 0.4s ease;
  }

  /* ESTADO: ONLINE (Verdes/Cyan vivos) */
  .onu--online {
    --pon-front: #10b981;
    --pon-top: #34d399;
    --pon-right: #047857;
    
    --led-pwr: #10b981;
    --led-pon: #06b6d4;
    --led-los: #334155; /* Apagado */
    --led-lan: #10b981;
    
    --state-ring: #08b67f;
    --state-glow: rgba(8, 182, 127, 0.4);
    
    --status-bar: #06b6d4;
    --status-glow: drop-shadow(0 0 5px rgba(6, 182, 212, 0.8));
    --led-filter-pon: drop-shadow(0 0 3px rgba(6, 182, 212, 0.8));
  }

  /* ESTADO: OFFLINE (Apagado, alarma roja en LOS) */
  .onu--offline {
    --pon-front: #143622;
    --pon-top: #1c4a2f;
    --pon-right: #0a1f12;
    
    --led-pwr: #475569;
    --led-pon: #475569;
    --led-los: #ef4444; /* Alarma Roja Brillante */
    --led-lan: #475569;
    
    --state-ring: #ff4d4f;
    --state-glow: rgba(255, 77, 79, 0.4);
    
    --status-bar: #ef4444;
    --status-glow: drop-shadow(0 0 5px rgba(239, 68, 68, 0.8));
    --led-filter-pon: drop-shadow(0 0 4px rgba(239, 68, 68, 0.9));
  }

  /* ESTADO: DEGRADED (Advertencia amarilla/naranja) */
  .onu--degraded {
    --pon-front: #84cc16;
    --pon-top: #a3e635;
    --pon-right: #4d7c0f;
    
    --led-pwr: #10b981;
    --led-pon: #eab308;
    --led-los: #f59e0b;
    --led-lan: #eab308;
    
    --state-ring: #fadb14;
    --state-glow: rgba(250, 219, 20, 0.4);
    
    --status-bar: #f59e0b;
    --status-glow: drop-shadow(0 0 5px rgba(245, 158, 11, 0.8));
    --led-filter-pon: drop-shadow(0 0 3px rgba(234, 179, 8, 0.8));
  }

  /* ESTADO: UNKNOWN (Grises neutros) */
  .onu--unknown {
    --pon-front: #475569;
    --pon-top: #64748b;
    --pon-right: #334155;
    
    --led-pwr: #64748b;
    --led-pon: #64748b;
    --led-los: #64748b;
    --led-lan: #64748b;
    
    --state-ring: #8c8c8c;
    --state-glow: rgba(100, 116, 139, 0.2);
    
    --status-bar: #64748b;
    --status-glow: none;
    --led-filter-pon: none;
    filter: grayscale(0.2) opacity(0.8);
  }

  .glow-pon { filter: var(--led-filter-pon); }
  .glow-status { filter: var(--status-glow); }

  /* ANIMACIÓN DE ONDA EXPANSIVA (RIPPLE) */
  @keyframes onu-ripple-anim {
    0% { transform: scale(0.1); opacity: 1; stroke-width: 6px; }
    100% { transform: scale(1); opacity: 0; stroke-width: 1px; }
  }
  .onu-ripple-ring {
    transform-box: fill-box;
    transform-origin: center;
    animation: onu-ripple-anim 3s cubic-bezier(0.1, 0.4, 0.3, 1) infinite;
  }
  .onu-ripple-delay { animation-delay: 1.5s; }
`;

export function OnuIcon({
  size = 48,
  state = "online",
  label,
  className = "",
  selected = false,
  alarm = false,
  animate = "auto",
  variant = "ont",
}: OnuIconProps) {
  const ariaProps = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

  // Lógica de renderizado condicional para la animación (Ripple)
  const shouldAnimate =
    animate === "always" ||
    (animate === "auto" &&
      (selected || alarm || state === "offline" || state === "degraded"));

  // ============================================================================
  // MOTOR DE PROYECCIÓN 3D (Isométrico 3/4)
  // ============================================================================
  const originX = 110;
  const originY = 240;

  const proj = (x: number, y: number, z: number): [number, number] => {
    const px = originX + x + z * 0.9;
    const py = originY + x * 0.1 + y - z * 0.6;
    return [px, py];
  };

  const p = (x: number, y: number, z: number) => {
    const [px, py] = proj(x, y, z);
    return `${px},${py}`;
  };

  const pts = (...points: [number, number][]) =>
    points.map((pt) => `${pt[0]},${pt[1]}`).join(" ");

  const drawBlock = (x: number, y: number, w: number, h: number, zDepth: number, zOffset: number = 0) => {
    const front = pts(proj(x, y, zOffset), proj(x + w, y, zOffset), proj(x + w, y + h, zOffset), proj(x, y + h, zOffset));
    const top = pts(proj(x, y, zOffset + zDepth), proj(x + w, y, zOffset + zDepth), proj(x + w, y, zOffset), proj(x, y, zOffset));
    const right = pts(proj(x + w, y, zOffset), proj(x + w, y, zOffset + zDepth), proj(x + w, y + h, zOffset + zDepth), proj(x + w, y + h, zOffset));
    return { front, top, right };
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={`onu-icon onu--${state} ${className}`.trim()}
      {...ariaProps}
    >
      <style>{ONU_CSS}</style>

      <defs>
        <filter id="chassis-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="map-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
      </defs>

      {/* =========================================
          MARCADOR DE MAPA (Anillos NOC y Glow)
          ========================================= */}
      <g className="map-marker-base">
        {/* Glow base estático */}
        <ellipse cx="200" cy="300" rx="120" ry="40" fill="var(--state-glow)" filter="url(#map-glow)" />

        {/* Anillos de Onda Expansiva (Condicionales) */}
        {shouldAnimate && (
          <>
            <ellipse cx="200" cy="300" rx="120" ry="40" fill="transparent" stroke="var(--state-ring)" className="onu-ripple-ring" />
            <ellipse cx="200" cy="300" rx="120" ry="40" fill="transparent" stroke="var(--state-ring)" className="onu-ripple-ring onu-ripple-delay" />
          </>
        )}

        {/* Anillo exterior estático (Límite visual) */}
        <ellipse cx="200" cy="300" rx="120" ry="40" fill="transparent" stroke="var(--state-ring)" strokeWidth="1.5" opacity="0.3" />
        <ellipse cx="200" cy="300" rx="15" ry="5" fill="var(--state-ring)" opacity="0.6" />
      </g>

      {/* --- SOMBRA DEL EQUIPO ONU EN EL SUELO --- */}
      <polygon
        points={pts(proj(0, 30, -5), proj(160, 30, -5), proj(160, 30, 95), proj(0, 30, 95))}
        fill="rgba(0,0,0,0.4)"
        transform="translate(0, 25)"
        filter="url(#chassis-shadow)"
      />

      {/* =========================================
          ANTENAS WIFI (Traseras, zOffset > 0)
          Se renderizan solo si variant es "ont"
          ========================================= */}
      {variant === "ont" && (
        <g className="onu-antennas">
          {/* Antena Izquierda */}
          <polygon points={drawBlock(20, -50, 8, 70, 8, 80).top} fill="var(--antenna)" />
          <polygon points={drawBlock(20, -50, 8, 70, 8, 80).right} fill="var(--antenna-dark)" />
          <polygon points={drawBlock(20, -50, 8, 70, 8, 80).front} fill="var(--chassis-right)" />
          {/* Base/Articulación antena izq */}
          <polygon points={drawBlock(18, 15, 12, 10, 12, 78).top} fill="var(--chassis-dark)" />
          <polygon points={drawBlock(18, 15, 12, 10, 12, 78).right} fill="var(--chassis-dark)" />
          <polygon points={drawBlock(18, 15, 12, 10, 12, 78).front} fill="var(--cutout)" />

          {/* Antena Derecha */}
          <polygon points={drawBlock(130, -50, 8, 70, 8, 80).top} fill="var(--antenna)" />
          <polygon points={drawBlock(130, -50, 8, 70, 8, 80).right} fill="var(--antenna-dark)" />
          <polygon points={drawBlock(130, -50, 8, 70, 8, 80).front} fill="var(--chassis-right)" />
          {/* Base/Articulación antena der */}
          <polygon points={drawBlock(128, 15, 12, 10, 12, 78).top} fill="var(--chassis-dark)" />
          <polygon points={drawBlock(128, 15, 12, 10, 12, 78).right} fill="var(--chassis-dark)" />
          <polygon points={drawBlock(128, 15, 12, 10, 12, 78).front} fill="var(--cutout)" />
        </g>
      )}

      {/* =========================================
          CHASIS PRINCIPAL (Cuerpo Blanco/Gris)
          ========================================= */}
      <g className="onu-chassis">
        {/* Cuerpo Principal */}
        <polygon points={drawBlock(0, 0, 160, 30, 90).top} fill="var(--chassis-top)" />
        <polygon points={drawBlock(0, 0, 160, 30, 90).right} fill="var(--chassis-right)" />
        <polygon points={drawBlock(0, 0, 160, 30, 90).front} fill="var(--chassis-front)" />

        {/* Rejillas de ventilación superiores (Vents) */}
        <g opacity="0.3">
          {[20, 35, 50, 65, 80, 95, 110, 125, 140].map((x) => (
            <polygon key={`vent-${x}`} points={drawBlock(x, 0, 3, 0.1, 50, 20).top} fill="var(--cutout)" />
          ))}
        </g>
        
        {/* Rejillas laterales (derecha) */}
        <g opacity="0.4">
          {[20, 35, 50, 65].map((z) => (
            <polygon key={`vent-r-${z}`} points={drawBlock(160, 10, 0.1, 10, 5, z).right} fill="var(--cutout)" />
          ))}
        </g>
      </g>

      {/* =========================================
          PANEL FRONTAL Y BARRA DE ESTADO
          ========================================= */}
      <g className="onu-faceplate">
        {/* Panel de cristal oscuro en el frente */}
        <polygon points={drawBlock(5, 5, 150, 18, 0).front} fill="var(--panel-glass)" />

        {/* Barra luminosa inferior indicadora de estado */}
        <polygon points={drawBlock(5, 25, 150, 2, 0).front} fill="var(--status-bar)" className="glow-status" />

        {/* -------------------------------------
            MÓDULO DE LEDs INDICADORES (Izquierda)
            ------------------------------------- */}
        <g className="onu-leds">
          {/* PWR */}
          <polygon points={drawBlock(12, 10, 4, 2, 0).front} fill="var(--led-pwr)" />
          <polygon points={drawBlock(12, 15, 4, 1, 0).front} fill="var(--chassis-dark)" />
          
          {/* PON */}
          <polygon points={drawBlock(22, 10, 4, 2, 0).front} fill="var(--led-pon)" className="glow-pon" />
          <polygon points={drawBlock(22, 15, 4, 1, 0).front} fill="var(--chassis-dark)" />

          {/* LOS */}
          <polygon points={drawBlock(32, 10, 4, 2, 0).front} fill="var(--led-los)" className="glow-pon" />
          <polygon points={drawBlock(32, 15, 4, 1, 0).front} fill="var(--chassis-dark)" />

          {/* LAN */}
          <polygon points={drawBlock(42, 10, 4, 2, 0).front} fill="var(--led-lan)" />
          <polygon points={drawBlock(42, 15, 4, 1, 0).front} fill="var(--chassis-dark)" />
        </g>

        {/* -------------------------------------
            PUERTO ÓPTICO SC/APC (Centro)
            ------------------------------------- */}
        <g className="onu-pon-port">
          {/* Base verde saliente */}
          <polygon points={drawBlock(65, 8, 14, 12, 4, -4).top} fill="var(--pon-top)" />
          <polygon points={drawBlock(65, 8, 14, 12, 4, -4).right} fill="var(--pon-right)" />
          <polygon points={drawBlock(65, 8, 14, 12, 4, -4).front} fill="var(--pon-front)" />
          {/* Hueco óptico oscuro */}
          <polygon points={drawBlock(69, 12, 6, 4, 0, -4.1).front} fill="var(--cutout)" />
        </g>

        {/* -------------------------------------
            PUERTOS RJ45 LAN (Derecha)
            ------------------------------------- */}
        <g className="onu-rj45-ports">
          {[95, 115, 135].map((x, i) => (
            <g key={`rj45-${i}`}>
              <polygon points={drawBlock(x, 7, 12, 14, 2, -2).top} fill="var(--rj45-outer)" />
              <polygon points={drawBlock(x, 7, 12, 14, 2, -2).right} fill="var(--rj45-inner)" />
              <polygon points={drawBlock(x, 7, 12, 14, 2, -2).front} fill="var(--rj45-outer)" />
              
              <polygon points={drawBlock(x + 1.5, 9, 9, 9, 0, -2.1).front} fill="var(--cutout)" />
              
              {/* Pines dorados */}
              {[3, 5, 7, 9].map(px => (
                <polygon key={`pin-${px}`} points={drawBlock(x + px, 9, 1, 3, 0, -2.2).front} fill="#fbbf24" />
              ))}
            </g>
          ))}
        </g>
      </g>

      {/* =========================================
          CABLE DE FIBRA (Amarillo, entrando al puerto PON)
          ========================================= */}
      <g className="onu-fiber-cable">
        <path 
          d={`M ${p(72, 14, -4.2)} C ${p(72, 40, -30)} ${p(30, 80, -20)} ${p(30, 150, 0)}`} 
          fill="none" 
          stroke="var(--fiber-cable-dark)" 
          strokeWidth="5" 
          strokeLinecap="round" 
        />
        <path 
          d={`M ${p(72, 14, -4.2)} C ${p(72, 40, -30)} ${p(30, 80, -20)} ${p(30, 150, 0)}`} 
          fill="none" 
          stroke="var(--fiber-cable)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        {/* Bota protectora del conector verde */}
        <polygon points={drawBlock(69, 12, 6, 6, 8, -12).right} fill="var(--pon-right)" />
        <polygon points={drawBlock(69, 12, 6, 6, 8, -12).front} fill="var(--pon-front)" />
      </g>
      
    </svg>
  );
}
