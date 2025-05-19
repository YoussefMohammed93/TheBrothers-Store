import { Card } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 pt-20">
          <div className="mb-8 text-center">
            <Skeleton className="h-10 w-64 mx-auto mb-2" />
            <Skeleton className="h-5 w-32 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card
                key={i}
                className="h-[465px] md:h-[520px] lg:h-[470px] xl:h-[430px] flex flex-col p-0"
              >
                <div className="relative aspect-[4/3]">
                  <Skeleton className="absolute inset-0 w-full h-full rounded-t-lg" />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col">
                  <div className="mb-2">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="mt-auto pt-4">
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 sm:gap-4">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-md" />
              ))}
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
