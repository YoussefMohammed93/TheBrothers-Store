"use client";

import {
  TrendingUpIcon,
  BoxIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PackageIcon,
  TagIcon,
  Eye,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Heading } from "@/components/ui/heading";
import { useState, useEffect, useMemo } from "react";
import { useCurrency } from "@/contexts/currency-context";
import DashboardLoadingSkeleton from "./loading-skeleton";

const getStatusInfo = (status: string) => {
  switch (status) {
    case "completed":
    case "delivered":
      return { icon: CheckCircleIcon, color: "text-green-500", text: "مكتمل" };
    case "processing":
    case "pending":
      return { icon: ClockIcon, color: "text-amber-500", text: "معلق" };
    case "cancelled":
      return { icon: XCircleIcon, color: "text-red-500", text: "ملغي" };
    default:
      return { icon: ClockIcon, color: "text-blue-500", text: status };
  }
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "منذ أقل من دقيقة";
  if (diffInSeconds < 3600)
    return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400)
    return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 2592000)
    return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;

  return date.toLocaleDateString("ar-SA");
};

export default function DashboardPage() {
  const orders = useQuery(api.orders.getAllOrders);
  const products = useQuery(api.products.getProducts);

  const { formatPrice } = useCurrency();

  const [isLoading, setIsLoading] = useState(true);

  const subscribers = useQuery(api.newsletter.getSubscribers);
  const totalWebsiteViews = useQuery(api.analytics.getTotalViews);
  const rawTopSellingProducts = useQuery(api.products.getTopSellingProducts);

  useEffect(() => {
    if (
      orders !== undefined &&
      products !== undefined &&
      rawTopSellingProducts !== undefined &&
      totalWebsiteViews !== undefined &&
      subscribers !== undefined
    ) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [orders, products, rawTopSellingProducts, totalWebsiteViews, subscribers]);

  const orderStats = useMemo(() => {
    if (!orders)
      return {
        total: 0,
        completed: 0,
        processing: 0,
        cancelled: 0,
        totalSales: 0,
      };

    return orders.reduce(
      (acc, order) => {
        acc.total++;
        acc.totalSales += order.total || 0;

        switch (order.status) {
          case "completed":
          case "delivered":
            acc.completed++;
            break;
          case "processing":
          case "pending":
            acc.processing++;
            break;
          case "cancelled":
            acc.cancelled++;
            break;
        }
        return acc;
      },
      { total: 0, completed: 0, processing: 0, cancelled: 0, totalSales: 0 }
    );
  }, [orders]);

  const productStats = useMemo(() => {
    if (!products) return { total: 0, inStock: 0, outOfStock: 0, onSale: 0 };

    return products.reduce(
      (acc, product) => {
        acc.total++;
        if (product.quantity > 0) acc.inStock++;
        if (product.quantity <= 0) acc.outOfStock++;
        if (product.discountPercentage > 0) acc.onSale++;
        return acc;
      },
      { total: 0, inStock: 0, outOfStock: 0, onSale: 0 }
    );
  }, [products]);

  const topSellingProducts = useMemo(() => {
    if (!rawTopSellingProducts || rawTopSellingProducts.length === 0) return [];

    return rawTopSellingProducts.map((product) => ({
      ...product,
      revenue: formatPrice(product.revenue),
    }));
  }, [rawTopSellingProducts, formatPrice]);

  const recentTransactions = useMemo(() => {
    if (!orders) return [];

    return orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 4)
      .map((order) => {
        const { icon, color, text } = getStatusInfo(order.status);

        return {
          id: order.orderNumber,
          status: text,
          amount: formatPrice(order.total),
          date: formatRelativeTime(order.createdAt),
          statusColor: color,
          icon,
        };
      });
  }, [orders, formatPrice]);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <Heading
          title="لوحة التحكم"
          description="نظرة عامة على أداء متجرك وإحصائيات المبيعات والعملاء لتحسين استراتيجيتك التجارية."
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-lg border bg-card p-6 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">إجمالي المبيعات</h3>
            <div className="bg-muted-foreground/10 p-3 rounded-full">
              <TrendingUpIcon className="text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold">
            {formatPrice(orderStats.totalSales)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {orderStats.completed} طلب مكتمل
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">الطلبات الجديدة</h3>
            <div className="bg-muted-foreground/10 p-3 rounded-full">
              <ShoppingCartIcon className="text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold">{orderStats.total}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {orderStats.processing} قيد المعالجة
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">المنتجات المتاحة</h3>
            <div className="bg-muted-foreground/10 p-3 rounded-full">
              <BoxIcon className="text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold">{productStats.inStock}</p>
          <p className="text-sm text-muted-foreground mt-2">
            من أصل {productStats.total}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">المنتجات بخصم</h3>
            <div className="bg-muted-foreground/10 p-3 rounded-full">
              <TagIcon className="text-cyan-500" />
            </div>
          </div>
          <p className="text-3xl font-bold">{productStats.onSale}</p>
          <p className="text-sm text-muted-foreground mt-2">منتج بخصم</p>
        </div>
        <div className="rounded-lg border bg-card p-6 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">زوار الموقع</h3>
            <div className="bg-muted-foreground/10 p-3 rounded-full">
              <Eye className="text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold">
            {totalWebsiteViews?.uniqueViews || 0}
          </p>
          <p className="text-sm text-muted-foreground mt-2">زائر فريد للموقع</p>
        </div>
        <div className="rounded-lg border bg-card p-6 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">مشتركي النشرة البريدية</h3>
            <div className="bg-muted-foreground/10 p-3 rounded-full">
              <Mail className="text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{subscribers?.length || 0}</p>
          <p className="text-sm text-muted-foreground mt-2">
            مشترك في النشرة البريدية
          </p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 mt-6">
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-lg font-medium mb-4">المنتجات الأكثر مبيعاً</h3>
          <div className="space-y-3 sm:space-y-4">
            {topSellingProducts.length > 0 ? (
              topSellingProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 pb-2 border-b last:border-b-0 sm:border-0 group transition-colors p-2"
                >
                  <div className="flex items-center gap-2">
                    <PackageIcon className="size-5 text-primary" />
                    <span className="font-medium text-sm sm:text-base">
                      {product.name}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-end items-center text-muted-foreground text-sm">
                    <span className="sm:ml-4">{product.sales} مبيعات</span>
                    <span className="mr-2">{product.revenue}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                لا توجد منتجات مباعة بعد
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-lg font-medium mb-4">آخر المعاملات</h3>
          <div className="space-y-3 sm:space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 pb-2 border-b last:border-b-0 sm:border-0 group transition-colors p-2"
                >
                  <div className="flex items-center gap-2">
                    <transaction.icon
                      className={cn("size-5", transaction.statusColor)}
                    />
                    <span className="font-medium text-sm sm:text-base">
                      {transaction.id}
                    </span>
                    <span className={cn("text-sm", transaction.statusColor)}>
                      ({transaction.status})
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-end items-center text-muted-foreground text-sm">
                    <span className="sm:ml-4">{transaction.amount}</span>
                    <span>{transaction.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                لا توجد معاملات حديثة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
