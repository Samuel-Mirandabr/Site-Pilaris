"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategory, saveCategory, setCategoryActive } from "@/app/admin/(painel)/categorias/actions";
import { discardUploadedImage, uploadImage } from "@/lib/admin/upload";
import { slugify } from "@/lib/domain/format";
import type { Category } from "@/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { ConfirmDialog } from "./ConfirmDialog";
import { Field } from "./Field";
import { useToast } from "./Toast";

type Cat = Category & { productCount: number };
interface Draft { id?: string; name: string; slug: string; slugTouched: boolean; description: string; active: boolean; imageUrl: string | null; newPath?: string; keepImage: boolean }
const blank: Draft = { name: "", slug: "", slugTouched: false, description: "", active: true, imageUrl: null, keepImage: true };

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Cat | null>(null);
  const [uploading, setUploading] = useState(false);

  const handle = (r: { ok: boolean; message?: string; error?: string; code?: string }, after?: () => void) => {
    if (r.ok) { notify("success", r.message ?? "Salvo."); after?.(); router.refresh(); }
    else if (r.code === "session") router.replace("/admin/login?expirada=1");
    else notify("error", r.error ?? "Erro.");
  };

  async function pickImage(file?: File) {
    if (!file || !draft) return;
    setUploading(true);
    try {
      if (draft.newPath) void discardUploadedImage(draft.newPath);
      const up = await uploadImage(file, "categories");
      setDraft((d) => d && { ...d, imageUrl: up.previewUrl, newPath: up.path, keepImage: true });
    } catch (e) { notify("error", e instanceof Error ? e.message : "Falha no envio."); }
    finally { setUploading(false); }
  }

  function cancel() { if (draft?.newPath) void discardUploadedImage(draft.newPath); setDraft(null); setErrors({}); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    start(async () => {
      const r = await saveCategory({ id: draft.id ?? null, name: draft.name, slug: draft.slug, description: draft.description, active: draft.active, imageStoragePath: draft.newPath ?? null, keepImage: draft.keepImage });
      if (!r.ok && r.fieldErrors) setErrors(r.fieldErrors);
      handle(r, () => { setDraft(null); setErrors({}); });
    });
  }

  return (
    <div className="space-y-8">
      {!draft && <button type="button" className="btn-primary" onClick={() => setDraft({ ...blank })}>Nova categoria</button>}

      {draft && (
        <form onSubmit={submit} noValidate className="max-w-2xl space-y-5 border border-navy/40 p-5" aria-labelledby="cat-form-title">
          <h2 id="cat-form-title" className="text-2xl">{draft.id ? "Editar categoria" : "Nova categoria"}</h2>
          <Field label="Nome" required error={errors.name}>{(p) => <input {...p} className="field" value={draft.name} maxLength={60} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slugTouched ? draft.slug : slugify(e.target.value) })} />}</Field>
          <Field label="Endereço (slug)" required error={errors.slug} hint="Usado nos filtros e links do catálogo.">{(p) => <input {...p} className="field" value={draft.slug} maxLength={100} onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase(), slugTouched: true })} />}</Field>
          <Field label="Descrição (opcional)" error={errors.description}>{(p) => <textarea {...p} rows={3} className="field" maxLength={300} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />}</Field>
          <div>
            <p className="label">Imagem (opcional)</p>
            <div className="flex flex-wrap items-center gap-4">
              {draft.imageUrl && draft.keepImage && <div className="relative aspect-square w-24 overflow-hidden bg-[#F1F3F5]"><ProductImage src={draft.imageUrl} alt="Imagem da categoria" sizes="96px" /></div>}
              <input id="cat-img" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => void pickImage(e.target.files?.[0])} />
              <label htmlFor="cat-img" className="btn-outline btn-sm cursor-pointer">{draft.imageUrl && draft.keepImage ? "Trocar imagem" : "Escolher imagem"}</label>
              {draft.imageUrl && draft.keepImage && <button type="button" className="btn-danger btn-sm" onClick={() => setDraft({ ...draft, imageUrl: null, keepImage: false, newPath: undefined })}>Remover imagem</button>}
              {uploading && <span role="status" className="text-sm">Enviando…</span>}
            </div>
          </div>
          <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-navy" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Categoria ativa</label>
          {!draft.active && <p className="text-sm">Categoria inativa fica oculta no site, e os produtos dela também deixam de aparecer no catálogo.</p>}
          <div className="flex gap-3"><button className="btn-primary" type="submit" disabled={pending || uploading}>{pending ? "Salvando…" : "Salvar categoria"}</button><button type="button" className="btn-outline" onClick={cancel}>Cancelar</button></div>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="border border-stone/40 p-8 text-center" role="status">Nenhuma categoria cadastrada.</p>
      ) : (
        <ul className="divide-y divide-stone/30 border-y border-stone/30">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="flex min-w-0 items-center gap-4">
                {c.imageUrl && <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[#F1F3F5]"><ProductImage src={c.imageUrl} alt="" sizes="56px" /></div>}
                <div className="min-w-0">
                  <p className="font-serif text-lg text-navy">{c.name} {!c.active && <span className="ml-1 border border-stone px-2 py-0.5 font-sans text-xs text-ink">Inativa</span>}</p>
                  <p className="text-sm">{c.productCount} {c.productCount === 1 ? "produto" : "produtos"} · /{c.slug}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline btn-sm" onClick={() => { setErrors({}); setDraft({ id: c.id, name: c.name, slug: c.slug, slugTouched: true, description: c.description ?? "", active: c.active, imageUrl: c.imageUrl, keepImage: true }); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Editar ${c.name}`}>Editar</button>
                <button type="button" className="btn-outline btn-sm" disabled={pending} onClick={() => start(async () => handle(await setCategoryActive(c.id, !c.active)))} aria-label={`${c.active ? "Desativar" : "Ativar"} ${c.name}`}>{c.active ? "Desativar" : "Ativar"}</button>
                <button type="button" className="btn-danger btn-sm" onClick={() => setToDelete(c)} aria-label={`Excluir ${c.name}`}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog open={toDelete !== null} busy={pending} title="Excluir categoria?" confirmLabel="Excluir categoria"
        message={toDelete && toDelete.productCount > 0
          ? <p>“{toDelete.name}” tem {toDelete.productCount} {toDelete.productCount === 1 ? "produto" : "produtos"} e não pode ser excluída. Mova os produtos para outra categoria ou use “Desativar”.</p>
          : <p>“{toDelete?.name}” será excluída de forma definitiva.</p>}
        onCancel={() => setToDelete(null)}
        onConfirm={() => start(async () => { const c = toDelete!; const r = await deleteCategory(c.id); setToDelete(null); handle(r); })} />
    </div>
  );
}
