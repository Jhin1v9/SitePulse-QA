import { Check, X, ShieldCheck } from 'lucide-react'

function FeatureRow({ text, included = true }: { text: string; included?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-sm ${!included ? 'text-gray-600' : ''}`}>
      {included
        ? <Check className="w-4 h-4 text-neon-green flex-shrink-0" />
        : <X className="w-4 h-4 flex-shrink-0" />
      }
      <span className={included ? 'text-gray-300' : ''}>{text}</span>
    </div>
  )
}

export function PricingSection() {
  return (
    <section id="precos" className="py-24 bg-cyber-dark relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-neon-purple text-sm font-mono uppercase tracking-wider mb-4 block">
            Inversión
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Precios basados en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
              valor, no en features
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            No cobramos por "número de scans". Cobramos por resultados medibles: horas ahorradas,
            issues prevenidos y tiempo de recuperación de incidentes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Professional */}
          <div className="pricing-card rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <p className="text-gray-400 text-sm">Para equipos que quieren dejar de perder tiempo</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$899</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <div className="text-sm text-neon-green mt-2">ROI típico: 340%</div>
            </div>
            <div className="space-y-4 mb-8">
              <FeatureRow text="50,000 páginas/mes" />
              <FeatureRow text="5 motores de IA core" />
              <FeatureRow text="Memoria operacional básica" />
              <FeatureRow text="Priorización P0-P4" />
              <FeatureRow text="Self-Healing Engine" included={false} />
              <FeatureRow text="API completa" included={false} />
            </div>
            <button className="w-full py-3 border border-white/20 text-white rounded-lg hover:border-neon-blue hover:text-neon-blue transition-all font-medium">
              Comenzar Trial 14 días
            </button>
          </div>

          {/* Enterprise — Featured */}
          <div className="pricing-featured rounded-2xl p-8 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-neon-blue text-cyber-black text-xs font-bold rounded-full">
                RECOMENDADO
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 text-sm">Para organizaciones que necesitan autonomía real</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$2,499</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <div className="text-sm text-neon-green mt-2">ROI típico: 780%</div>
            </div>
            <div className="space-y-4 mb-8">
              <FeatureRow text="250,000 páginas/mes" />
              <FeatureRow text="9 motores de IA completos" />
              <FeatureRow text="Self-Healing Engine" />
              <FeatureRow text="Memoria operacional avanzada" />
              <FeatureRow text="API completa + Webhooks" />
              <FeatureRow text="Onboarding técnico dedicado" />
            </div>
            <button className="w-full py-3 bg-neon-blue text-cyber-black font-bold rounded-lg hover:bg-neon-blue/90 transition-all">
              Agendar Demo Técnica
            </button>
          </div>

          {/* Organization */}
          <div className="pricing-card rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Organization</h3>
              <p className="text-gray-400 text-sm">Para multinacionales con necesidades específicas</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">Custom</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">Desde $8,000/mes</div>
            </div>
            <div className="space-y-4 mb-8">
              <FeatureRow text="Páginas ilimitadas" />
              <FeatureRow text="Self-hosted opcional" />
              <FeatureRow text="SLA 99.9% garantizado" />
              <FeatureRow text="Ingeniero de éxito dedicado" />
              <FeatureRow text="Custom integrations" />
              <FeatureRow text="Training para equipos" />
            </div>
            <button className="w-full py-3 border border-white/20 text-white rounded-lg hover:border-neon-purple hover:text-neon-purple transition-all font-medium">
              Contactar Ventas
            </button>
          </div>
        </div>

        {/* Guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-cyber-panel border border-cyber-border">
            <ShieldCheck className="w-5 h-5 text-neon-green" />
            <span className="text-gray-300 text-sm">
              Garantía de 90 días: Si no ves ROI positivo, te devolvemos el 100%
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
