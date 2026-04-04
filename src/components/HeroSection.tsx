import { useRef, useEffect } from 'react'
import { Play, Calculator } from 'lucide-react'
import { LiveTerminal, LiveTerminalHandle } from './LiveTerminal'

interface HeroSectionProps {
  onScrollToDemo: () => void
  onScrollToROI: () => void
}

function animateValue(
  el: HTMLElement,
  end: number,
  duration: number,
  suffix = ''
) {
  const range = end
  const minTimer = 50
  let stepTime = Math.max(Math.abs(Math.floor(duration / range)), minTimer)
  const startTime = Date.now()
  const endTime = startTime + duration

  const timer = setInterval(() => {
    const remaining = Math.max((endTime - Date.now()) / duration, 0)
    const value = Math.round(end - remaining * range)
    el.innerHTML = value.toLocaleString() + suffix
    if (value === end) clearInterval(timer)
  }, stepTime)
}

export function HeroSection({ onScrollToDemo, onScrollToROI }: HeroSectionProps) {
  const terminalRef = useRef<LiveTerminalHandle>(null)
  const statsAnimated = useRef(false)

  useEffect(() => {
    if (statsAnimated.current) return
    statsAnimated.current = true

    const id = setTimeout(() => {
      const hours   = document.getElementById('stat-hours')
      const accuracy = document.getElementById('stat-accuracy')
      const issues  = document.getElementById('stat-issues')
      if (hours)    animateValue(hours,   320,  2000)
      if (accuracy) animateValue(accuracy, 98,  2000, '%')
      if (issues)   animateValue(issues, 1547,  2000)
    }, 500)

    return () => clearTimeout(id)
  }, [])

  function handleDemoClick() {
    terminalRef.current?.restart()
    onScrollToDemo()
  }

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-mono mb-6">
            <span className="status-pulse w-1.5 h-1.5 bg-neon-blue rounded-full" />
            Sistema Autónomo v3.0
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 glitch"
            data-text="Deja de auditar."
          >
            Deja de auditar.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
              Empieza a curar.
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl">
            SitePulse QA es el primer sistema de{' '}
            <strong>auditoría técnica con memoria operacional</strong>. No escanea una vez y
            olvida. Aprende, cura y valida automáticamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={handleDemoClick}
              className="px-8 py-4 bg-neon-blue text-cyber-black font-bold rounded hover:bg-neon-blue/90 transition-all flex items-center justify-center gap-2 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Ver Demo en Vivo
            </button>
            <button
              onClick={onScrollToROI}
              className="px-8 py-4 border border-white/20 text-white rounded hover:border-neon-blue hover:text-neon-blue transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calcular ROI
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-cyber-border">
            <div>
              <div id="stat-hours" className="text-3xl font-bold text-white font-mono">0</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Horas ahorradas/mes</div>
            </div>
            <div>
              <div id="stat-accuracy" className="text-3xl font-bold text-white font-mono">0</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">% Precisión validada</div>
            </div>
            <div>
              <div id="stat-issues" className="text-3xl font-bold text-white font-mono">0</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Issues auto-curados</div>
            </div>
          </div>
        </div>

        <LiveTerminal ref={terminalRef} />
      </div>
    </section>
  )
}
