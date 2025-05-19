"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "./product-image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Id } from "@/convex/_generated/dataModel";
import { StarRating } from "@/components/ui/star-rating";
import { useCurrency } from "@/contexts/currency-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { AlertTriangle, Heart, ShoppingCart } from "lucide-react";

export interface ProductCardProps {
  product: {
    _id: Id<"products">;
    name: string;
    description: string;
    price: number;
    discountPercentage: number;
    mainImageUrl: string | null;
    badges?: string[];
    categoryId?: Id<"categories">;
    quantity?: number;
    rating?: number;
    reviewCount?: number;
  };
  className?: string;
  aspectRatio?: "square" | "portrait" | "custom";
  variant?: "default" | "compact";
  showAddToCart?: boolean;
  showWishlistButton?: boolean;
  showRating?: boolean;
  onAddToCart?: (productId: Id<"products">, e: React.MouseEvent) => void;
  onImageLoad?: (productId: Id<"products">) => void;
  imageLoaded?: boolean;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  onAddToCart,
  onImageLoad,
  imageLoaded,
  priority = false,
  showRating = true,
  variant = "default",
  showAddToCart = true,
  aspectRatio = "square",
  showWishlistButton = true,
}: ProductCardProps) {
  // Hooks
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isProductInCart } = useCart();
  const { formatPrice } = useCurrency();

  // Derived state
  const isWishlisted = isInWishlist(product._id);
  const isInCart = isProductInCart(product._id);
  const isOutOfStock = product.quantity !== undefined && product.quantity <= 0;
  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);

  // UI helpers
  const aspectRatioClass = {
    square: "aspect-square",
    portrait: "aspect-[4/3]",
    custom: "",
  }[aspectRatio];

  const finalAspectRatioClass =
    variant === "compact" ? "aspect-[3/4]" : aspectRatioClass;

  // Event handlers
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      e.preventDefault();
      return;
    }

    if (onAddToCart) {
      onAddToCart(product._id, e);
    } else {
      addToCart(product._id, 1);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  return (
    <Link href={`/products/${product._id}`} className="block relative">
      <Card
        className={cn(
          "h-full flex flex-col p-0 overflow-hidden hover:bg-muted/50 transition-colors duration-300",
          variant === "compact"
            ? "h-[450px] sm:h-[450px] lg:h-[470px]"
            : "h-[450px] sm:h-[450px] lg:h-[470px]",
          `product-${product._id.toString()}`,
          className
        )}
      >
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-40">
            <div className="flex flex-col items-center gap-2 text-muted/90 bg-muted/20 p-6 rounded-full">
              <AlertTriangle className="size-8" />
              <span>نفذ المنتج</span>
            </div>
          </div>
        )}
        <div
          className={cn(
            "relative w-full overflow-hidden",
            finalAspectRatioClass
          )}
        >
          <ProductImage
            src={product.mainImageUrl}
            alt={product.name}
            priority={priority}
            className="sm:p-4 sm:pb-0 rounded-t-lg"
            imageLoaded={imageLoaded}
            onLoad={() => {
              if (onImageLoad) {
                onImageLoad(product._id);
              }
            }}
          />
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex flex-col gap-2">
            {product.discountPercentage > 0 && (
              <Badge variant="destructive" className="w-full text-center">
                خصم {product.discountPercentage}%
              </Badge>
            )}
            {product.badges?.includes("جديد") && (
              <Badge
                variant="default"
                className="w-full text-center bg-green-500"
              >
                جديد
              </Badge>
            )}
            {product.badges?.includes("عرض خاص") && (
              <Badge
                variant="default"
                className="w-full text-center bg-blue-500"
              >
                عرض خاص
              </Badge>
            )}
            {product.badges?.includes("الأكثر مبيعاً") && (
              <Badge
                variant="default"
                className="w-full text-center bg-amber-500"
              >
                الأكثر مبيعاً
              </Badge>
            )}
          </div>
          {showWishlistButton && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleWishlistToggle}
            >
              <Heart
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  isWishlisted
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                )}
              />
            </Button>
          )}
        </div>
        <div className="p-3 pt-0 sm:p-4 sm:pt-0 flex flex-col gap-2 flex-1">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          {showRating && product.rating !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={product.rating} size="md" showValue={false} />
              {product.reviewCount !== undefined && (
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between mt-auto mb-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-bold text-primary text-sm sm:text-base">
                {formatPrice(discountedPrice)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
          {showAddToCart && (
            <Button
              className="w-full gap-2 text-sm sm:text-base mt-auto"
              onClick={handleAddToCart}
              variant={
                isInCart
                  ? "secondary"
                  : isOutOfStock
                    ? "destructive"
                    : "default"
              }
              disabled={isInCart || isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {isInCart
                ? "في السلة"
                : isOutOfStock
                  ? "نفذ المنتج"
                  : "إضافة للسلة"}
            </Button>
          )}
        </div>
      </Card>
    </Link>
  );
}
