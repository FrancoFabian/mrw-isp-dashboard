"use client"

import React, { useState } from 'react';
import { mockClients } from "@/mocks/clients"

interface CustomerData {
  id: string;
  label: string;
  value: number;
  color: string;
}

export function ClientsChart() {
  const data: CustomerData[] = [
    {
      id: 'active',
      label: 'Activos',
      value: mockClients.filter((c) => c.status === "active").length,
      color: '#22c55e'
    },
    {
      id: 'suspended',
      label: 'Suspendidos',
      value: mockClients.filter((c) => c.status === "suspended").length,
      color: '#ef4444'
    },
    {
      id: 'risk',
      label: 'En riesgo',
      value: mockClients.filter((c) => c.status === "at_risk").length,
      color: '#f59e0b'
    },
  ];

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group flex flex-col w-full xl:self-stretch xl:h-full">
      {/* Brillo de fondo sutil */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none transition-opacity duration-500" />

      {/* Cabecera */}
      <div className="mb-6">
        <h2 className="text-white text-[1.1rem] font-semibold tracking-wide mb-1">Estado de clientes</h2>
        <p className="text-zinc-500 text-sm">Distribución actual</p>
      </div>

      {/* Contenedor del Gráfico y Leyenda */}
      <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center gap-6 flex-1 justify-center">

        {/* Gráfico SVG */}
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72 shrink-0">
          <DonutChart
            data={data}
            total={total}
            hoveredId={hoveredId}
          />
          {/* Centro del Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
            <span className="text-5xl xl:text-6xl font-bold text-white tracking-tight leading-none">
              {total}
            </span>
            <span className="text-[10px] xl:text-xs uppercase tracking-[0.25em] text-zinc-500 mt-2 font-semibold ml-1">
              Total
            </span>
          </div>
        </div>

        {/* Leyenda Refinada */}
        <div className="w-full max-w-[340px] sm:max-w-[360px] flex flex-col justify-center gap-4 py-2">
          {data.map((item) => {
            const isHovered = hoveredId === item.id;
            const isFaded = hoveredId !== null && hoveredId !== item.id;

            // Se agregó w-full para evitar que se aplasten y el % para que coincida con el original
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex items-center justify-between cursor-pointer transition-all duration-300 ${isFaded ? 'opacity-40 grayscale-[30]' : 'opacity-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* Punto indicador */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className="w-2.5 h-2.5 rounded-full z-10"
                      style={{ backgroundColor: item.color }}
                    />
                    {isHovered && (
                      <div
                        className="absolute w-5 h-5 rounded-full opacity-40 blur-xs"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </div>
                  <span className="text-zinc-300 text-sm font-medium tracking-wide">{item.label}</span>
                </div>

                {/* Número alineado a la derecha */}
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-semibold">{item.value}</span>
                  <span className="text-xs text-zinc-500 min-w-[32px] text-right">
                    ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Componente de Gráfico Donut (SVG Puro) ---
interface DonutChartProps {
  data: CustomerData[];
  total: number;
  hoveredId: string | null;
}

function DonutChart({ data, total, hoveredId }: DonutChartProps) {
  const size = 144; // Ajustado al w-36 de Tailwind
  const strokeWidth = 14; // Grosor refinado
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  let cumulativeValue = 0;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 origin-center">
      {/* Filtro de brillo sutil para interacciones */}
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Círculo de fondo oscuro (track) */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke="#ffffff"
        strokeOpacity={0.02}
        strokeWidth={strokeWidth}
      />

      {/* Segmentos del Donut */}
      {data.map((item) => {
        if (total === 0) return null; // Prevenir división por 0 visualmente
        const percentage = item.value / total;
        // Compensamos el gap considerando el strokeLinecap="round" para que no se superpongan
        const gap = 10;
        const strokeLength = Math.max(0, (percentage * circumference) - gap);

        const strokeDasharray = `${strokeLength} ${circumference}`;
        // Ajustamos el offset para incluir la mitad del gap y centrar el segmento
        const strokeDashoffset = -((cumulativeValue / total) * circumference) - (gap / 2);

        cumulativeValue += item.value;

        const isHovered = hoveredId === item.id;
        const isFaded = hoveredId !== null && hoveredId !== item.id;

        return (
          <circle
            key={item.id}
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={item.color}
            strokeWidth={isHovered ? strokeWidth + 1.5 : strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out origin-center"
            style={{
              opacity: isFaded ? 0.4 : 1,
              filter: isHovered ? 'url(#glow)' : 'none',
              transformOrigin: '50% 50%',
            }}
          />
        );
      })}
    </svg>
  );
}



