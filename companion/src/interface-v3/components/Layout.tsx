/**
 * LAYOUT - SitePulse Studio v3.0
 * Estrutura principal da aplicação
 */

import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeWorkspace: string;
  onWorkspaceChange: (id: string) => void;
  currentTarget?: string;
  qualityScore?: number;
  p0p1Count?: number;
  runBadge?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeWorkspace,
  onWorkspaceChange,
  currentTarget,
  qualityScore,
  p0p1Count,
  runBadge,
}) => {
  return (
    <div className="app-container bg-page">
      <Sidebar
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={onWorkspaceChange}
        currentTarget={currentTarget}
        qualityScore={qualityScore}
        p0p1Count={p0p1Count}
        runBadge={runBadge}
      />
      
      <main className="main-content">
        {/* Header simplificado - pode ser expandido depois */}
        <header className="border-b border-white-6 glass-shell px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-primary capitalize">
              {activeWorkspace}
            </h1>
            <div className="flex items-center gap-3">
              <span className="chip chip-green">
                <span className="status-dot bg-green-400" />
                System Online
              </span>
              <button className="sp-btn-primary">
                New Scan
              </button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
