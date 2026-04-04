/**
 * SITEPULSE STUDIO v3.0 - ENTRY POINT
 * Ponto de entrada da aplicação React
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

// Componentes UI
import { Button, Card, Badge } from './components/ui';

// App principal
const App: React.FC = () => {
  return (
    <div className="sp-min-h-screen sp-p-8">
      {/* Header */}
      <header className="sp-mb-8">
        <h1 className="sp-heading-1 sp-text-gradient">
          🧠 SitePulse Studio v3.0
        </h1>
        <p className="sp-body-large sp-mt-2">
          O Oráculo Cibernético - 10 Motores de IA Supremos
        </p>
      </header>

      {/* Grid de Demonstração */}
      <div className="sp-grid sp-grid-3">
        {/* Card de Exemplo 1 */}
        <Card 
          title="🔒 CyberSenior Security" 
          subtitle="Motor de Segurança"
          footer={
            <Button variant="primary" size="sm">
              Iniciar Scan
            </Button>
          }
        >
          <div className="sp-flex sp-gap-2 sp-mb-4">
            <Badge severity="critical" count={2} />
            <Badge severity="medium" count={5} />
            <Badge severity="low" count={8} />
          </div>
          <p className="sp-body-small">
            Score de segurança: <strong>72/100</strong>
          </p>
        </Card>

        {/* Card de Exemplo 2 */}
        <Card 
          title="🎯 Intent Engine" 
          subtitle="Compreensão de Intenções"
          variant="elevated"
        >
          <div className="sp-mb-4">
            <Badge status="online">ONLINE</Badge>
          </div>
          <p className="sp-body-small">
            Confiança média: <strong>94%</strong>
          </p>
          <div className="sp-mt-4 sp-flex sp-gap-2">
            <Button variant="secondary" size="sm">Analisar</Button>
            <Button variant="ghost" size="sm">Histórico</Button>
          </div>
        </Card>

        {/* Card de Exemplo 3 */}
        <Card 
          title="🔮 Predictive Engine" 
          subtitle="Análise Preditiva"
        >
          <div className="sp-mb-4">
            <Badge severity="info" variant="pulse">PREVENDO</Badge>
          </div>
          <p className="sp-body-small">
            Previsões para próximos 7 dias geradas.
          </p>
          <div className="sp-mt-4">
            <Button variant="outline" size="sm" className="sp-w-full">
              Ver Forecast
            </Button>
          </div>
        </Card>
      </div>

      {/* Seção de Botões */}
      <section className="sp-mt-12">
        <h2 className="sp-heading-3 sp-mb-4">Variações de Botões</h2>
        <div className="sp-flex sp-gap-4 sp-flex-wrap">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Perigoso</Button>
          <Button variant="success">Sucesso</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
      </section>

      {/* Seção de Severidade */}
      <section className="sp-mt-12">
        <h2 className="sp-heading-3 sp-mb-4">Badges de Severidade</h2>
        <div className="sp-flex sp-gap-3">
          <Badge severity="critical">CRÍTICO</Badge>
          <Badge severity="high">ALTO</Badge>
          <Badge severity="medium">MÉDIO</Badge>
          <Badge severity="low">BAIXO</Badge>
          <Badge severity="info">INFO</Badge>
        </div>
      </section>
    </div>
  );
};

// Renderizar aplicação
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
