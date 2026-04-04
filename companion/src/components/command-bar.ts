// SitePulse V3 — Command Bar Component
// Cmd+K palette for quick navigation and actions

import { eventBus } from '../core/event-bus.js';
import type { DomainEvent } from '../core/types.js';

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: string;
  category: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
}

export interface CommandBarOptions {
  container?: HTMLElement;
  placeholder?: string;
  hotkey?: string;
}

export class CommandBar {
  private _container: HTMLElement;
  private _overlay: HTMLElement;
  private _input: HTMLInputElement;
  private _results: HTMLElement;
  private _commands: Command[] = [];
  private _filtered: Command[] = [];
  private _selectedIndex = 0;
  private _isOpen = false;
  private _hotkey: string;
  private _unsubscribe?: () => void;

  constructor(options: CommandBarOptions = {}) {
    this._hotkey = options.hotkey ?? 'meta+k';
    this._container = options.container ?? document.body;
    
    this._buildDOM();
    this._attachListeners();
    this._registerDefaultCommands();
  }

  private _buildDOM(): void {
    // Styles
    const styleId = 'command-bar-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .cmd-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s, visibility 0.2s;
        }
        
        .cmd-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        
        .cmd-container {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%) scale(0.95);
          width: 90%;
          max-width: 640px;
          background: #1a1d24;
          border: 1px solid #2d3139;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          z-index: 10000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .cmd-container.open {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) scale(1);
        }
        
        .cmd-input-wrapper {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #2d3139;
        }
        
        .cmd-search-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
          margin-right: 12px;
        }
        
        .cmd-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #f3f4f6;
          font-size: 16px;
          outline: none;
        }
        
        .cmd-input::placeholder {
          color: #6b7280;
        }
        
        .cmd-shortcut-hint {
          padding: 4px 8px;
          background: #2d3139;
          border-radius: 4px;
          font-size: 11px;
          color: #9ca3af;
        }
        
        .cmd-results {
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        }
        
        .cmd-category {
          padding: 8px 12px 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
        }
        
        .cmd-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        
        .cmd-item:hover,
        .cmd-item.selected {
          background: #2d3139;
        }
        
        .cmd-item-icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
          color: #9ca3af;
        }
        
        .cmd-item-content {
          flex: 1;
        }
        
        .cmd-item-label {
          color: #f3f4f6;
          font-size: 14px;
        }
        
        .cmd-item-description {
          color: #6b7280;
          font-size: 12px;
          margin-top: 2px;
        }
        
        .cmd-item-shortcut {
          padding: 2px 6px;
          background: #1f2937;
          border-radius: 4px;
          font-size: 11px;
          color: #9ca3af;
          font-family: monospace;
        }
        
        .cmd-empty {
          padding: 40px;
          text-align: center;
          color: #6b7280;
        }
        
        .cmd-footer {
          display: flex;
          gap: 16px;
          padding: 12px 16px;
          border-top: 1px solid #2d3139;
          font-size: 11px;
          color: #6b7280;
        }
        
        .cmd-footer kbd {
          padding: 2px 6px;
          background: #2d3139;
          border-radius: 4px;
          font-family: monospace;
        }
      `;
      document.head.appendChild(style);
    }

    // Overlay
    this._overlay = document.createElement('div');
    this._overlay.className = 'cmd-overlay';
    document.body.appendChild(this._overlay);

    // Container
    const container = document.createElement('div');
    container.className = 'cmd-container';
    container.innerHTML = `
      <div class="cmd-input-wrapper">
        <svg class="cmd-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" class="cmd-input" placeholder="Buscar comando...">
        <span class="cmd-shortcut-hint">ESC para cerrar</span>
      </div>
      <div class="cmd-results"></div>
      <div class="cmd-footer">
        <span><kbd>↑↓</kbd> navegar</span>
        <span><kbd>↵</kbd> seleccionar</span>
      </div>
    `;
    document.body.appendChild(container);

    this._input = container.querySelector('.cmd-input')!;
    this._results = container.querySelector('.cmd-results')!;
    this._container = container;
  }

  private _attachListeners(): void {
    // Hotkey
    document.addEventListener('keydown', (e) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this._isOpen) {
        this.close();
      }
    });

    // Input
    this._input.addEventListener('input', () => this._filter());
    
    this._input.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this._selectedIndex = Math.min(this._selectedIndex + 1, this._filtered.length - 1);
          this._renderResults();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this._selectedIndex = Math.max(this._selectedIndex - 1, 0);
          this._renderResults();
          break;
        case 'Enter':
          e.preventDefault();
          this._execute(this._filtered[this._selectedIndex]);
          break;
      }
    });

    // Overlay click
    this._overlay.addEventListener('click', () => this.close());
  }

  private _registerDefaultCommands(): void {
    this.register({
      id: 'workspace.findings',
      label: 'Ver hallazgos',
      description: 'Abrir panel de hallazgos del análisis',
      category: 'Workspace',
      shortcut: 'Ctrl+1',
      action: () => this._navigate('findings')
    });

    this.register({
      id: 'workspace.healing',
      label: 'Centro de curación',
      description: 'Gestionar correcciones automáticas',
      category: 'Workspace',
      shortcut: 'Ctrl+2',
      action: () => this._navigate('healing')
    });

    this.register({
      id: 'workspace.security',
      label: 'Análisis de seguridad',
      description: 'Ver superficie de ataque y vectores',
      category: 'Workspace',
      shortcut: 'Ctrl+3',
      action: () => this._navigate('security')
    });

    this.register({
      id: 'ai.explain',
      label: 'Explicar selección',
      description: 'Pedir a la IA que explique el código seleccionado',
      category: 'AI',
      action: () => this._emit('ai:explain')
    });

    this.register({
      id: 'ai.heal',
      label: 'Curar automáticamente',
      description: 'Aplicar corrección sugerida',
      category: 'AI',
      action: () => this._emit('ai:heal')
    });

    this.register({
      id: 'system.settings',
      label: 'Configuración',
      description: 'Abrir preferencias del sistema',
      category: 'Sistema',
      shortcut: 'Ctrl+,',
      action: () => this._navigate('settings')
    });

    this.register({
      id: 'system.reload',
      label: 'Recargar aplicación',
      description: 'Recargar ventana actual',
      category: 'Sistema',
      shortcut: 'Ctrl+R',
      action: () => location.reload()
    });
  }

  register(command: Command): void {
    this._commands.push(command);
    this._commands.sort((a, b) => a.category.localeCompare(b.category));
  }

  unregister(id: string): void {
    this._commands = this._commands.filter(c => c.id !== id);
  }

  open(): void {
    this._isOpen = true;
    this._overlay.classList.add('open');
    this._container.classList.add('open');
    this._input.value = '';
    this._input.focus();
    this._filter();
  }

  close(): void {
    this._isOpen = false;
    this._overlay.classList.remove('open');
    this._container.classList.remove('open');
  }

  toggle(): void {
    if (this._isOpen) this.close();
    else this.open();
  }

  private _filter(): void {
    const query = this._input.value.toLowerCase().trim();
    
    if (!query) {
      this._filtered = [...this._commands];
    } else {
      this._filtered = this._commands.filter(cmd => 
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query) ||
        cmd.category.toLowerCase().includes(query)
      );
    }

    this._selectedIndex = 0;
    this._renderResults();
  }

  private _renderResults(): void {
    if (this._filtered.length === 0) {
      this._results.innerHTML = '<div class="cmd-empty">No se encontraron comandos</div>';
      return;
    }

    let currentCategory = '';
    let html = '';

    this._filtered.forEach((cmd, index) => {
      if (cmd.category !== currentCategory) {
        currentCategory = cmd.category;
        html += `<div class="cmd-category">${this._escapeHtml(currentCategory)}</div>`;
      }

      html += `
        <div class="cmd-item ${index === this._selectedIndex ? 'selected' : ''}" data-index="${index}">
          <svg class="cmd-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <div class="cmd-item-content">
            <div class="cmd-item-label">${this._escapeHtml(cmd.label)}</div>
            ${cmd.description ? `<div class="cmd-item-description">${this._escapeHtml(cmd.description)}</div>` : ''}
          </div>
          ${cmd.shortcut ? `<span class="cmd-item-shortcut">${this._escapeHtml(cmd.shortcut)}</span>` : ''}
        </div>
      `;
    });

    this._results.innerHTML = html;

    // Click handlers
    this._results.querySelectorAll('.cmd-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.getAttribute('data-index')!);
        this._execute(this._filtered[index]);
      });
    });

    // Scroll selected into view
    const selected = this._results.querySelector('.selected');
    selected?.scrollIntoView({ block: 'nearest' });
  }

  private _execute(command?: Command): void {
    if (!command || command.disabled) return;
    
    this.close();
    
    try {
      command.action();
    } catch (err) {
      console.error('[CommandBar] Execution failed:', err);
    }
  }

  private _navigate(view: string): void {
    eventBus.emit({
      type: 'SYSTEM_MODE_CHANGED',
      payload: { view }
    });
  }

  private _emit(event: string): void {
    window.dispatchEvent(new CustomEvent(event));
  }

  private _escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy(): void {
    this._overlay.remove();
    this._container.remove();
  }
}

// Singleton
let _commandBar: CommandBar | null = null;

export function getCommandBar(): CommandBar {
  if (!_commandBar) {
    _commandBar = new CommandBar();
  }
  return _commandBar;
}
