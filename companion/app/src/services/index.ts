/**
 * SitePulse OS - Services
 * API wrappers for IPC, Python bridge, and external services
 */

export { default as ipcService } from './ipc';
export * from './ipc';

export { default as workspaceService } from './workspace';
export * from './workspace';

export { default as engineService } from './engines';
export * from './engines';

export { default as scanService } from './scan';
export * from './scan';

export { default as findingsService } from './findings';
export * from './findings';

export { default as reportService } from './report';
export * from './report';
