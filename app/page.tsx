import { SiteHeader } from '@/components/site-header';
import { DynamicScene } from '@/components/canvas/DynamicScene';
import { PortfolioPage } from '@/components/portfolio-page';
import { SmoothScroller } from '@/components/smooth-scroller';

export default function HomePage() {
  return (
    <SmoothScroller>
      <main className="relative min-h-screen w-full bg-background">
        <SiteHeader />
        
        {/* Fixed 3D Background - Calmed down for Vercel/Linear minimalism */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40 blur-[1px]">
          <DynamicScene />
        </div>

        {/* Native Scrolling Content */}
        <div className="relative z-10">
          <PortfolioPage />
        </div>
      </main>
    </SmoothScroller>
  );
}
