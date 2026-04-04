#!/usr/bin/env node
/**
 * SITEPULSE STUDIO v3.0 - BUILD INTERFACE V3
 * Script para buildar a interface v3 React
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const interfaceDir = path.join(rootDir, 'src', 'interface-v3');
const distDir = path.join(interfaceDir, 'dist');

console.log('🚀 SitePulse Studio v3.0 - Interface Builder\n');

// Verificar se o diretório existe
if (!fs.existsSync(interfaceDir)) {
  console.error('❌ Diretório interface-v3 não encontrado!');
  process.exit(1);
}

// Limpar build anterior
console.log('🧹 Limpando build anterior...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Build com Vite
console.log('📦 Buildando interface v3...');
try {
  execSync('npx vite build', {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('❌ Build falhou:', error.message);
  process.exit(1);
}

// Copiar arquivos para src/renderer-v3/
const rendererV3Dir = path.join(rootDir, 'src', 'renderer-v3');
console.log('📂 Copiando para src/renderer-v3/...');

if (fs.existsSync(rendererV3Dir)) {
  fs.rmSync(rendererV3Dir, { recursive: true, force: true });
}
fs.mkdirSync(rendererV3Dir, { recursive: true });

// Copiar arquivos do dist
const files = fs.readdirSync(distDir);
for (const file of files) {
  const src = path.join(distDir, file);
  const dest = path.join(rendererV3Dir, file);
  
  if (fs.statSync(src).isDirectory()) {
    fs.cpSync(src, dest, { recursive: true });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('\n✅ Interface v3 buildada com sucesso!');
console.log(`📍 Local: ${rendererV3Dir}`);
console.log('\nPara usar a nova interface:');
console.log('  npm run dev:v3    # Iniciar com interface v3');
console.log('  npm run dev       # Iniciar com interface antiga');
