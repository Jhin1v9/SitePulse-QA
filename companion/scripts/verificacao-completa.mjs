#!/usr/bin/env node
/**
 * Verificação Completa do SitePulse OS
 * Checagem sistemática de todos os componentes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 VERIFICAÇÃO COMPLETA DO SITEPULSE OS\n');
console.log('=' .repeat(60));

let passed = 0;
let failed = 0;

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// ============================================
// 1. ESTRUTURA DE ARQUIVOS
// ============================================
console.log('\n📁 1. ESTRUTURA DE ARQUIVOS\n');

check('main.cjs existe', fs.existsSync(path.join(rootDir, 'src/main.cjs')));
check('preload.cjs existe', fs.existsSync(path.join(rootDir, 'src/preload.cjs')));
check('update-service.cjs existe', fs.existsSync(path.join(rootDir, 'src/update-service.cjs')));
check('Build app/dist/index.html existe', fs.existsSync(path.join(rootDir, 'app/dist/index.html')));
check('Build src/app/dist/index.html existe', fs.existsSync(path.join(rootDir, 'src/app/dist/index.html')));

// ============================================
// 2. SINTAXE JAVASCRIPT
// ============================================
console.log('\n📝 2. SINTAXE JAVASCRIPT\n');

const filesToCheck = [
  'src/main.cjs',
  'src/preload.cjs',
  'src/update-service.cjs',
];

for (const file of filesToCheck) {
  try {
    const fullPath = path.join(rootDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    // Verificação básica de sintaxe
    new Function(content);
    check(`${file} - sintaxe válida`, true);
  } catch (err) {
    check(`${file} - sintaxe válida`, false, err.message);
  }
}

// ============================================
// 3. IPC HANDLERS (main.cjs)
// ============================================
console.log('\n🔌 3. IPC HANDLERS (main.cjs)\n');

const mainContent = fs.readFileSync(path.join(rootDir, 'src/main.cjs'), 'utf-8');

const requiredHandlers = [
  "ipcMain.handle('app:ping'",
  "ipcMain.handle('app:get-version'",
  "ipcMain.handle('engine:list'",
  "ipcMain.handle('engine:get'",
  "ipcMain.handle('engine:activate'",
  "ipcMain.handle('engine:deactivate'",
  "ipcMain.handle('fs:read-dir'",
  "ipcMain.handle('fs:mkdir'",
  "ipcMain.handle('fs:exists'",
  "ipcMain.handle('fs:read-file'",
  "ipcMain.handle('fs:write-file'",
  "ipcMain.handle('fs:delete'",
  "ipcMain.handle('fs:stat'",
  "ipcMain.handle('workspace:get-root'",
  "ipcMain.handle('scan:start'",
  "ipcMain.handle('scan:stop'",
  "ipcMain.handle('findings:list'",
  "ipcMain.handle('finding:update'",
  "ipcMain.handle('report:generate'",
  "ipcMain.handle('report:export'",
];

for (const handler of requiredHandlers) {
  check(`Handler ${handler.split("'")[1]}`, mainContent.includes(handler));
}

// ============================================
// 4. PRELOAD API
// ============================================
console.log('\n🔐 4. PRELOAD API (preload.cjs)\n');

const preloadContent = fs.readFileSync(path.join(rootDir, 'src/preload.cjs'), 'utf-8');

check('API electron exposta', preloadContent.includes('exposeInMainWorld("electron"'));
check('API sitePulseCompanion exposta', preloadContent.includes('exposeInMainWorld("sitePulseCompanion"'));
check('API sitepulse exposta', preloadContent.includes('exposeInMainWorld("sitepulse"'));
check('sitepulse.ping exposto', preloadContent.includes("ping: () => ipcRenderer.invoke('app:ping')"));
check('sitepulse.engine.list exposto', preloadContent.includes("list: () => ipcRenderer.invoke('engine:list')"));
check('sitepulse.fs.readDir exposto', preloadContent.includes("readDir: (path) => ipcRenderer.invoke('fs:read-dir', path)"));
check('sitepulse.fs.readFile exposto', preloadContent.includes("readFile: (path) => ipcRenderer.invoke('fs:read-file', path)"));
check('sitepulse.fs.writeFile exposto', preloadContent.includes("writeFile: (path, content) => ipcRenderer.invoke('fs:write-file', path, content)"));

// ============================================
// 5. FRONTEND BUILD
// ============================================
console.log('\n🎨 5. FRONTEND BUILD\n');

const indexHtml = fs.readFileSync(path.join(rootDir, 'src/app/dist/index.html'), 'utf-8');
check('HTML contém div#root', indexHtml.includes('id="root"'));
check('HTML referencia JS', indexHtml.includes('<script'));
check('HTML referencia CSS', indexHtml.includes('<link'));

const assetsDir = path.join(rootDir, 'src/app/dist/assets');
const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

check(`Arquivo CSS gerado (${cssFiles.length})`, cssFiles.length > 0);
check(`Arquivo JS gerado (${jsFiles.length})`, jsFiles.length > 0);

// Verificar se Tailwind está no CSS
const cssContent = fs.readFileSync(path.join(assetsDir, cssFiles[0]), 'utf-8');
check('CSS contém classes Tailwind', cssContent.includes('--tw-'));

// ============================================
// 6. WORKSPACE SERVICE
// ============================================
console.log('\n💾 6. WORKSPACE SERVICE\n');

const workspaceService = fs.readFileSync(path.join(rootDir, 'app/src/services/workspace.ts'), 'utf-8');

check('createSite implementado', workspaceService.includes('export async function createSite'));
check('createAudit implementado', workspaceService.includes('export async function createAudit'));
check('saveFinding implementado', workspaceService.includes('export async function saveFinding'));
check('saveEngineMemory implementado', workspaceService.includes('export async function saveEngineMemory'));
check('listSites implementado', workspaceService.includes('export async function listSites'));
check('listAudits implementado', workspaceService.includes('export async function listAudits'));
check('sanitizeHostname implementado', workspaceService.includes('export function sanitizeHostname'));

// ============================================
// 7. TYPES
// ============================================
console.log('\n📐 7. TYPES\n');

const ipcTypes = fs.readFileSync(path.join(rootDir, 'app/src/types/ipc.ts'), 'utf-8');
const workspaceTypes = fs.readFileSync(path.join(rootDir, 'app/src/types/workspace.ts'), 'utf-8');

check('IPC_CHANNELS definido', ipcTypes.includes('export const IPC_CHANNELS'));
check('IpcResponse definido', ipcTypes.includes('export interface IpcResponse'));
check('SitePulseAPI definido', ipcTypes.includes('export interface SitePulseAPI'));
check('SiteMetadata definido', workspaceTypes.includes('export interface SiteMetadata'));
check('AuditMetadata definido', workspaceTypes.includes('export interface AuditMetadata'));
check('FindingData definido', workspaceTypes.includes('export interface FindingData'));
check('EngineMemory definido', workspaceTypes.includes('export interface EngineMemory'));

// ============================================
// RESUMO
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA VERIFICAÇÃO\n');
console.log(`✅ Passaram: ${passed}`);
console.log(`❌ Falharam: ${failed}`);
console.log(`📈 Taxa de sucesso: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 TODOS OS CHECKS PASSARAM!');
  console.log('O SitePulse OS está pronto para execução.\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} chec(s) falharam. Corrija antes de prosseguir.\n`);
  process.exit(1);
}
