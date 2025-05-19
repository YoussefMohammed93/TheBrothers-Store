"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";

type CartItem = {
  _id: Id<"cart">;
  productId: Id<"products">;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  addedAt: string;
  updatedAt: string;
  product: {
    _id: Id<"products">;
    name: string;
    description: string;
    price: number;
    discountPercentage: number;
    quantity: number;
    mainImage: Id<"_storage">;
    gallery: Id<"_storage">[];
    mainImageUrl: string | null;
    galleryUrls: (string | null)[];
    categoryId: Id<"categories">;
    sizes: Array<{ name: string; price: number }>;
    colors: Array<{ name: string; value: string }>;
    _creationTime: number;
    createdAt: string;
    updatedAt: string;
  };
};

type CouponType = {
  _id: Id<"coupons">;
  name: string;
  code: string;
  discountPercentage: number;
  usageLimit?: number;
  usageCount?: number;
};

type CartContextType = {
  cartItems: CartItem[];
  isLoading: boolean;
  cartCount: number;
  cartTotal: number;
  discountAmount: number;
  finalTotal: number;
  coupon: CouponType | null;
  isApplyingCoupon: boolean;
  isProductInCart: (productId: Id<"products">) => boolean;
  addToCart: (
    productId: Id<"products">,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string
  ) => Promise<void>;
  removeFromCart: (cartItemId: Id<"cart">) => Promise<void>;
  removeProductFromCart: (productId: Id<"products">) => Promise<void>;
  updateCartItemQuantity: (
    cartItemId: Id<"cart">,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();

  // State declarations
  const [isLoading, setIsLoading] = useState(true);
  const [coupon, setCoupon] = useState<CouponType | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // API queries
  const cartQuery = useQuery(api.cart.getUserCart);
  const cartItems = React.useMemo(() => cartQuery || [], [cartQuery]);
  const cartCount = useQuery(api.cart.getCartCount) || 0;

  // API mutations
  const addToCartMutation = useMutation(api.cart.addToCart);
  const removeFromCartMutation = useMutation(api.cart.removeFromCart);
  const removeProductFromCartMutation = useMutation(
    api.cart.removeProductFromCart
  );
  const updateCartItemQuantityMutation = useMutation(
    api.cart.updateCartItemQuantity
  );
  const clearCartMutation = useMutation(api.cart.clearCart);
  const validateCouponDirectly = useMutation(api.coupons.validateCoupon);

  // Effects
  useEffect(() => {
    if (cartItems !== undefined) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  // Computed values
  const cartTotal = React.useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = item?.product?.price
        ? item.product.price *
          (1 - (item.product.discountPercentage || 0) / 100)
        : 0;
      return total + price * (item?.quantity || 0);
    }, 0);
  }, [cartItems]);

  const discountAmount = React.useMemo(() => {
    if (!coupon) return 0;
    return (cartTotal * coupon.discountPercentage) / 100;
  }, [cartTotal, coupon]);

  const finalTotal = React.useMemo(() => {
    return Math.max(0, cartTotal - discountAmount);
  }, [cartTotal, discountAmount]);

  // Helper functions
  const isProductInCart = (productId: Id<"products">) => {
    return cartItems.some((item) => item?.productId === productId);
  };

  // Cart operation handlers
  const addToCart = async (
    productId: Id<"products">,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    if (!isSignedIn) {
      toast.error("يرجى تسجيل الدخول لإضافة المنتج إلى السلة");
      return;
    }

    try {
      await addToCartMutation({
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });
      toast.success("تمت إضافة المنتج إلى السلة");
    } catch {
      toast.error("فشل في إضافة المنتج إلى السلة");
    }
  };

  const removeFromCart = async (cartItemId: Id<"cart">) => {
    if (!isSignedIn) return;

    try {
      await removeFromCartMutation({ cartItemId });
      toast.success("تمت إزالة المنتج من السلة");
    } catch {
      toast.error("فشل في إزالة المنتج من السلة");
    }
  };

  const removeProductFromCart = async (productId: Id<"products">) => {
    if (!isSignedIn) return;

    try {
      await removeProductFromCartMutation({ productId });
      toast.success("تمت إزالة المنتج من السلة");
    } catch {
      toast.error("فشل في إزالة المنتج من السلة");
    }
  };

  const updateCartItemQuantity = async (
    cartItemId: Id<"cart">,
    quantity: number
  ) => {
    if (!isSignedIn) return;

    try {
      await updateCartItemQuantityMutation({ cartItemId, quantity });
    } catch {
      toast.error("فشل في تحديث كمية المنتج");
    }
  };

  const clearCart = async () => {
    if (!isSignedIn) return;

    try {
      await clearCartMutation();
      toast.success("تم مسح السلة");
    } catch {
      toast.error("فشل في مسح السلة");
    }
  };

  // Coupon handlers
  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!isSignedIn) return false;

    setIsApplyingCoupon(true);
    try {
      const result = await validateCouponDirectly({ code });

      if (result?.valid && result?.coupon) {
        setCoupon(result.coupon);
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: (cartQuery || []).filter(
          (item): item is NonNullable<typeof item> => item !== null
        ),
        isLoading,
        cartCount,
        cartTotal,
        discountAmount,
        finalTotal,
        coupon,
        isApplyingCoupon,
        isProductInCart,
        addToCart,
        removeFromCart,
        removeProductFromCart,
        updateCartItemQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
