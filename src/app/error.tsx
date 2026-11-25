"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center" role="alert">
      <h1 className="text-3xl">Não foi possível carregar esta página</h1>
      <p className="mt-3 max-w-md">Ocorreu um erro temporário. Tente novamente em instantes.</p>
      <button type="button" onClick={reset} className="btn-primary mt-8">Tentar novamente</button>
    </main>
  );
}
