/**
 * SITEPULSE STUDIO v3.0 - BADGE COMPONENT
 * Badges de severidade e status com variações
 */

import React from 'react';
import { BadgeProps } from '../../types';

export const Badge: React.FC<BadgeProps> = ({
  severity,
  status,
  variant = 'default',
  count,
  children,
  className = '',
}) => {
  const getSeverityClasses = () => {
    switch (severity) {
      case 'critical': return 'sp-badge-critical';
      case 'high': return 'sp-badge-high';
      case 'medium': return 'sp-badge-medium';
      case 'low': return 'sp-badge-low';
      case 'info': return 'sp-badge-info';
      default: return '';
    }
  };
  
  const getStatusClasses = () => {
    switch (status) {
      case 'online': return 'sp-badge-online';
      case 'offline': return 'sp-badge-offline';
      case 'busy': return 'sp-badge-busy';
      case 'error': return 'sp-badge-error';
      default: return '';
    }
  };
  
  const baseClasses = 'sp-badge';
  const severityClasses = getSeverityClasses();
  const statusClasses = getStatusClasses();
  const variantClasses = variant === 'pulse' ? 'sp-badge-pulse' : '';
  const counterClasses = variant === 'counter' ? 'sp-badge-counter' : '';
  
  const classes = [
    baseClasses,
    severityClasses,
    statusClasses,
    variantClasses,
    counterClasses,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <span className={classes}>
      {count !== undefined ? count : children}
    </span>
  );
};

// Badge de severidade específico
export const SeverityBadge: React.FC<{ level: BadgeProps['severity']; count?: number }> = ({
  level,
  count,
}) => (
  <Badge severity={level} count={count}>
    {level?.toUpperCase()}
  </Badge>
);

// Badge de status específico
export const StatusBadge: React.FC<{ status: BadgeProps['status'] }> = ({ status }) => (
  <Badge status={status}>
    {status?.toUpperCase()}
  </Badge>
);

export default Badge;
