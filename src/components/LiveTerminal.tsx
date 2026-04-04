import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'

interface LogEntry {
  text: string
  color: string
  delay: number
}

const LOGS: LogEntry[] = [
  { text: "[SYSTEM] Inicializando 9 motores de IA...",          color: "text-gray-400",             delay: 500  },
  { text: "[IMPACT] Analizando 12,847 páginas...",              color: "text-neon-blue",             delay: 800  },
  { text: "[PREDICTIVE] Detectando patrones históricos...",     color: "text-neon-purple",           delay: 600  },
  { text: "[AUDIT] 47 issues encontrados",                      color: "text-gray-400",             delay: 400  },
  { text: "[PRIORITY] Clasificando severidad...",               color: "text-neon-amber",            delay: 500  },
  { text: "[P0] SEO_CANONICAL_MISSING — 23 páginas",            color: "text-neon-red",             delay: 300  },
  { text: "[P1] PERF_LCP_SLOW — 156 páginas",                   color: "text-neon-amber",            delay: 300  },
  { text: "[P2] A11Y_ALT_MISSING — 89 páginas",                 color: "text-neon-blue",             delay: 300  },
  { text: "[HEALING] Buscando estrategias validadas...",        color: "text-neon-green",            delay: 700  },
  { text: "[MEMORY] 3 soluciones previas encontradas",          color: "text-gray-400",             delay: 400  },
  { text: "[STRATEGY] Seleccionada: canonical_injection_v2",    color: "text-neon-green",            delay: 500  },
  { text: "[CONFIDENCE] 94.7% — Aprobado para auto-healing",    color: "text-neon-green",            delay: 600  },
  { text: "[ACTION] Generando prompts de corrección...",        color: "text-neon-blue",             delay: 800  },
  { text: "[DONE] 23/23 issues resueltos",                      color: "text-neon-green font-bold",  delay: 1000 },
  { text: "[VALIDATION] Programado para run #2848",             color: "text-gray-400",             delay: 500  },
  { text: "[LEARNING] Actualizando memoria operacional...",     color: "text-neon-purple",           delay: 600  },
  { text: "[COMPLETE] Auditoría finalizada en 4.2s",            color: "text-white font-bold",       delay: 400  },
]

export interface LiveTerminalHandle {
  restart: () => void
}

export const LiveTerminal = forwardRef<LiveTerminalHandle>((_, ref) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const indexRef   = useRef(0)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    const content = contentRef.current
    if (!content) return

    content.innerHTML =
      '<div class="text-gray-500">$ sitepulse init --target https://demo-enterprise.com --mode=autonomous</div>'
    indexRef.current = 0

    if (timerRef.current) clearTimeout(timerRef.current)

    function addLog() {
      if (!contentRef.current) return
      if (indexRef.current >= LOGS.length) {
        indexRef.current = 0
        timerRef.current = setTimeout(start, 3000)
        return
      }

      const log = LOGS[indexRef.current]
      const div = document.createElement('div')
      div.className = `log-entry ${log.color} mt-1`
      div.textContent = log.text
      contentRef.current.appendChild(div)
      contentRef.current.scrollTop = contentRef.current.scrollHeight
      indexRef.current++
      timerRef.current = setTimeout(addLog, log.delay)
    }

    addLog()
  }, [])

  useImperativeHandle(ref, () => ({ restart: start }), [start])

  useEffect(() => {
    const id = setTimeout(start, 1000)
    return () => {
      clearTimeout(id)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [start])

  return (
    <div className="live-terminal rounded-lg p-6 shadow-2xl" id="demo-terminal">
      <div className="flex items-center justify-between mb-4 border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-500 font-mono">sitepulse-engine — enterprise</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-green rounded-full status-pulse" />
          <span className="text-xs text-neon-green font-mono">LIVE</span>
        </div>
      </div>
      <div
        ref={contentRef}
        className="font-mono text-sm space-y-1 h-80 overflow-hidden"
      >
        <div className="text-gray-500">$ sitepulse init --target https://demo-enterprise.com --mode=autonomous</div>
        <div className="text-gray-400 mt-4">[SYSTEM] Inicializando motores de IA...</div>
      </div>
    </div>
  )
})

LiveTerminal.displayName = 'LiveTerminal'
