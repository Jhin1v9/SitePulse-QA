/**
 * SITEPULSE STUDIO v3.0 - SPARKLINE CHART
 * Gráfico de linha minimalista para tendências
 */

import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showArea?: boolean;
  showDots?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 40,
  color = '#6366F1',
  strokeWidth = 2,
  showArea = true,
  showDots = false,
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = strokeWidth / 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return { x, y, value };
  });

  // Create path
  const pathD = points
    .map((point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `L ${point.x} ${point.y}`
    )
    .join(' ');

  // Create area path
  const areaD = showArea
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`
    : '';

  return (
    <svg width={width} height={height} className="sp-overflow-visible">
      {/* Area */}
      {showArea && (
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {showArea && (
        <path
          d={areaD}
          fill="url(#sparklineGradient)"
        />
      )}

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0 0 4px ${color}50)`,
        }}
      />

      {/* Dots */}
      {showDots &&
        points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={color}
            stroke="#0B0D12"
            strokeWidth={2}
          />
        ))}
    </svg>
  );
};

// Sparkline com tooltip
interface SparklineWithValueProps extends SparklineProps {
  label: string;
  value: number;
  change?: number;
}

export const SparklineWithValue: React.FC<SparklineWithValueProps> = ({
  label,
  value,
  change,
  ...sparklineProps
}) => {
  const changeColor =
    change === undefined
      ? '#6B7280'
      : change > 0
      ? '#22C55E'
      : change < 0
      ? '#EF4444'
      : '#6B7280';

  return (
    <div className="sp-flex sp-items-center sp-gap-4">
      <div>
        <p className="sp-text-xs sp-text-text-tertiary sp-uppercase sp-tracking-wider">
          {label}
        </p>
        <div className="sp-flex sp-items-baseline sp-gap-2">
          <span className="sp-text-2xl sp-font-bold sp-text-white">
            {value.toLocaleString()}
          </span>
          {change !== undefined && (
            <span className="sp-text-sm sp-font-medium" style={{ color: changeColor }}>
              {change > 0 ? '+' : ''}
              {change}%
            </span>
          )}
        </div>
      </div>
      <Sparkline {...sparklineProps} />
    </div>
  );
};

export default Sparkline;

