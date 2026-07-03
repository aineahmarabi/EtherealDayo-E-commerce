import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.03]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
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
      {/* Image placeholder — bottle shape outline */}
      <div className="aspect-[4/5] w-full flex flex-col items-center justify-center gap-1.5 bg-transparent">
        <Skeleton className="w-10 h-5 rounded-md" />
        <Skeleton className="w-24 h-40 rounded-2xl" />
      </div>
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
        <div className="aspect-[4/5] w-full max-w-[360px] mx-auto flex flex-col items-center justify-center gap-2 bg-transparent">
          <Skeleton className="w-16 h-8 rounded-md" />
          <Skeleton className="w-36 h-60 rounded-3xl" />
        </div>
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-square w-20 rounded-lg" />
          ))}
        </div>
      </div>
      {/* Info area */}
      <div className="flex flex-col gap-6 pt-2">
        {/* Title / Meta */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-3 w-48" />
        </div>
        
        {/* Divider */}
        <div className="h-[1px] bg-gold/10 w-full" />

        {/* Variant Pill */}
        <Skeleton className="h-9 w-24 rounded-full" />

        {/* Price */}
        <Skeleton className="h-6 w-20" />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1 rounded-full" />
          <Skeleton className="h-12 flex-1 rounded-full" />
        </div>

        {/* Story */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-gold/10">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Scent Profile & Performance */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gold/10">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-24" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-24" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
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
