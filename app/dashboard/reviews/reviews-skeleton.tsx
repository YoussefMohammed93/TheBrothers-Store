"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ReviewsSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Skeleton className="h-5 w-5" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full sm:w-[180px]" />
        <Skeleton className="h-10 w-full sm:w-auto" />
        <Skeleton className="h-10 w-full sm:w-auto" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="border">
            <CardContent className="px-6 py-0">
              <div className="flex gap-4">
                <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-4 mx-0.5" />
                          ))}
                        </div>
                      </div>
                      <Skeleton className="h-4 w-64 mb-2" />
                      <Skeleton className="h-4 w-full sm:w-96" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Skeleton className="h-10 w-10" />
            </PaginationItem>
            {[...Array(3)].map((_, i) => (
              <PaginationItem key={i}>
                <Skeleton className="h-10 w-10" />
              </PaginationItem>
            ))}
            <PaginationItem>
              <Skeleton className="h-10 w-10" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
