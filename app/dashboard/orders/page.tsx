"use client";

import {
  Eye as EyeIcon,
  PackageIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  SearchIcon,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/contexts/currency-context";
import { OrdersLoadingSkeleton } from "./_components/orders-loading-skeleton";

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const { formatPrice } = useCurrency();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const orders = useQuery(api.orders.getAllOrders);
  const markOrdersAsRead = useMutation(api.orders.markAllOrdersAsRead);

  useEffect(() => {
    if (orders && orders.length > 0) {
      markOrdersAsRead();
    }
  }, [orders, markOrdersAsRead]);

  const orderStats = useMemo(() => {
    if (!orders) return { total: 0, completed: 0, processing: 0, cancelled: 0 };
    return orders.reduce(
      (acc, order) => {
        acc.total++;
        switch (order.status) {
          case "completed":
          case "delivered":
            acc.completed++;
            break;
          case "processing":
            acc.processing++;
            break;
          case "cancelled":
            acc.cancelled++;
            break;
        }
        return acc;
      },
      { total: 0, completed: 0, processing: 0, cancelled: 0 }
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return (orders || [])
      .filter((order) => {
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = sortConfig.key === "createdAt" ? a.createdAt : a.total;
        const bValue = sortConfig.key === "createdAt" ? b.createdAt : b.total;
        if (sortConfig.direction === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [orders, searchQuery, statusFilter, sortConfig]);

  const handleSort = (key: "createdAt" | "total") => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "processing":
        return "bg-blue-50 text-blue-700";
      case "delivered":
        return "bg-green-50 text-green-700";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "processing":
        return "قيد المعالجة";
      case "pending":
        return "قيد الانتظار";
      case "delivered":
        return "تم التوصيل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {orders === undefined ? (
        <OrdersLoadingSkeleton />
      ) : (
        <>
          <div className="pt-14 mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
              <Heading
                title="الطلبات"
                description="إدارة وعرض جميع الطلبات الواردة في متجرك."
              />
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
                    <p className="text-sm text-muted-foreground">
                      إجمالي الطلبات
                    </p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
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
                    <p className="text-sm text-muted-foreground">
                      الطلبات المكتملة
                    </p>
                    <p className="text-2xl font-bold">{orderStats.completed}</p>
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
                    <p className="text-sm text-muted-foreground">
                      قيد المعالجة
                    </p>
                    <p className="text-2xl font-bold">
                      {orderStats.processing}
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                      الطلبات الملغاة
                    </p>
                    <p className="text-2xl font-bold">{orderStats.cancelled}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="relative md:col-span-6">
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن طلب..."
                className="pr-9 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="md:col-span-4 flex gap-2">
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={() => handleSort("createdAt")}
              >
                <ArrowUpDown className="h-4 w-4" />
                ترتيب حسب التاريخ
              </Button>
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={() => handleSort("total")}
              >
                <ArrowUpDown className="h-4 w-4" />
                ترتيب حسب المبلغ
              </Button>
            </div>
            <div className="md:col-span-2">
              <Select
                dir="rtl"
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full text-right">
                  <SelectValue placeholder="كل الحالات" />
                </SelectTrigger>
                <SelectContent className="text-right">
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="delivered">تم التوصيل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Card className="mb-4 py-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-4 px-6 font-medium">
                      رقم الطلب
                    </th>
                    <th className="text-right py-4 px-6 font-medium">العميل</th>
                    <th className="text-right py-4 px-6 font-medium">
                      التاريخ
                    </th>
                    <th className="text-right py-4 px-6 font-medium">المبلغ</th>
                    <th className="text-right py-4 px-6 font-medium">الحالة</th>
                    <th className="text-right py-4 px-6 font-medium">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-6">{order.orderNumber}</td>
                      <td className="py-4 px-6">{order.fullName}</td>
                      <td className="py-4 px-6">
                        {new Date(order.createdAt).toLocaleDateString("en-US")}
                      </td>
                      <td className="py-4 px-6">{formatPrice(order.total)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary hover:text-white transition-colors"
                        >
                          <Link
                            href={`/dashboard/orders/${order._id}`}
                            className="flex gap-2"
                          >
                            <EyeIcon className="h-4 w-4" />
                            عرض
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="text-sm text-muted-foreground">
              {filteredOrders.length > 0 ? (
                <>
                  عرض {startIndex + 1} إلى {endIndex} من {filteredOrders.length}{" "}
                  طلب
                </>
              ) : (
                "لا توجد طلبات"
              )}
            </div>
            <Pagination className="w-fit mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {getPageNumbers().map((pageNumber, index) =>
                  pageNumber === "..." ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={currentPage === pageNumber}
                        onClick={() => setCurrentPage(Number(pageNumber))}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}
