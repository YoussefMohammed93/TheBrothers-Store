import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Skeleton className="h-9 w-1/2 sm:w-[100px]" />
            <Skeleton className="h-9 w-1/2 sm:w-[140px]" />
          </div>
        </div>
      </div>
      <Tabs defaultValue="general" className="w-full" dir="rtl">
        <div className="mb-4 inline-flex h-auto items-center justify-start rounded-lg bg-muted px-0.5 py-1 text-muted-foreground w-full md:w-fit">
          <div className="flex w-full gap-1 p-1">
            <Skeleton className="h-8 w-full sm:w-32 rounded-md" />
            <Skeleton className="h-8 w-full sm:w-32 rounded-md" />
            <Skeleton className="h-8 w-full sm:w-32 rounded-md" />
          </div>
        </div>
        <TabsContent value="general">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-24 w-24" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-24 w-24" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end gap-4 mt-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
