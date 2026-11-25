/** Mantém apenas dígitos; números brasileiros sem DDI (10–11 dígitos) recebem 55. */
export function normalizeWhatsappNumber(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 12 && digits.length <= 15 ? digits : null;
}

export interface WhatsappSelection {
  name: string;
  value: string;
}

export function buildProductMessage(opts: {
  productName: string;
  storeName?: string;
  selections?: WhatsappSelection[];
  productUrl?: string | null;
}): string {
  const store = opts.storeName?.trim() || "Pilaris";
  let msg = `Olá! Tenho interesse no produto ${opts.productName}, anunciado no site da ${store}.`;
  const sel = (opts.selections ?? []).filter((s) => s.value);
  if (sel.length) msg += ` Variação: ${sel.map((s) => `${s.name} ${s.value}`).join(", ")}.`;
  msg += " Gostaria de obter mais informações.";
  if (opts.productUrl) msg += `\n\n${opts.productUrl}`;
  return msg;
}

export function buildGeneralMessage(storeName?: string): string {
  return `Olá! Vim pelo site da ${storeName?.trim() || "Pilaris"} e gostaria de mais informações.`;
}

export function buildWhatsappUrl(number: string | null | undefined, message: string): string | null {
  const n = normalizeWhatsappNumber(number);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}
