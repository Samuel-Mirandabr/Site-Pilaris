import type { StoreSettings } from "@/types";

/** A biografia é editável no painel. Parágrafos são separados por linha em branco; se o primeiro for curto, vira o título. */
export function splitBiography(settings: Pick<StoreSettings, "biography" | "storeName">) {
  const paragraphs = settings.biography.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const hasTitle = paragraphs.length > 1 && paragraphs[0].length <= 60;
  const title = hasTitle ? paragraphs[0] : settings.storeName;
  const rest = hasTitle ? paragraphs.slice(1) : paragraphs;
  const hasSignature = rest.length > 1 && rest[rest.length - 1].length <= 60;
  return { title, body: hasSignature ? rest.slice(0, -1) : rest, signature: hasSignature ? rest[rest.length - 1] : null };
}
