// SitePulse V3 — Diff Viewer Component
// Premium code diff visualization with syntax highlighting

import type { Diff, DiffHunk, DiffLine } from '../core/types.js';

export interface DiffViewerOptions {
  container: HTMLElement;
  diff: Diff;
  language?: string;
  showLineNumbers?: boolean;
  highlightSyntax?: boolean;
  theme?: 'dark' | 'light';
}

export class DiffViewer {
  private _container: HTMLElement;
  private _diff: Diff;
  private _options: Required<DiffViewerOptions>;
  private _currentHunk = 0;

  constructor(options: DiffViewerOptions) {
    this._container = options.container;
    this._diff = options.diff;
    this._options = {
      container: options.container,
      diff: options.diff,
      language: options.language ?? 'typescript',
      showLineNumbers: options.showLineNumbers ?? true,
      highlightSyntax: options.highlightSyntax ?? true,
      theme: options.theme ?? 'dark'
    };

    this._buildStyles();
    this._render();
  }

  private _buildStyles(): void {
    const styleId = 'diff-viewer-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .diff-viewer {
        font-family: 'SF Mono', 'JetBrains Mono', monospace;
        font-size: 13px;
        line-height: 1.5;
        background: #0d1117;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #30363d;
      }
      
      .diff-header {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: #161b22;
        border-bottom: 1px solid #30363d;
        gap: 12px;
      }
      
      .diff-file-icon {
        width: 16px;
        height: 16px;
        color: #7d8590;
      }
      
      .diff-file-path {
        flex: 1;
        color: #c9d1d9;
        font-size: 12px;
        font-weight: 500;
      }
      
      .diff-stats {
        display: flex;
        gap: 12px;
        font-size: 11px;
      }
      
      .diff-stat-added {
        color: #3fb950;
      }
      
      .diff-stat-removed {
        color: #f85149;
      }
      
      .diff-hunk {
        border-bottom: 1px solid #21262d;
      }
      
      .diff-hunk-header {
        padding: 8px 16px;
        background: #0d1117;
        color: #7d8590;
        font-size: 12px;
        border-left: 4px solid #1f6feb;
      }
      
      .diff-line {
        display: flex;
        min-height: 24px;
      }
      
      .diff-line:hover {
        background: rgba(56, 139, 253, 0.1);
      }
      
      .diff-line-num {
        width: 60px;
        padding: 2px 12px;
        text-align: right;
        color: #6e7681;
        font-size: 12px;
        background: #0d1117;
        border-right: 1px solid #21262d;
        user-select: none;
      }
      
      .diff-line-num.old {
        background: rgba(248, 81, 73, 0.1);
      }
      
      .diff-line-num.new {
        background: rgba(63, 185, 80, 0.1);
      }
      
      .diff-line-content {
        flex: 1;
        padding: 2px 16px;
        white-space: pre;
        overflow-x: auto;
      }
      
      .diff-line.added {
        background: rgba(46, 160, 67, 0.15);
      }
      
      .diff-line.added .diff-line-content {
        color: #aff5b4;
      }
      
      .diff-line.removed {
        background: rgba(248, 81, 73, 0.15);
      }
      
      .diff-line.removed .diff-line-content {
        color: #ffdcd7;
      }
      
      .diff-line.context {
        color: #c9d1d9;
      }
      
      .diff-line.modified {
        background: rgba(187, 128, 9, 0.15);
      }
      
      .diff-line-marker {
        width: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        user-select: none;
      }
      
      .diff-line.added .diff-line-marker {
        color: #3fb950;
      }
      
      .diff-line.removed .diff-line-marker {
        color: #f85149;
      }
      
      .diff-summary {
        padding: 12px 16px;
        background: #161b22;
        color: #8b949e;
        font-size: 12px;
        font-style: italic;
        border-top: 1px solid #30363d;
      }
      
