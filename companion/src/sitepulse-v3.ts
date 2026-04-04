// SitePulse V3 — Complete Module Bundle
// Entry point for the V3 architecture

// Core
export * from './core/index.js';

// Providers
export * from './providers/index.js';

// Components
export * from './components/index.js';

// Security
export * from './security/index.js';

// Memory
export * from './memory/index.js';

// Version
export const VERSION = '3.0.0';

// Initialization helper
import { getSystemFSM } from './core/system-state-machine.js';
import { getAIConsciousness, type AIConsciousnessContext } from './core/ai-consciousness-machine.js';
import { getProviderRegistry } from './providers/provider-registry.js';
import { getKnowledgeGraph } from './memory/knowledge-graph.js';
import { eventBus } from './core/event-bus.js';

export interface V3Config {
  openaiApiKey?: string;
  deepseekApiKey?: string;
  defaultProvider?: 'openai' | 'deepseek';
}

export function initializeV3(config: V3Config = {}): {
  fsm: ReturnType<typeof getSystemFSM>;
  ai: ReturnType<typeof getAIConsciousness>;
  registry: ReturnType<typeof getProviderRegistry>;
  knowledge: ReturnType<typeof getKnowledgeGraph>;
  events: typeof eventBus;
} {
  // Initialize core systems
  const fsm = getSystemFSM();
  const aiContext: AIConsciousnessContext = {
    cognitiveLoad: 0,
    currentFocus: [],
    threatLevel: 'none',
    hasFindings: false,
    healingInProgress: false,
    lastUserInteraction: Date.now()
  };
  const ai = getAIConsciousness(aiContext);
  
  const registry = getProviderRegistry();
  const knowledge = getKnowledgeGraph();

  // Register AI providers if keys provided
  if (config.openaiApiKey) {
    const { OpenAIAdapter } = require('./providers/openai-adapter.js');
    registry.registerProvider(new OpenAIAdapter({ apiKey: config.openaiApiKey }));
  }

  if (config.deepseekApiKey) {
    const { DeepSeekAdapter } = require('./providers/deepseek-adapter.js');
    registry.registerProvider(new DeepSeekAdapter({ apiKey: config.deepseekApiKey }));
  }

  // Set default provider preference in router
  if (config.defaultProvider) {
    registry.router.setDefault(config.defaultProvider);
  }

  console.info('[SitePulse V3] Initialized successfully');
  console.info(`[SitePulse V3] Version: ${VERSION}`);

  return { fsm, ai, registry, knowledge, events: eventBus };
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).SitePulseV3 = {
    initialize: initializeV3,
    VERSION
  };
}
