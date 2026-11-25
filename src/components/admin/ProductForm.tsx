"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct } from "@/app/admin/(painel)/produtos/actions";
import { formatBRL, parsePriceInput, slugify } from "@/lib/domain/format";
import type { Product } from "@/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { Field } from "./Field";
import { ProductImagesEditor, type ImgState } from "./ProductImagesEditor";
import { useToast } from "./Toast";

interface VarState { key: string; id?: string; name: string; value: string; stockControlType: "quantity" | "simple" | "none"; stockQuantity: string; simpleAvailability: boolean; active: boolean }
type Cat = { id: string; name: string; active: boolean };

const uid = () => crypto.randomUUID();

export function ProductForm({ product, categories }: { product?: Product; categories: Cat[] }) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, start] = useTransition();

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories.find((c) => c.active)?.id ?? "");
  const [price, setPrice] = useState(product ? product.price.toFixed(2).replace(".", ",") : "");
  const [saleType, setSaleType] = useState<"pronta_entrega" | "sob_encomenda">(product?.saleType ?? "pronta_entrega");
  const [control, setControl] = useState<"quantity" | "simple" | "variant">(product && product.stockControlType !== "none" ? product.stockControlType : "quantity");
  const [qty, setQty] = useState(String(product?.stockQuantity ?? 1));
  const [available, setAvailable] = useState(product?.simpleAvailability ?? true);
  const [published, setPublished] = useState(product?.published ?? false);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [variants, setVariants] = useState<VarState[]>((product?.variants ?? []).map((v) => ({
    key: uid(), id: v.id, name: v.name, value: v.value, stockControlType: v.stockControlType === "none" ? "quantity" : v.stockControlType,
    stockQuantity: String(v.stockQuantity ?? 0), simpleAvailability: v.simpleAvailability ?? true, active: v.active,
  })));
  const [images, setImages] = useState<ImgState[]>((product?.images ?? []).map((i) => ({ key: i.id, id: i.id, url: i.imageUrl, altText: i.altText ?? "", isPrimary: i.isPrimary })));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bulkName, setBulkName] = useState("");
  const [bulkValues, setBulkValues] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);

  const perVariant = saleType === "pronta_entrega" && control === "variant";
  const uploading = images.some((i) => i.uploading);

  function addBulk() {
    const n = bulkName.trim();
    const vals = [...new Set(bulkValues.split(",").map((v) => v.trim()).filter(Boolean))];
    if (!n || vals.length === 0) { notify("error", "Informe o tipo (ex.: Tamanho) e as opções separadas por vírgula (ex.: P, M, G)."); return; }
    const existing = new Set(variants.map((v) => `${v.name.toLowerCase()}|${v.value.toLowerCase()}`));
    const add = vals.filter((v) => !existing.has(`${n.toLowerCase()}|${v.toLowerCase()}`)).map((value): VarState => ({ key: uid(), name: n, value, stockControlType: "quantity", stockQuantity: "0", simpleAvailability: true, active: true }));
    setVariants((l) => [...l, ...add]);
    setBulkValues("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = parsePriceInput(price);
    if (Number.isNaN(priceNum)) { setErrors({ price: "Informe um preço válido, como 289,90." }); return; }
    if (uploading) { notify("error", "Aguarde o envio das fotos terminar."); return; }
    const toNum = (s: string) => (s.trim() === "" ? null : Number(s));
    const payload = {
      id: product?.id ?? null, name, slug, description, price: priceNum, categoryId, saleType,
      stockControlType: saleType === "sob_encomenda" ? "none" : control,
      stockQuantity: control === "quantity" ? toNum(qty) : null, simpleAvailability: control === "simple" ? available : null,
      published, featured,
      variants: variants.map((v) => ({
        id: v.id ?? null, name: v.name, value: v.value, stockControlType: v.stockControlType,
        stockQuantity: v.stockControlType === "quantity" ? toNum(v.stockQuantity) : null,
        simpleAvailability: v.stockControlType === "simple" ? v.simpleAvailability : null, active: v.active,
      })),
      images: images.map((i) => ({ id: i.id ?? null, storagePath: i.storagePath ?? null, altText: i.altText, isPrimary: i.isPrimary })),
    };
    start(async () => {
      const r = await saveProduct(payload);
      if (r.ok) {
        setErrors({});
        notify("success", r.message ?? "Salvo.");
        if (!product) router.replace(`/admin/produtos/${r.data?.id}`);
        else router.refresh();
      } else if (r.code === "session") {
        router.replace("/admin/login?expirada=1");
      } else {
        setErrors(r.fieldErrors ?? {});
        notify("error", r.error);
        setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50);
      }
    });
  }

  const sect = "space-y-5 border-t border-stone/25 pt-7";
  const err = (k: string) => errors[k];

  return (
    <form onSubmit={submit} noValidate className="admin-product-editor w-full max-w-none space-y-8">
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="border-l-4 border-amber bg-white px-4 py-3 text-sm font-medium ring-1 ring-stone/30">Há campos com problema. Revise as mensagens abaixo de cada campo.</p>
      )}

      <div className="admin-product-editor-grid">
        <aside className="admin-product-media-column" aria-label="Fotos do produto">
      <section aria-labelledby="s-fotos" className="admin-product-photo-card glass-surface space-y-5 p-5 sm:p-6">
        <h2 id="s-fotos" className="text-2xl">Fotos</h2>
        <span id="fotos-secao" tabIndex={-1} />
        <ProductImagesEditor images={images} onChange={setImages} onError={(m) => notify("error", m)} error={err("images")} />
      </section>

        </aside>
        <div className="admin-product-editor-fields glass-surface">
      <section aria-labelledby="s-info" className="admin-product-info space-y-5">
        <h2 id="s-info" className="text-2xl">Informações</h2>
        <Field label="Nome do produto" required error={err("name")}>
          {(p) => <input {...p} className="field" value={name} maxLength={120} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />}
        </Field>
        <Field label="Endereço do produto (slug)" required error={err("slug")} hint={`Aparece na URL: /produto/${slug || "nome-do-produto"}. Use letras minúsculas, números e hifens.`}>
          {(p) => <input {...p} className="field" value={slug} maxLength={100} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase()); }} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Categoria" required error={err("categoryId")}>
            {(p) => (
              <select {...p} className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}{c.active ? "" : " (inativa)"}</option>)}
              </select>
            )}
          </Field>
          <Field label="Preço (R$)" required error={err("price")} hint={price && !Number.isNaN(parsePriceInput(price)) ? `Será exibido como ${formatBRL(parsePriceInput(price))}` : undefined}>
            {(p) => <input {...p} className="field" inputMode="decimal" placeholder="289,90" value={price} onChange={(e) => setPrice(e.target.value)} />}
          </Field>
        </div>
        <Field label="Descrição" error={err("description")}>
          {(p) => <textarea {...p} rows={5} className="field" maxLength={4000} value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />}
        </Field>
      </section>

      <section aria-labelledby="s-venda" className={sect}>
        <h2 id="s-venda" className="text-2xl">Venda e estoque</h2>
        <fieldset>
          <legend className="label">Modalidade de venda</legend>
          <div className="flex flex-wrap gap-3">
            {([["pronta_entrega", "Pronta entrega"], ["sob_encomenda", "Sob encomenda"]] as const).map(([v, l]) => (
              <label key={v} className={`flex min-h-[44px] cursor-pointer items-center gap-2 border px-4 ${saleType === v ? "border-navy bg-navy text-white" : "border-stone/60"}`}>
                <input type="radio" name="saleType" value={v} checked={saleType === v} onChange={() => setSaleType(v)} className="accent-amber" /> {l}
              </label>
            ))}
          </div>
        </fieldset>

        {saleType === "sob_encomenda" ? (
          <p className="text-sm">Produtos sob encomenda não têm controle de estoque. O site mostrará “Sob encomenda” e direcionará o visitante ao WhatsApp.</p>
        ) : (
          <>
            <Field label="Como controlar o estoque" error={err("stockControlType")}>
              {(p) => (
                <select {...p} className="field sm:max-w-sm" value={control} onChange={(e) => setControl(e.target.value as typeof control)}>
                  <option value="quantity">Por quantidade</option>
                  <option value="simple">Simples (disponível ou indisponível)</option>
                  <option value="variant">Por variação (ex.: cada tamanho)</option>
                </select>
              )}
            </Field>
            {control === "quantity" && (
              <Field label="Quantidade disponível" error={err("stockQuantity")} hint="Zero significa esgotado. O estoque é atualizado manualmente por você.">
                {(p) => <input {...p} className="field sm:max-w-[10rem]" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />}
              </Field>
            )}
            {control === "simple" && (
              <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-navy" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Produto disponível para pronta entrega</label>
            )}
            {control === "variant" && <p className="text-sm">O estoque será informado em cada variação (abaixo). O estoque do produto principal não é usado.</p>}
          </>
        )}
      </section>

      <section aria-labelledby="s-var" className={sect}>
        <h2 id="s-var" className="text-2xl">Variações <span className="text-base font-normal">(opcional)</span></h2>
        <p className="text-sm">Use para tamanho, cor ou modelo. O visitante escolhe a opção antes de chamar no WhatsApp.{perVariant && " Com estoque por variação, use um único tipo (ex.: só Tamanho)."}</p>
        {err("variants") && <p role="alert" className="error-text">{err("variants")}</p>}
        <div className="grid gap-3 border border-stone/40 p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <div><label htmlFor="bulk-name" className="label">Tipo</label><input id="bulk-name" className="field" placeholder="Tamanho" value={bulkName} maxLength={40} onChange={(e) => setBulkName(e.target.value)} /></div>
          <div><label htmlFor="bulk-values" className="label">Opções (separadas por vírgula)</label><input id="bulk-values" className="field" placeholder="P, M, G, GG" value={bulkValues} onChange={(e) => setBulkValues(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBulk(); } }} /></div>
          <button type="button" className="btn-outline" onClick={addBulk}>Adicionar</button>
        </div>
        <span id="variacoes" tabIndex={-1} />
        {variants.length > 0 && (
          <ul className="space-y-3">
            {variants.map((v, i) => {
              const set = (patch: Partial<VarState>) => setVariants((l) => l.map((x) => (x.key === v.key ? { ...x, ...patch } : x)));
              return (
                <li key={v.key} className="grid gap-3 border border-stone/40 p-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Field label="Tipo" error={err(`variants.${i}.name`)}>{(p) => <input {...p} className="field" value={v.name} maxLength={40} onChange={(e) => set({ name: e.target.value })} />}</Field>
                  <Field label="Opção" error={err(`variants.${i}.value`)}>{(p) => <input {...p} className="field" value={v.value} maxLength={60} onChange={(e) => set({ value: e.target.value })} />}</Field>
                  <div className="flex items-end gap-3">
                    <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5 accent-navy" checked={v.active} onChange={(e) => set({ active: e.target.checked })} /> Ativa</label>
                    <button type="button" className="btn-danger btn-sm" onClick={() => setVariants((l) => l.filter((x) => x.key !== v.key))} aria-label={`Remover variação ${v.name} ${v.value}`}>Remover</button>
                  </div>
                  {perVariant && (
                    <div className="grid gap-3 sm:col-span-3 sm:grid-cols-[12rem_1fr]">
                      <Field label="Estoque desta opção" error={err(`variants.${i}.stockControlType`)}>
                        {(p) => <select {...p} className="field" value={v.stockControlType} onChange={(e) => set({ stockControlType: e.target.value as VarState["stockControlType"] })}><option value="quantity">Por quantidade</option><option value="simple">Disponível/indisponível</option></select>}
                      </Field>
                      {v.stockControlType === "quantity" ? (
                        <Field label="Quantidade" error={err(`variants.${i}.stockQuantity`)}>{(p) => <input {...p} className="field sm:max-w-[10rem]" inputMode="numeric" value={v.stockQuantity} onChange={(e) => set({ stockQuantity: e.target.value.replace(/\D/g, "") })} />}</Field>
                      ) : (
                        <label className="flex min-h-[44px] items-center gap-3 self-end"><input type="checkbox" className="h-5 w-5 accent-navy" checked={v.simpleAvailability} onChange={(e) => set({ simpleAvailability: e.target.checked })} /> Disponível</label>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="s-pub" className={sect}>
        <h2 id="s-pub" className="text-2xl">Publicação</h2>
        <label className="flex min-h-[44px] items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5 accent-navy" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <span><strong>Publicar no catálogo</strong><br /><span className="text-sm">Desmarcado, o produto fica como rascunho e não aparece no site. Exige ao menos uma foto.</span></span></label>
        <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-navy" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Destacar na página inicial</label>
      </section>

        </div>
      </div>

      <div className="admin-product-savebar sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-stone/40 bg-white px-4 py-4 sm:mx-0 sm:px-0">
        <button type="submit" className="btn-primary" disabled={pending || uploading}>{pending ? "Salvando…" : uploading ? "Enviando fotos…" : product ? "Salvar alterações" : "Cadastrar produto"}</button>
        <button type="button" className="btn-outline" onClick={() => setConfirmLeave(true)}>Voltar à lista</button>
        {product?.published && <Link href={`/produto/${product.slug}`} target="_blank" className="text-sm text-navy underline underline-offset-4">Ver no site</Link>}
      </div>
      <ConfirmDialog open={confirmLeave} title="Sair sem salvar?" confirmLabel="Sair sem salvar" message={<p>Alterações que não foram salvas serão perdidas.</p>} onCancel={() => setConfirmLeave(false)} onConfirm={() => router.push("/admin/produtos")} />
    </form>
  );
}
