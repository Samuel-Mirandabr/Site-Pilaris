import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-screen flex-col items-center justify-center py-16 text-center">
      <Image src="/brand/logo-pilaris.png" alt="Pilaris — Seja o Pilar" width={900} height={775} className="h-28 w-auto" />
      <h1 className="mt-8 text-4xl">Página não encontrada</h1>
      <p className="mt-3 max-w-md">O endereço pode ter mudado ou o produto não está mais publicado.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Voltar ao início</Link>
        <Link href="/catalogo" className="btn-outline">Ver o catálogo</Link>
      </div>
    </main>
  );
}
