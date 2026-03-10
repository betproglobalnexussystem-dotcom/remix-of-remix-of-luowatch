import { Skeleton } from "@/components/ui/skeleton";

const MovieCardSkeleton = () => (
  <div className="block">
    <Skeleton className="aspect-[2/3] w-full rounded" />
    <div className="mt-1 px-0.5 space-y-1">
      <Skeleton className="h-2.5 w-3/4 rounded" />
      <Skeleton className="h-2 w-1/2 rounded" />
    </div>
  </div>
);

export default MovieCardSkeleton;
