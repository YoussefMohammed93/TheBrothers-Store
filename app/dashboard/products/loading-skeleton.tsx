import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full">
                  <Skeleton className="h-5 w-5" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2.5" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="relative md:col-span-6">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border p-3 pl-0">
            <CardContent className="p-0">
              <div className="flex gap-4">
                <div>
                  <Skeleton className="w-20 h-20 rounded-md flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-[90%]" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 pr-0 pb-0 pl-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
