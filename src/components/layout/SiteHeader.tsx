"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreSettings } from "@/types";
import { buildGeneralMessage, buildWhatsappUrl } from "@/lib/domain/whatsapp";
import { HeaderNav } from "./HeaderNav";

export function SiteHeader({ settings }: { settings: StoreSettings }) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const update = () => setCompact(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const whatsappHref = buildWhatsappUrl(settings.whatsappNumber, buildGeneralMessage(settings.storeName));
  return (
    <header className={"site-header glass-header sticky top-0 z-20 border-b bg-white transition-[box-shadow,border-color] duration-200 " + (compact ? "site-header-compact border-navy/25" : "border-stone/20")}>
      <div className="container-page flex h-[76px] items-center justify-between gap-6 md:h-[84px]">
        <Link href="/" aria-label={settings.storeName + " — página inicial"} className="site-logo shrink-0">
          <Image src="/brand/logo-pilaris.png" alt={settings.storeName + " — " + settings.slogan} width={900} height={775} priority
            className="h-[58px] w-auto md:h-[68px]" />
        </Link>
        <HeaderNav whatsappHref={whatsappHref} />
      </div>
    </header>
  );
}

