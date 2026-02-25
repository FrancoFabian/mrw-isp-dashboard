export type NapState = "online" | "offline" | "degraded" | "unknown";

export interface NapIconProps {
  /** Tamaño del ancho/alto del icono en píxeles. Default: 48 */
  size?: number;
  /** Estado del NAP (define colores del sello, LEDs, puertos y anillos del mapa). Default: "online" */
  state?: NapState;
  /** Texto para accesibilidad. Si se omite, se usa aria-hidden="true" */
  label?: string;
  className?: string;
  selected?: boolean;
  alarm?: boolean;
  animate?: "auto" | "always" | "never";
}

/**
 * CSS inyectado para los colores base y los estados del NAP.
 * Sigue la paleta de la nueva referencia vertical y el estilo del Dashboard.
 */
const NAP_CSS = `
  .nap-icon {
    display: inline-block;
    flex-shrink: 0;
    overflow: visible;
    
    /* Colores de la Caja NAP (Slate Grey / Navy oscuro) */
    --chassis-top: #475569;
    --chassis-front: #334155;
    --chassis-right: #1e293b;
    --chassis-dark: #0f172a;
    
    /* Tubos y gomas (Negro/Gris muy oscuro) */
    --tube-light: #1e293b;
    --tube-front: #0f172a;
    --tube-dark: #020617;
    
    /* Metales (Abrazaderas, bisagras) */
    --metal-top: #94a3b8;
    --metal-front: #64748b;
    --metal-right: #475569;
    
    /* Cables de fibra */
    --fiber-cable: #eab308;
    --fiber-cable-dark: #a16207;

    transition: all 0.4s ease;
  }

  /* ESTADO: ONLINE (Sello Cyan, Puertos Verdes vivos) */
  .nap--online {
    --pon-front: #10b981;
    --pon-top: #34d399;
    --pon-right: #047857;
    
    --seal-glow: #06b6d4;
    --led-glow: #22d3ee;
    
    --state-ring: #08b67f;
    --state-glow: rgba(8, 182, 127, 0.4);
    
    --seal-filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.8));
    --led-filter: drop-shadow(0 0 3px rgba(34, 211, 238, 0.9));
  }

  /* ESTADO: OFFLINE (Apagado, alarma roja) */
  .nap--offline {
    --pon-front: #dc2626; /* Puertos en rojo */
    --pon-top: #ef4444;
    --pon-right: #991b1b;
    
    /* Los cables heredan el amarillo por defecto (--fiber-cable) */
    
    --seal-glow: #ef4444; /* Sello en rojo alarma */
    --led-glow: #dc2626;
    
    --state-ring: #ff4d4f;
    --state-glow: rgba(255, 77, 79, 0.4);
    
    --seal-filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.5));
    --led-filter: drop-shadow(0 0 3px rgba(220, 38, 38, 0.8));
  }

  /* ESTADO: DEGRADED (Advertencia amarilla/naranja) */
  .nap--degraded {
    --pon-front: #84cc16;
    --pon-top: #a3e635;
    --pon-right: #4d7c0f;
    
    --seal-glow: #f59e0b;
    --led-glow: #fbbf24;
    
    --state-ring: #fadb14;
    --state-glow: rgba(250, 219, 20, 0.4);
    
    --seal-filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.6));
    --led-filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.9));
  }

  /* ESTADO: UNKNOWN (Grises neutros) */
  .nap--unknown {
    --pon-front: #475569;
    --pon-top: #64748b;
    --pon-right: #334155;
    
    --seal-glow: #475569;
    --led-glow: #334155;
    --fiber-cable: #64748b;
    --fiber-cable-dark: #334155;
    
    --state-ring: #8c8c8c;
    --state-glow: rgba(100, 116, 139, 0.3);
    
    --seal-filter: none;
    --led-filter: none;
    filter: grayscale(0.2) opacity(0.85);
  }

  .glow-seal { filter: var(--seal-filter); }
  .glow-led { filter: var(--led-filter); }

  /* ANIMACIÓN DE ONDA EXPANSIVA (RIPPLE) */
  @keyframes nap-ripple-anim {
    0% { transform: scale(0.1); opacity: 1; stroke-width: 6px; }
    100% { transform: scale(1); opacity: 0; stroke-width: 1px; }
  }
  .nap-ripple-ring {
    transform-box: fill-box;
    transform-origin: center;
    animation: nap-ripple-anim 3s cubic-bezier(0.1, 0.4, 0.3, 1) infinite;
  }
  .nap-ripple-delay { animation-delay: 1.5s; }
`;

