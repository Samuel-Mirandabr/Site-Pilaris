import { z } from "zod";
import { line, optionalLine, optionalText, optionalUrl } from "./common";
import { normalizeWhatsappNumber } from "../domain/whatsapp";

export const settingsInputSchema = z.object({
  storeName: line(2, 60, "O nome da loja"),
  slogan: line(1, 80, "O slogan"),
  biography: z.string().transform((v) => v.replace(/\r\n?/g, "\n").trim()).pipe(z.string().min(10, { message: "A biografia deve ter ao menos 10 caracteres." }).max(2000, { message: "A biografia deve ter no máximo 2000 caracteres." })),
  whatsappNumber: z
    .string()
    .nullish()
    .transform((v) => (v ? v.trim() : ""))
    .refine((v) => !v || normalizeWhatsappNumber(v) !== null, { message: "Número inválido. Use DDD + número (ex.: 11 91234-5678)." })
    .transform((v) => (v ? normalizeWhatsappNumber(v) : null)),
  instagramUrl: optionalUrl("Instagram"),
  facebookUrl: optionalUrl("Facebook"),
  contactEmail: optionalLine(120, "O e-mail").refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "E-mail inválido." }),
  contactInfo: optionalText(500, "As informações de contato"),
});
export type SettingsInput = z.infer<typeof settingsInputSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: "Informe um e-mail válido." }).max(200),
  password: z.string().min(1, { message: "Informe a senha." }).max(200),
});
