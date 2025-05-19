"use client";

import React from "react";
import { useQuery } from "convex/react";
import "keen-slider/keen-slider.min.css";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useKeenSlider } from "keen-slider/react";
import { useCart } from "@/contexts/cart-context";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";

const SalesSkeletonItem = React.memo(() => {
  return (
    <div className="keen-slider__slide" role="presentation">
      <Card className="h-[420px] lg:h-[420px] flex flex-col p-0">
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
              aria-label="Loading product rating"
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

SalesSkeletonItem.displayName = "SalesSkeletonItem";

export const SalesSectionSkeleton = React.memo(() => {
  return (
    <section
      className="pb-16 pt-0 bg-background"
      aria-label="Loading sales section"
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
          <div
            className="keen-slider"
            role="list"
            aria-label="Loading product carousel"
          >
            <div className="w-full sm:hidden">
              <div className="block sm:hidden">
                <SalesSkeletonItem />
              </div>
            </div>
            <div className="hidden sm:block w-full">
              <div className="hidden w-full sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-5">
                <SalesSkeletonItem />
                <SalesSkeletonItem />
                <SalesSkeletonItem />
                <SalesSkeletonItem />
              </div>
            </div>
          </div>
          <div
            className="flex flex-row-reverse justify-center gap-2 mt-4"
            role="tablist"
            aria-label="Loading carousel navigation"
          >
            {[...Array(4)].map((_, idx) => (
              <Skeleton
                key={idx}
                className="w-2 h-2 rounded-full"
                aria-label={`Loading navigation dot ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

SalesSectionSkeleton.displayName = "SalesSectionSkeleton";

function SalesSectionBase() {
  const [loaded, setLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { addToCart } = useCart();

  const productsData = useQuery(api.products.getProducts);
  const productRatings = useQuery(api.reviews.getProductsRatings, {
    productIds: productsData?.map((product) => product._id) || [],
  });
  const isLoading = productsData === undefined || productRatings === undefined;

  const salesProducts = useMemo(() => {
    if (!productsData || !productRatings) return [];

    return productsData
      .filter(
        (product) =>
          product.discountPercentage > 0 ||
          (product.badges &&
            (product.badges.includes("خصم") ||
              product.badges.includes("sales")))
      )
      .map((product) => {
        const rating = productRatings[product._id.toString()];
        return {
          ...product,
          mainImageUrl: product.mainImageUrl || "",
          rating: rating?.averageRating || 0,
          reviewCount: rating?.reviewCount || 0,
        };
      })
      .slice(0, 12);
  }, [productsData, productRatings]);

  const structuredData = useMemo(() => {
    if (!salesProducts?.length) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: salesProducts.map((product, index) => ({
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
  }, [salesProducts]);

  const sliderOptions = useMemo<SliderOptions>(
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
        },
        "(min-width: 1024px)": {
          slides: { perView: 3, spacing: 16 },
        },
        "(min-width: 1280px)": {
          slides: { perView: 4, spacing: 16 },
        },
      },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    }),
    []
  );

  const [sliderRef, instanceRef] = useKeenSlider(sliderOptions);

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

  interface SliderOptions {
    initial: number;
    rtl: boolean;
    slides: {
      perView: number;
      spacing: number;
    };
    breakpoints: {
      [key: string]: {
        slides: {
          perView: number;
          spacing: number;
        };
      };
    };
    slideChanged: (slider: { track: { details: { rel: number } } }) => void;
    created: () => void;
  }

  const totalSlides = instanceRef.current?.track.details.slides.length || 0;
  const perView =
    typeof instanceRef.current?.options.slides === "object"
      ? instanceRef.current?.options?.slides &&
        "perView" in instanceRef.current.options.slides
        ? instanceRef.current.options.slides.perView
        : 1
      : 1;
  const isAtStart = currentSlide === 0;
  const isAtEnd =
    currentSlide >= totalSlides - (typeof perView === "number" ? perView : 1);

  const handleAddToCart = useCallback(
    (productId: Id<"products">, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      addToCart(productId, 1);
    },
    [addToCart]
  );

  if (isLoading) {
    return <SalesSectionSkeleton />;
  }

  return (
    <section
      className="py-12 bg-background"
      ref={sectionRef}
      aria-labelledby="sales-heading"
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-5">
          <SectionHeading
            title="تخفيضات حصرية"
            description="اكتشف أفضل العروض والتخفيضات على منتجاتنا المميزة"
            id="sales-heading"
          />
        </div>
        {salesProducts.length === 0 ? (
          <div
            className="text-center py-10 border rounded-md"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">
              لا توجد منتجات بخصومات حالياً
            </p>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={sliderRef}
              className="keen-slider"
              role="region"
              aria-label="منتجات بخصومات"
              aria-roledescription="carousel"
            >
              {salesProducts.map((product, index) => (
                <div
                  className="keen-slider__slide"
                  key={product._id}
                  role="group"
                  aria-label={`منتج ${index + 1} من ${salesProducts.length}`}
                  aria-roledescription="slide"
                >
                  <ProductCard
                    key={product._id}
                    product={product}
                    variant="compact"
                    onAddToCart={handleAddToCart}
                    onImageLoad={() => handleImageLoad(product._id)}
                    imageLoaded={imagesLoaded[product._id]}
                    priority={index < 4}
                  />
                </div>
              ))}
            </div>
            {loaded && instanceRef.current && (
              <>
                <Button
                  size="icon"
                  className={`absolute top-1/2 -translate-y-1/2 -left-2 sm:-left-4 xl:-left-16 rounded-full flex ${
                    isAtEnd ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => instanceRef.current?.next()}
                  disabled={isAtEnd}
                  aria-label="التالي"
                  aria-controls="sales-slider"
                  aria-disabled={isAtEnd}
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </Button>
                <Button
                  size="icon"
                  className={`absolute top-1/2 -translate-y-1/2 -right-2 sm:-right-4 xl:-right-16 rounded-full flex ${
                    isAtStart ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => instanceRef.current?.prev()}
                  disabled={isAtStart}
                  aria-label="السابق"
                  aria-controls="sales-slider"
                  aria-disabled={isAtStart}
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </Button>
                {instanceRef.current?.track?.details?.slides?.length > 0 && (
                  <div
                    className="flex flex-row justify-center gap-2 mt-4 sm:hidden"
                    role="tablist"
                    aria-label="التنقل بين الشرائح"
                  >
                    {[
                      ...Array(instanceRef.current.track.details.slides.length),
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
                        role="tab"
                        aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
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

SalesSectionBase.displayName = "SalesSectionBase";

export const SalesSection = React.memo(SalesSectionBase);
