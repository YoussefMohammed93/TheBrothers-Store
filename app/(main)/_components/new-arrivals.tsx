"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "@/contexts/cart-context";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { useMemo, useCallback, useState, useRef, useEffect } from "react";

const NewArrivalsSkeleton = React.memo(() => {
  return (
    <section
      className="py-12 bg-background"
      aria-label="Loading new arrivals section"
      aria-busy="true"
    >
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-8">
          <Skeleton
            className="h-10 w-48 mx-auto mb-4"
            aria-label="Loading section title"
          />
          <Skeleton
            className="h-6 w-64 sm:w-96 mx-auto"
            aria-label="Loading section description"
          />
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          role="list"
          aria-label="Loading product grid"
        >
          {[...Array(4)].map((_, index) => (
            <div key={index} role="listitem">
              <Skeleton
                className="h-[420px] w-full rounded-lg"
                aria-label={`Loading product ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

NewArrivalsSkeleton.displayName = "NewArrivalsSkeleton";

function NewArrivalsSectionBase() {
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { addToCart } = useCart();

  const productsData = useQuery(api.products.getProducts);
  const productRatings = useQuery(api.reviews.getProductsRatings, {
    productIds: productsData?.map((product) => product._id) || [],
  });

  const handleImageLoad = useCallback((productId: string) => {
    setImagesLoaded((prev) => ({
      ...prev,
      [productId]: true,
    }));
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(sectionRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const isLoading = productsData === undefined || productRatings === undefined;

  const newArrivals = useMemo(() => {
    if (!productsData || !productRatings) return [];

    return productsData
      .filter(
        (product) =>
          product.badges &&
          (product.badges.includes("جديد") || product.badges.includes("new"))
      )
      .map((product) => {
        const rating = productRatings[product._id.toString()];
        return {
          ...product,
          mainImageUrl:
            product.mainImageUrl && typeof product.mainImageUrl === "string"
              ? product.mainImageUrl
              : "/hoodie.png",
          rating: rating?.averageRating || 0,
          reviewCount: rating?.reviewCount || 0,
        };
      })
      .slice(0, 4);
  }, [productsData, productRatings]);

  const structuredData = useMemo(() => {
    if (!newArrivals?.length) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: newArrivals.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.mainImageUrl,
          url: `${typeof window !== "undefined" ? window.location.origin : ""}/products/${product._id}`,
          offers: {
            "@type": "Offer",
            price:
              product.discountPercentage > 0
                ? (
                    product.price *
                    (1 - product.discountPercentage / 100)
                  ).toFixed(2)
                : product.price.toFixed(2),
            priceCurrency: "SAR",
            availability:
              product.quantity && product.quantity > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
          aggregateRating:
            product.rating > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating.toFixed(1),
                  reviewCount: product.reviewCount || 0,
                }
              : undefined,
        },
      })),
    };
  }, [newArrivals]);

  const handleAddToCart = useCallback(
    (productId: Id<"products">, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      addToCart(productId, 1);
    },
    [addToCart]
  );

  if (isLoading) {
    return <NewArrivalsSkeleton />;
  }

  return (
    <section
      className="py-12 bg-background"
      ref={sectionRef}
      aria-labelledby="new-arrivals-heading"
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-8">
          <SectionHeading
            title="وصل حديثا"
            description="اكتشف أحدث المنتجات في متجرنا"
            id="new-arrivals-heading"
          />
        </div>
        {newArrivals.length === 0 ? (
          <div
            className="text-center py-10 border rounded-md"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">لا توجد منتجات جديدة حالياً</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            role="list"
            aria-label="قائمة المنتجات الجديدة"
          >
            {newArrivals.map((product, index) => (
              <div key={product._id} role="listitem">
                <ProductCard
                  product={product}
                  variant="compact"
                  onAddToCart={handleAddToCart}
                  onImageLoad={() => handleImageLoad(product._id)}
                  imageLoaded={imagesLoaded[product._id]}
                  priority={index < 2}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

NewArrivalsSectionBase.displayName = "NewArrivalsSectionBase";

export const NewArrivalsSection = React.memo(NewArrivalsSectionBase);
