"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProduct, setProductPublished } from "@/app/admin/(painel)/produtos/actions";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

export function ProductRowActions({ id, name, published, slug }: { id: string; name: string; published: boolean; slug: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  const handle = (r: Awaited<ReturnType<typeof deleteProduct>>) => {
    if (r.ok) { notify("success", r.message ?? "Concluído."); router.refresh(); }
    else if (r.code === "session") router.replace("/admin/login?expirada=1");
    else notify("error", r.error);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/produtos/${id}`} className="btn-outline btn-sm" aria-label={`Editar ${name}`}>Editar</Link>
      {published && <Link href={`/produto/${slug}`} target="_blank" className="btn-outline btn-sm" aria-label={`Ver ${name} no site (nova aba)`}>Ver no site</Link>}
      <button type="button" className="btn-outline btn-sm" disabled={pending} aria-label={`${published ? "Retirar do catálogo" : "Publicar"}: ${name}`}
        onClick={() => start(async () => handle(await setProductPublished(id, !published)))}>{published ? "Retirar do catálogo" : "Publicar"}</button>
      <button type="button" className="btn-danger btn-sm" disabled={pending} onClick={() => setConfirm(true)} aria-label={`Excluir ${name}`}>Excluir</button>
      <ConfirmDialog open={confirm} busy={pending} title="Excluir produto?" confirmLabel="Excluir produto"
        message={<p>“{name}” e suas fotos e variações serão excluídos de forma definitiva. Para apenas escondê-lo do site, use “Retirar do catálogo”.</p>}
        onCancel={() => setConfirm(false)}
        onConfirm={() => start(async () => { const r = await deleteProduct(id); setConfirm(false); handle(r); })} />
    </div>
  );
}
