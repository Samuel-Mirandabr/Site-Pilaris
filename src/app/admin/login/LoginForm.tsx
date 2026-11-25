"use client";
import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {notice && <p role="status" className="border-l-4 border-amber bg-white px-4 py-3 text-sm ring-1 ring-stone/30">{notice}</p>}
      {state.error && <p role="alert" className="border-l-4 border-ink bg-white px-4 py-3 text-sm font-medium ring-1 ring-stone/30">{state.error}</p>}
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
