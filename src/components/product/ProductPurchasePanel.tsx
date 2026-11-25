"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types";
import { activeVariants, productAvailability, variantAvailability, variantGroups } from "@/lib/domain/availability";
import { buildProductMessage, buildWhatsappUrl } from "@/lib/domain/whatsapp";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { StatusText } from "@/components/ui/Badge";

interface Props {
  product: Product;
  storeName: string;
  whatsappNumber: string | null;
  productUrl: string;
}

export function ProductPurchasePanel({ product, storeName, whatsappNumber, productUrl }: Props) {
  const variants = useMemo(() => activeVariants(product), [product]);
  const groups = useMemo(() => variantGroups(variants), [variants]);
  const [selected, setSelected] = useState<Record<string, string>>({}); // grupo -> id da variação
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const perVariantStock = product.stockControlType === "variant" && product.saleType === "pronta_entrega";

  const selectedVariants = groups.map((g) => g.options.find((o) => o.id === selected[g.name])).filter(Boolean) as typeof variants;
  const overall = productAvailability(product);

  // Com estoque por variação, a disponibilidade exibida é a da opção escolhida.
  const chosen = perVariantStock ? selectedVariants[0] : undefined;
  const chosenStatus = chosen ? variantAvailability(product, chosen) : null;
  const status = chosenStatus ?? overall.status;
  const quantity = chosen?.stockControlType === "quantity" ? chosen.stockQuantity : chosen ? null : overall.quantity;

  const message = buildProductMessage({
    productName: product.name,
    storeName,
    selections: selectedVariants.map((v) => ({ name: v.name, value: v.value })),
    productUrl,
  });
  const href = buildWhatsappUrl(whatsappNumber, message);
  const soldOut = status === "sold_out";
  const ctaLabel = product.saleType === "sob_encomenda" ? "Encomendar pelo WhatsApp" : soldOut ? "Consultar reposição pelo WhatsApp" : "Falar no WhatsApp";

  useEffect(() => {
    const target = ctaRef.current;
    if (!target || !href) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyCta(!entry.isIntersecting), { threshold: 0.1 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [href]);

  return (
    <div className="purchase-panel glass-surface space-y-6">
      {groups.map((g) => (
        <fieldset key={g.name}>
          <legend className="label">{g.name}{selected[g.name] ? <span className="font-normal">: {g.options.find((o) => o.id === selected[g.name])?.value}</span> : null}</legend>
          <div className="flex flex-wrap gap-2">
            {g.options.map((o) => {
              const st = variantAvailability(product, o);
              const out = st === "sold_out";
              const checked = selected[g.name] === o.id;
              return (
                <label key={o.id} className={"variant-option relative flex min-h-[46px] min-w-[54px] cursor-pointer items-center justify-center gap-2 border px-4 text-[0.95rem] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber " + (checked ? "is-selected " : "") + (out && perVariantStock ? "is-disabled" : "")}>
                  <input type="radio" name={`var-${g.name}`} value={o.id} checked={checked} disabled={out && perVariantStock} className="sr-only"
                    onChange={() => setSelected((s) => ({ ...s, [g.name]: o.id }))} />
                  <span className="variant-option-value">{o.value}</span>
                  {checked && <span aria-hidden className="variant-option-check">✓</span>}
                  {out && perVariantStock && <span className="sr-only"> (esgotado)</span>}
                </label>
              );
            })}
          </div>
          {selected[g.name] && (
            <button type="button" className="mt-2 min-h-[36px] text-sm text-navy underline underline-offset-4" onClick={() => setSelected((s) => { const n = { ...s }; delete n[g.name]; return n; })}>
              Limpar escolha
            </button>
          )}
        </fieldset>
      ))}

      <div key={selectedVariants.map((variant) => variant.id).join(":")} aria-live="polite" className={"availability-panel glass-inset space-y-1 " + (selectedVariants.length ? "has-selection" : "")}>
        <p className="label !mb-0">Disponibilidade</p>
        <StatusText status={status} quantity={status === "available" ? quantity : null} />
        {chosen && soldOut && <p className="text-sm text-ink">A opção {chosen.name} {chosen.value} está esgotada.</p>}
        {product.saleType === "sob_encomenda" && <p className="text-sm text-ink">Este produto não é de pronta entrega. Prazo e condições são combinados pelo WhatsApp.</p>}
        {groups.length > 0 && selectedVariants.length < groups.length && (
          <p className="text-sm text-ink">Escolha {groups.length > 1 ? "as opções" : "uma opção"} para incluir na mensagem.</p>
        )}
      </div>

      <div ref={ctaRef} className="product-main-cta">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="btn-primary w-full gap-3 py-3 text-base sm:w-auto">
            <WhatsAppIcon width={22} height={22} /> {ctaLabel} <span className="sr-only">(abre em nova aba)</span>
          </a>
        ) : (
          <>
            <button type="button" disabled className="btn-primary w-full gap-3 py-3 text-base sm:w-auto"><WhatsAppIcon width={22} height={22} /> {ctaLabel}</button>
            <p className="mt-2 text-sm text-ink">O número de WhatsApp da loja ainda não foi configurado.</p>
          </>
        )}
        <p className="mt-3 text-sm text-ink">Não há compra pelo site: a negociação acontece diretamente pelo WhatsApp.</p>
      </div>
      {href && <div className={"product-sticky-cta " + (showStickyCta ? "is-visible" : "")}>
        <a href={href} target="_blank" rel="noopener noreferrer" className="btn-primary w-full gap-2">
          <WhatsAppIcon width={20} height={20} /> {ctaLabel}
        </a>
      </div>}
    </div>
  );
}
