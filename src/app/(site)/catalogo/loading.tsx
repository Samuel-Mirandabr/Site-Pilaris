export default function Loading() {
  return (
    <div className="container-page py-14" role="status" aria-live="polite">
      <span className="sr-only">Carregando catálogo…</span>
      <div className="h-10 w-56 skeleton-shimmer" />
      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}><div className="aspect-[4/5] skeleton-shimmer" /><div className="mt-4 h-4 w-3/4 skeleton-shimmer" /></div>
        ))}
      </div>
    </div>
  );
}
