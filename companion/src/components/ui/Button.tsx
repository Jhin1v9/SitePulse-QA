/**
 * SITEPULSE STUDIO v3.0 - BUTTON COMPONENT
 * Botão supremo com todas as variações e estados
 */

import React from 'react';
import { ButtonProps } from '../../types';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconOnly = false,
  disabled,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'sp-btn';
  
  const variantClasses = {
    primary: 'sp-btn-primary',
    secondary: 'sp-btn-secondary',
    ghost: 'sp-btn-ghost',
    outline: 'sp-btn-outline',
    danger: 'sp-btn-danger',
    success: 'sp-btn-success',
  };
  
  const sizeClasses = {
    xs: 'sp-btn-xs',
    sm: 'sp-btn-sm',
    md: '',
    lg: 'sp-btn-lg',
    xl: 'sp-btn-xl',
  };
  
  const stateClasses = [
    loading && 'sp-btn-loading',
    iconOnly && 'sp-btn-icon-only',
  ].filter(Boolean).join(' ');
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    stateClasses,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="sp-btn-icon-wrapper">{icon}</span>}
      {!iconOnly && children}
    </button>
  );
};

// Botão de ícone específico
export const IconButton: React.FC<Omit<ButtonProps, 'iconOnly'>> = (props) => (
  <Button {...props} iconOnly />
);

export default Button;
