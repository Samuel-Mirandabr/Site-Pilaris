import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expirada?: string; acesso?: string }> }) {
  const sp = await searchParams;
  const configured = isSupabaseConfigured();
  const notice = sp.expirada ? "Sua sessão expirou ou você ainda não entrou. Faça login para continuar." : sp.acesso === "negado" ? "Esta conta não tem permissão para acessar o painel." : undefined;

  return (
    <main id="conteudo" className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" aria-label="Voltar ao site" className="mx-auto"><Image src="/brand/logo-pilaris.png" alt="Pilaris — Seja o Pilar" width={900} height={775} className="h-28 w-auto" priority /></Link>
      <h1 className="mt-8 text-center text-3xl">Painel da loja</h1>
      {configured ? (
        <div className="mt-8"><LoginForm notice={notice} /></div>
      ) : (
        <section className="mt-8 border border-amber/70 p-5" aria-labelledby="setup">
          <h2 id="setup" className="text-xl">O Supabase ainda não está configurado</h2>
          <p className="mt-2 text-sm">O login e o cadastro de produtos dependem do banco de dados e da autenticação do Supabase. Enquanto isso, o site público exibe apenas dados de exemplo.</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
            <li>Crie um projeto no Supabase e execute os arquivos de <code>supabase/migrations</code>.</li>
            <li>Crie o usuário do proprietário e marque-o como administrador (veja o README).</li>
            <li>Preencha <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo <code>.env.local</code> e reinicie o servidor.</li>
          </ol>
        </section>
      )}
      <p className="mt-8 text-center text-sm"><Link href="/" className="underline underline-offset-4">Voltar ao site</Link></p>
    </main>
  );
}
