import { HeroSection } from '@/components/landing/HeroSection';
import { PreviewSection } from '@/components/landing/PreviewSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { ClosingSection } from '@/components/landing/ClosingSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas antialiased">
      <HeroSection />
      <PreviewSection />
      <FeaturesSection />
      <TrustSection />
      <ClosingSection />
    </main>
  );
}
