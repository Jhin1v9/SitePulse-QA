# SitePulse Implementation Guide

Este arquivo é preenchido em etapas conforme o Cursor solicitar.

## Seções

1. Estrutura de diretórios (sitepulse)

```
sitepulse/
├── src/
│   ├── styles/
│   │   ├── tokens.css          # Variáveis de design
│   │   ├── base.css            # Reset + tipografia
│   │   └── components.css        # Classes utilitárias
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ContextBar.jsx
│   │   │   └── CommandDock.jsx
│   │   ├── intelligence/
│   │   │   ├── IntelligenceHeader.jsx
│   │   │   ├── AdaptiveResponseFrame.jsx
│   │   │   ├── AIAgentWorkspace.jsx
│   │   │   └── IntelligenceQueue.jsx
│   │   ├── ui/
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── StatusChip.jsx
│   │   │   └── IssueRow.jsx
│   │   └── icons/
│   │       └── SystemIcons.jsx
│   ├── hooks/
│   │   └── useIntelligence.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── tailwind.config.js
```
2. Crie o arquivo `src/styles/tokens.css` com o sistema de design completo do SitePulse. Use CSS variables com LCH color space, tipografia SF Pro, e spacing 8px grid. Inclua todas as cores, sombras, e transições que eu vou te passar.

```css
/* src/styles/tokens.css */
:root {
  /* Core Backgrounds - LCH Lightness 4-18% */
  --bg-page: #0B0D12;
  --bg-shell: #0F131A;
  --bg-panel: #131821;
  --bg-panel-elevated: #1A202C;
  --bg-surface: #212836;
  --bg-interactive: #2A3441;
  
  /* Text - LCH Lightness 40-94% */
  --text-primary: #F0F4F8;
  --text-secondary: #8B95A5;
  --text-tertiary: #5A6578;
  --text-disabled: #3A4556;
  
  /* Accents - Operational Colors */
  --accent-blue: #5B8CFF;
  --accent-cyan: #5CC8FF;
  --accent-purple: #A855F7;
  --accent-green: #22C55E;
  --accent-amber: #F59E0B;
  --accent-red: #EF4444;
  
  /* Semantic Mapping */
  --color-success: var(--accent-green);
  --color-warning: var(--accent-amber);
  --color-danger: var(--accent-red);
  --color-info: var(--accent-blue);
  
  /* Edge Lighting */
  --edge-blue: rgba(91, 140, 255, 0.15);
  --edge-purple: rgba(168, 85, 247, 0.12);
  --edge-green: rgba(34, 197, 94, 0.12);
  --edge-amber: rgba(245, 158, 11, 0.12);
  --edge-red: rgba(239, 68, 68, 0.15);
  
  /* Typography */
  --font-sans: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes - 8px baseline */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 40px;
  
  /* Spacing - 8px grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  
  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  
  /* Shadows */
  --shadow-soft: 0 10px 24px rgba(0, 0, 0, 0.16);
  --shadow-surface: 0 18px 40px rgba(0, 0, 0, 0.18);
  --shadow-focus: 0 0 0 1px rgba(91, 140, 255, 0.24), 0 14px 30px rgba(0, 0, 0, 0.22);
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Dark mode is default */
html {
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Selection */
::selection {
  background: rgba(91, 140, 255, 0.24);
  color: var(--text-primary);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-shell);
}

::-webkit-scrollbar-thumb {
  background: #1d2735;
  border-radius: 999px;
  border: 2px solid var(--bg-shell);
}

::-webkit-scrollbar-thumb:hover {
  background: #273346;
}

/* Focus states */
*:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
}
```
3. Crie src/components/ui/Badge.jsx - Um componente Badge ultra-flexível com variantes: subtle, accent, danger, warning, success. Deve aceitar tamanhos sm, xs e ícones opcionais. Use as cores do nosso tema.

```jsx
// src/components/ui/Badge.jsx
import React from 'react';

const variants = {
  subtle: 'border-white/[0.08] bg-white/[0.03] text-text-secondary',
  accent: 'border-accent-blue/20 bg-accent-blue/10 text-blue-200',
  danger: 'border-accent-red/20 bg-accent-red/10 text-red-200',
  warning: 'border-accent-amber/20 bg-accent-amber/10 text-amber-200',
  success: 'border-accent-green/20 bg-accent-green/10 text-green-200',
};

const sizes = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-[11px]',
};

export function Badge({ 
  children, 
  variant = 'subtle', 
  size = 'sm',
  className = '',
  icon: Icon,
  ...props 
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border uppercase tracking-[0.08em] font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
```

## Comandos

- (Aguardando comandos exatos do usuário/Cursor)
