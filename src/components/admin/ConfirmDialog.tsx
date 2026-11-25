"use client";
import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmação antes de operações destrutivas (usa <dialog> nativo: foco preso e Esc fecha). */
export function ConfirmDialog({ open, title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onCancel(); }} onClick={(e) => e.target === ref.current && onCancel()}
      aria-labelledby="confirm-title" className="w-[min(92vw,28rem)] border border-stone/50 bg-white p-0 text-ink backdrop:bg-ink/50">
      <div className="p-6">
        <h2 id="confirm-title" className="text-2xl">{title}</h2>
        <div className="mt-3">{message}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="btn-outline btn-sm" onClick={onCancel} disabled={busy} autoFocus>Cancelar</button>
          <button type="button" className="btn-primary btn-sm" onClick={onConfirm} disabled={busy}>{busy ? "Aguarde…" : confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
