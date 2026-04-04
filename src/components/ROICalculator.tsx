import { useState, useCallback } from 'react'

export function ROICalculator() {
  const [hours,  setHours]  = useState(40)
  const [rate,   setRate]   = useState(120)
  const [pages,  setPages]  = useState(10000)
  const [issues, setIssues] = useState(15)

  const monthlyCost  = hours * rate * 4
  const sitepulseCost = 2499
  const savings      = monthlyCost - sitepulseCost
  const roi          = ((savings / sitepulseCost) * 100).toFixed(0)

  return (
    <section id="roi" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-neon-blue text-sm font-mono uppercase tracking-wider mb-4 block">
            Calculadora de ROI
          </span>
          <h2 className="text-4xl font-bold mb-4">¿Cuánto estás perdiendo hoy?</h2>
          <p className="text-gray-400">
            Ajusta los parámetros y descubre tu retorno de inversión real con SitePulse QA.
          </p>
        </div>

        <div className="bg-cyber-panel rounded-2xl p-8 border border-cyber-border">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Sliders */}
            <div className="space-y-8">
              <div>
                <label className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Horas semanales en QA manual</span>
                  <span className="text-neon-blue font-mono">{hours}h</span>
                </label>
                <input
                  type="range" min={10} max={160} value={hours}
                  className="roi-slider"
                  onChange={e => setHours(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Costo hora dev senior ($)</span>
                  <span className="text-neon-blue font-mono">${rate}</span>
                </label>
                <input
                  type="range" min={50} max={300} value={rate}
                  className="roi-slider"
                  onChange={e => setRate(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Páginas en el sitio</span>
                  <span className="text-neon-blue font-mono">{pages.toLocaleString()}</span>
                </label>
                <input
                  type="range" min={1000} max={100000} step={1000} value={pages}
                  className="roi-slider"
                  onChange={e => setPages(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Issues críticos/mes (estimado)</span>
                  <span className="text-neon-blue font-mono">{issues}</span>
                </label>
                <input
                  type="range" min={5} max={100} value={issues}
                  className="roi-slider"
                  onChange={e => setIssues(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="p-6 bg-cyber-black rounded-xl border border-cyber-border">
                <div className="text-gray-400 text-sm mb-2">Costo actual mensual (QA manual)</div>
                <div className="text-4xl font-bold text-neon-red font-mono">
                  ${monthlyCost.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Solo en horas. No incluye costo de oportunidad.</div>
              </div>

              <div className="p-6 bg-cyber-black rounded-xl border border-neon-green/30">
                <div className="text-gray-400 text-sm mb-2">Inversión SitePulse QA Enterprise</div>
                <div className="text-4xl font-bold text-neon-green font-mono">$2,499</div>
                <div className="text-xs text-gray-500 mt-1">Incluye todos los motores + Self-Healing</div>
              </div>

              <div className="p-6 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl border border-neon-blue/30">
                <div className="text-gray-400 text-sm mb-2">Ahorro mensual real</div>
                <div className="text-5xl font-bold text-white font-mono">
                  ${savings.toLocaleString()}
                </div>
                <div className="text-sm text-neon-blue mt-2">
                  ROI: <span>{roi}%</span> en el primer mes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
