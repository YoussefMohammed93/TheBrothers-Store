"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function OrdersLoadingSkeleton() {
  return (
    <>
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
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
          <Skeleton className="h-10 w-full flex-1" />
          <Skeleton className="h-10 w-full flex-1" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Card className="mb-4 py-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-4 px-6 font-medium">
                  <Skeleton className="h-5 w-24" />
                </th>
                <th className="text-right py-4 px-6 font-medium">
                  <Skeleton className="h-5 w-20" />
                </th>
                <th className="text-right py-4 px-6 font-medium">
                  <Skeleton className="h-5 w-20" />
                </th>
                <th className="text-right py-4 px-6 font-medium">
                  <Skeleton className="h-5 w-16" />
                </th>
                <th className="text-right py-4 px-6 font-medium">
                  <Skeleton className="h-5 w-16" />
                </th>
                <th className="text-right py-4 px-6 font-medium">
                  <Skeleton className="h-5 w-24" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="text-sm text-muted-foreground">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-8 w-8 rounded-md" />
          ))}
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </>
  );
}
