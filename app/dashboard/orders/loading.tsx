"use client";

import {
  PackageIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  SearchIcon,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersLoadingSkeleton() {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <PackageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-full">
                <ClockIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-red-500/10 p-3 rounded-full">
                <XCircleIcon className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="relative md:col-span-6">
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <th className="text-right py-4 px-6 font-medium">رقم الطلب</th>
                <th className="text-right py-4 px-6 font-medium">العميل</th>
                <th className="text-right py-4 px-6 font-medium">التاريخ</th>
                <th className="text-right py-4 px-6 font-medium">المبلغ</th>
                <th className="text-right py-4 px-6 font-medium">الحالة</th>
                <th className="text-right py-4 px-6 font-medium">الإجراءات</th>
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
        <Pagination className="w-fit mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            {[...Array(3)].map((_, index) => (
              <PaginationItem key={index}>
                <Skeleton className="h-8 w-8 rounded-md" />
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
