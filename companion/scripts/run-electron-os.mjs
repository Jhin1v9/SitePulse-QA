#!/usr/bin/env node
/**
 * Script para executar o SitePulse OS (interface moderna tipo desktop OS)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Iniciando SitePulse OS (Desktop Interface)\n');

// Verificar se src/app/dist existe
import fs from 'fs';
const distPath = path.join(rootDir, 'src', 'app', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Erro: src/app/dist não encontrado!');
  console.log('   Execute primeiro: cd app && npm run build && cp -r app/dist src/app/');
  process.exit(1);
}

// Configurar ambiente
const env = {
  ...process.env,
  SITEPULSE_OS: '1',  // Ativar modo OS
  NODE_ENV: 'development',
};

// Executar Electron (Windows ou Linux/Mac)
const isWindows = process.platform === 'win32';
const electronBin = isWindows ? 'electron.cmd' : 'electron';
const electronPath = path.join(rootDir, 'node_modules', '.bin', electronBin);
const mainPath = path.join(rootDir, 'src', 'main.cjs');

const child = spawn(electronPath, [mainPath], {
  env,
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows, // Necessário no Windows
});

child.on('close', (code) => {
  console.log(`\n👋 SitePulse OS encerrado (código ${code})`);
  process.exit(code);
});
