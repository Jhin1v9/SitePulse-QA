#!/usr/bin/env node
/**
 * Script de teste para SitePulse OS
 * Inicia o Electron com logs detalhados
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Testando SitePulse OS...\n');

// Verificar dist
const distPath = path.join(rootDir, 'src', 'app', 'dist');
console.log('✓ Dist path:', distPath);

// Configurar ambiente
const env = {
  ...process.env,
  SITEPULSE_OS: '1',
  NODE_ENV: 'development',
  ELECTRON_ENABLE_LOGGING: '1',
  ELECTRON_ENABLE_STACK_DUMPING: '1',
};

// Executar Electron
const isWindows = process.platform === 'win32';
const electronBin = isWindows ? 'electron.cmd' : 'electron';
const electronPath = path.join(rootDir, 'node_modules', '.bin', electronBin);
const mainPath = path.join(rootDir, 'src', 'main.cjs');

console.log('✓ Electron:', electronPath);
console.log('✓ Main:', mainPath);
console.log('🚀 Iniciando...\n');

const child = spawn(electronPath, [mainPath], {
  env,
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows,
});

child.on('close', (code) => {
  console.log(`\n👋 Electron encerrado (código ${code})`);
  process.exit(code);
});
