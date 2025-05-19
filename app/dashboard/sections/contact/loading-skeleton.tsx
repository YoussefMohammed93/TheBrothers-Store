import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ContactLoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="w-full mb-6">
        <Skeleton className="h-10 w-full sm:w-96 rounded-md" />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card
                key={index}
                className="border p-0 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-2 sm:gap-4 p-2 sm:p-4">
                    <Skeleton className="h-8 w-8 shrink-0" />
                    <div className="flex-1 space-y-2 sm:space-y-4">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl" />
                          <div>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                          <Skeleton className="h-8 w-8 sm:h-9 sm:w-9" />
                          <Skeleton className="h-8 w-8 sm:h-9 sm:w-9" />
                          <div className="mx-0.5 sm:mx-1 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
