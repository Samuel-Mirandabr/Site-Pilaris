"use client";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { PRODUCT_BUCKET } from "@/lib/supabase/config";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_ORIGINAL_BYTES = 12 * 1024 * 1024; // arquivo original
const MAX_SIDE = 1600;
const MAX_OPTIMIZED_BYTES = 5 * 1024 * 1024; // limite do bucket

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return `"${file.name}": formato não suportado. Use JPG, PNG ou WebP.`;
  if (file.size > MAX_ORIGINAL_BYTES) return `"${file.name}": arquivo maior que 12 MB.`;
  return null;
}

async function optimize(file: File): Promise<{ blob: Blob; ext: "webp" | "jpg" }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.fillStyle = "#fff"; // fundo branco para PNGs transparentes
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const toBlob = (type: string, q: number) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, q));
  const webp = await toBlob("image/webp", 0.85);
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpg = await toBlob("image/jpeg", 0.88);
  if (!jpg) throw new Error("Não foi possível converter a imagem.");
  return { blob: jpg, ext: "jpg" };
}

export interface UploadedImage { path: string; previewUrl: string }

/** Redimensiona, converte para WebP e envia ao Storage com a sessão do administrador (RLS do bucket). */
export async function uploadImage(file: File, folder: "products" | "categories"): Promise<UploadedImage> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);
  const { blob, ext } = await optimize(file);
  if (blob.size > MAX_OPTIMIZED_BYTES) throw new Error(`"${file.name}": a imagem continua maior que 5 MB após otimizar.`);
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await getBrowserSupabase().storage.from(PRODUCT_BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(/jwt|token|expired|unauthor/i.test(error.message) ? "Sessão expirada. Entre novamente." : `Falha ao enviar "${file.name}": ${error.message}`);
  return { path, previewUrl: URL.createObjectURL(blob) };
}

export async function discardUploadedImage(path: string) {
  await getBrowserSupabase().storage.from(PRODUCT_BUCKET).remove([path]).catch(() => undefined);
}
