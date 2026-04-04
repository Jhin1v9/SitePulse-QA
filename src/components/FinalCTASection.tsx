import { PlayCircle, Calendar } from 'lucide-react'

interface FinalCTASectionProps {
  onDemoClick: () => void
}

export function FinalCTASection({ onDemoClick }: FinalCTASectionProps) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-blue/10" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Tu equipo técnico merece<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            herramientas de élite
          </span>
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Deja de tratar a tus devs senior como robots de QA. Dale a tu equipo el sistema
          que hace el trabajo pesado mientras ellos se enfocan en lo que realmente importa: construir.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onDemoClick}
            className="px-8 py-4 bg-neon-blue text-cyber-black font-bold rounded-lg hover:bg-neon-blue/90 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <PlayCircle className="w-6 h-6" />
            Ver Demo en Vivo Ahora
          </button>
          <button className="px-8 py-4 border border-white/20 text-white rounded-lg hover:border-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-lg">
            <Calendar className="w-6 h-6" />
            Agendar Demo 1:1
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-6">
          Setup completo en menos de 15 minutos. No requiere tarjeta de crédito.
        </p>
      </div>
    </section>
  )
}
