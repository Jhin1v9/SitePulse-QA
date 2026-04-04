/**
 * Audit Store - Zustand
 * Gerencia estado de auditoria com integração real via IPC
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuditState, Finding, EngineId, Severity, ScanStatus } from '@/types/os';
import type { ScanProgress, ScanPhase } from '@/types/scan';
import { scanService } from '@/services/scan';

interface AuditStore extends AuditState {
  // Scan state
  scanId: string | null;
  scanPhase: ScanPhase | null;
  engineProgress: Record<string, {
    status: 'waiting' | 'running' | 'completed' | 'error';
    progress: number;
    findings: number;
  }>;
  
  // Actions
  setTarget: (target: string, targetType: 'url' | 'folder') => void;
  toggleEngine: (engineId: EngineId) => void;
  setSelectedEngines: (engines: EngineId[]) => void;
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  pauseScan: () => void;
  resumeScan: () => void;
  updateProgress: (progress: number) => void;
  updateScanPhase: (phase: ScanPhase) => void;
  updateEngineProgress: (engineId: string, progress: number, findings: number) => void;
  addLog: (message: string) => void;
  addFinding: (finding: Omit<Finding, 'id' | 'timestamp'>) => void;
  clearFindings: () => void;
  completeScan: () => void;
  reset: () => void;
  getFindingsBySeverity: (severity: Severity) => Finding[];
  getCriticalCount: () => number;
  getHighCount: () => number;
  getMediumCount: () => number;
  getLowCount: () => number;
}

const defaultEngines: EngineId[] = ['intent', 'context', 'evidence', 'security'];

const initialState: Omit<AuditState, 'getFindingsBySeverity' | 'getCriticalCount' | 'getHighCount' | 'getMediumCount' | 'getLowCount'> & {
  scanId: string | null;
  scanPhase: ScanPhase | null;
  engineProgress: Record<string, any>;
} = {
  status: 'idle',
  selectedEngines: defaultEngines,
  progress: 0,
  findings: [],
  logs: [],
  estimatedTime: 240,
  scanId: null,
  scanPhase: null,
  engineProgress: {},
};

export const useAuditStore = create<AuditStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setTarget: (target: string, targetType: 'url' | 'folder') => {
        set({ target, targetType });
      },

      toggleEngine: (engineId: EngineId) => {
        const { selectedEngines } = get();
        if (selectedEngines.includes(engineId)) {
          set({ selectedEngines: selectedEngines.filter(e => e !== engineId) });
        } else {
          set({ selectedEngines: [...selectedEngines, engineId] });
        }
      },

      setSelectedEngines: (engines: EngineId[]) => {
        set({ selectedEngines: engines });
      },

      startScan: async () => {
        const { target, selectedEngines } = get();
        
        if (!target) {
          console.error('[AuditStore] Target não definido');
          return;
        }

        try {
          // Criar configuração do scan
          const config = scanService.createDefaultConfig(target);
          config.engines = {
            intent: selectedEngines.includes('intent'),
            context: selectedEngines.includes('context'),
            evidence: selectedEngines.includes('evidence'),
            memory: selectedEngines.includes('memory'),
            learning: selectedEngines.includes('learning'),
            decision: selectedEngines.includes('decision'),
            action: selectedEngines.includes('action'),
            predictive: selectedEngines.includes('predictive'),
            autonomous: selectedEngines.includes('autonomous'),
            security: selectedEngines.includes('security'),
          };

          // Iniciar scan via serviço
          const scanId = await scanService.startScan(config);

          set({
            scanId,
            status: 'scanning',
            progress: 0,
            findings: [],
            logs: [`[${new Date().toLocaleTimeString()}] Iniciando auditoria de segurança...`, `[${new Date().toLocaleTimeString()}] Target: ${target}`],
            startTime: new Date(),
            scanPhase: 'setup',
            engineProgress: {},
          });

          // Registrar listener de eventos
          scanService.onScanEvent(scanId, (event) => {
            const { addLog, updateProgress, updateScanPhase, updateEngineProgress, completeScan } = get();

            switch (event.type) {
              case 'progress':
                const progressData = event.data as { percentage: number; currentAction?: string };
                updateProgress(progressData.percentage);
                if (progressData.currentAction) {
                  addLog(progressData.currentAction);
                }
                break;

              case 'phase':
                const phaseData = event.data as { phase: ScanPhase };
                updateScanPhase(phaseData.phase);
                addLog(`Fase: ${phaseData.phase}`);
                break;

              case 'engine':
                const engineData = event.data as { engineId: string; progress: number; findings: number; status: string };
                updateEngineProgress(engineData.engineId, engineData.progress, engineData.findings);
                break;

              case 'error':
                const errorData = event.data as { message: string; severity: string };
                addLog(`Erro [${errorData.severity}]: ${errorData.message}`);
                break;

              case 'complete':
                addLog('Auditoria concluída!');
                completeScan();
                break;
            }
          });
        } catch (error) {
          console.error('[AuditStore] Erro ao iniciar scan:', error);
          set({
            status: 'idle',
            logs: [`[${new Date().toLocaleTimeString()}] Erro ao iniciar: ${error}`],
          });
        }
      },

      stopScan: async () => {
        const { scanId } = get();
        if (scanId) {
          await scanService.stopScan(scanId);
        }
        set({ status: 'idle', scanId: null, scanPhase: null });
      },

      pauseScan: () => {
        const { scanId } = get();
        if (scanId) {
          scanService.pauseScan(scanId);
        }
        set({ status: 'idle' });
      },

      resumeScan: () => {
        const { scanId } = get();
        if (scanId) {
          scanService.resumeScan(scanId);
        }
        set({ status: 'scanning' });
      },

      updateProgress: (progress: number) => {
        set({ progress });
      },

      updateScanPhase: (phase: ScanPhase) => {
        set({ scanPhase: phase });
      },

      updateEngineProgress: (engineId: string, progress: number, findings: number) => {
        set(state => ({
          engineProgress: {
            ...state.engineProgress,
            [engineId]: {
              ...state.engineProgress[engineId],
              progress,
              findings,
              status: progress >= 100 ? 'completed' : 'running',
            },
          },
        }));
      },

      addLog: (message: string) => {
        set(state => ({
          logs: [...state.logs.slice(-99), `[${new Date().toLocaleTimeString()}] ${message}`],
        }));
      },

      addFinding: (finding: Omit<Finding, 'id' | 'timestamp'>) => {
        const newFinding: Finding = {
          ...finding,
          id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };
        set(state => ({ findings: [...state.findings, newFinding] }));
      },

      clearFindings: () => {
        set({ findings: [] });
      },

      completeScan: () => {
        set({ 
          status: 'completed', 
          progress: 100,
          endTime: new Date(),
        });
      },

      reset: () => {
        const { scanId } = get();
        if (scanId) {
          scanService.stopScan(scanId);
        }
        set({ ...initialState });
      },

      getFindingsBySeverity: (severity: Severity) => {
        return get().findings.filter(f => f.severity === severity);
      },

      getCriticalCount: () => {
        return get().findings.filter(f => f.severity === 'critical').length;
      },

      getHighCount: () => {
        return get().findings.filter(f => f.severity === 'high').length;
      },

      getMediumCount: () => {
        return get().findings.filter(f => f.severity === 'medium').length;
      },

      getLowCount: () => {
        return get().findings.filter(f => f.severity === 'low').length;
      },
    }),
    { name: 'AuditStore' }
  )
);

export default useAuditStore;
