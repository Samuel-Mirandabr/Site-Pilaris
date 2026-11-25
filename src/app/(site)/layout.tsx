import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { getStoreSettings, isDemoMode } from "@/lib/services/public";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-4 focus:py-3 focus:text-navy">Pular para o conteúdo</a>
      {isDemoMode() && <DemoBanner />}
      <SiteHeader settings={settings} />
      <main id="conteudo">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
