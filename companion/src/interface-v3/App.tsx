/**
 * SITEPULSE STUDIO v3.0 - APP PRINCIPAL
 * Usando CSS Puro extraído da interface antiga
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';

// Importar o CSS do design system
import '../styles/design-system.css';

// Screens placeholder
const PlaceholderScreen: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="flex flex-col items-center justify-center h-96 text-center">
    <div
      className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))',
        border: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      <svg
        className="w-10 h-10 text-accent-blue"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-text-secondary max-w-md">{description}</p>
    <p className="mt-4 text-xs text-text-tertiary uppercase tracking-widest">
      Em desenvolvimento
    </p>
  </div>
);

const Findings = () => (
  <PlaceholderScreen
    title="Findings"
    description="Issue board com severidade, triage e gerenciamento de vulnerabilidades."
  />
);

const SEO = () => (
  <PlaceholderScreen
    title="SEO"
    description="Visibility, metadata e indexing analysis."
  />
);

const Compare = () => (
  <PlaceholderScreen
    title="Compare"
    description="Delta analysis, regressions e baseline comparison."
  />
);

const Memory = () => (
  <PlaceholderScreen
    title="Memory"
    description="Knowledge graph e sistema de memória persistente."
  />
);

const Healing = () => (
  <PlaceholderScreen
    title="Healing"
    description="Auto-correction com patches e validação automática."
  />
);

const Reports = () => (
  <PlaceholderScreen
    title="Reports"
    description="Evidence, exports e archive management."
  />
);

const Settings = () => (
  <PlaceholderScreen
    title="Settings"
    description="Preferences, integrations e configurações avançadas."
  />
);

// Mapeamento de workspaces para screens
const SCREENS: Record<string, React.FC> = {
  operator: Dashboard,
  findings: Findings,
  seo: SEO,
  compare: Compare,
  memory: Memory,
  healing: Healing,
  reports: Reports,
  settings: Settings,
};

export const App: React.FC = () => {
  const [activeWorkspace, setActiveWorkspace] = useState('operator');

  // Dados mock do sistema
  const systemData = {
    currentTarget: 'exemplo.com',
    qualityScore: 72,
    p0p1Count: 2,
    runBadge: 'IDLE',
  };

  // Renderizar a screen ativa
  const ActiveScreen = SCREENS[activeWorkspace] || Dashboard;

  return (
    <Layout
      activeWorkspace={activeWorkspace}
      onWorkspaceChange={setActiveWorkspace}
      currentTarget={systemData.currentTarget}
      qualityScore={systemData.qualityScore}
      p0p1Count={systemData.p0p1Count}
      runBadge={systemData.runBadge}
    >
      <ActiveScreen />
    </Layout>
  );
};

export default App;
