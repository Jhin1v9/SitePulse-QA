import { useCallback } from 'react'
import { ScanlinesOverlay }       from '../components/ScanlinesOverlay'
import { NeuralBackgroundCanvas } from '../components/NeuralBackgroundCanvas'
import { Navbar }                 from '../components/Navbar'
import { HeroSection }            from '../components/HeroSection'
import { PainPointsSection }      from '../components/PainPointsSection'
import { SolutionSection }        from '../components/SolutionSection'
import { ROICalculator }          from '../components/ROICalculator'
import { PricingSection }         from '../components/PricingSection'
import { FinalCTASection }        from '../components/FinalCTASection'
import { Footer }                 from '../components/Footer'

export default function Index() {
  const scrollToDemo = useCallback(() => {
    document.getElementById('demo-terminal')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const scrollToROI = useCallback(() => {
    document.getElementById('roi')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="antialiased">
      <ScanlinesOverlay />
      <NeuralBackgroundCanvas />

      <Navbar onDemoClick={scrollToDemo} />

      <HeroSection
        onScrollToDemo={scrollToDemo}
        onScrollToROI={scrollToROI}
      />

      <PainPointsSection />
      <SolutionSection />
      <ROICalculator />
      <PricingSection />

      <FinalCTASection onDemoClick={scrollToDemo} />
      <Footer />
    </div>
  )
}
