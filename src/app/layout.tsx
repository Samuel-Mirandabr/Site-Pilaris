import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda";
import "@fontsource-variable/jost";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Pilaris — Seja o Pilar", template: "%s | Pilaris" },
  description: "Pilaris: moda executiva e cristã. Roupas e acessórios com elegância e propósito.",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Pilaris", title: "Pilaris — Seja o Pilar", description: "Moda executiva e cristã. Roupas e acessórios com elegância e propósito." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#1A365D", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
