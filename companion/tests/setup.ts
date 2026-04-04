/**
 * Setup de Testes - Jest
 * SitePulse Studio v3.0
 */

// Mock do console para testes limpos
global.console = {
  ...console,
  // Desabilitar logs em testes
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Manter errors
  error: console.error,
};

// Setup de timers
jest.useFakeTimers({ legacyFakeTimers: false });

// Cleanup após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
