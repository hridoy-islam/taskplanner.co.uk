import { SiteHeader } from './components/site-header';
import { HeroSection } from './components/hero-section';
import { LogosSection } from './components/logos-section';
import { FeaturesSection } from './components/features-section';
import { AppPreviewSection } from './components/app-preview-section';
import { PricingSection } from './components/pricing-section';


export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* <SiteHeader /> */}
      {/* <Header /> */}
      <main className="flex-1 bg-white">
        <HeroSection />
        <LogosSection />
        <FeaturesSection id="features" />
        <AppPreviewSection />
        {/* <HowItWorkSection id="how-it-works" /> */}
        <PricingSection id="pricing" />
      </main>
      {/* <SiteFooter /> */}
    </div>
  );
}
