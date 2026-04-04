/**
 * LiveMetric - Animated Metric Display
 * Shows metrics with counting animation and trend indicators
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LiveMetricProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LiveMetric({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  trendValue,
  icon,
  color = '#6366f1',
  size = 'md',
}: LiveMetricProps) {
  const formatted = value.toFixed(decimals);
  const display = `${prefix}${formatted}${suffix}`;

  const sizeClasses = {
    sm: { value: 'text-2xl', label: 'text-xs', padding: 'p-4' },
    md: { value: 'text-4xl', label: 'text-sm', padding: 'p-6' },
    lg: { value: 'text-5xl', label: 'text-base', padding: 'p-8' },
  };

  const classes = sizeClasses[size];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'rgba(255,255,255,0.4)';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${classes.padding} transition-all duration-200 hover:scale-[1.02]`}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Subtle gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at top right, ${color}20, transparent 70%)`,
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {icon && (
            <div
              className="p-2 rounded-xl"
              style={{
                background: `${color}15`,
                color: color,
              }}
            >
              {icon}
            </div>
          )}

          {trend && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              style={{
                background: `${trendColor}15`,
                color: trendColor,
              }}
            >
              <TrendIcon size={12} />
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>

        {/* Value */}
        <p className={`${classes.value} font-bold text-white mb-1`}>{display}</p>

        {/* Label */}
        <p className={`${classes.label} text-white/50`}>{label}</p>
      </div>
    </div>
  );
}

export default LiveMetric;
