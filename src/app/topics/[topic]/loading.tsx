import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-6 lg:px-12 py-8">
      <div className="mb-6">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-full mb-8" />
      <div className="max-w-3xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}
