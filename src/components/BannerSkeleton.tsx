import { Skeleton } from "@/components/ui/skeleton";

const BannerSkeleton = () => (
  <div className="relative mb-4">
    <Skeleton className="w-full h-40 md:h-52 rounded" />
    <div className="absolute bottom-2 left-2 space-y-1">
      <div className="flex gap-1">
        <Skeleton className="w-10 h-3 rounded" />
        <Skeleton className="w-8 h-3 rounded" />
      </div>
      <Skeleton className="w-32 h-3 rounded" />
    </div>
  </div>
);

export default BannerSkeleton;
