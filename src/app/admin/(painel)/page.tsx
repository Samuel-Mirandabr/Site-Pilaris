import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { RemoveDemoButton } from "@/components/admin/RemoveDemoButton";
import { requireAdminPage } from "@/lib/auth";
import { computeDashboardStats, getAdminProducts } from "@/lib/services/admin";
import { getStoreSettings } from "@/lib/services/public";
import { normalizeWhatsappNumber } from "@/lib/domain/whatsapp";

export const metadata: Metadata = { title: "Resumo" };

export default async function DashboardPage() {
  const { supabase } = await requireAdminPage();
  const [products, settings] = await Promise.all([getAdminProducts(supabase), getStoreSettings()]);
  const s = computeDashboardStats(products);
  const cards = [
    ["Produtos cadastrados", s.total, "/admin/produtos"],
    ["Publicados", s.published, "/admin/produtos?status=publicados"],
    ["Em rascunho", s.drafts, "/admin/produtos?status=rascunhos"],
    ["Disponíveis", s.available, "/admin/produtos?status=disponiveis"],
    ["Esgotados", s.soldOut, "/admin/estoque?somente=esgotados"],
    ["Sob encomenda", s.madeToOrder, "/admin/produtos?status=encomenda"],
  ] as const;

  const alerts: React.ReactNode[] = [];
  if (!normalizeWhatsappNumber(settings.whatsappNumber)) alerts.push(<>O número de WhatsApp ainda não foi informado. Sem ele os botões de contato ficam desativados. <Link href="/admin/configuracoes" className="underline underline-offset-4">Configurar agora</Link></>);
  if (s.total === 0) alerts.push(<>Nenhum produto cadastrado ainda. <Link href="/admin/produtos/novo" className="underline underline-offset-4">Cadastrar o primeiro produto</Link></>);

  return (
    <>
      <PageHeader title="Resumo da loja" description="Visão geral do catálogo. O site não registra vendas: toda negociação acontece pelo WhatsApp."
        actions={<Link href="/admin/produtos/novo" className="btn-primary">Novo produto</Link>} />
      {alerts.length > 0 && (
        <ul className="mb-8 space-y-2">{alerts.map((a, i) => <li key={i} role="note" className="border-l-4 border-amber bg-white px-4 py-3 text-sm ring-1 ring-stone/30">{a}</li>)}</ul>
      )}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {cards.map(([label, value, href]) => (
          <li key={label}>
            <Link href={href} className="block border border-stone/40 p-4 hover:border-navy md:p-6">
              <span className="block font-serif text-4xl text-navy md:text-5xl">{value}</span>
              <span className="mt-1 block text-sm">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {s.demo > 0 && (
        <section className="mt-10 border border-dashed border-stone p-5" aria-labelledby="demo">
          <h2 id="demo" className="text-xl">Produtos de exemplo</h2>
          <p className="mt-1 text-sm">Existem {s.demo} produtos de exemplo cadastrados, identificados com a etiqueta “Exemplo”. Remova-os antes de divulgar o site.</p>
          <RemoveDemoButton count={s.demo} />
        </section>
      )}
    </>
  );
}
