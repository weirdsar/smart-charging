import ComparisonBar from '@/components/comparison/ComparisonBar';
import CookieConsent from '@/components/layout/CookieConsent';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { organizationSchema } from '@/lib/seo';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieConsent />
      <ComparisonBar />
    </>
  );
}
