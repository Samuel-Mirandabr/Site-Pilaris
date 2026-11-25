/** Aviso exibido quando o site usa dados de exemplo (Supabase não configurado). */
export function DemoBanner() {
  return (
    <div role="note" className="border-b border-amber/60 bg-white">
      <p className="container-page py-2 text-sm text-ink">
        <strong className="font-semibold text-navy">Modo demonstração.</strong> Produtos, preços e fotos são exemplos para teste. O Supabase ainda não está configurado.
      </p>
    </div>
  );
}
