import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { ProductImage } from "@/components/ui/ProductImage";
import { DemoTag, SaleTypeBadge, StatusText } from "@/components/ui/Badge";
import { primaryImage, productAvailability } from "@/lib/domain/availability";
import { formatBRL, normalizeText } from "@/lib/domain/format";
import { requireAdminPage } from "@/lib/auth";
import { getAdminProducts } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Produtos" };

const STATUS = [["", "Todos"], ["publicados", "Publicados"], ["rascunhos", "Rascunhos"], ["disponiveis", "Disponíveis"], ["esgotados", "Esgotados"], ["encomenda", "Sob encomenda"]] as const;

export default async function ProductsAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const q = normalizeText((sp.q ?? "").slice(0, 80));
  const status = STATUS.some(([v]) => v === sp.status) ? (sp.status ?? "") : "";
  const all = await getAdminProducts(supabase);
  const list = all.filter((p) => {
    if (q && !normalizeText(p.name).includes(q)) return false;
    const st = productAvailability(p).status;
    return status === "" || (status === "publicados" && p.published) || (status === "rascunhos" && !p.published) ||
      (status === "disponiveis" && st === "available") || (status === "esgotados" && st === "sold_out") || (status === "encomenda" && st === "made_to_order");
  });

  return (
    <>
      <PageHeader title="Produtos" description="Cadastre, edite, publique ou retire produtos do catálogo." actions={<Link href="/admin/produtos/novo" className="btn-primary">Novo produto</Link>} />
      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end" role="search">
        <div className="flex-1"><label htmlFor="q" className="label">Buscar pelo nome</label><input id="q" name="q" defaultValue={sp.q ?? ""} className="field" maxLength={80} /></div>
        <div className="sm:w-56"><label htmlFor="status" className="label">Situação</label>
          <select id="status" name="status" defaultValue={status} className="field">{STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <button className="btn-primary" type="submit">Filtrar</button>
      </form>

      {list.length === 0 ? (
        <div className="border border-stone/40 px-6 py-14 text-center" role="status">
          <p className="font-serif text-2xl text-navy">{all.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}</p>
          <p className="mt-2">{all.length === 0 ? "Comece cadastrando o primeiro produto da loja." : "Ajuste a busca ou a situação."}</p>
          {all.length === 0 && <Link href="/admin/produtos/novo" className="btn-primary mt-6">Cadastrar produto</Link>}
        </div>
      ) : (
        <ul className="divide-y divide-stone/30 border-y border-stone/30">
          {list.map((p) => {
            const img = primaryImage(p);
            const a = productAvailability(p);
            return (
              <li key={p.id} className="grid grid-cols-[4.5rem_1fr] gap-4 py-4 md:grid-cols-[4.5rem_1fr_auto] md:items-center">
                <div className="relative aspect-[4/5] w-[4.5rem] overflow-hidden bg-[#F1F3F5]"><ProductImage src={img?.imageUrl} alt="" sizes="72px" /></div>
                <div className="min-w-0">
                  <p className="font-serif text-lg text-navy">{p.name}</p>
                  <p className="text-sm">{p.category?.name ?? "Sem categoria"} — {formatBRL(p.price)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`border px-2 py-0.5 text-xs font-medium ${p.published ? "border-navy text-navy" : "border-stone text-ink"}`}>{p.published ? "Publicado" : "Rascunho"}</span>
                    <SaleTypeBadge saleType={p.saleType} />
                    <StatusText status={a.status} quantity={a.quantity} />
                    {p.featured && <span className="text-xs font-medium text-navy">★ Destaque</span>}
                    {p.isDemo && <DemoTag />}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1"><ProductRowActions id={p.id} name={p.name} slug={p.slug} published={p.published} /></div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
