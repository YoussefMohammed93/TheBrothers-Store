import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/shell";

export default function ContactSubmissionsLoadingSkeleton() {
  return (
    <DashboardShell>
      <div className="flex flex-col rtl" dir="rtl">
        <div className="mb-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
        </div>
        <div className="mb-6">
          <div className="relative">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
        </div>
        <Tabs value="all" className="w-full" dir="rtl">
          <div className="mb-4 inline-flex max-w-lg h-10 items-center justify-start rounded-lg bg-muted px-0.5 py-1 text-muted-foreground w-full">
            <div className="grid w-full grid-cols-5 gap-1 p-1">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <TabsContent value="all" className="mt-6 rtl" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden min-h-[320px] flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 flex-1">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full mt-1" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between mt-auto">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-9" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
