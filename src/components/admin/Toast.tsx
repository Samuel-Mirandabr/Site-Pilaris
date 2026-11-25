"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Kind = "success" | "error";
interface ToastItem { id: number; kind: Kind; text: string }
const Ctx = createContext<{ notify: (kind: Kind, text: string) => void }>({ notify: () => undefined });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const notify = useCallback((kind: Kind, text: string) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l.slice(-2), { id, kind, text }]);
    setTimeout(() => setItems((l) => l.filter((i) => i.id !== id)), kind === "error" ? 8000 : 4000);
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex max-w-md items-start gap-3 border-l-4 bg-white px-4 py-3 shadow-md ring-1 ring-stone/30 ${t.kind === "error" ? "border-amber" : "border-navy"}`}>
            <p className="text-sm text-ink"><strong className="font-semibold text-navy">{t.kind === "error" ? "Erro. " : "Pronto. "}</strong>{t.text}</p>
            <button type="button" className="-my-1 -mr-2 h-8 w-8 shrink-0 text-ink" aria-label="Fechar aviso" onClick={() => setItems((l) => l.filter((i) => i.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
