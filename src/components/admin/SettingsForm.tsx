"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/(painel)/configuracoes/actions";
import type { StoreSettings } from "@/types";
import { Field } from "./Field";
import { useToast } from "./Toast";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, start] = useTransition();
  const [v, setV] = useState({
    storeName: settings.storeName, slogan: settings.slogan, biography: settings.biography, whatsappNumber: settings.whatsappNumber ?? "",
    instagramUrl: settings.instagramUrl ?? "", facebookUrl: settings.facebookUrl ?? "", contactEmail: settings.contactEmail ?? "", contactInfo: settings.contactInfo ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((s) => ({ ...s, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await saveSettings(v);
      if (r.ok) { setErrors({}); notify("success", r.message ?? "Salvo."); router.refresh(); }
      else if (r.code === "session") router.replace("/admin/login?expirada=1");
      else { setErrors(r.fieldErrors ?? {}); notify("error", r.error); setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50); }
    });
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome da loja" required error={errors.storeName}>{(p) => <input {...p} className="field" value={v.storeName} maxLength={60} onChange={set("storeName")} />}</Field>
        <Field label="Slogan" required error={errors.slogan}>{(p) => <input {...p} className="field" value={v.slogan} maxLength={80} onChange={set("slogan")} />}</Field>
      </div>
      <Field label="Biografia institucional (página inicial)" required error={errors.biography} hint="Separe os parágrafos com uma linha em branco. Se o primeiro parágrafo for curto (até 60 caracteres), ele vira o título; um último parágrafo curto vira a assinatura.">
        {(p) => <textarea {...p} rows={9} className="field" maxLength={2000} value={v.biography} onChange={set("biography")} />}
      </Field>
      <Field label="Número de WhatsApp" error={errors.whatsappNumber} hint="Com DDD, por exemplo 11 91234-5678. O código do Brasil (55) é adicionado automaticamente. Sem número, os botões de contato ficam desativados.">
        {(p) => <input {...p} className="field sm:max-w-xs" inputMode="tel" autoComplete="off" value={v.whatsappNumber} onChange={set("whatsappNumber")} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Link do Instagram" error={errors.instagramUrl}>{(p) => <input {...p} className="field" inputMode="url" placeholder="https://instagram.com/..." value={v.instagramUrl} onChange={set("instagramUrl")} />}</Field>
        <Field label="Link do Facebook" error={errors.facebookUrl}>{(p) => <input {...p} className="field" inputMode="url" placeholder="https://facebook.com/..." value={v.facebookUrl} onChange={set("facebookUrl")} />}</Field>
      </div>
      <Field label="E-mail de contato" error={errors.contactEmail}>{(p) => <input {...p} type="email" className="field sm:max-w-md" value={v.contactEmail} onChange={set("contactEmail")} />}</Field>
      <Field label="Outras informações de contato" error={errors.contactInfo} hint="Opcional. Aparece no rodapé e na página Contato (ex.: horário de atendimento, cidade).">
        {(p) => <textarea {...p} rows={3} className="field" maxLength={500} value={v.contactInfo} onChange={set("contactInfo")} />}
      </Field>
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Salvando…" : "Salvar configurações"}</button>
    </form>
  );
}
