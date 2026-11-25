"use client";
import { useRef, useState } from "react";
import { discardUploadedImage, uploadImage, validateImageFile } from "@/lib/admin/upload";
import { ProductImage } from "@/components/ui/ProductImage";

export interface ImgState {
  key: string;
  id?: string;
  url: string;
  storagePath?: string;
  altText: string;
  isPrimary: boolean;
  uploading?: boolean;
}

interface Props {
  images: ImgState[];
  onChange: (next: ImgState[]) => void;
  onError: (message: string) => void;
  max?: number;
  error?: string;
}

export function ProductImagesEditor({ images, onChange, onError, max = 12, error }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [framingWarning, setFramingWarning] = useState(false);
  const primary = images.find((image) => image.isPrimary) ?? images[0];
  // Cópia mutável para que uploads simultâneos não sobrescrevam o estado uns dos outros.
  const latest = useRef(images);
  latest.current = images;
  const commit = (next: ImgState[]) => { latest.current = next; onChange(next); };

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = [...files].slice(0, Math.max(0, max - latest.current.length));
    if (files.length > list.length) onError(`Limite de ${max} fotos por produto.`);
    for (const file of list) {
      const invalid = validateImageFile(file);
      if (invalid) { onError(invalid); continue; }
      try {
        const bitmap = await createImageBitmap(file);
        if (Math.abs(bitmap.width / bitmap.height - 0.8) > 0.08) setFramingWarning(true);
        bitmap.close();
      } catch { /* O envio segue normalmente se o navegador não puder ler as dimensões. */ }
      const key = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      commit([...latest.current, { key, url: preview, altText: "", isPrimary: latest.current.length === 0, uploading: true }]);
      setBusy((b) => b + 1);
      try {
        const up = await uploadImage(file, "products");
        commit(latest.current.map((i) => (i.key === key ? { ...i, url: up.previewUrl, storagePath: up.path, uploading: false } : i)));
      } catch (e) {
        onError(e instanceof Error ? e.message : "Falha no envio da imagem.");
        const rest = latest.current.filter((i) => i.key !== key);
        if (rest.length && !rest.some((i) => i.isPrimary)) rest[0] = { ...rest[0], isPrimary: true };
        commit(rest);
      } finally { setBusy((b) => b - 1); }
    }
    if (input.current) input.current.value = "";
  }

  const move = (i: number, d: -1 | 1) => {
    const next = [...images]; const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (img: ImgState) => {
    if (img.storagePath && !img.id) void discardUploadedImage(img.storagePath); // enviada e ainda não salva
    const rest = images.filter((i) => i.key !== img.key);
    if (rest.length && !rest.some((i) => i.isPrimary)) rest[0] = { ...rest[0], isPrimary: true };
    onChange(rest);
  };

  return (
    <div>
      <div className="admin-product-preview">
        <div className="admin-product-preview-stage relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white/75">
          {primary ? (
            <ProductImage src={primary.url} alt={primary.altText || "Foto principal do produto"} sizes="(min-width:1280px) 38vw, (min-width:768px) 44vw, 100vw" className="object-contain p-[8%]" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-ink/70">
              <span className="font-serif text-5xl text-navy/70">P</span>
              <p className="text-sm">A foto principal aparecerá aqui.</p>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <ul className="admin-product-thumbs mt-3 flex gap-3 overflow-x-auto pb-1" aria-label="Escolha a foto principal">
            {images.map((image, index) => (
              <li key={image.key} className="shrink-0">
                <button type="button" aria-label={"Selecionar foto " + (index + 1) + " como principal"} aria-pressed={image.isPrimary}
                  onClick={() => onChange(images.map((item) => ({ ...item, isPrimary: item.key === image.key })))}
                  className={"admin-product-thumb relative block h-20 w-16 overflow-hidden rounded-lg border-2 bg-white/70 sm:h-24 sm:w-20 " + (image.isPrimary ? "is-primary" : "")}>
                  <ProductImage src={image.url} alt="" sizes="80px" className="object-contain p-[7%]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input ref={input} id="fotos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => void addFiles(e.target.files)} />
        <label htmlFor="fotos" className="btn-outline btn-sm cursor-pointer focus-within:outline">Adicionar fotos</label>
        <p className="text-sm">JPG, PNG ou WebP, até 12 MB cada. As fotos são otimizadas automaticamente (WebP, até 1600 px).</p>
      </div>
      <p className="mt-2 text-sm text-ink">Prefira fotos verticais 4:5 (ideal: 1600 × 2000 px), produto centralizado e fundo claro. O painel não bloqueia outros formatos.</p>
      {busy > 0 && <p role="status" className="mt-2 text-sm">Enviando {busy} {busy === 1 ? "foto" : "fotos"}…</p>}
      {framingWarning && <p role="note" className="mt-2 border-l-2 border-amber px-3 py-2 text-sm text-ink">Uma foto enviada foge do formato 4:5. Ela será mostrada inteira, mas uma imagem 4:5 com margem livre terá melhor equilíbrio visual.</p>}
      {error && <p role="alert" className="error-text">{error}</p>}
      {images.length === 0 ? (
        <p className="mt-4 border border-dashed border-stone/60 p-6 text-center text-sm">Nenhuma foto ainda. A primeira foto adicionada será a principal.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {images.map((img, i) => (
            <li key={img.key} className="grid grid-cols-[6rem_1fr] gap-3 border border-stone/40 p-3">
              <div className="relative aspect-[4/5] w-24 overflow-hidden bg-[#F1F3F5]">
                <ProductImage src={img.url} alt={img.altText || `Foto ${i + 1}`} sizes="96px" />
                {img.uploading && <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-xs">Enviando…</span>}
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-navy">{img.isPrimary ? "★ Foto principal" : `Foto ${i + 1}`}</p>
                <label className="sr-only" htmlFor={`alt-${img.key}`}>Texto alternativo da foto {i + 1}</label>
                <input id={`alt-${img.key}`} className="field !min-h-[40px] text-sm" placeholder="Descrição da foto (acessibilidade)" maxLength={200} value={img.altText}
                  onChange={(e) => onChange(images.map((x) => (x.key === img.key ? { ...x, altText: e.target.value } : x)))} />
                <div className="flex flex-wrap gap-1.5">
                  {!img.isPrimary && <button type="button" className="btn-outline btn-sm !px-3" disabled={img.uploading} onClick={() => onChange(images.map((x) => ({ ...x, isPrimary: x.key === img.key })))}>Tornar principal</button>}
                  <button type="button" className="btn-outline btn-sm !px-3" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Mover foto ${i + 1} para antes`}>↑</button>
                  <button type="button" className="btn-outline btn-sm !px-3" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label={`Mover foto ${i + 1} para depois`}>↓</button>
                  <button type="button" className="btn-danger btn-sm !px-3" disabled={img.uploading} onClick={() => remove(img)}>Remover</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
