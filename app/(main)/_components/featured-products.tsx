"use client";

import React from "react";
import { useQuery } from "convex/react";
import "keen-slider/keen-slider.min.css";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useKeenSlider } from "keen-slider/react";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { useState, useMemo, useCallback, useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";

const ProductSkeletonItem = React.memo(() => {
  return (
    <div className="keen-slider__slide">
      <Card className="h-[450px] lg:h-[470px] flex flex-col p-0">
        <div className="relative w-full h-[280px] lg:h-[280px]">
          <Skeleton
            className="absolute inset-0 w-full h-full rounded-t-xl rounded-b-none"
            aria-label="Loading product image"
          />
          <Skeleton
            className="absolute top-3 right-3 h-6 w-16"
            aria-label="Loading product badge"
          />
          <Skeleton
            className="absolute top-3 left-3 h-9 w-9"
            aria-label="Loading wishlist button"
          />
        </div>
        <div className="flex flex-col flex-1 p-4 pt-0 gap-2.5">
          <div className="flex items-center gap-2 justify-between">
            <Skeleton
              className="h-5 w-20"
              aria-label="Loading product category"
            />
            <div className="flex items-center gap-2">
              <Skeleton
                className="h-5 w-24"
                aria-label="Loading product price"
              />
              <Skeleton
                className="h-4 w-20"
                aria-label="Loading product original price"
              />
            </div>
          </div>
          <Skeleton className="h-7 w-3/4" aria-label="Loading product title" />
          <Skeleton
            className="h-10 w-full"
            aria-label="Loading product description"
          />
          <Skeleton
            className="h-10 w-full mt-auto"
            aria-label="Loading add to cart button"
          />
        </div>
      </Card>
    </div>
  );
});

ProductSkeletonItem.displayName = "ProductSkeletonItem";

export const ProductsSectionSkeleton = React.memo(() => {
  return (
    <section
      className="py-12 bg-background"
      aria-label="Loading featured products section"
      aria-busy="true"
    >
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-5">
          <Skeleton
            className="h-10 w-48 mx-auto mb-4"
            aria-label="Loading section title"
          />
          <Skeleton
            className="h-6 w-64 sm:w-96 mx-auto"
            aria-label="Loading section description"
          />
        </div>
        <div className="relative">
          <div className="keen-slider">
            <div className="w-full sm:hidden">
              <div className="block sm:hidden">
                <ProductSkeletonItem />
              </div>
            </div>
            <div className="hidden sm:block w-full">
              <div className="hidden w-full sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
                <ProductSkeletonItem />
                <ProductSkeletonItem />
                <ProductSkeletonItem />
                <ProductSkeletonItem />
              </div>
            </div>
          </div>
          <div className="flex flex-row-reverse justify-center gap-2 mt-4">
            {[...Array(4)].map((_, idx) => (
              <Skeleton
                key={idx}
                className="w-2 h-2 rounded-full"
                aria-label={`Loading pagination indicator ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

ProductsSectionSkeleton.displayName = "ProductsSectionSkeleton";

function ProductsSectionBase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const sectionRef = useRef<HTMLElement>(null);

  const { addToCart } = useCart();

  const productsData = useQuery(api.products.getProducts);
  const productRatings = useQuery(api.reviews.getProductsRatings, {
    productIds: productsData?.map((product) => product._id) || [],
  });
  const isLoading = productsData === undefined || productRatings === undefined;

  const featuredProducts = useMemo(() => {
    if (!productsData || !productRatings) return [];

    return productsData
      .filter(
        (product) =>
          product.badges &&
          (product.badges.includes("عرض خاص") ||
            product.badges.includes("الأكثر مبيعاً"))
      )
      .map((product) => {
        const rating = productRatings[product._id.toString()];
        return {
          ...product,
          rating: rating?.averageRating || 0,
          reviewCount: rating?.reviewCount || 0,
        };
      })
      .slice(0, 12);
  }, [productsData, productRatings]);

  const structuredData = useMemo(() => {
    if (featuredProducts.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: featuredProducts
        .map((product, index) => ({
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
              price: product.price * (1 - product.discountPercentage / 100),
              priceCurrency: "SAR",
              availability:
                product.quantity && product.quantity > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
            aggregateRating:
              product.reviewCount > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: product.rating,
                    reviewCount: product.reviewCount,
                  }
                : undefined,
          },
        }))
        .filter((item) => item.item.aggregateRating !== undefined),
    };
  }, [featuredProducts]);

  const sliderOptions = useMemo(
    () => ({
      initial: 0,
      rtl: true,
      slides: {
        perView: 1,
        spacing: 16,
      },
      breakpoints: {
        "(min-width: 640px)": {
          slides: { perView: 2, spacing: 16 },
          rtl: false,
        },
        "(min-width: 1024px)": {
          slides: { perView: 3, spacing: 16 },
        },
        "(min-width: 1280px)": {
          slides: { perView: 4, spacing: 16 },
        },
      },
      slideChanged(slider: { track: { details: { rel: number } } }) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    }),
    []
  );

  const [sliderRef, instanceRef] = useKeenSlider(sliderOptions);

  const handleImageLoad = useCallback((productId: Id<"products">) => {
    setLoadedImages((prev) => ({
      ...prev,
      [productId.toString()]: true,
    }));
  }, []);

  const handleAddToCart = useCallback(
    (productId: Id<"products">, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(productId, 1);
    },
    [addToCart]
  );

  if (isLoading) {
    return <ProductsSectionSkeleton />;
  }

  const totalSlides = instanceRef.current?.track.details.slides.length || 0;
  const perView =
    typeof instanceRef.current?.options.slides === "object"
      ? instanceRef.current?.options?.slides &&
        "perView" in instanceRef.current.options.slides
        ? instanceRef.current.options.slides.perView
        : 1
      : 1;
  const isAtStart =
    currentSlide >= totalSlides - (typeof perView === "number" ? perView : 1);
  const isAtEnd = currentSlide === 0;

  return (
    <section
      className="py-12 bg-background"
      ref={sectionRef}
      aria-labelledby="featured-products-heading"
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
            title="منتجات مميزة"
            description="اكتشف مجموعة متنوعة من المنتجات العصرية والأنيقة"
            id="featured-products-heading"
          />
        </div>
        {featuredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">لا توجد منتجات مميزة حالياً</p>
          </div>
        ) : (
          <div className="relative">
            <div ref={sliderRef} className="keen-slider">
              {featuredProducts.map((product) => (
                <div
                  className="keen-slider__slide"
                  key={product._id}
                  aria-roledescription="slide"
                >
                  <ProductCard
                    key={product._id}
                    product={product}
                    variant="compact"
                    onAddToCart={handleAddToCart}
                    onImageLoad={handleImageLoad}
                    imageLoaded={!!loadedImages[product._id.toString()]}
                    priority={currentSlide === 0}
                  />
                </div>
              ))}
            </div>
            {loaded && instanceRef.current && (
              <>
                <Button
                  size="icon"
                  className="absolute top-1/2 -translate-y-1/2 -left-2 sm:-left-4 xl:-left-16 rounded-full flex opacity-100 disabled:opacity-50 transition-opacity"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    instanceRef.current?.next();
                  }}
                  disabled={!instanceRef.current || isAtStart}
                  aria-label="عرض المنتجات السابقة"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </Button>

                <Button
                  size="icon"
                  className="absolute top-1/2 -translate-y-1/2 -right-2 sm:-right-4 xl:-right-16 rounded-full flex opacity-100 disabled:opacity-50 transition-opacity"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    instanceRef.current?.prev();
                  }}
                  disabled={!instanceRef.current || isAtEnd}
                  aria-label="عرض المنتجات التالية"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </Button>
                {instanceRef.current &&
                  instanceRef.current.track &&
                  instanceRef.current.track.details &&
                  instanceRef.current.track.details.slides &&
                  instanceRef.current.track.details.slides.length > 0 && (
                    <div
                      className="flex flex-row justify-center gap-2 mt-6 sm:hidden"
                      role="tablist"
                      aria-label="اختر شريحة المنتجات"
                    >
                      {[
                        ...Array(
                          instanceRef.current.track.details.slides.length
                        ),
                      ].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            instanceRef.current?.moveToIdx(idx);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentSlide === idx
                              ? "bg-primary w-4"
                              : "bg-primary/20"
                          }`}
                          aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
                          role="tab"
                          aria-selected={currentSlide === idx}
                          aria-controls={`slide-${idx}`}
                        />
                      ))}
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

ProductsSectionBase.displayName = "ProductsSectionBase";

export const ProductsSection = React.memo(ProductsSectionBase);
