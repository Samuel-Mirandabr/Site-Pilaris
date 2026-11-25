"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateStock } from "@/app/admin/(painel)/estoque/actions";
import { productAvailability, variantAvailability } from "@/lib/domain/availability";
import { normalizeText } from "@/lib/domain/format";
import type { Product } from "@/types";
import { StatusText } from "@/components/ui/Badge";
import { useToast } from "./Toast";

function Row({ label, target, id, control, quantity, simple, status, product }: {
  label: string; target: "product" | "variant"; id: string; control: string; quantity: number | null; simple: boolean | null; status: ReturnType<typeof productAvailability>["status"]; product?: Product;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, start] = useTransition();
  const [qty, setQty] = useState(String(quantity ?? 0));
  void product;

  const send = (payload: object) => start(async () => {
    const r = await updateStock({ target, id, ...payload });
    if (r.ok) { notify("success", r.message ?? "Estoque atualizado."); router.refresh(); }
    else if (r.code === "session") router.replace("/admin/login?expirada=1");
    else notify("error", r.error);
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2">
      <div><p className="font-medium text-navy">{label}</p><StatusText status={status} quantity={control === "quantity" ? quantity : null} /></div>
      {control === "quantity" && (
        <div className="flex items-end gap-2">
          <div><label className="sr-only" htmlFor={`q-${id}`}>Quantidade de {label}</label>
            <input id={`q-${id}`} className="field !w-24" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} /></div>
          <button type="button" className="btn-primary btn-sm" disabled={pending || qty === ""} onClick={() => send({ quantity: Number(qty) })}>Salvar</button>
          <button type="button" className="btn-outline btn-sm" disabled={pending} onClick={() => { setQty("0"); send({ quantity: 0 }); }} aria-label={`Marcar ${label} como esgotado`}>Esgotar</button>
        </div>
      )}
      {control === "simple" && (
        <div className="flex gap-2">
          <button type="button" className={simple ? "btn-primary btn-sm" : "btn-outline btn-sm"} disabled={pending || simple === true} aria-pressed={simple === true} onClick={() => send({ available: true })}>Disponível</button>
          <button type="button" className={!simple ? "btn-primary btn-sm" : "btn-outline btn-sm"} disabled={pending || simple === false} aria-pressed={simple === false} onClick={() => send({ available: false })}>Indisponível</button>
        </div>
      )}
    </div>
  );
}

export function StockManager({ products, onlySoldOut }: { products: Product[]; onlySoldOut: boolean }) {
  const [q, setQ] = useState("");
  const [only, setOnly] = useState(onlySoldOut);
  const ready = products.filter((p) => p.saleType === "pronta_entrega");
  const madeToOrder = products.length - ready.length;
  const list = ready.filter((p) => {
    if (q && !normalizeText(p.name).includes(normalizeText(q))) return false;
    if (!only) return true;
    return productAvailability(p).status === "sold_out" || p.variants.some((v) => variantAvailability(p, v) === "sold_out");
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1"><label htmlFor="est-q" className="label">Buscar produto</label><input id="est-q" className="field" value={q} onChange={(e) => setQ(e.target.value)} maxLength={80} /></div>
        <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-navy" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Mostrar somente esgotados</label>
      </div>
      {madeToOrder > 0 && <p className="mb-4 text-sm">{madeToOrder} {madeToOrder === 1 ? "produto sob encomenda não aparece" : "produtos sob encomenda não aparecem"} aqui porque não têm estoque.</p>}
      {list.length === 0 ? (
        <p className="border border-stone/40 p-8 text-center" role="status">{only ? "Nenhum produto esgotado." : "Nenhum produto de pronta entrega encontrado."}</p>
      ) : (
        <ul className="divide-y divide-stone/30 border-y border-stone/30">
          {list.map((p) => {
            const a = productAvailability(p);
            const perVariant = p.stockControlType === "variant";
            return (
              <li key={p.id} className="py-4">
                <div className="mb-1 flex flex-wrap items-center gap-2"><h2 className="font-serif text-xl">{p.name}</h2>{!p.published && <span className="border border-stone px-2 py-0.5 text-xs">Rascunho</span>}</div>
                {perVariant ? (
                  <div className="divide-y divide-stone/20 pl-3">
                    {p.variants.length === 0 && <p className="py-2 text-sm">Sem variações. Adicione-as na edição do produto.</p>}
                    {p.variants.map((v) => (
                      <Row key={v.id} label={`${v.name} ${v.value}${v.active ? "" : " (inativa)"}`} target="variant" id={v.id} control={v.stockControlType} quantity={v.stockQuantity} simple={v.simpleAvailability} status={variantAvailability(p, v)} />
                    ))}
                  </div>
                ) : (
                  <Row label="Estoque do produto" target="product" id={p.id} control={p.stockControlType} quantity={p.stockQuantity} simple={p.simpleAvailability} status={a.status} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
