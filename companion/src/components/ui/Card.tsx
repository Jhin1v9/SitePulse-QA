/**
 * SITEPULSE STUDIO v3.0 - CARD COMPONENT
 * Card glassmorphism supremo com header, content e footer
 */

import React from 'react';
import { CardProps } from '../../types';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  header,
  title,
  subtitle,
  footer,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'sp-card';
  
  const variantClasses = {
    default: '',
    compact: 'sp-card-compact',
    loose: 'sp-card-loose',
    flat: 'sp-card-flat',
    elevated: 'sp-card-elevated',
  };
  
  const stateClasses = interactive || onClick ? 'sp-card-interactive' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    stateClasses,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={classes} 
      onClick={onClick}
      {...props}
    >
      {(header || title) && (
        <div className="sp-card-header">
          {header || (
            <div>
              {title && <h3 className="sp-card-title">{title}</h3>}
              {subtitle && <p className="sp-card-subtitle">{subtitle}</p>}
            </div>
          )}
        </div>
      )}
      
      <div className="sp-card-content">
        {children}
      </div>
      
      {footer && (
        <div className="sp-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
