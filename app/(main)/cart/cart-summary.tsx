"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { memo, useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Ticket, X, Loader2, ArrowLeft } from "lucide-react";

type CartSummaryProps = {
  subtotal: number;
  shipping: number;
  total: number;
  formatPrice: (amount: number) => string;
  coupon: {
    code: string;
    discountPercentage: number;
  } | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isApplyingCoupon: boolean;
  shippingSettings: {
    freeShippingThreshold: number;
  } | null;
};

const CartSummary = memo(function CartSummary({
  subtotal,
  shipping,
  total,
  formatPrice,
  coupon,
  discountAmount,
  applyCoupon,
  removeCoupon,
  isApplyingCoupon,
  shippingSettings,
}: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateCouponDirectly = useMutation(api.coupons.validateCoupon);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;

    try {
      const success = await applyCoupon(couponCode.trim().toUpperCase());
      if (!success) {
        setStatus("error");
        const couponResult = await validateCouponDirectly({
          code: couponCode.trim().toUpperCase(),
        });
        if (
          couponResult?.valid === false &&
          couponResult?.message === "Coupon usage limit reached"
        ) {
          setErrorMessage("تم الوصول إلى الحد الأقصى لاستخدام هذا الكوبون");
        } else {
          setErrorMessage("الكوبون غير صالح");
        }
        const couponInput = document.getElementById("coupon-input");
        if (couponInput) {
          (couponInput as HTMLInputElement).focus();
        }
      } else {
        setStatus("idle");
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setStatus("error");
      setErrorMessage("حدث خطأ أثناء تطبيق الكوبون");
    }
  }, [couponCode, applyCoupon, validateCouponDirectly]);

  const handleRemoveCoupon = useCallback(() => {
    removeCoupon();
    setCouponCode("");
    setStatus("idle");
    setErrorMessage("");
  }, [removeCoupon]);

  return (
    <Card>
      <CardContent className="px-6">
        <h3 className="text-lg font-semibold mb-4">ملخص الطلب</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">الشحن</span>
              <div>
                <span className="w-full flex justify-end">
                  {shipping === 0 ? "مجاني" : formatPrice(shipping)}
                </span>
              </div>
            </div>
            <span>
              {shippingSettings?.freeShippingThreshold &&
                subtotal < shippingSettings.freeShippingThreshold && (
                  <div className="text-sm text-muted-foreground">
                    أضف{" "}
                    {formatPrice(
                      shippingSettings.freeShippingThreshold - subtotal
                    )}{" "}
                    للحصول على شحن مجاني
                  </div>
                )}
            </span>
          </div>
          {coupon && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Ticket className="h-4 w-4" />
                خصم ({coupon.discountPercentage}%)
              </span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 mb-4">
          {coupon ? (
            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  تم تطبيق كوبون{" "}
                  <span className="font-bold">{coupon.code}</span> (
                  {coupon.discountPercentage}%)
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-green-50 hover:bg-green-50"
                onClick={handleRemoveCoupon}
                aria-label="إزالة الكوبون"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="coupon-input"
                    placeholder="أدخل كود الكوبون"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="text-right"
                    aria-label="كود الكوبون"
                  />
                </div>
                <Button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  aria-label="تطبيق الكوبون"
                >
                  {isApplyingCoupon ? (
                    <span className="flex items-center gap-2">
                      جاري التطبيق...
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </span>
                  ) : (
                    "تطبيق"
                  )}
                </Button>
              </div>
              {status === "error" && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded-md border border-red-200 dark:border-red-900">
                  <X
                    className="h-4 w-4 cursor-pointer"
                    onClick={handleRemoveCoupon}
                  />
                  <span className="text-sm">
                    {errorMessage || "الكوبون غير صالح"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold mb-4">
          <span>الإجمالي</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
        <Button className="w-full gap-2" asChild>
          <Link href="/checkout">
            <ShoppingBag className="h-4 w-4" />
            إتمام الطلب
          </Link>
        </Button>
        <div className="mt-4 text-center">
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            متابعة التسوق
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

export default CartSummary;
