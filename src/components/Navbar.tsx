import { Activity } from 'lucide-react'

interface NavbarProps {
  onDemoClick: () => void
}

export function Navbar({ onDemoClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-cyber-black/80 backdrop-blur-xl border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyber-black" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            SitePulse<span className="text-neon-blue">QA</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#demo" className="text-sm text-gray-400 hover:text-white transition-colors">Demo en Vivo</a>
          <a href="#dores" className="text-sm text-gray-400 hover:text-white transition-colors">Problemas</a>
          <a href="#solucao" className="text-sm text-gray-400 hover:text-white transition-colors">Solución</a>
          <a href="#roi" className="text-sm text-gray-400 hover:text-white transition-colors">ROI</a>
          <a href="#precos" className="text-sm text-gray-400 hover:text-white transition-colors">Precios</a>
        </div>

        <button
          onClick={onDemoClick}
          className="px-4 py-2 bg-neon-blue/10 border border-neon-blue text-neon-blue rounded text-sm font-medium hover:bg-neon-blue/20 transition-all flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-neon-blue rounded-full status-pulse" />
          Demo Interactiva
        </button>
      </div>
    </nav>
  )
}
