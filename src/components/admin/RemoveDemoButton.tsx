"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeDemoProducts } from "@/app/admin/(painel)/produtos/actions";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

export function RemoveDemoButton({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const { notify } = useToast();
  const router = useRouter();
  return (
    <>
      <button type="button" className="btn-danger btn-sm mt-3" onClick={() => setOpen(true)}>Remover produtos de exemplo</button>
      <ConfirmDialog open={open} busy={pending} title="Remover produtos de exemplo?" confirmLabel="Remover"
        message={<p>Serão excluídos {count} produtos marcados como exemplo. Os seus produtos reais não são afetados.</p>}
        onCancel={() => setOpen(false)}
        onConfirm={() => start(async () => {
          const r = await removeDemoProducts();
          setOpen(false);
          if (r.ok) { notify("success", r.message ?? "Removidos."); router.refresh(); }
          else if (r.code === "session") router.replace("/admin/login?expirada=1");
          else notify("error", r.error);
        })} />
    </>
  );
}
