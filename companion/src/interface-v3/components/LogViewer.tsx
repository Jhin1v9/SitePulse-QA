/**
 * SITEPULSE STUDIO v3.0 - LOG VIEWER
 * Visualização de logs em tempo real com streaming
 */

import React, { useRef, useEffect, useState } from 'react';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
  details?: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  maxHeight?: number;
  autoScroll?: boolean;
  filter?: string;
  onClear?: () => void;
}

const LEVEL_CONFIG: Record<LogLevel, { color: string; bg: string; icon: string }> = {
  debug: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '◆' },
  info: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: 'ℹ' },
  warn: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '⚠' },
  error: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: '✕' },
  success: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: '✓' },
};

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  maxHeight = 400,
  autoScroll = true,
  filter = '',
  onClear,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isAtBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
  };

  const filteredLogs = filter
    ? logs.filter(
        (log) =>
          log.message.toLowerCase().includes(filter.toLowerCase()) ||
          log.source.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div
      className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-[#0B0D12] sp-flex sp-flex-col"
      style={{ maxHeight }}
    >
      {/* Header */}
      <div className="sp-flex sp-items-center sp-justify-between sp-px-4 sp-py-3 sp-border-b sp-border-white/[0.06]">
        <div className="sp-flex sp-items-center sp-gap-4">
          <span className="sp-text-sm sp-font-medium sp-text-white">
            Logs em tempo real
          </span>
          <span className="sp-text-xs sp-text-text-tertiary">
            {filteredLogs.length} entradas
          </span>
        </div>
        <div className="sp-flex sp-items-center sp-gap-2">
          <button
            onClick={() => setIsAtBottom(!isAtBottom)}
            className={`sp-px-3 sp-py-1.5 sp-rounded-lg sp-text-xs sp-transition-colors ${
              isAtBottom
                ? 'sp-bg-primary/20 sp-text-primary'
                : 'sp-bg-white/[0.05] sp-text-text-secondary'
            }`}
          >
            Auto-scroll {isAtBottom ? 'ON' : 'OFF'}
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="sp-px-3 sp-py-1.5 sp-rounded-lg sp-text-xs sp-bg-white/[0.05] sp-text-text-secondary hover:sp-text-white sp-transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Log List */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="sp-flex-1 sp-overflow-y-auto sp-font-mono sp-text-sm"
        style={{ maxHeight: maxHeight - 60 }}
      >
        {filteredLogs.length === 0 ? (
          <div className="sp-flex sp-items-center sp-justify-center sp-h-32 sp-text-text-tertiary">
            Nenhum log para exibir
          </div>
        ) : (
          <div className="sp-py-2">
            {filteredLogs.map((log, index) => {
              const config = LEVEL_CONFIG[log.level];
              const isSelected = selectedLog?.id === log.id;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(isSelected ? null : log)}
                  className={`sp-px-4 sp-py-2 sp-flex sp-items-start sp-gap-3 sp-cursor-pointer sp-transition-colors ${
                    isSelected
                      ? 'sp-bg-primary/10'
                      : isEven
                      ? 'sp-bg-white/[0.01]'
                      : ''
                  } hover:sp-bg-white/[0.03]`}
                >
                  {/* Timestamp */}
                  <span className="sp-text-text-tertiary sp-shrink-0 sp-w-[85px]">
                    {formatTime(log.timestamp)}
                  </span>

                  {/* Level Badge */}
                  <span
                    className="sp-shrink-0 sp-w-6 sp-h-6 sp-flex sp-items-center sp-justify-center sp-rounded sp-text-xs sp-font-bold"
                    style={{
                      background: config.bg,
                      color: config.color,
                    }}
                  >
                    {config.icon}
                  </span>

                  {/* Source */}
                  <span className="sp-text-text-secondary sp-shrink-0 sp-w-[120px] sp-truncate">
                    [{log.source}]
                  </span>

                  {/* Message */}
                  <span
                    className={`sp-flex-1 sp-break-all ${
                      log.level === 'error'
                        ? 'sp-text-red-400'
                        : log.level === 'success'
                        ? 'sp-text-green-400'
                        : 'sp-text-white'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedLog && (
        <div className="sp-border-t sp-border-white/[0.06] sp-p-4 sp-bg-white/[0.02]">
          <div className="sp-flex sp-items-center sp-justify-between sp-mb-2">
            <span className="sp-text-sm sp-font-medium sp-text-white">
              Detalhes
            </span>
            <button
              onClick={() => setSelectedLog(null)}
              className="sp-text-text-tertiary hover:sp-text-white"
            >
              ✕
            </button>
          </div>
          <pre className="sp-text-xs sp-text-text-secondary sp-overflow-x-auto">
            {JSON.stringify(selectedLog, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Hook para gerenciar logs
export const useLogs = (maxLogs = 1000) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    setLogs((prev) => {
      const updated = [...prev, newLog];
      return updated.slice(-maxLogs);
    });
  };

  const clearLogs = () => setLogs([]);

  return { logs, addLog, clearLogs };
};

export default LogViewer;

