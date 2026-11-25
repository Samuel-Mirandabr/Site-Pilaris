import type { Metadata } from "next";
import { FacebookIcon, InstagramIcon, MailIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { buildGeneralMessage, buildWhatsappUrl } from "@/lib/domain/whatsapp";
import { getStoreSettings } from "@/lib/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "Contato", description: "Fale com a Pilaris pelo WhatsApp para tirar dúvidas, consultar peças ou fazer uma encomenda.", alternates: { canonical: "/contato" } };

export default async function ContactPage() {
  const s = await getStoreSettings();
  const wa = buildWhatsappUrl(s.whatsappNumber, buildGeneralMessage(s.storeName));
  const hasAny = wa || s.contactEmail || s.contactInfo || s.instagramUrl || s.facebookUrl;
  return (
    <div className="container-page max-w-3xl py-14 md:py-20">
      <h1 className="text-4xl md:text-6xl">Contato</h1>
      <p className="mt-4 text-[1.05rem]">Compras e encomendas são combinadas diretamente pelo WhatsApp. Escreva para tirar dúvidas sobre peças, tamanhos e disponibilidade.</p>

      <div className="mt-10 space-y-8">
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary gap-3 py-3 text-base"><WhatsAppIcon width={22} height={22} /> Conversar no WhatsApp <span className="sr-only">(abre em nova aba)</span></a>
        ) : (
          <p className="border border-amber/70 p-4" role="note">O número de WhatsApp ainda não foi configurado. Ele é definido no painel administrativo, em Configurações.</p>
        )}
        {(s.contactEmail || s.contactInfo) && (
          <div className="space-y-3">
            {s.contactEmail && <p className="flex items-center gap-3"><MailIcon className="text-navy" /> <a href={`mailto:${s.contactEmail}`} className="underline underline-offset-4 hover:text-navy">{s.contactEmail}</a></p>}
            {s.contactInfo && <p className="whitespace-pre-line">{s.contactInfo}</p>}
          </div>
        )}
        {(s.instagramUrl || s.facebookUrl) && (
          <div>
            <h2 className="mb-3 text-2xl">Redes sociais</h2>
            <ul className="flex flex-wrap gap-3">
              {s.instagramUrl && <li><a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 border border-stone/60 px-4 hover:border-navy"><InstagramIcon /> Instagram</a></li>}
              {s.facebookUrl && <li><a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 border border-stone/60 px-4 hover:border-navy"><FacebookIcon /> Facebook</a></li>}
            </ul>
          </div>
        )}
        {!hasAny && <p>Em breve divulgaremos os canais de atendimento.</p>}
      </div>
    </div>
  );
}
