/**
 * SITEPULSE STUDIO v3.0 - ENTRY POINT
 * Ponto de entrada da aplicação React
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Importar estilos do design system (CSS Puro extraído da interface antiga)
import './design-system.css';

// Elemento root
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found!');
}

// Criar root e renderizar
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

