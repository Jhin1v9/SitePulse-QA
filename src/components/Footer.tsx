import { Activity, Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-cyber-border bg-cyber-black py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-neon-blue to-neon-purple rounded flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyber-black" />
              </div>
              <span className="font-bold text-white">SitePulseQA</span>
            </div>
            <p className="text-gray-500 text-sm">
              Sistemas autónomos de auditoría técnica para equipos enterprise que toman QA en serio.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Motores de IA', 'Self-Healing', 'API Docs', 'Changelog'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-neon-blue transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Recursos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Blog Técnico', 'Case Studies', 'ROI Calculator', 'Community'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-neon-blue transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>enterprise@sitepulse.qa</li>
              <li>+1 (555) QA-ELITE</li>
              <li className="flex gap-4 mt-4">
                <a href="#" className="hover:text-neon-blue transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-neon-blue transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-neon-blue transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyber-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2024 SitePulse QA. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            {['Privacidad', 'Términos', 'Seguridad'].map(item => (
              <a key={item} href="#" className="hover:text-gray-400 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
