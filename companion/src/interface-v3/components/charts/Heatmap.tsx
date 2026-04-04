/**
 * SITEPULSE STUDIO v3.0 - HEATMAP
 * Mapa de calor para visualização de dados densos
 */

import React from 'react';

interface HeatmapData {
  x: number;
  y: number;
  value: number; // 0-100
}

interface HeatmapProps {
  data: HeatmapData[];
  width?: number;
  height?: number;
  cellSize?: number;
  xLabels?: string[];
  yLabels?: string[];
  colorScale?: string[];
}

const DEFAULT_COLOR_SCALE = [
  '#0F172A', // 0-10
  '#1E293B', // 10-20
  '#334155', // 20-30
  '#475569', // 30-40
  '#6366F1', // 40-50
  '#8B5CF6', // 50-60
  '#A855F7', // 60-70
  '#EC4899', // 70-80
  '#F43F5E', // 80-90
  '#EF4444', // 90-100
];

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  width = 400,
  height = 200,
  cellSize = 20,
  xLabels,
  yLabels,
  colorScale = DEFAULT_COLOR_SCALE,
}) => {
  const getColor = (value: number) => {
    const index = Math.min(Math.floor(value / 10), 9);
    return colorScale[index];
  };

  const labelOffsetX = yLabels ? 60 : 0;
  const labelOffsetY = xLabels ? 30 : 0;

  return (
    <div className="sp-flex sp-flex-col">
      <svg
        width={width + labelOffsetX}
        height={height + labelOffsetY}
        className="sp-overflow-visible"
      >
        {/* Grid cells */}
        {data.map((cell, index) => {
          const x = cell.x * cellSize + labelOffsetX;
          const y = cell.y * cellSize;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={cellSize - 1}
              height={cellSize - 1}
              rx={2}
              fill={getColor(cell.value)}
              style={{
                transition: 'fill 0.3s ease',
              }}
            />
          );
        })}

        {/* X-axis labels */}
        {xLabels?.map((label, index) => (
          <text
            key={`x-${index}`}
            x={labelOffsetX + index * cellSize + cellSize / 2}
            y={height + 20}
            textAnchor="middle"
            fill="#8B95A5"
            fontSize="10"
          >
            {label}
          </text>
        ))}

        {/* Y-axis labels */}
        {yLabels?.map((label, index) => (
          <text
            key={`y-${index}`}
            x={labelOffsetX - 8}
            y={index * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            fill="#8B95A5"
            fontSize="10"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="sp-flex sp-items-center sp-gap-2 sp-mt-4 sp-ml-[60px]">
        <span className="sp-text-xs sp-text-text-tertiary">0</span>
        {colorScale.map((color, i) => (
          <div
            key={i}
            className="sp-w-4 sp-h-4 sp-rounded"
            style={{ background: color }}
            title={`${i * 10}-${(i + 1) * 10}`}
          />
        ))}
        <span className="sp-text-xs sp-text-text-tertiary">100</span>
      </div>
    </div>
  );
};

export default Heatmap;