function shouldAnimateRipple({
  animate,
  selected,
  alarm,
  state,
}: {
  animate: NonNullable<NapIconProps["animate"]>;
  selected: boolean;
  alarm: boolean;
  state: NapState;
}): boolean {
  if (animate === "always") return true;
  if (animate === "never") return false;
  return selected || alarm || state === "offline" || state === "degraded";
}

export function NapIcon({
  size = 48,
  state = "online",
  label,
  className = "",
  selected = false,
  alarm = false,
  animate = "auto",
}: NapIconProps) {
  const rippleOn = shouldAnimateRipple({ animate, selected, alarm, state });
  const ariaProps = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

  // ============================================================================
  // MOTOR DE PROYECCIÓN 3D
  // Adaptado para centrar el modelo vertical detallado.
  // ============================================================================
  const originX = 140;
  const originY = 160;
  
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
    points.map(pt => `${pt[0]},${pt[1]}`).join(' ');

  const drawBlock = (x: number, y: number, w: number, h: number, zDepth: number, zOffset: number = 0) => {
    const front = pts(proj(x, y, zOffset), proj(x+w, y, zOffset), proj(x+w, y+h, zOffset), proj(x, y+h, zOffset));
    const top = pts(proj(x, y, zOffset + zDepth), proj(x+w, y, zOffset + zDepth), proj(x+w, y, zOffset), proj(x, y, zOffset));
    const right = pts(proj(x+w, y, zOffset), proj(x+w, y, zOffset + zDepth), proj(x+w, y+h, zOffset + zDepth), proj(x+w, y+h, zOffset));
    return { front, top, right };
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 450 650"
      width={size}
      className={`nap-icon nap--${state} ${className}`.trim()}
      {...ariaProps}
    >
      <style>{NAP_CSS}</style>
      
      <defs>
        <filter id="chassis-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
        <filter id="map-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
      </defs>

      {/* =========================================
          MARCADOR DE MAPA (Anillos NOC y Glow)
          Ubicado en la parte más baja para "anclar" el pin
          ========================================= */}
      <g className="map-marker-base">
        <ellipse cx="230" cy="560" rx="160" ry="55" fill="var(--state-glow)" opacity={rippleOn ? 1 : 0.35} filter="url(#map-glow)" />

        {rippleOn ? (
          <>
            <ellipse cx="230" cy="560" rx="160" ry="55" fill="transparent" stroke="var(--state-ring)" className="nap-ripple-ring" />
            <ellipse cx="230" cy="560" rx="160" ry="55" fill="transparent" stroke="var(--state-ring)" className="nap-ripple-ring nap-ripple-delay" />
          </>
        ) : null}

        <ellipse cx="230" cy="560" rx="160" ry="55" fill="transparent" stroke="var(--state-ring)" strokeWidth="2" opacity={rippleOn ? 0.3 : 0.15} />
        <ellipse cx="230" cy="560" rx="20" ry="6" fill="var(--state-ring)" opacity={rippleOn ? 0.6 : 0.25} />
      </g>

      {/* --- SOMBRA DEL EQUIPO NAP EN EL SUELO --- */}
      <polygon 
        points={pts(proj(-20, 360, -20), proj(180, 360, -20), proj(180, 360, 80), proj(-20, 360, 80))} 
        fill="rgba(0,0,0,0.4)" 
        transform="translate(0, 50)" 
        filter="url(#chassis-shadow)" 
      />

      {/* =========================================
          TRAYECTO 1: TUBOS TRASEROS / SOPORTES
          ========================================= */}
      <g className="nap-back-tubes">
        {/* TUBO SUPERIOR NEGRO */}
        <polygon points={drawBlock(40, -100, 60, 100, 40).top} fill="var(--tube-light)" />
        <polygon points={drawBlock(40, -100, 60, 100, 40).right} fill="var(--tube-dark)" />
        <polygon points={drawBlock(40, -100, 60, 100, 40).front} fill="var(--tube-front)" />
        {/* Soporte metálico del tubo superior */}
        <polygon points={drawBlock(30, -30, 80, 20, 50).top} fill="var(--metal-top)" />
        <polygon points={drawBlock(30, -30, 80, 20, 50).right} fill="var(--metal-right)" />
        <polygon points={drawBlock(30, -30, 80, 20, 50).front} fill="var(--metal-front)" />

        {/* TUBO INFERIOR NEGRO (Baja hasta la base) */}
        <polygon points={drawBlock(40, 220, 60, 200, 40).right} fill="var(--tube-dark)" />
        <polygon points={drawBlock(40, 220, 60, 200, 40).front} fill="var(--tube-front)" />
        
        {/* TEXTURA CORRUGADA del tubo inferior */}
        <g opacity="0.4">
          {Array.from({ length: 15 }).map((_, i) => {
            const y = 240 + i * 10;
            return (
              <polygon key={`corr-${i}`} points={drawBlock(38, y, 64, 4, 44).front} fill="#000" />
            );
          })}
        </g>
      </g>

      {/* =========================================
          TRAYECTO 2: CHASIS PRINCIPAL (BACKPLATE)
          ========================================= */}
      <g className="nap-chassis">
        {/* Base Principal gris oscura */}
        <polygon points={drawBlock(0, 0, 140, 190, 60).top} fill="var(--chassis-top)" />
        <polygon points={drawBlock(0, 0, 140, 190, 60).right} fill="var(--chassis-right)" />
        <polygon points={drawBlock(0, 0, 140, 190, 60).front} fill="var(--chassis-front)" />

        {/* BISAGRAS Y CLIPS METÁLICOS LATERALES (Izquierda y Derecha) */}
        <g className="nap-hinges">
          {/* Superior Derecha */}
          <polygon points={drawBlock(140, 30, 10, 25, 40).front} fill="var(--metal-front)" />
          <polygon points={drawBlock(140, 30, 10, 25, 40).right} fill="var(--metal-right)" />
          {/* Tornillos/Remaches */}
          <polygon points={drawBlock(142, 35, 3, 3, 40).right} fill="var(--tube-dark)" />
          <polygon points={drawBlock(142, 47, 3, 3, 40).right} fill="var(--tube-dark)" />

          {/* Inferior Derecha */}
          <polygon points={drawBlock(140, 130, 10, 25, 40).front} fill="var(--metal-front)" />
          <polygon points={drawBlock(140, 130, 10, 25, 40).right} fill="var(--metal-right)" />
          {/* Tornillos/Remaches */}
          <polygon points={drawBlock(142, 135, 3, 3, 40).right} fill="var(--tube-dark)" />
          <polygon points={drawBlock(142, 147, 3, 3, 40).right} fill="var(--tube-dark)" />
        </g>
      </g>

      {/* =========================================
          TRAYECTO 3: LÍNEA DE SELLO BRILLANTE (GLOW)
          ========================================= */}
      <g className="nap-seal glow-seal">
        {/* Un bloque sutil apenas más ancho que el chasis que emite luz */}
        <polygon points={drawBlock(-2, -2, 144, 184, 5, -15).top} fill="var(--seal-glow)" />
        <polygon points={drawBlock(-2, -2, 144, 184, 5, -15).right} fill="var(--seal-glow)" />
        <polygon points={drawBlock(-2, -2, 144, 184, 5, -15).front} fill="var(--seal-glow)" />
      </g>

      {/* =========================================
          TRAYECTO 4: TAPA FRONTAL (LID) Y LED
          ========================================= */}
      <g className="nap-lid">
        {/* Cuerpo de la tapa */}
        <polygon points={drawBlock(0, 0, 140, 180, 15, -16).top} fill="var(--chassis-top)" />
        <polygon points={drawBlock(0, 0, 140, 180, 15, -16).right} fill="var(--chassis-right)" />
        <polygon points={drawBlock(0, 0, 140, 180, 15, -16).front} fill="var(--chassis-front)" />
        
        {/* Bisel Frontal (simulando borde redondeado de la referencia) */}
        <polygon points={drawBlock(3, 3, 134, 150, 5, -31).top} fill="var(--chassis-top)" />
        <polygon points={drawBlock(3, 3, 134, 150, 5, -31).right} fill="var(--chassis-right)" />
        <polygon points={drawBlock(3, 3, 134, 150, 5, -31).front} fill="var(--chassis-top)" /> {/* Lighter shade for front plate */}

        {/* Cinturón oscuro inferior en la tapa */}
        <polygon points={drawBlock(0, 155, 140, 25, 20, -16).front} fill="var(--chassis-dark)" opacity="0.5" />
        <polygon points={drawBlock(-4, 160, 148, 15, 20, -18).front} fill="var(--chassis-right)" />
        <polygon points={drawBlock(-4, 160, 148, 15, 20, -18).right} fill="var(--chassis-dark)" />

        {/* LED INDICADOR CYAN (Inferior derecho) */}
        <polygon points={drawBlock(115, 165, 12, 5, 0, -36).front} fill="var(--led-glow)" className="glow-led" />
        
        {/* Botón / Placa de indentación (Inferior izquierdo) */}
        <polygon points={drawBlock(10, 162, 25, 12, 0, -36).front} fill="var(--tube-front)" stroke="var(--tube-dark)" strokeWidth="1" />
      </g>

      {/* =========================================
          TRAYECTO 5: PUERTOS SC/APC (Salida inferior)
          ========================================= */}
      <g className="nap-ports">
        {/* Hueco negro donde se alojan los puertos */}
        <polygon points={drawBlock(15, 180, 110, 10, 15, -10).front} fill="var(--tube-dark)" />

        {/* Los 4 Puertos Verdes */}
        {[20, 45, 70, 95].map((x, i) => (
          <g key={`port-${i}`}>
            {/* Base del conector */}
            <polygon points={drawBlock(x, 185, 20, 15, 10, -15).top} fill="var(--pon-top)" />
            <polygon points={drawBlock(x, 185, 20, 15, 10, -15).right} fill="var(--pon-right)" />
            <polygon points={drawBlock(x, 185, 20, 15, 10, -15).front} fill="var(--pon-front)" />
            
            {/* Punta de la bota verde */}
            <polygon points={drawBlock(x + 3, 200, 14, 10, 6, -18).right} fill="var(--pon-right)" />
            <polygon points={drawBlock(x + 3, 200, 14, 10, 6, -18).front} fill="var(--pon-front)" />
            
            {/* Detalle del SC/APC (cuadrito oscuro) */}
            <polygon points={drawBlock(x + 7, 192, 6, 4, 0, -25).front} fill="rgba(0,0,0,0.5)" />
          </g>
        ))}
      </g>

      {/* =========================================
          TRAYECTO 6: CABLES AMARILLOS CURVADOS (BEZIERS)
          ========================================= */}
      <g className="nap-cables" fill="none">
        {[27, 52, 77, 102].map((portX, i) => {
          // Coordenadas de inicio (en la punta de la bota verde)
          const startX = portX;
          const startY = 210;
          const startZ = -15;

          // Coordenadas de control de la curva para dar peso gravitacional
          const cp1Y = startY + 50 + (i * 10); // Los cables de la derecha bajan más recto
          
          // Coordenadas finales (juntándose en la abrazadera del tubo inferior)
          const endX = 55 + (i * 8); 
          const endY = 320;
          const endZ = 35; // Van hacia atrás (z positivo) hacia el tubo

          const cp2Y = endY - 60;

          // Path SVG 3D simulado con curvas Bezier
          const d = `M ${p(startX, startY, startZ)} C ${p(startX, cp1Y, startZ)} ${p(endX, cp2Y, endZ)} ${p(endX, endY, endZ)}`;
          
          return (
            <g key={`cable-${i}`}>
              {/* Sombra gruesa del cable */}
              <path d={d} stroke="var(--fiber-cable-dark)" strokeWidth="6" strokeLinecap="round" />
              {/* Línea principal brillante */}
              <path d={d} stroke="var(--fiber-cable)" strokeWidth="3" strokeLinecap="round" />
            </g>
          );
        })}
      </g>

      {/* =========================================
          TRAYECTO 7: ABRAZADERA INFERIOR (Sujeta los cables)
          ========================================= */}
      <g className="nap-bottom-clamp">
        <polygon points={drawBlock(35, 310, 75, 15, 45, 40).top} fill="var(--metal-top)" />
        <polygon points={drawBlock(35, 310, 75, 15, 45, 40).right} fill="var(--metal-right)" />
        <polygon points={drawBlock(35, 310, 75, 15, 45, 40).front} fill="var(--metal-front)" />
        {/* Tornillos de la abrazadera */}
        <polygon points={drawBlock(38, 315, 4, 4, 0, 40).front} fill="var(--tube-dark)" />
        <polygon points={drawBlock(102, 315, 4, 4, 0, 40).front} fill="var(--tube-dark)" />
      </g>

    </svg>
  );
}
