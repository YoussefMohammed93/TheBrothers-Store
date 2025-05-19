import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-full sm:w-96" />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="rounded-lg border bg-card p-6 lg:col-span-1 xl:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <div className="bg-muted-foreground/10 p-3 rounded-full">
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32 mt-2" />
          </Card>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 mt-6">
        <Card className="rounded-lg border bg-card p-4 sm:p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3 sm:space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 pb-2 border-b last:border-b-0 sm:border-0 group transition-colors p-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex justify-between sm:justify-end items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-lg border bg-card p-4 sm:p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3 sm:space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 pb-2 border-b last:border-b-0 sm:border-0 group transition-colors p-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between sm:justify-end items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
