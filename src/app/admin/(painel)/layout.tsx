import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Painel", template: "%s | Painel Pilaris" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdminPage(); // verificação no servidor, além do middleware
  return <AdminShell email={user.email ?? "Administrador"}>{children}</AdminShell>;
}
