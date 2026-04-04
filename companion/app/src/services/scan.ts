/**
 * SitePulse Scan Service
 * Gerencia scans de auditoria com eventos em tempo real
 */

import type {
  ScanConfig,
  ScanProgress,
  ScanResult,
  ScanEvent,
  ScanStatus,
  ScanPhase,
} from '../types/scan';
import { scanAPI } from './ipc';

// Callbacks para eventos
type EventCallback = (event: ScanEvent) => void;

class ScanService {
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private activeScans: Map<string, {
    config: ScanConfig;
    abortController: AbortController;
    startTime: string;
  }> = new Map();

  /**
   * Inicia um novo scan
   */
  async startScan(config: ScanConfig): Promise<string> {
    try {
      const response = await scanAPI.start({
        target: config.target,
        engines: Object.entries(config.engines)
          .filter(([, enabled]) => enabled)
          .map(([id]) => id),
        scope: config.scope,
      });

      if (!response.success || !response.data?.scanId) {
        throw new Error('Falha ao iniciar scan');
      }

      const scanId = response.data.scanId;
      
      this.activeScans.set(scanId, {
        config,
        abortController: new AbortController(),
        startTime: new Date().toISOString(),
      });

      // Iniciar listeners de eventos
      this.setupEventListeners(scanId);

      return scanId;
    } catch (error) {
      console.error('[ScanService] Erro ao iniciar scan:', error);
      throw error;
    }
  }

  /**
   * Para um scan em execução
   */
  async stopScan(scanId: string): Promise<void> {
    try {
      const scan = this.activeScans.get(scanId);
      if (scan) {
        scan.abortController.abort();
      }

      await scanAPI.stop(scanId);
      this.activeScans.delete(scanId);
      this.emitEvent(scanId, {
        type: 'status',
        timestamp: new Date().toISOString(),
        scanId,
        data: { status: 'cancelled', previousStatus: 'scanning' },
      });
    } catch (error) {
      console.error(`[ScanService] Erro ao parar scan ${scanId}:`, error);
      throw error;
    }
  }

  /**
   * Pausa um scan (se suportado pelo backend)
   */
  async pauseScan(scanId: string): Promise<void> {
    // TODO: Implementar quando backend suportar
    console.log('[ScanService] Pausar scan - em desenvolvimento');
  }

  /**
   * Retoma um scan pausado
   */
  async resumeScan(scanId: string): Promise<void> {
    // TODO: Implementar quando backend suportar
    console.log('[ScanService] Retomar scan - em desenvolvimento');
  }

  /**
   * Obtém progresso atual de um scan
   */
  async getProgress(scanId: string): Promise<ScanProgress | null> {
    // TODO: Implementar endpoint no backend
    console.log('[ScanService] Get progress - em desenvolvimento');
    return null;
  }

  /**
   * Obtém resultado final de um scan
   */
  async getResult(scanId: string): Promise<ScanResult | null> {
    // TODO: Implementar endpoint no backend
    console.log('[ScanService] Get result - em desenvolvimento');
    return null;
  }

  /**
   * Registra listener para eventos de um scan
   */
  onScanEvent(scanId: string, callback: EventCallback): () => void {
    if (!this.eventListeners.has(scanId)) {
      this.eventListeners.set(scanId, new Set());
    }
    
    this.eventListeners.get(scanId)!.add(callback);
    
    // Retornar função de unsubscribe
    return () => {
      this.eventListeners.get(scanId)?.delete(callback);
    };
  }

  /**
   * Registra listener para todos os scans
   */
  onAnyScanEvent(callback: EventCallback): () => void {
    const allCallback = (event: ScanEvent) => callback(event);
    
    // Adicionar a todos os scans ativos
    this.activeScans.forEach((_, scanId) => {
      this.onScanEvent(scanId, allCallback);
    });
    
    return () => {
      this.eventListeners.forEach((listeners) => {
        listeners.delete(allCallback);
      });
    };
  }

