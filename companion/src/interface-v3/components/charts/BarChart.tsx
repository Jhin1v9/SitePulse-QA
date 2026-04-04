/**
 * SITEPULSE STUDIO v3.0 - BAR CHART
 * Gráfico de barras para comparações
 */

import React from 'react';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  showLabels?: boolean;
  showValues?: boolean;
  height?: number;
  barWidth?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  showLabels = true,
  showValues = true,
  height = 200,
  barWidth = 40,
}) => {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  const gap = 16;
  const totalWidth = data.length * barWidth + (data.length - 1) * gap;

  return (
    <div className="sp-flex sp-flex-col">
      <svg width={totalWidth} height={height} className="sp-overflow-visible">
        {data.map((item, index) => {
          const barHeight = (item.value / max) * (height - 24);
          const x = index * (barWidth + gap);
          const y = height - barHeight - 24;
          const color = item.color || '#6366F1';

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={color}
                style={{
                  filter: `drop-shadow(0 0 8px ${color}40)`,
                }}
              />

              {/* Value label */}
              {showValues && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="500"
                >
                  {item.value}
                </text>
              )}

              {/* X-axis label */}
              {showLabels && (
                <text
                  x={x + barWidth / 2}
                  y={height - 4}
                  textAnchor="middle"
                  fill="#8B95A5"
                  fontSize="11"
                >
                  {item.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Horizontal bar chart
interface HorizontalBarChartProps {
  data: BarData[];
  maxValue?: number;
  showLabels?: boolean;
  showValues?: boolean;
  width?: number;
  barHeight?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  maxValue,
  showLabels = true,
  showValues = true,
  width = 300,
  barHeight = 24,
}) => {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  const gap = 12;
  const labelWidth = showLabels ? 100 : 0;
  const chartWidth = width - labelWidth - 50;

  return (
    <div className="sp-flex sp-flex-col sp-gap-3">
      {data.map((item, index) => {
        const barWidth = (item.value / max) * chartWidth;
        const color = item.color || '#6366F1';

        return (
          <div key={index} className="sp-flex sp-items-center sp-gap-3">
            {showLabels && (
              <span className="sp-w-[100px] sp-text-sm sp-text-text-secondary sp-truncate sp-text-right">
                {item.label}
              </span>
            )}
            <div
              className="sp-relative sp-rounded-r-lg sp-transition-all sp-duration-500"
              style={{
                width: barWidth,
                height: barHeight,
                background: color,
                filter: `drop-shadow(0 0 6px ${color}40)`,
              }}
            />
            {showValues && (
              <span className="sp-text-sm sp-font-medium sp-text-white sp-w-[40px]">
                {item.value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;

