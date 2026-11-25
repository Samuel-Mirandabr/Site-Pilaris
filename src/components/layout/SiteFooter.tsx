import Image from "next/image";
import Link from "next/link";
import type { StoreSettings } from "@/types";
import { buildGeneralMessage, buildWhatsappUrl, normalizeWhatsappNumber } from "@/lib/domain/whatsapp";
import { FacebookIcon, InstagramIcon, MailIcon, WhatsAppIcon } from "@/components/ui/Icons";

function formatPhone(n: string): string {
  const d = n.startsWith("55") ? n.slice(2) : n;
  if (n.startsWith("55") && (d.length === 10 || d.length === 11)) {
    const local = d.slice(2);
    return `(${d.slice(0, 2)}) ${local.slice(0, local.length - 4)}-${local.slice(-4)}`;
  }
  return `+${n}`;
}

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  const number = normalizeWhatsappNumber(settings.whatsappNumber);
  const wa = buildWhatsappUrl(number, buildGeneralMessage(settings.storeName));
  const social = [
    settings.instagramUrl && { href: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    settings.facebookUrl && { href: settings.facebookUrl, label: "Facebook", Icon: FacebookIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  return (
    <footer className="mt-20 border-t-2 border-navy bg-white">
      <div aria-label="Pilaris — Seja o Pilar" className="footer-ribbon">
        <div aria-hidden="true" className="footer-ribbon-track"><span>SEJA O PILAR</span><i>✦</i><span>ELEGÂNCIA COM PROPÓSITO</span><i>✦</i><span>MODA COM FÉ</span><i>✦</i><span>SEJA O PILAR</span><i>✦</i><span>ELEGÂNCIA COM PROPÓSITO</span><i>✦</i><span>MODA COM FÉ</span><i>✦</i></div>
      </div>
      <div className="container-page grid gap-10 py-14 md:grid-cols-[auto_1fr_1fr] md:gap-16">
        <div className="flex items-center gap-5">
          <Image src="/brand/logo-pilaris.png" alt={settings.storeName} width={900} height={775} className="h-24 w-auto" />
          <div>
            <p className="font-serif text-xl text-navy">{settings.storeName}</p>
            <p className="text-ink">{settings.slogan}</p>
          </div>
        </div>

        <nav aria-label="Rodapé">
          <h2 className="mb-3 font-serif text-lg">Navegue</h2>
          <ul className="space-y-1">
            {[["/", "Início"], ["/catalogo", "Catálogo"], ["/sobre", "Sobre"], ["/contato", "Contato"]].map(([href, label]) => (
              <li key={href}><Link href={href} className="inline-block py-1 hover:text-navy hover:underline">{label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 font-serif text-lg">Contato</h2>
          <ul className="space-y-2">
            {wa && number && (
              <li><a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-1 hover:text-navy hover:underline"><WhatsAppIcon /> WhatsApp {formatPhone(number)}</a></li>
            )}
            {settings.contactEmail && (
              <li><a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center gap-2 py-1 hover:text-navy hover:underline"><MailIcon /> {settings.contactEmail}</a></li>
            )}
            {settings.contactInfo && <li className="whitespace-pre-line">{settings.contactInfo}</li>}
            {!wa && !settings.contactEmail && !settings.contactInfo && <li>Os canais de contato serão divulgados em breve.</li>}
          </ul>
          {social.length > 0 && (
            <ul className="mt-4 flex gap-1">
              {social.map(({ href, label, Icon }) => (
                <li key={label}><a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (abre em nova aba)`} className="flex h-11 w-11 items-center justify-center border border-stone/50 text-navy hover:border-navy"><Icon /></a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-stone/30">
        <p className="container-page py-5 text-sm">© {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
