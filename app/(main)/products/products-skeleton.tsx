import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 pt-28">
      <div className="bg-muted p-5 rounded-full mb-4">
        <ShoppingCart className="h-9 w-9 text-muted-foreground" />
      </div>
      <h3 className="text-lg sm:text-xl font-medium mb-2">
        لا توجد منتجات متاحة حاليًا
      </h3>
      <p className="text-sm sm:text-lg text-muted-foreground max-w-[500px]">
        لم يتم إضافة أي منتجات بعد, يرجى العودة لاحقًا
      </p>
    </div>
  );
};

export default function ProductsSkeleton() {
  return (
    <div>
      <div className="lg:hidden mb-4">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block w-64 flex-shrink-0 mt-16">
          <div className="sticky h-fit top-24 space-y-5">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-9 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 mt-4 lg:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-6">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 lg:col-span-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn("h-10 w-full", i === 5 ? "sm:hidden" : "")}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group">
                <Card className="h-[400px] sm:h-[450px] flex flex-col p-0">
                  <div className="relative aspect-square">
                    <Skeleton className="absolute inset-0 w-full h-full rounded-t-lg" />
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2">
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="absolute top-2 sm:top-3 left-2 sm:left-3 h-9 w-9" />
                  </div>
                  <div className="p-3 sm:p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-10" />
              ))}
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
