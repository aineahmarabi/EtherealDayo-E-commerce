import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-bordeaux-deep/30",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-gold/10 before:to-transparent",
        "before:animate-[shimmer_2s_infinite]",
        className
      )}
      aria-hidden="true"
    />
  );
}

// Product card skeleton — mirrors exact ProductCard dimensions
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-0">
      {/* Image placeholder — 4:5 ratio bottle shape */}
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <div className="px-1 flex flex-col gap-2">
        {/* Brand name — small */}
        <Skeleton className="h-3 w-20" />
        {/* Product name — large */}
        <Skeleton className="h-5 w-4/5" />
        {/* Family tag */}
        <Skeleton className="h-3 w-28" />
        {/* Price */}
        <Skeleton className="h-4 w-16 mt-1" />
      </div>
    </div>
  );
}

// Collection grid skeleton — 4 cards wide on desktop
export function CollectionGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Brand card skeleton
export function BrandCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-bordeaux-deep/30">
      <Skeleton className="h-12 w-24 mx-auto" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

// Product page hero skeleton
export function ProductHeroSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
      {/* Bottle image area */}
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-square w-20 rounded-lg" />
          ))}
        </div>
      </div>
      {/* Info area */}
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-8 w-24" />
        {/* Variant pills */}
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-14 w-full rounded-full" />
        {/* Meters */}
        <div className="flex flex-col gap-4 pt-4">
          {["Sillage", "Longevity", "Intensity"].map((m) => (
            <div key={m} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hero world card skeleton
export function WorldCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  );
}
