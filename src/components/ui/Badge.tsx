import type { AvailabilityStatus, SaleType } from "@/types";

export function SaleTypeBadge({ saleType, className = "" }: { saleType: SaleType; className?: string }) {
  const made = saleType === "sob_encomenda";
  return (
    <span className={`sale-type-badge glass-badge inline-flex items-center gap-1.5 border bg-white px-2.5 py-1 text-[0.8rem] font-medium leading-none text-navy ${made ? "border-amber" : "border-navy/30"} ${className}`}>
      {made && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />}
      {made ? "Sob encomenda" : "Pronta entrega"}
    </span>
  );
}

export function StatusText({ status, quantity, className = "" }: { status: AvailabilityStatus; quantity?: number | null; className?: string }) {
  const map = {
    available: { label: quantity != null ? `Disponível (${quantity} ${quantity === 1 ? "unidade" : "unidades"})` : "Disponível", dot: "bg-navy" },
    sold_out: { label: "Esgotado", dot: "bg-ink/40" },
    made_to_order: { label: "Disponível sob encomenda", dot: "bg-amber" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${status === "sold_out" ? "font-medium text-ink" : "text-ink"} ${className}`}>
      <span aria-hidden className={`h-2 w-2 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

export function DemoTag() {
  return <span className="inline-block border border-dashed border-stone px-2 py-0.5 text-xs text-ink">Exemplo</span>;
}
