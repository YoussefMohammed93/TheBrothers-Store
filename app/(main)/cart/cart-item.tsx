"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";

type CartItemProps = {
  item: {
    _id: Id<"cart">;
    product: {
      _id: Id<"products">;
      name: string;
      description: string;
      price: number;
      discountPercentage: number;
      mainImageUrl: string | null;
      colors: Array<{ name: string; value: string }>;
    };
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  };
  formatPrice: (amount: number) => string;
  onRemove: (cartItemId: Id<"cart">) => Promise<void>;
  onQuantityChange: (
    cartItemId: string,
    currentQuantity: number,
    change: number
  ) => void;
};

const CartItem = memo(function CartItem({
  item,
  formatPrice,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  const discountedPrice =
    item.product.price * (1 - item.product.discountPercentage / 100);
  const itemTotal = discountedPrice * item.quantity;

  return (
    <Card key={item._id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-40 sm:h-auto sm:w-40 bg-muted/30">
            <Image
              src={item.product.mainImageUrl || "/hoodie.png"}
              alt={item.product.name}
              fill
              sizes="(max-width: 640px) 100vw, 160px"
              className="object-contain p-2"
              loading="lazy"
            />
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1">
              <div className="flex justify-between">
                <Link
                  href={`/products/${item.product._id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  {item.product.name}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(item._id)}
                  aria-label={`حذف ${item.product.name} من السلة`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {item.product.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {item.selectedSize && (
                  <div className="text-sm bg-muted px-2 py-1 rounded">
                    المقاس: {item.selectedSize}
                  </div>
                )}
                {item.selectedColor && (
                  <div className="text-sm bg-muted px-2 py-1 rounded flex items-center gap-2">
                    اللون: {item.selectedColor}
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          item.product.colors.find(
                            (c) => c.name === item.selectedColor
                          )?.value || "#000",
                      }}
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 mt-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onQuantityChange(item._id, item.quantity, -1)}
                  disabled={item.quantity <= 1}
                  aria-label="تقليل الكمية"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span
                  className="w-8 text-center"
                  aria-label={`الكمية: ${item.quantity}`}
                >
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onQuantityChange(item._id, item.quantity, 1)}
                  aria-label="زيادة الكمية"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">
                  {formatPrice(itemTotal)}
                </span>
                {item.product.discountPercentage > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default CartItem;