      .diff-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        background: #161b22;
        border-top: 1px solid #30363d;
      }
      
      .diff-btn {
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid #30363d;
        background: #21262d;
        color: #c9d1d9;
        transition: all 0.2s;
      }
      
      .diff-btn:hover {
        background: #30363d;
        border-color: #8b949e;
      }
      
      .diff-btn-primary {
        background: #238636;
        border-color: #238636;
        color: white;
      }
      
      .diff-btn-primary:hover {
        background: #2ea043;
      }
      
      .diff-btn-danger {
        background: #da3633;
        border-color: #da3633;
        color: white;
      }
      
      .diff-btn-danger:hover {
        background: #f85149;
      }
    `;
    document.head.appendChild(style);
  }

  private _render(): void {
    this._container.innerHTML = '';
    this._container.className = 'diff-viewer';

    // Header
    const header = document.createElement('div');
    header.className = 'diff-header';
    
    const stats = this._calculateStats();
    header.innerHTML = `
      <svg class="diff-file-icon" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.56.44-2.94-2.94a.25.25 0 0 0-.177-.073H9.75v2.75c0 .138.112.25.25.25h2.75Z"/>
      </svg>
      <span class="diff-file-path">${this._escapeHtml(this._diff.fromFile)} → ${this._escapeHtml(this._diff.toFile)}</span>
      <div class="diff-stats">
        <span class="diff-stat-added">+${stats.added}</span>
        <span class="diff-stat-removed">-${stats.removed}</span>
      </div>
    `;
    this._container.appendChild(header);

    // Hunks
    this._diff.hunks.forEach((hunk, index) => {
      this._renderHunk(hunk, index);
    });

    // Summary
    if (this._diff.summary) {
      const summary = document.createElement('div');
      summary.className = 'diff-summary';
      summary.textContent = this._diff.summary;
      this._container.appendChild(summary);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'diff-actions';
    actions.innerHTML = `
      <button class="diff-btn diff-btn-primary" data-action="apply">Aplicar cambios</button>
      <button class="diff-btn" data-action="copy">Copiar diff</button>
      <button class="diff-btn diff-btn-danger" data-action="reject">Rechazar</button>
    `;
    this._container.appendChild(actions);

    // Event listeners
    actions.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.target as HTMLElement).dataset.action;
        this._handleAction(action!);
      });
    });
  }

  private _renderHunk(hunk: DiffHunk, index: number): void {
    const hunkEl = document.createElement('div');
    hunkEl.className = 'diff-hunk';

    // Hunk header
    const header = document.createElement('div');
    header.className = 'diff-hunk-header';
    header.textContent = `@@ -${hunk.startLine},${hunk.lines.length} +${hunk.startLine},${hunk.lines.length} @@`;
    hunkEl.appendChild(header);

    // Lines
    let oldLineNum = hunk.startLine;
    let newLineNum = hunk.startLine;

    hunk.lines.forEach(line => {
      const lineEl = document.createElement('div');
      lineEl.className = `diff-line ${line.type}`;

      // Line numbers
      if (this._options.showLineNumbers) {
        const oldNum = document.createElement('span');
        oldNum.className = 'diff-line-num' + (line.type === 'removed' ? ' old' : '');
        oldNum.textContent = line.type === 'added' ? '' : String(oldLineNum++);

        const newNum = document.createElement('span');
        newNum.className = 'diff-line-num' + (line.type === 'added' ? ' new' : '');
        newNum.textContent = line.type === 'removed' ? '' : String(newLineNum++);

        lineEl.appendChild(oldNum);
        lineEl.appendChild(newNum);
      }

      // Marker
      const marker = document.createElement('span');
      marker.className = 'diff-line-marker';
      marker.textContent = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
      lineEl.appendChild(marker);

      // Content
      const content = document.createElement('span');
      content.className = 'diff-line-content';
      content.textContent = line.content;
      lineEl.appendChild(content);

      hunkEl.appendChild(lineEl);
    });

    this._container.appendChild(hunkEl);
  }

  private _calculateStats(): { added: number; removed: number } {
    let added = 0;
    let removed = 0;

    this._diff.hunks.forEach(hunk => {
      hunk.lines.forEach(line => {
        if (line.type === 'added') added++;
        if (line.type === 'removed') removed++;
      });
    });

    return { added, removed };
  }

  private _escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private _handleAction(action: string): void {
    switch (action) {
      case 'apply':
        this._container.dispatchEvent(new CustomEvent('diff:apply', { 
          detail: { diff: this._diff } 
        }));
        break;
      case 'copy':
        navigator.clipboard.writeText(this._toUnifiedFormat());
        break;
      case 'reject':
        this._container.dispatchEvent(new CustomEvent('diff:reject', { 
          detail: { diff: this._diff } 
        }));
        break;
    }
  }

  private _toUnifiedFormat(): string {
    let output = `--- ${this._diff.fromFile}\n+++ ${this._diff.toFile}\n`;
    
    this._diff.hunks.forEach(hunk => {
      output += `@@ -${hunk.startLine},${hunk.lines.length} +${hunk.startLine},${hunk.lines.length} @@\n`;
      hunk.lines.forEach(line => {
        const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
        output += `${prefix}${line.content}\n`;
      });
    });

    return output;
  }

  updateDiff(diff: Diff): void {
    this._diff = diff;
    this._render();
  }

  destroy(): void {
    this._container.innerHTML = '';
  }
}

export function createDiffViewer(options: DiffViewerOptions): DiffViewer {
  return new DiffViewer(options);
}
