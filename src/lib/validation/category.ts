import { z } from "zod";
import { line, optionalText, slugSchema, uuidSchema } from "./common";
import { STORAGE_PATH_RE } from "./product";

export const categoryInputSchema = z.object({
  id: uuidSchema.nullish(),
  name: line(2, 60, "O nome"),
  slug: slugSchema,
  description: optionalText(300, "A descrição"),
  imageStoragePath: z.string().regex(STORAGE_PATH_RE, { message: "Caminho de imagem inválido." }).nullish(),
  keepImage: z.boolean().default(true),
  active: z.boolean(),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;
