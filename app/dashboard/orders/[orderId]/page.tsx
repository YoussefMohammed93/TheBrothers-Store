"use client";

import { toast } from "sonner";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import { useCurrency } from "@/contexts/currency-context";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderDetailsPage() {
  const { formatPrice } = useCurrency();

  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const order = useQuery(api.orders.getOrderById, {
    orderId: orderId as Id<"orders">,
  });

  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus({
        orderId: orderId as Id<"orders">,
        status: newStatus,
      });
      toast.success("تم تحديث حالة الطلب بنجاح");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الطلب");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader heading="تفاصيل الطلب" />
      <div className="flex-1 space-y-4 p-0">
        <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
          <Heading
            title={`تفاصيل الطلب: ${order.orderNumber}`}
            description="عرض وإدارة تفاصيل الطلب"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/orders")}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-muted-foreground">رقم الطلب:</span>{" "}
                    <span className="font-medium">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">تاريخ الطلب:</span>{" "}
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-end sm:items-center justify-start gap-2">
                    <span className="text-muted-foreground h-fit">الحالة:</span>
                    <div>
                      <Select
                        value={order.status}
                        onValueChange={handleStatusChange}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="تغيير الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="processing">
                            قيد المعالجة
                          </SelectItem>
                          <SelectItem value="delivered">تم التوصيل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                      {isUpdating && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">معلومات العميل</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">الاسم:</span>{" "}
                        {order.fullName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          البريد الإلكتروني:
                        </span>{" "}
                        {order.email}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          رقم الهاتف:
                        </span>{" "}
                        {order.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">معلومات الشحن</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">البلد:</span>{" "}
                        {order.country}
                      </p>
                      <p>
                        <span className="text-muted-foreground">المدينة:</span>{" "}
                        {order.city}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          الحي / المنطقة:
                        </span>{" "}
                        {order.district}
                      </p>
                      <p>
                        <span className="text-muted-foreground">الشارع:</span>{" "}
                        {order.street}
                      </p>
                      {order.postalCode && (
                        <p>
                          <span className="text-muted-foreground">
                            الرمز البريدي:
                          </span>{" "}
                          {order.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {order.notes && (
                  <div>
                    <h3 className="font-medium mb-2">ملاحظات</h3>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
                <Separator />
                <div>
                  <h3 className="font-medium mb-4">المنتجات</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 border rounded-lg p-3"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={
                              item.product?.mainImageUrl ||
                              "/placeholder-product.jpg"
                            }
                            alt={item.product?.name || "Product Image"}
                            fill
                            className="object-contain rounded-md"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name}</p>
                          <div className="text-sm text-muted-foreground">
                            <span>الكمية: {item.quantity}</span>
                            {item.selectedColor && (
                              <span className="mx-2">
                                اللون: {item.selectedColor}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-1">
                            {formatPrice(item.productPrice ?? 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      المجموع الفرعي
                    </span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الشحن</span>
                    <span>
                      {order.shipping === 0
                        ? "مجاني"
                        : formatPrice(order.shipping)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم</span>
                      <span>- {formatPrice(order.discount)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>الإجمالي</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div>
                  <h3 className="font-medium mb-2">طريقة الدفع</h3>
                  <p className="text-sm">
                    {order.paymentMethod === "cash_on_delivery"
                      ? "الدفع عند الاستلام"
                      : order.paymentMethod === "stripe"
                        ? "Stripe"
                        : order.paymentMethod}
                  </p>
                </div>
                {order.couponCode && (
                  <div>
                    <h3 className="font-medium mb-2">كوبون الخصم</h3>
                    <p className="text-sm">
                      {order.couponCode}{" "}
                      {order.couponDiscount &&
                        `(${formatPrice(order.couponDiscount)})`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
