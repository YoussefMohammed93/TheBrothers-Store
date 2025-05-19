import {
  Calendar,
  Download,
  Loader2,
  MapPin,
  Package,
  Phone,
  Receipt,
  User,
  Mail,
  CreditCard,
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface OrderDetailsDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  const order = useQuery(api.orders.getOrderById, {
    orderId: orderId as Id<"orders">,
  });
  const [isDownloading, setIsDownloading] = useState(false);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "cancelled":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const handleDownloadOrderCard = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not supported");

      canvas.width = 400;
      canvas.height = 600;

      const roundRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };

      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      roundRect(20, 20, canvas.width - 40, 80, 8);
      ctx.fill();
      ctx.strokeStyle = "#e9ecef";
      ctx.stroke();

      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "right";
      ctx.direction = "rtl";
      ctx.fillText("تسوق", canvas.width - 30, 50);

      ctx.font = "14px Arial";
      ctx.fillStyle = "#6c757d";
      ctx.fillText(
        `رقم الطلب: ${order?.orderNumber || ""}`,
        canvas.width - 30,
        80
      );
      ctx.textAlign = "left";
      ctx.fillText(
        `${new Date(order?.createdAt || "").toLocaleDateString("ar-SA")}`,
        30,
        80
      );

      ctx.fillStyle = "#ffffff";
      roundRect(20, 120, canvas.width - 40, 440, 8);
      ctx.fill();
      ctx.strokeStyle = "#e9ecef";
      ctx.stroke();

      let y = 150;
      ctx.textAlign = "right";

      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 18px Arial";
      ctx.fillText("معلومات العميل", canvas.width - 30, y);

      ctx.beginPath();
      ctx.moveTo(canvas.width - 30, y + 5);
      ctx.lineTo(canvas.width - 150, y + 5);
      ctx.strokeStyle = "#007bff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      y += 35;
      ctx.font = "14px Arial";
      ctx.fillStyle = "#495057";

      const details = [
        { label: "الاسم", value: order?.fullName || "" },
        { label: "البريد الإلكتروني", value: order?.email || "" },
        { label: "رقم الجوال", value: order?.phone || "" },
        { label: "البلد", value: order?.country || "" },
        { label: "المدينة", value: order?.city || "" },
        { label: "الحي / المنطقة", value: order?.district || "" },
        { label: "الشارع", value: order?.street || "" },
        { label: "الرمز البريدي", value: order?.postalCode || "" },
      ];

      details.forEach((detail) => {
        ctx.fillStyle = "#6c757d";
        ctx.font = "14px Arial";
        ctx.fillText(`${detail.label}:`, canvas.width - 30, y);
        ctx.fillStyle = "#212529";
        ctx.font = "bold 14px Arial";
        ctx.fillText(detail.value, canvas.width - 120, y);
        y += 25;
      });

      y += 20;
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 18px Arial";
      ctx.fillText("ملخص الطلب", canvas.width - 30, y);

      ctx.beginPath();
      ctx.moveTo(canvas.width - 30, y + 5);
      ctx.lineTo(canvas.width - 130, y + 5);
      ctx.strokeStyle = "#007bff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      y += 30;
      ctx.fillStyle = "#f8f9fa";
      roundRect(30, y, canvas.width - 60, 140, 8);
      ctx.fill();

      y += 30;
      ctx.fillStyle = "#495057";
      ctx.font = "14px Arial";

      ctx.textAlign = "right";
      ctx.fillText(`المجموع الفرعي:`, canvas.width - 40, y);
      ctx.textAlign = "left";
      ctx.fillText(`${order?.subtotal?.toFixed(2) || "0.00"} ر.س`, 40, y);

      y += 25;
      ctx.textAlign = "right";
      ctx.fillText(`رسوم الشحن:`, canvas.width - 40, y);
      ctx.textAlign = "left";
      ctx.fillText(`${order?.shipping?.toFixed(2) || "0.00"} ر.س`, 40, y);

      if (order?.discount && order.discount > 0) {
        y += 25;
        ctx.textAlign = "right";
        ctx.fillStyle = "#dc3545";
        ctx.fillText(`الخصم:`, canvas.width - 40, y);
        ctx.textAlign = "left";
        ctx.fillText(`- ${order.discount.toFixed(2)} ر.س`, 40, y);
      }

      y += 35;
      ctx.fillStyle = "#007bff";
      roundRect(30, y - 20, canvas.width - 60, 40, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`الإجمالي:`, canvas.width - 40, y);
      ctx.textAlign = "left";
      ctx.fillText(`${order?.total?.toFixed(2) || "0.00"} ر.س`, 40, y);

      ctx.fillStyle = "#6c757d";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("شكراً لتسوقكم معنا", canvas.width / 2, canvas.height - 30);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `order-${order?.orderNumber || "receipt"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating order card image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-3xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
            تفاصيل الطلب
            {order && (
              <span className="text-muted-foreground font-normal text-base">
                #{order.orderNumber}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            عرض كافة تفاصيل الطلب والمنتجات المطلوبة
          </DialogDescription>
        </DialogHeader>
        {!order ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
            <Separator />
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-full max-w-[200px]" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-full ${
                    order.status === "delivered"
                      ? "bg-green-100"
                      : order.status === "cancelled"
                        ? "bg-red-100"
                        : order.status === "shipped"
                          ? "bg-purple-100"
                          : "bg-blue-100"
                  }`}
                >
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">حالة الطلب</p>
                  <p
                    className={`font-medium ${
                      order.status === "delivered"
                        ? "text-green-700"
                        : order.status === "cancelled"
                          ? "text-red-700"
                          : order.status === "shipped"
                            ? "text-purple-700"
                            : "text-blue-700"
                    }`}
                  >
                    {getStatusText(order.status)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  معلومات العميل
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">الاسم: </span>
                      <span className="font-medium">{order.fullName}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">
                        البريد الإلكتروني:{" "}
                      </span>
                      <span className="font-medium">{order.email}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">
                        رقم الجوال:{" "}
                      </span>
                      <span className="font-medium">{order.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">العنوان: </span>
                      <span className="font-medium">
                        {order.street}، {order.district}، {order.city}،{" "}
                        {order.country}
                        {order.postalCode && ` (${order.postalCode})`}
                      </span>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="flex items-start gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">ملاحظات: </span>
                        <span className="font-medium">{order.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  ملخص الطلب
                </h3>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        المجموع الفرعي:
                      </span>
                      <span>{order.subtotal.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الشحن:</span>
                      <span>{order.shipping.toFixed(2)} ر.س</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">الخصم:</span>
                        <span className="text-red-600">
                          - {order.discount.toFixed(2)} ر.س
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>الإجمالي:</span>
                      <span>{order.total.toFixed(2)} ر.س</span>
                    </div>
                    <div className="pt-2 text-sm">
                      <span className="text-muted-foreground">
                        طريقة الدفع:{" "}
                      </span>
                      <span className="font-medium flex items-center gap-1">
                        {order.paymentMethod === "cash_on_delivery" ? (
                          <>
                            <ShoppingBag className="h-3.5 w-3.5" />
                            الدفع عند الاستلام
                          </>
                        ) : order.paymentMethod === "stripe" ? (
                          <>
                            <CreditCard className="h-3.5 w-3.5" />
                            بطاقة ائتمان
                          </>
                        ) : (
                          order.paymentMethod
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleDownloadOrderCard}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  تحميل إيصال الطلب
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                المنتجات المطلوبة
              </h3>
              <div className="space-y-4">
                {order.items?.map(
                  (item: {
                    _id: string;
                    productName: string;
                    quantity: number;
                    productPrice: number;
                    total: number;
                    selectedSize?: string;
                    selectedColor?: string;
                    product: {
                      mainImageUrl: string | null;
                      _id: Id<"products">;
                      _creationTime: number;
                      name: string;
                      description: string;
                      mainImage: Id<"_storage">;
                      gallery: Id<"_storage">[];
                      price: number;
                      updatedAt: string;
                    } | null;
                  }) => (
                    <div
                      key={item._id}
                      className="flex gap-4 items-center border rounded-lg p-3"
                    >
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                        {item.product?.mainImageUrl ? (
                          <Image
                            src={item.product.mainImageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-muted">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.productName}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span>الكمية: {item.quantity}</span>
                            {item.selectedSize && (
                              <span>المقاس: {item.selectedSize}</span>
                            )}
                            {item.selectedColor && (
                              <div className="flex items-center gap-1">
                                <span>اللون:</span>
                                <span
                                  className="h-3 w-3 rounded-full inline-block"
                                  style={{
                                    backgroundColor: item.selectedColor,
                                  }}
                                ></span>
                              </div>
                            )}
                          </div>
                          <div>السعر: {item.productPrice.toFixed(2)} ر.س</div>
                        </div>
                      </div>
                      <div className="font-medium text-sm">
                        {item.total.toFixed(2)} ر.س
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
