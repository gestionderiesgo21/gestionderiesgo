import { Skeleton } from "@/components/ui/skeleton";

export default function PanelLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando panel">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
