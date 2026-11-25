"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/admin/login/actions";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { ToastProvider } from "./Toast";

const NAV = [
  { href: "/admin", label: "Resumo", exact: true },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/estoque", label: "Estoque" },
  { href: "/admin/configuracoes", label: "Configurações da loja" },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string, exact?: boolean) => (exact ? pathname === h : pathname.startsWith(h));

  const nav = (
    <nav aria-label="Painel administrativo">
      <ul className="space-y-1">
        {NAV.map((n) => (
          <li key={n.href}>
            <Link href={n.href} onClick={() => setOpen(false)} aria-current={active(n.href, n.exact) ? "page" : undefined}
              className={`flex min-h-[44px] items-center border-l-2 px-4 ${active(n.href, n.exact) ? "border-amber bg-white font-medium text-navy" : "border-transparent text-ink hover:bg-white"}`}>
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  const account = (
    <div className="border-t border-stone/40 p-4">
      <p className="truncate text-sm text-ink" title={email}>{email}</p>
      <Link href="/" target="_blank" className="mt-2 inline-flex min-h-[44px] items-center text-sm text-navy underline underline-offset-4">Ver o site</Link>
      <form action={signOut}><button type="submit" className="btn-outline btn-sm mt-1 w-full">Sair da conta</button></form>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F7F8F7] lg:grid lg:grid-cols-[16rem_1fr]">
        <header className="flex items-center justify-between border-b border-stone/40 px-4 py-2 lg:hidden">
          <Link href="/admin" aria-label="Painel Pilaris"><Image src="/brand/logo-pilaris.png" alt="Pilaris" width={900} height={775} className="h-12 w-auto" /></Link>
          <button type="button" className="flex h-11 w-11 items-center justify-center text-navy" aria-expanded={open} aria-controls="menu-admin" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <CloseIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
          </button>
        </header>
        <aside id="menu-admin" className={`${open ? "block" : "hidden"} border-b border-stone/40 bg-[#EEF0EF] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:border-b-0 lg:border-r`}>
          <div>
            <Link href="/admin" className="hidden p-6 lg:block" aria-label="Painel Pilaris"><Image src="/brand/logo-pilaris.png" alt="Pilaris" width={900} height={775} className="h-20 w-auto" /></Link>
            <div className="py-3 lg:py-0">{nav}</div>
          </div>
          {account}
        </aside>
        <main id="conteudo" className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
