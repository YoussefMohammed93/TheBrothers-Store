"use client";

import Link from "next/link";
import CartItem from "./cart-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CartJsonLd from "./cart-json-ld";
import { useQuery } from "convex/react";
import CartSummary from "./cart-summary";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/contexts/currency-context";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted p-6 rounded-full mb-6">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">سلة التسوق فارغة</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        لم تقم بإضافة أي منتجات إلى سلة التسوق بعد. استعرض منتجاتنا وأضف ما
        يعجبك.
      </p>
      <Button asChild>
        <Link href="/products" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          تصفح المنتجات
        </Link>
      </Button>
    </div>
  );
}

function CartItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg animate-pulse">
      <Skeleton className="h-40 sm:h-40 sm:w-40 rounded-md" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex flex-wrap gap-2 mb-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 mt-auto">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSummarySkeleton() {
  return (
    <div className="space-y-4 p-4 border rounded-lg animate-pulse">
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="mt-4 mb-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Separator />
      <div className="flex justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="mt-4 text-center">
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const {
    cartItems,
    isLoading,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    cartTotal,
    applyCoupon,
    removeCoupon,
    coupon,
    isApplyingCoupon,
    discountAmount,
  } = useCart();
  const { formatPrice, currency } = useCurrency();

  const [localLoading, setLocalLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [clearCartDialogOpen, setClearCartDialogOpen] = useState(false);

  const shippingSettings = useQuery(api.settings.getShippingSettings);

  useEffect(() => {
    if (cartItems.length > 0 && shippingSettings !== undefined) {
      setLocalLoading(false);
    } else {
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [cartItems, shippingSettings]);

  const handleQuantityChange = useCallback(
    (cartItemId: string, currentQuantity: number, change: number) => {
      const newQuantity = Math.max(1, currentQuantity + change);
      if (newQuantity !== currentQuantity) {
        updateCartItemQuantity(
          cartItemId as unknown as Id<"cart">,
          newQuantity
        );
      }
    },
    [updateCartItemQuantity]
  );

  const { shipping, total } = useMemo(() => {
    const calculateShipping = (subtotal: number) => {
      if (!shippingSettings) return 15;

      const { shippingCost, freeShippingThreshold } = shippingSettings;

      if (freeShippingThreshold && subtotal >= freeShippingThreshold) {
        return 0;
      }
      return shippingCost;
    };

    const shippingCost = calculateShipping(cartTotal);
    const totalCost = cartTotal + shippingCost - discountAmount;

    return { shipping: shippingCost, total: totalCost };
  }, [cartTotal, discountAmount, shippingSettings]);

  return (
    <>
      <CartJsonLd
        cartItems={cartItems.map((item) => ({
          ...item,
          product: {
            ...item.product,
            mainImageUrl: item.product.mainImageUrl || undefined,
          },
        }))}
        total={total}
        currency={currency.code}
      />
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold">سلة التسوق</h1>
              {cartItems.length > 0 && (
                <AlertDialog
                  open={clearCartDialogOpen}
                  onOpenChange={setClearCartDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      aria-label="إفراغ سلة التسوق"
                    >
                      <Trash2 className="h-4 w-4" />
                      إفراغ السلة
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم حذف جميع المنتجات من سلة التسوق. هذا الإجراء لا
                        يمكن التراجع عنه.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            setIsClearing(true);
                            await clearCart();
                          } finally {
                            setIsClearing(false);
                            setClearCartDialogOpen(false);
                          }
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isClearing ? (
                          <span className="flex items-center gap-2">
                            جاري التحميل...
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          </span>
                        ) : (
                          "إفراغ السلة"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            {isLoading || localLoading || shippingSettings === undefined ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <CartItemSkeleton key={i} />
                  ))}
                </div>
                <div>
                  <CartSummarySkeleton />
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item._id}
                      item={item}
                      formatPrice={formatPrice}
                      onRemove={removeFromCart}
                      onQuantityChange={handleQuantityChange}
                    />
                  ))}
                </div>
                <div>
                  <CartSummary
                    subtotal={cartTotal}
                    shipping={shipping}
                    total={total}
                    formatPrice={formatPrice}
                    coupon={coupon}
                    discountAmount={discountAmount}
                    applyCoupon={applyCoupon}
                    removeCoupon={removeCoupon}
                    isApplyingCoupon={isApplyingCoupon}
                    shippingSettings={
                      shippingSettings?.freeShippingThreshold
                        ? {
                            freeShippingThreshold:
                              shippingSettings.freeShippingThreshold,
                          }
                        : null
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
