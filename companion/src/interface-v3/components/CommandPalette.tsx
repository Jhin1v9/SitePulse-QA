/**
 * SITEPULSE STUDIO v3.0 - COMMAND PALETTE
 * Paleta de comandos estilo VS Code (Ctrl+K)
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

export type CommandAction = () => void;

export interface Command {
  id: string;
  title: string;
  shortcut?: string;
  icon?: string;
  action: CommandAction;
  category?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filtrar comandos
  const filteredCommands = search.trim()
    ? commands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(search.toLowerCase()) ||
          cmd.category?.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  // Agrupar por categoria
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const category = cmd.category || 'Geral';
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  // Reset selection quando search muda
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input quando abre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredCommands.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          const cmd = filteredCommands[selectedIndex];
          if (cmd) {
            cmd.action();
            onClose();
          }
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll to selected
  useEffect(() => {
    const element = listRef.current?.children[selectedIndex] as HTMLElement;
    element?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let globalIndex = 0;

  return (
    <div className="sp-fixed sp-inset-0 sp-z-50 sp-flex sp-items-start sp-justify-center sp-pt-[20vh]">
      {/* Backdrop */}
      <div
        className="sp-absolute sp-inset-0 sp-bg-black/60 sp-backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="sp-relative sp-w-full sp-max-w-[640px] sp-mx-4 sp-rounded-2xl sp-border sp-border-white/[0.1] sp-bg-[#0F172A] sp-shadow-2xl sp-overflow-hidden">
        {/* Search */}
        <div className="sp-flex sp-items-center sp-gap-3 sp-px-4 sp-py-4 sp-border-b sp-border-white/[0.06]">
          <svg
            className="sp-w-5 sp-h-5 sp-text-text-tertiary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite um comando..."
            className="sp-flex-1 sp-bg-transparent sp-text-white sp-placeholder-text-tertiary sp-outline-none sp-text-lg"
          />
          <kbd className="sp-px-2 sp-py-1 sp-rounded sp-bg-white/[0.05] sp-text-text-tertiary sp-text-xs">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div
          ref={listRef}
          className="sp-max-h-[400px] sp-overflow-y-auto sp-py-2"
        >
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              <div className="sp-px-4 sp-py-2 sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary">
                {category}
              </div>
              {cmds.map((cmd) => {
                const isSelected = globalIndex === selectedIndex;
                const index = globalIndex++;

                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`sp-w-full sp-flex sp-items-center sp-gap-3 sp-px-4 sp-py-3 sp-text-left sp-transition-colors ${
                      isSelected
                        ? 'sp-bg-primary/20'
                        : 'hover:sp-bg-white/[0.02]'
                    }`}
                  >
                    {cmd.icon && (
                      <span className="sp-text-lg">{cmd.icon}</span>
                    )}
                    <span className="sp-flex-1 sp-text-white">{cmd.title}</span>
                    {cmd.shortcut && (
                      <kbd className="sp-px-2 sp-py-1 sp-rounded sp-bg-white/[0.05] sp-text-text-secondary sp-text-xs">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="sp-px-4 sp-py-8 sp-text-center sp-text-text-secondary">
              Nenhum comando encontrado
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sp-flex sp-items-center sp-gap-4 sp-px-4 sp-py-2 sp-border-t sp-border-white/[0.06] sp-text-text-tertiary sp-text-xs">
          <div className="sp-flex sp-items-center sp-gap-1">
            <kbd className="sp-px-1.5 sp-py-0.5 sp-rounded sp-bg-white/[0.05]">↑↓</kbd>
            <span>Navegar</span>
          </div>
          <div className="sp-flex sp-items-center sp-gap-1">
            <kbd className="sp-px-1.5 sp-py-0.5 sp-rounded sp-bg-white/[0.05]">↵</kbd>
            <span>Selecionar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar command palette
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};

export default CommandPalette;

