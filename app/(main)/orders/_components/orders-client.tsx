"use client";

import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { OrdersSkeleton } from "./orders-skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useCallback, useMemo } from "react";
import { OrdersEmptyState } from "./orders-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { OrderDetailsSheet } from "./order-details-sheet";
import { useCurrency } from "@/contexts/currency-context";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "قيد الانتظار";
    case "processing":
      return "قيد المعالجة";
    case "shipped":
      return "تم الشحن";
    case "delivered":
      return "تم التوصيل";
    case "cancelled":
      return "ملغي";
    default:
      return status;
  }
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "processing":
      return <Package className="h-4 w-4" />;
    case "shipped":
      return <Truck className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const OrderCard = ({
  order,
  formatPrice,
  onViewDetails,
}: {
  order: {
    _id: string;
    status: string;
    createdAt: number;
    orderNumber: string;
    fullName: string;
    phone: string;
    street: string;
    district: string;
    city: string;
    country: string;
    total: number;
    shipping: number;
    paymentMethod: "cash_on_delivery" | "stripe" | string;
  };
  formatPrice: (price: number) => string;
  onViewDetails: (orderId: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onViewDetails(order._id);
  }, [order._id, onViewDetails]);

  return (
    <Card key={order._id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="px-6 flex flex-col md:flex-row gap-6">
          <div className="md:w-64 flex flex-col justify-center gap-2 md:border-l md:pl-6">
            <div
              className={`w-fit flex items-center gap-2 px-5 py-1.5 rounded-full text-sm ${getStatusColor(
                order.status
              )}`}
            >
              <StatusIcon status={order.status} />
              <span>{getStatusText(order.status)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(order.createdAt).toLocaleDateString("ar-SA")}
              </span>
            </div>
            <div className="text-sm font-medium">
              رقم الطلب: {order.orderNumber}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-1 mb-3">
              <h3 className="font-medium">معلومات الطلب</h3>
              <div className="text-sm text-muted-foreground">
                {order.fullName} • {order.phone}
              </div>
              <div className="text-sm text-muted-foreground truncate max-w-md">
                {order.street}, {order.district}, {order.city}, {order.country}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">المجموع: </span>
                <span className="font-medium">{formatPrice(order.total)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">طريقة الدفع: </span>
                <span className="font-medium">
                  {order.paymentMethod === "cash_on_delivery"
                    ? "الدفع عند الاستلام"
                    : order.paymentMethod === "stripe"
                      ? "بطاقة ائتمان"
                      : order.paymentMethod}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">الشحن: </span>
                <span className="font-medium">
                  {order.shipping > 0
                    ? `${formatPrice(order.shipping)}`
                    : "شحن مجاني"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <Button onClick={handleClick} className="gap-2 w-full sm:w-auto">
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function OrdersClient() {
  const orders = useQuery(api.orders.getUserOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { formatPrice } = useCurrency();

  const handleViewOrderDetails = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailsOpen(true);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setIsDetailsOpen(open);
    if (!open) {
      setTimeout(() => setSelectedOrderId(null), 300);
    }
  }, []);

  const content = useMemo(() => {
    if (orders === undefined) {
      return <OrdersSkeleton />;
    }

    if (orders.length === 0) {
      return <OrdersEmptyState />;
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={{
              ...order,
              createdAt: new Date(order.createdAt).getTime(),
            }}
            formatPrice={formatPrice}
            onViewDetails={handleViewOrderDetails}
          />
        ))}
      </div>
    );
  }, [orders, formatPrice, handleViewOrderDetails]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading title="طلباتي" description="عرض وتتبع جميع طلباتك السابقة" />
        </div>
        {orders && orders.length > 0 && (
          <Button asChild>
            <Link href="/products" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              تسوق المزيد
            </Link>
          </Button>
        )}
      </div>
      {content}
      {selectedOrderId && (
        <OrderDetailsSheet
          orderId={selectedOrderId as Id<"orders">}
          open={isDetailsOpen}
          onOpenChange={handleSheetOpenChange}
        />
      )}
    </div>
  );
}
