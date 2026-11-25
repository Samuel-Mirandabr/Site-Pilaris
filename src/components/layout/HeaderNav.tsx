"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "@/components/ui/Icons";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

interface Props {
  whatsappHref: string | null;
}

export function HeaderNav({ whatsappHref }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const wa = whatsappHref ?? "/contato";
  const external = Boolean(whatsappHref);

  return (
    <>
      <nav aria-label="Navegação principal" className="hidden md:block">
        <ul className="flex items-center gap-9">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}
                className={`inline-block border-b py-1 text-[0.95rem] tracking-wide transition-colors hover:border-amber ${isActive(l.href) ? "border-amber text-navy" : "border-transparent text-ink"}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        <a href={wa} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="whatsapp-cta glass-control btn-outline btn-sm hidden gap-2 whitespace-nowrap leading-none md:inline-flex" aria-label={external ? "Falar pelo WhatsApp (abre em nova aba)" : "Ir para a página de contato"}>
          <WhatsAppIcon /> WhatsApp
        </a>
        <a href={wa} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flex h-11 w-11 items-center justify-center text-navy md:hidden" aria-label={external ? "Falar pelo WhatsApp (abre em nova aba)" : "Ir para a página de contato"}>
          <WhatsAppIcon width={24} height={24} />
        </a>
        <button type="button" className="flex h-11 w-11 items-center justify-center text-navy md:hidden" aria-expanded={open} aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <CloseIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Menu" className="glass-surface absolute inset-x-0 top-full z-30 border-b border-stone/40 md:hidden">
          <ul className="container-page py-2">
            {LINKS.map((l) => (
              <li key={l.href} className="border-b border-stone/20 last:border-0">
                <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}
                  className={`flex min-h-[52px] items-center font-serif text-xl ${isActive(l.href) ? "text-navy" : "text-ink"}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
