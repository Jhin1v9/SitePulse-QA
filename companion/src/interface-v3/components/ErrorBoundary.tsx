/**
 * SITEPULSE STUDIO v3.0 - ERROR BOUNDARY
 * Captura erros de renderização e exibe fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="sp-flex sp-flex-col sp-items-center sp-justify-center sp-min-h-[300px] sp-p-8 sp-text-center">
          <div
            className="sp-w-16 sp-h-16 sp-rounded-2xl sp-flex sp-items-center sp-justify-center sp-mb-4"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <svg
              className="sp-w-8 sp-h-8 sp-text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-2">
            Algo deu errado
          </h3>
          <p className="sp-text-sm sp-text-text-secondary sp-mb-4 sp-max-w-md">
            Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="sp-px-4 sp-py-2 sp-rounded-xl sp-bg-primary sp-text-white sp-text-sm sp-font-medium hover:sp-brightness-110 sp-transition-all"
          >
            Recarregar Página
          </button>
          {this.state.error && (
            <details className="sp-mt-4 sp-text-left">
              <summary className="sp-text-xs sp-text-text-tertiary sp-cursor-pointer">
                Ver detalhes técnicos
              </summary>
              <pre className="sp-mt-2 sp-p-4 sp-rounded-lg sp-bg-black/30 sp-text-xs sp-text-red-400 sp-overflow-x-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

