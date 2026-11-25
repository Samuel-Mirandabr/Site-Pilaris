import { z } from "zod";

/** Sanitização: remove caracteres de controle, normaliza quebras de linha e apara espaços. */
export function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, "")
    .trim();
}

/** Texto de uma linha: também colapsa espaços e quebras. */
export function cleanLine(value: string): string {
  return cleanText(value).replace(/\s+/g, " ");
}

export const line = (min: number, max: number, label: string) =>
  z
    .string({ message: `${label} é obrigatório.` })
    .transform(cleanLine)
    .pipe(
      z
        .string()
        .min(min, { message: min <= 1 ? `${label} é obrigatório.` : `${label} deve ter ao menos ${min} caracteres.` })
        .max(max, { message: `${label} deve ter no máximo ${max} caracteres.` }),
    );

export const optionalLine = (max: number, label: string) =>
  z
    .string()
    .nullish()
    .transform((v) => (v ? cleanLine(v) : ""))
    .pipe(z.string().max(max, { message: `${label} deve ter no máximo ${max} caracteres.` }))
    .transform((v) => (v === "" ? null : v));

export const optionalText = (max: number, label: string) =>
  z
    .string()
    .nullish()
    .transform((v) => (v ? cleanText(v) : ""))
    .pipe(z.string().max(max, { message: `${label} deve ter no máximo ${max} caracteres.` }))
    .transform((v) => (v === "" ? null : v));

export const slugSchema = z
  .string({ message: "O endereço (slug) é obrigatório." })
  .transform((v) => v.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(2, { message: "O endereço (slug) deve ter ao menos 2 caracteres." })
      .max(100, { message: "O endereço (slug) deve ter no máximo 100 caracteres." })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Use apenas letras minúsculas, números e hifens (ex.: terno-azul-marinho)." }),
  );

export const uuidSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: "Identificador inválido." });

export type FieldErrors = Record<string, string>;

export function issuesToFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Aceita apenas URLs http(s). Retorna null se vazio. */
export const optionalUrl = (label: string) =>
  z
    .string()
    .nullish()
    .transform((v) => (v ? v.trim() : ""))
    .refine(
      (v) => {
        if (!v) return true;
        try {
          const u = new URL(v);
          return u.protocol === "https:" || u.protocol === "http:";
        } catch {
          return false;
        }
      },
      { message: `${label}: informe um link válido começando com https://` },
    )
    .transform((v) => (v === "" ? null : v));
