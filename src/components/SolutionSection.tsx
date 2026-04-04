import { Brain, Database, Zap, ArrowDown, CheckCircle } from 'lucide-react'

export function SolutionSection() {
  return (
    <section id="solucao" className="py-24 bg-cyber-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left */}
          <div>
            <span className="text-neon-green text-sm font-mono uppercase tracking-wider mb-4 block">
              La Solución
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Memoria operacional +<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
                Self-Healing real
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              SitePulse QA no es un scanner. Es un{' '}
              <strong>sistema autónomo</strong> que opera 24/7, aprende de cada ejecución y
              corrige issues sin intervención humana.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-cyber-panel border border-cyber-border">
                <div className="w-10 h-10 rounded bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-neon-blue" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">9 Motores de IA Especializados</h4>
                  <p className="text-gray-400 text-sm">
                    Impact Engine, Predictive Intelligence, Autonomous QA, Self-Healing, Data Intelligence,
                    Optimization Engine, Quality Control, Learning Memory y más.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-cyber-panel border border-cyber-border">
                <div className="w-10 h-10 rounded bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Persistencia de Conocimiento</h4>
                  <p className="text-gray-400 text-sm">
                    El sistema recuerda qué soluciones funcionaron, cuáles fallaron y por qué. Nunca repites errores.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-cyber-panel border border-cyber-border">
                <div className="w-10 h-10 rounded bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Ciclo Detecta-Cura-Valida</h4>
                  <p className="text-gray-400 text-sm">
                    Encuentra el problema, genera la solución, aplica el fix y valida automáticamente en el próximo run.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Healing engine demo */}
          <div className="relative">
            <div className="bg-cyber-panel rounded-xl p-6 border border-cyber-border">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-mono text-gray-400">healing-engine-demo.js</span>
                <span className="px-2 py-1 bg-neon-green/10 text-neon-green text-xs rounded font-mono">ACTIVE</span>
              </div>

              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center justify-between p-3 bg-cyber-black rounded border-l-2 border-neon-red">
                  <div>
                    <div className="text-white">SEO_CANONICAL_MISSING</div>
                    <div className="text-gray-500 text-xs">47 páginas afectadas</div>
                  </div>
                  <span className="text-neon-red text-xs">P0 CRITICAL</span>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-xs my-2">
                  <ArrowDown className="w-4 h-4" />
                  <span>Análisis de estrategia...</span>
                </div>

                <div className="p-3 bg-cyber-black rounded border border-neon-blue/30">
                  <div className="text-neon-blue text-xs mb-2">STRATEGY SELECTED:</div>
                  <div className="text-white text-sm">canonical_dynamic_injection</div>
                  <div className="text-gray-500 text-xs mt-1">Confianza: 94.3% | Modo: prompt_assisted</div>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-xs my-2">
                  <ArrowDown className="w-4 h-4" />
                  <span>Ejecutando curación...</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-cyber-black rounded border-l-2 border-neon-green">
                  <div>
                    <div className="text-white">Estado: RESOLVED</div>
                    <div className="text-gray-500 text-xs">Validado en run #2847</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                </div>

                <div className="mt-4 p-3 bg-neon-green/5 rounded border border-neon-green/20">
                  <div className="text-neon-green text-xs font-semibold mb-1">APRENDIZAJE GUARDADO</div>
                  <div className="text-gray-400 text-xs">
                    Esta estrategia ahora tiene prioridad para issues similares en el mismo contexto.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
