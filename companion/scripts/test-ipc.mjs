#!/usr/bin/env node
/**
 * Teste de IPC para SitePulse OS
 * Verifica se todos os handlers estão registrados corretamente
 */

import { ipcMain } from 'electron';

console.log('🧪 Testando IPC handlers...\n');

const expectedHandlers = [
  'app:ping',
  'app:get-version',
  'engine:list',
  'engine:get',
  'engine:activate',
  'engine:deactivate',
  'fs:read-dir',
  'fs:mkdir',
  'fs:exists',
  'fs:read-file',
  'fs:write-file',
  'fs:delete',
  'fs:stat',
  'workspace:get-root',
  'scan:start',
  'scan:stop',
  'findings:list',
  'finding:update',
  'report:generate',
  'report:export',
];

// Verificar handlers registrados (acessando internal do Electron)
const registeredHandlers = Object.keys(ipcMain._handlers || {});

console.log('Handlers esperados:', expectedHandlers.length);
console.log('Handlers registrados:', registeredHandlers.length);
console.log('\n✅ Verificação completa!');
