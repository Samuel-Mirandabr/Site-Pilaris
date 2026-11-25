"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Category } from "@/types";
import { SORT_OPTIONS, catalogHref, countActiveFilters, type CatalogQuery } from "@/lib/domain/catalog";
import { FilterIcon, SearchIcon } from "@/components/ui/Icons";

interface Props {
  categories: Pick<Category, "id" | "name" | "slug">[];
  query: CatalogQuery;
  total: number;
}

/** A URL é a fonte da verdade: busca, filtros e ordenação são compartilháveis e funcionam sem JavaScript (envio do formulário). */
export function CatalogFilters({ categories, query, total }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.q);
  const [min, setMin] = useState(query.min?.toString() ?? "");
  const [max, setMax] = useState(query.max?.toString() ?? "");
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const active = countActiveFilters(query);

  useEffect(() => { setSearch(query.q); setMin(query.min?.toString() ?? ""); setMax(query.max?.toString() ?? ""); }, [query.q, query.min, query.max]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (patch: Partial<CatalogQuery>) =>
    startTransition(() => router.replace(catalogHref({ ...query, ...patch, pagina: 1 }), { scroll: false }));

  const toNum = (s: string) => (s.trim() !== "" && Number.isFinite(Number(s.replace(",", "."))) && Number(s.replace(",", ".")) >= 0 ? Number(s.replace(",", ".")) : null);
  const applyPrice = () => go({ min: toNum(min), max: toNum(max) });

  return (
    <form role="search" action="/catalogo" method="get" onSubmit={(e) => { e.preventDefault(); clearTimeout(timer.current); go({ q: search.trim(), min: toNum(min), max: toNum(max) }); }} className="catalog-filter-panel glass-surface space-y-4" aria-busy={pending}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="busca" className="label">Buscar pelo nome</label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
            <input id="busca" name="q" type="search" value={search} autoComplete="off" placeholder="Ex.: camisa, terno, gravata"
              className="field pl-10" maxLength={80}
              onChange={(e) => { const v = e.target.value; setSearch(v); clearTimeout(timer.current); timer.current = setTimeout(() => go({ q: v.trim() }), 350); }} />
          </div>
        </div>
        <div className="sm:w-56">
          <label htmlFor="ordem" className="label">Ordenar por</label>
          <select id="ordem" name="ordem" className="field" value={query.ordem} onChange={(e) => go({ ordem: e.target.value as CatalogQuery["ordem"] })}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button type="button" className="btn-outline md:hidden" aria-expanded={open} aria-controls="painel-filtros" onClick={() => setOpen((v) => !v)}>
          <FilterIcon /> Filtros{active > 0 ? ` (${active})` : ""}
        </button>
      </div>

      <div id="painel-filtros" className={`${open ? "block" : "hidden"} border border-stone/40 p-4 md:block md:border-0 md:p-0`}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.3fr)]">
          <div>
            <label htmlFor="categoria" className="label">Categoria</label>
            <select id="categoria" name="categoria" className="field" value={query.categoria} onChange={(e) => go({ categoria: e.target.value })}>
              <option value="">Todas</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="disponibilidade" className="label">Disponibilidade</label>
            <select id="disponibilidade" name="disponibilidade" className="field" value={query.disponibilidade} onChange={(e) => go({ disponibilidade: e.target.value as CatalogQuery["disponibilidade"] })}>
              <option value="">Todas</option>
              <option value="disponivel">Disponível</option>
              <option value="esgotado">Esgotado</option>
            </select>
          </div>
          <div>
            <label htmlFor="venda" className="label">Modalidade</label>
            <select id="venda" name="venda" className="field" value={query.venda} onChange={(e) => go({ venda: e.target.value as CatalogQuery["venda"] })}>
              <option value="">Todas</option>
              <option value="pronta_entrega">Pronta entrega</option>
              <option value="sob_encomenda">Sob encomenda</option>
            </select>
          </div>
          <fieldset>
            <legend className="label">Faixa de preço (R$)</legend>
            <div className="flex items-center gap-2">
              <input aria-label="Preço mínimo" name="min" inputMode="decimal" placeholder="Mín." className="field" value={min} onChange={(e) => setMin(e.target.value)} onBlur={applyPrice} />
              <span aria-hidden>–</span>
              <input aria-label="Preço máximo" name="max" inputMode="decimal" placeholder="Máx." className="field" value={max} onChange={(e) => setMax(e.target.value)} onBlur={applyPrice} />
            </div>
          </fieldset>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-ink">
          {pending ? "Atualizando…" : `${total} ${total === 1 ? "produto encontrado" : "produtos encontrados"}`}
        </p>
        <div className="flex items-center gap-3">
          <noscript><button className="btn-primary btn-sm" type="submit">Aplicar</button></noscript>
          {(active > 0 || query.q) && (
            <button type="button" className="min-h-[44px] text-sm text-navy underline underline-offset-4 hover:text-ink" onClick={() => { setSearch(""); setMin(""); setMax(""); startTransition(() => router.replace("/catalogo", { scroll: false })); }}>
              Limpar busca e filtros
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
