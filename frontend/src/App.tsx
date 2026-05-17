import { CustomCursor } from './components/CustomCursor';
import AnalysisFlow from './pages/AnalysisFlow';
import { FinalCta } from './sections/FinalCta';
import { ForClients } from './sections/ForClients';
import { ForLawyers } from './sections/ForLawyers';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { Nav } from './sections/Nav';
import { Problem } from './sections/Problem';
import { Testimonials } from './sections/Testimonials';
import { WhyLexLens } from './sections/WhyLexLens';

function App() {
  const isAnalysisRoute = window.location.pathname === '/analyze' || window.location.pathname.startsWith('/analysis');

  if (isAnalysisRoute) {
    return (
      <div className="grain min-h-screen bg-obsidian text-parchment">
        <CustomCursor />
        <AnalysisFlow />
      </div>
    );
  }

  return (
    <div className="grain min-h-screen bg-obsidian text-parchment">
      <CustomCursor />
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <WhyLexLens />
        <ForLawyers />
        <ForClients />
        <Testimonials />
      </main>
      <FinalCta />
    </div>
  );
}

export default App;
