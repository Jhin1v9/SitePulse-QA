import { useEffect, useRef } from 'react'
import { Clock, Repeat, AlertTriangle, Users } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PAIN_POINTS = [
  {
    icon: Clock,
    title: '40 horas semanales perdidas',
    body: 'Tu equipo senior revisando logs manuales, comparando runs en Excel, buscando patterns que una IA encontraría en segundos.',
    cost: 'Costo: $4,800/mes en horas senior',
  },
  {
    icon: Repeat,
    title: 'El mismo error 47 veces',
    body: 'Sin memoria operacional, cada auditoría es Day 0. Corriges canonicals rotos en marzo, vuelven en abril, y nadie se da cuenta.',
    cost: 'Impacto: -23% tráfico orgánico',
  },
  {
    icon: AlertTriangle,
    title: 'P0 descubiertos por el cliente',
    body: 'Tu CEO recibe un email de un cliente importante: "Su checkout está roto en mobile". Too late. La auditoría semanal no sirvió.',
    cost: 'Pérdida: $50k+ en contratos',
  },
  {
    icon: Users,
    title: 'Rotación de QA técnico',
    body: 'Tus mejores devs se van porque pasan 60% de su tiempo en tareas mecánicas de auditoría en lugar de construir.',
    cost: 'Costo de reemplazo: $15k+ por dev',
  },
]

export function PainPointsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>('.pain-card')
    if (!cards) return

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="dores" className="py-24 relative" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-neon-red text-sm font-mono uppercase tracking-wider mb-4 block">
            La Realidad del QA Hoy
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Tu equipo está <span className="text-neon-red">perdiendo dinero</span>
            <br />y no lo sabe
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Las herramientas tradicionales de auditoría fueron diseñadas para 2015.
            El mercado actual exige velocidad que los humanos no pueden dar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PAIN_POINTS.map(({ icon: Icon, title, body, cost }) => (
            <div key={title} className="pain-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-neon-red/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-neon-red" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{body}</p>
              <div className="mt-4 text-neon-red font-mono text-sm">{cost}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
