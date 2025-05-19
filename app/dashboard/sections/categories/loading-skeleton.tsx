import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
        </div>
      </div>
      <Tabs defaultValue="page-settings" className="w-full" dir="rtl">
        <div className="mb-4 inline-flex h-auto items-center justify-start rounded-lg bg-muted px-0.5 py-1 text-muted-foreground w-full md:w-fit">
          <div className="flex w-full gap-1 p-1">
            <Skeleton className="h-8 w-full sm:w-32 rounded-md" />
            <Skeleton className="h-8 w-full sm:w-32 rounded-md" />
            <Skeleton className="h-8 w-full sm:w-32 rounded-md" />
          </div>
        </div>
        <TabsContent value="page-settings">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-64 mt-3" />
              </div>
              <Skeleton className="h-10 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end gap-4 mt-6">
        <Skeleton className="h-10 w-24" /> <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
