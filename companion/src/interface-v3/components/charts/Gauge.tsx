/**
 * SITEPULSE STUDIO v3.0 - GAUGE CHART
 * Gráfico circular para scores e métricas
 */

import React from 'react';

interface GaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  color,
  label,
  sublabel,
  showValue = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(100, value));
  const dashoffset = circumference - (progress / 100) * circumference * 0.75; // 270 degrees max

  const defaultColor =
    progress >= 90 ? '#22C55E' : progress >= 70 ? '#F59E0B' : '#EF4444';
  const strokeColor = color || defaultColor;

  return (
    <div className="sp-flex sp-flex-col sp-items-center">
      <div className="sp-relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="sp--rotate-[135deg]"
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={dashoffset}
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor}50)`,
              transition: 'stroke-dashoffset 0.5s ease',
            }}
          />
        </svg>
        {showValue && (
          <div className="sp-absolute sp-inset-0 sp-flex sp-flex-col sp-items-center sp-justify-center">
            <span
              className="sp-text-2xl sp-font-bold"
              style={{ color: strokeColor }}
            >
              {Math.round(progress)}
            </span>
            <span className="sp-text-xs sp-text-text-tertiary">/100</span>
          </div>
        )}
      </div>
      {label && (
        <p className="sp-mt-2 sp-text-sm sp-font-medium sp-text-white sp-text-center">
          {label}
        </p>
      )}
      {sublabel && (
        <p className="sp-text-xs sp-text-text-secondary sp-text-center">
          {sublabel}
        </p>
      )}
    </div>
  );
};

interface MiniGaugeProps {
  value: number;
  size?: number;
  color?: string;
}

export const MiniGauge: React.FC<MiniGaugeProps> = ({
  value,
  size = 40,
  color,
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(100, value));
  const dashoffset = circumference - (progress / 100) * circumference;

  const defaultColor =
    progress >= 90 ? '#22C55E' : progress >= 70 ? '#F59E0B' : '#EF4444';
  const strokeColor = color || defaultColor;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
    </svg>
  );
};

export default Gauge;

