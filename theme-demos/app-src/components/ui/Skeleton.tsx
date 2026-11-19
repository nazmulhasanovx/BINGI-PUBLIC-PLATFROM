export function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-line/70 ${className}`} />;
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading">
      <Skel className="h-8 w-56" />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-3xl border border-line bg-surface p-3">
            <Skel className="aspect-[4/3] w-2/5 shrink-0" />
            <div className="flex-1 space-y-3 py-2">
              <Skel className="h-5 w-3/4" />
              <Skel className="h-4 w-full" />
              <Skel className="h-4 w-1/2" />
              <Skel className="mt-6 h-9 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