  /**
   * Verifica se um scan está ativo
   */
  isScanActive(scanId: string): boolean {
    return this.activeScans.has(scanId);
  }

  /**
   * Lista scans ativos
   */
  getActiveScans(): string[] {
    return Array.from(this.activeScans.keys());
  }

  /**
   * Configura listeners de eventos do backend
   */
  private setupEventListeners(scanId: string): void {
    // Simular eventos de progresso (para desenvolvimento)
    // Em produção, isso viria do backend via IPC
    this.simulateProgress(scanId);
  }

  /**
   * Emite evento para todos os listeners
   */
  private emitEvent(scanId: string, event: ScanEvent): void {
    const listeners = this.eventListeners.get(scanId);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('[ScanService] Erro no callback de evento:', error);
        }
      });
    }
  }

  /**
   * Simula progresso de scan (para desenvolvimento)
   * TODO: Remover quando backend tiver eventos reais
   */
  private simulateProgress(scanId: string): void {
    const phases = ['setup', 'discovery', 'analysis', 'evidence', 'processing', 'reporting'] as const;
    let currentPhase = 0;
    let progress = 0;

    const interval = setInterval(() => {
      const scan = this.activeScans.get(scanId);
      if (!scan || scan.abortController.signal.aborted) {
        clearInterval(interval);
        return;
      }

      progress += Math.random() * 15;
      
      if (progress >= 100) {
        progress = 0;
        currentPhase++;
        
        if (currentPhase >= phases.length) {
          clearInterval(interval);
          this.emitEvent(scanId, {
            type: 'complete',
            timestamp: new Date().toISOString(),
            scanId,
            data: { success: true },
          });
          return;
        }

        // Emitir mudança de fase
        this.emitEvent(scanId, {
          type: 'phase',
          timestamp: new Date().toISOString(),
          scanId,
          data: {
            phase: phases[currentPhase],
            previousPhase: phases[currentPhase - 1],
          },
        });
      }

      // Emitir progresso
      this.emitEvent(scanId, {
        type: 'progress',
        timestamp: new Date().toISOString(),
        scanId,
        data: {
          current: Math.floor(progress * 10),
          total: 1000,
          percentage: Math.min(progress, 100),
          currentUrl: `https://example.com/page-${Math.floor(progress)}`,
          currentAction: 'Analisando...',
        },
      });

      // Emitir evento de engine aleatório
      if (Math.random() > 0.7) {
        const engines = ['intent', 'evidence', 'context', 'security'];
        const randomEngine = engines[Math.floor(Math.random() * engines.length)];
        
        this.emitEvent(scanId, {
          type: 'engine',
          timestamp: new Date().toISOString(),
          scanId,
          data: {
            engineId: randomEngine,
            status: 'running',
            progress: Math.min(progress, 100),
            findings: Math.floor(Math.random() * 10),
          },
        });
      }
    }, 1000);
  }

  /**
   * Cria configuração padrão de scan
   */
  createDefaultConfig(target: string): ScanConfig {
    return {
      target,
      scope: {
        include: ['/'],
        exclude: ['/admin', '/api', '/wp-login'],
        maxDepth: 3,
        maxPages: 100,
      },
      viewports: [
        {
          name: 'Desktop',
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          isMobile: false,
        },
        {
          name: 'Mobile',
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          isMobile: true,
        },
      ],
      engines: {
        intent: true,
        context: true,
        evidence: true,
        memory: true,
        learning: true,
        decision: true,
        action: false,
        predictive: true,
        autonomous: false,
        security: true,
      },
      options: {
        headless: true,
        captureScreenshots: true,
        saveHtmlSnapshots: false,
        followRedirects: true,
        respectRobotsTxt: true,
        timeout: 30000,
        concurrency: 3,
      },
    };
  }
}

// Singleton
export const scanService = new ScanService();
export default scanService;
