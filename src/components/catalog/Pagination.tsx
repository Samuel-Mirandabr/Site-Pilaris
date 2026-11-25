import Link from "next/link";
import { catalogHref, type CatalogQuery } from "@/lib/domain/catalog";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";

function pageList(page: number, total: number): (number | "…")[] {
  const set = new Set([1, total, page, page - 1, page + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => { if (i > 0 && n - sorted[i - 1] > 1) out.push("…"); out.push(n); });
  return out;
}

export function Pagination({ query, page, totalPages }: { query: CatalogQuery; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => catalogHref({ ...query, pagina: n });
  const item = "flex h-11 min-w-11 items-center justify-center border px-3 text-[0.95rem]";
  return (
    <nav aria-label="Paginação" className="mt-14">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? <Link href={href(page - 1)} rel="prev" aria-label="Página anterior" className={`${item} border-stone/50 text-navy hover:border-navy`}><ChevronLeft /></Link>
            : <span aria-hidden className={`${item} border-stone/20 text-stone/50`}><ChevronLeft /></span>}
        </li>
        {pageList(page, totalPages).map((n, i) => (
          <li key={`${n}-${i}`}>
            {n === "…" ? <span className="px-1">…</span> : (
              <Link href={href(n)} aria-label={`Página ${n}`} aria-current={n === page ? "page" : undefined}
                className={`${item} ${n === page ? "border-navy bg-navy text-white" : "border-stone/50 text-navy hover:border-navy"}`}>{n}</Link>
            )}
          </li>
        ))}
        <li>
          {page < totalPages ? <Link href={href(page + 1)} rel="next" aria-label="Próxima página" className={`${item} border-stone/50 text-navy hover:border-navy`}><ChevronRight /></Link>
            : <span aria-hidden className={`${item} border-stone/20 text-stone/50`}><ChevronRight /></span>}
        </li>
      </ul>
    </nav>
  );
}
