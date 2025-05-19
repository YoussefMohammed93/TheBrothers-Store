"use client";

import { memo, useMemo } from "react";
import { JsonLd } from "@/components/json-ld";

type CartJsonLdProps = {
  cartItems: Array<{
    product: {
      name: string;
      description: string;
      mainImageUrl?: string;
      price: number;
      discountPercentage: number;
      quantity: number;
    };
    quantity: number;
  }>;
  total: number;
  currency: string;
};

const CartJsonLd = memo(function CartJsonLd({
  cartItems,
  total,
  currency,
}: CartJsonLdProps) {
  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: cartItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: item.product.name,
          description: item.product.description,
          image: item.product.mainImageUrl || "/hoodie.png",
          offers: {
            "@type": "Offer",
            price:
              item.product.price * (1 - item.product.discountPercentage / 100),
            priceCurrency: currency,
            availability:
              item.product.quantity > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            quantity: item.quantity,
          },
        },
      })),
      numberOfItems: cartItems.length,
      totalPrice: {
        "@type": "PriceSpecification",
        price: total,
        priceCurrency: currency,
      },
    };
  }, [cartItems, total, currency]);

  if (cartItems.length === 0) {
    return null;
  }

  return <JsonLd data={structuredData} />;
});

export default CartJsonLd;
