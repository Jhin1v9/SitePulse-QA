/**
 * SITEPULSE STUDIO v3.0 - BATCH ACTIONS
 * Sistema de ações em lote com progresso
 */

import React, { useState, useCallback } from 'react';
import { eventBus, SystemEvents } from '../hooks/useEventBus';

export interface BatchAction {
  id: string;
  label: string;
  icon?: string;
  action: (ids: string[]) => Promise<void>;
  confirm?: boolean;
  confirmMessage?: string;
}

interface BatchActionsProps {
  actions: BatchAction[];
  selectedIds: Set<string>;
  onClearSelection: () => void;
  itemLabel?: string;
}

interface RunningAction {
  id: string;
  label: string;
  progress: number;
  total: number;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  actions,
  selectedIds,
  onClearSelection,
  itemLabel = 'itens',
}) => {
  const [running, setRunning] = useState<RunningAction | null>(null);
  const [confirmAction, setConfirmAction] = useState<BatchAction | null>(null);

  const executeAction = useCallback(
    async (batchAction: BatchAction) => {
      if (selectedIds.size === 0) return;

      if (batchAction.confirm && !confirmAction) {
        setConfirmAction(batchAction);
        return;
      }

      setConfirmAction(null);
      const ids = Array.from(selectedIds);

      setRunning({
        id: batchAction.id,
        label: batchAction.label,
        progress: 0,
        total: ids.length,
      });

      try {
        // Process in chunks
        const chunkSize = 5;
        for (let i = 0; i < ids.length; i += chunkSize) {
          const chunk = ids.slice(i, i + chunkSize);
          await batchAction.action(chunk);

          setRunning((prev) =>
            prev
              ? { ...prev, progress: Math.min(i + chunk.length, ids.length) }
              : null
          );

          // Emit progress event
          eventBus.emit(SystemEvents.DATA_REFRESH, {
            action: batchAction.id,
            progress: i + chunk.length,
            total: ids.length,
          });

          // Small delay for UI
          await new Promise((r) => setTimeout(r, 100));
        }

        // Success
        eventBus.emit(SystemEvents.NOTIFICATION_SHOW, {
          type: 'success',
          title: 'Ação concluída',
          message: `${batchAction.label} concluído para ${ids.length} ${itemLabel}`,
        });

        onClearSelection();
      } catch (error) {
        eventBus.emit(SystemEvents.NOTIFICATION_SHOW, {
          type: 'error',
          title: 'Erro na ação',
          message: String(error),
        });
      } finally {
        setRunning(null);
      }
    },
    [selectedIds, confirmAction, itemLabel, onClearSelection]
  );

  if (selectedIds.size === 0 && !running) return null;

  return (
    <>
      {/* Batch Actions Bar */}
      <div className="sp-fixed sp-bottom-6 sp-left-1/2 sp--translate-x-1/2 sp-z-40">
        <div
          className="sp-flex sp-items-center sp-gap-4 sp-px-6 sp-py-4 sp-rounded-2xl sp-border sp-border-white/[0.1] sp-shadow-2xl"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {running ? (
            // Progress View
            <div className="sp-flex sp-items-center sp-gap-4">
              <div className="sp-w-6 sp-h-6 sp-border-2 sp-border-primary sp-border-t-transparent sp-rounded-full sp-animate-spin" />
              <div>
                <p className="sp-text-sm sp-font-medium sp-text-white">
                  {running.label}...
                </p>
                <p className="sp-text-xs sp-text-text-secondary">
                  {running.progress} de {running.total} {itemLabel}
                </p>
              </div>
              <div className="sp-w-32 sp-h-2 sp-rounded-full sp-bg-white/[0.1] sp-overflow-hidden">
                <div
                  className="sp-h-full sp-rounded-full sp-bg-primary sp-transition-all"
                  style={{
                    width: `${(running.progress / running.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            // Actions View
            <>
              <div className="sp-flex sp-items-center sp-gap-2 sp-pr-4 sp-border-r sp-border-white/[0.1]">
                <span className="sp-w-6 sp-h-6 sp-flex sp-items-center sp-justify-center sp-rounded-full sp-bg-primary sp-text-white sp-text-xs sp-font-bold">
                  {selectedIds.size}
                </span>
                <span className="sp-text-sm sp-text-text-secondary">
                  {itemLabel} selecionados
                </span>
              </div>

              <div className="sp-flex sp-items-center sp-gap-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => executeAction(action)}
                    className="sp-flex sp-items-center sp-gap-2 sp-px-4 sp-py-2 sp-rounded-xl sp-text-sm sp-font-medium sp-transition-colors sp-bg-white/[0.05] hover:sp-bg-white/[0.1] sp-text-white"
                  >
                    {action.icon && <span>{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </div>

              <button
                onClick={onClearSelection}
                className="sp-p-2 sp-rounded-xl sp-text-text-tertiary hover:sp-text-white hover:sp-bg-white/[0.05] sp-transition-colors"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="sp-fixed sp-inset-0 sp-z-50 sp-flex sp-items-center sp-justify-center sp-bg-black/60 sp-backdrop-blur-sm">
          <div
            className="sp-w-full sp-max-w-md sp-p-6 sp-rounded-2xl sp-border sp-border-white/[0.1]"
            style={{ background: 'rgba(15, 23, 42, 0.95)' }}
          >
            <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-2">
              Confirmar ação
            </h3>
            <p className="sp-text-text-secondary sp-mb-6">
              {confirmAction.confirmMessage ||
                `Deseja realmente ${confirmAction.label.toLowerCase()} para ${selectedIds.size} ${itemLabel}?`}
            </p>
            <div className="sp-flex sp-justify-end sp-gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="sp-px-4 sp-py-2 sp-rounded-xl sp-text-sm sp-text-text-secondary hover:sp-text-white sp-transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => executeAction(confirmAction)}
                className="sp-px-4 sp-py-2 sp-rounded-xl sp-bg-red-500 sp-text-white sp-text-sm sp-font-medium hover:sp-brightness-110 sp-transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchActions;

