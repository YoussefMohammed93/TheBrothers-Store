import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function OrdersSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جاري تحميل الطلبات">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="overflow-hidden border border-muted">
          <CardContent className="p-0">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="md:w-64 flex flex-col gap-3 md:border-l md:pl-6">
                <Skeleton className="w-24 h-6" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="w-20 h-4" />
                </div>
                <Skeleton className="w-32 h-4" />
              </div>
              <div className="flex-1 space-y-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex flex-wrap gap-4 pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-end">
                <Skeleton className="w-32 h-9" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
