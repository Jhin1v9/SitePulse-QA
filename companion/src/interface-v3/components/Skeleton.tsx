/**
 * SITEPULSE STUDIO v3.0 - SKELETON LOADING
 * Estados de carregamento para melhor UX
 */

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  className = '',
  circle = false,
}) => {
  return (
    <div
      className={`sp-animate-pulse sp-bg-white/[0.05] ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : 8,
      }}
    />
  );
};

// Card skeleton
export const CardSkeleton: React.FC = () => (
  <div
    className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-4"
    style={{ background: 'rgba(255,255,255,0.02)' }}
  >
    <div className="sp-flex sp-items-center sp-gap-3 sp-mb-4">
      <Skeleton width={40} height={40} circle />
      <div className="sp-flex-1">
        <Skeleton width="60%" height={16} className="sp-mb-2" />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
    <Skeleton width="100%" height={60} />
  </div>
);

// Engine card skeleton
export const EngineCardSkeleton: React.FC = () => (
  <div
    className="sp-rounded-2xl sp-border sp-border-white/[0.06] sp-p-5"
    style={{ background: 'rgba(255,255,255,0.02)' }}
  >
    <div className="sp-flex sp-items-start sp-justify-between sp-mb-4">
      <Skeleton width={48} height={48} circle />
      <Skeleton width={60} height={20} />
    </div>
    <Skeleton width="80%" height={20} className="sp-mb-2" />
    <Skeleton width="100%" height={14} className="sp-mb-4" />
    <div className="sp-grid sp-grid-cols-2 sp-gap-3">
      <Skeleton width="100%" height={50} />
      <Skeleton width="100%" height={50} />
    </div>
  </div>
);

// Metric card skeleton
export const MetricCardSkeleton: React.FC = () => (
  <div
    className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-4"
    style={{ background: 'rgba(255,255,255,0.02)' }}
  >
    <Skeleton width="50%" height={12} className="sp-mb-2" />
    <div className="sp-flex sp-items-end sp-justify-between">
      <Skeleton width="40%" height={32} />
      <Skeleton width={80} height={30} />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="sp-w-full">
    <div className="sp-flex sp-gap-4 sp-pb-3 sp-border-b sp-border-white/[0.06] sp-mb-3">
      <Skeleton width={24} height={16} />
      <Skeleton width="20%" height={16} />
      <Skeleton width="30%" height={16} />
      <Skeleton width="25%" height={16} />
      <Skeleton width="25%" height={16} />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="sp-flex sp-gap-4 sp-py-3">
        <Skeleton width={24} height={16} />
        <Skeleton width="20%" height={16} />
        <Skeleton width="30%" height={16} />
        <Skeleton width="25%" height={16} />
        <Skeleton width="25%" height={16} />
      </div>
    ))}
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="sp-space-y-6">
    <div className="sp-flex sp-items-center sp-justify-between">
      <div>
        <Skeleton width={200} height={36} className="sp-mb-2" />
        <Skeleton width={300} height={16} />
      </div>
      <Skeleton width={100} height={32} />
    </div>
    <div className="sp-grid sp-grid-cols-4 sp-gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
    <Skeleton width="100%" height={150} />
    <div className="sp-grid sp-grid-cols-5 sp-gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <EngineCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default Skeleton;

