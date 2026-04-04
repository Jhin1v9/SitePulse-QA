/**
 * SITEPULSE STUDIO v3.0 - TOAST NOTIFICATIONS
 * Sistema de notificações toast com auto-dismiss
 */

import React, { useEffect, useState } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
        onRemove(toast.id);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [toast.id, duration, onRemove]);

  const config = {
    info: {
      icon: 'ℹ️',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      progressColor: '#3B82F6',
    },
    success: {
      icon: '✓',
      borderColor: 'rgba(34, 197, 94, 0.5)',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      progressColor: '#22C55E',
    },
    warning: {
      icon: '⚠️',
      borderColor: 'rgba(245, 158, 11, 0.5)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      progressColor: '#F59E0B',
    },
    error: {
      icon: '✕',
      borderColor: 'rgba(239, 68, 68, 0.5)',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      progressColor: '#EF4444',
    },
  }[toast.type];

  return (
    <div
      className="sp-relative sp-rounded-xl sp-border sp-p-4 sp-min-w-[320px] sp-max-w-[420px] sp-shadow-lg sp-animate-in sp-slide-in-from-right"
      style={{
        borderColor: config.borderColor,
        background: config.bgColor,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Progress bar */}
      <div className="sp-absolute sp-bottom-0 sp-left-0 sp-right-0 sp-h-[2px] sp-rounded-b-xl sp-overflow-hidden">
        <div
          className="sp-h-full sp-transition-all sp-ease-linear"
          style={{
            width: `${progress}%`,
            background: config.progressColor,
          }}
        />
      </div>

      <div className="sp-flex sp-gap-3">
        {/* Icon */}
        <div
          className="sp-flex sp-shrink-0 sp-w-8 sp-h-8 sp-rounded-lg sp-items-center sp-justify-center sp-text-lg sp-font-bold"
          style={{
            background: config.bgColor,
            border: `1px solid ${config.borderColor}`,
            color: config.progressColor,
          }}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="sp-flex-1 sp-min-w-0">
          <h4 className="sp-font-semibold sp-text-white sp-text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="sp-text-text-secondary sp-text-sm sp-mt-1">{toast.message}</p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => onRemove(toast.id)}
          className="sp-shrink-0 sp-w-6 sp-h-6 sp-flex sp-items-center sp-justify-center sp-rounded-lg sp-text-text-tertiary hover:sp-text-white hover:sp-bg-white/[0.1] sp-transition-colors"
        >
          <svg className="sp-w-4 sp-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="sp-fixed sp-top-4 sp-right-4 sp-z-50 sp-flex sp-flex-col sp-gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Hook para gerenciar toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
  };
};

export default ToastContainer;

