#!/usr/bin/env node
/**
 * Script para rodar Electron com interface v3
 * Cross-platform (Windows, Linux, Mac)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Iniciando SitePulse Studio v3.0 (Interface Nova)');

const electron = spawn('node', [
  path.join(rootDir, 'scripts/run-electron.mjs'),
  '.'
], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    SITEPULSE_UI_V3: '1'
  }
});

electron.on('exit', (code) => {
  process.exit(code);
});
