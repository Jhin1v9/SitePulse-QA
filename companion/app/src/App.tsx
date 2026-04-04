/**
 * SitePulse OS - Web Operating System
 * Desktop environment with 10 neural engine applications
 */

import { useEffect } from 'react';
import { Desktop, WindowManager, Dock, MenuBar, Spotlight } from '@/desktop';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { useSystemStore, useDesktopStore, useEngineStore } from '@/stores';
import { ipcService } from '@/services';

function App() {
  const { updateClock } = useSystemStore();
  const { initializeIcons } = useDesktopStore();
  const { engines } = useEngineStore();

  // Initialize clock
  useEffect(() => {
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [updateClock]);

  // Initialize desktop icons from engines
  useEffect(() => {
    const engineList = Object.values(engines).map(e => ({
      id: e.id,
      name: e.name,
      color: e.color,
      icon: e.icon,
    }));
    initializeIcons(engineList);
  }, [engines, initializeIcons]);

  // Initialize IPC connection
  useEffect(() => {
    const testIPC = async () => {
      try {
        const result = await ipcService.ping();
        console.log('[SitePulse OS] ✅ IPC Connected:', result);
      } catch (err) {
        console.warn('[SitePulse OS] ⚠️ IPC not available:', err);
      }
    };
    testIPC();
  }, []);

  return (
    <div className="sitepulse-os">
      {/* Animated Background */}
      <div className="os-background">
        <div className="gradient-orb orb-purple" />
        <div className="gradient-orb orb-cyan" />
        <div className="gradient-orb orb-pink" />
        <div className="grid-overlay" />
        <div className="vignette" />
      </div>

      {/* Menu Bar */}
      <MenuBar />

      {/* Desktop Area */}
      <Desktop />

      {/* Window Layer */}
      <WindowManager />

      {/* Dock */}
      <Dock />

      {/* Spotlight (Cmd+K) */}
      <Spotlight />

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}

export default App;
