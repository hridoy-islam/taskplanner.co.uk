import { SiteHeader } from './components/site-header';
import { HeroSection } from './components/hero-section';
import { LogosSection } from './components/logos-section';
import { FeaturesSection } from './components/features-section';
import { AppPreviewSection } from './components/app-preview-section';
import { PricingSection } from './components/pricing-section';
import { SiteFooter } from './components/site-footer';
import HowItWorkSection from './components/how-it-work-section';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-white">
        <HeroSection />
        <LogosSection />
        <FeaturesSection />
        <AppPreviewSection />
        <HowItWorkSection />
        <PricingSection />
      </main>
      <SiteFooter />
    </div>
  );
}
