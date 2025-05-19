"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useCallback, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";

const LoadingSkeleton = React.memo(() => (
  <div
    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4"
    role="status"
    aria-label="Loading categories"
  >
    {[...Array(8)].map((_, i) => (
      <Skeleton
        key={i}
        className="h-[160px]"
        aria-label={`Loading category ${i + 1}`}
      />
    ))}
    <span className="sr-only">جاري تحميل الفئات...</span>
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

function CategoriesSectionBase() {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const getGridCols = useCallback((itemCount: number) => {
    if (itemCount <= 2) return "lg:grid-cols-2";
    if (itemCount === 3) return "lg:grid-cols-3";
    if (itemCount === 4) return "lg:grid-cols-4";
    if (itemCount === 5) return "lg:grid-cols-5";
    if (itemCount === 6) return "lg:grid-cols-6";
    if (itemCount === 7) return "lg:grid-cols-7";
    if (itemCount === 8) return "lg:grid-cols-8";

    return "lg:grid-cols-8";
  }, []);

  const handleImageLoad = useCallback((categoryId: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [categoryId]: true,
    }));
  }, []);

  const categories = useQuery(api.categories.getCategories);
  const pageData = useQuery(api.categories.getCategoriesPage);

  const categoryImageUrls = useQuery(
    api.files.getMultipleImageUrls,
    categories?.length
      ? {
          storageIds: categories.map((category) => category.image),
        }
      : "skip"
  );

  const gridCols = useMemo(
    () => getGridCols(categories?.length || 0),
    [getGridCols, categories?.length]
  );

  const structuredData = useMemo(() => {
    if (!categories?.length) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: categories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: category.name,
          url: `${typeof window !== "undefined" ? window.location.origin : ""}/categories/${category._id}`,
        },
      })),
    };
  }, [categories]);

  if (categories === undefined || pageData === undefined) {
    return (
      <section
        className="py-12 bg-background"
        aria-label="Loading categories section"
        aria-busy="true"
      >
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <Skeleton
              className="h-8 w-64 mx-auto mb-4"
              aria-label="Loading section title"
            />
            <Skeleton
              className="h-6 w-96 mx-auto"
              aria-label="Loading section description"
            />
          </div>
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  if (pageData && !pageData.isVisible) {
    return null;
  }

  const title = pageData?.title || "تصفح حسب الفئات";
  const description =
    pageData?.description || "اكتشف منتجاتنا المميزة في مختلف الفئات";

  const hasCategories = categories?.length > 0;

  return (
    <section
      className="py-12 bg-background"
      aria-labelledby="categories-heading"
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <SectionHeading
            title={title}
            description={description}
            id="categories-heading"
          />
        </div>
        {hasCategories ? (
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${gridCols} gap-4`}
            role="list"
            aria-label="فئات المنتجات"
          >
            {categories.map((category, index) => {
              const imageUrl =
                categories.length > 0 && categoryImageUrls
                  ? (categoryImageUrls[
                      categories.findIndex((c) => c._id === category._id)
                    ] ?? "/placeholder.png")
                  : "/placeholder.png";
              const isImageLoaded = loadedImages[category._id];
              return (
                <Link
                  key={category._id}
                  href={`/categories/${category._id}`}
                  className="block h-[160px]"
                  aria-label={`فئة ${category.name}`}
                  role="listitem"
                >
                  <Card className="group h-full relative overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300 ease-in-out group-hover:bg-primary/5 will-change-transform`}
                    />
                    <div className="relative h-full w-full flex flex-col items-center justify-center gap-3">
                      <div className="w-18 h-18 flex items-center justify-center rounded-full bg-primary/10 relative">
                        {!isImageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Skeleton
                              className="h-10 w-10 rounded-full"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          width={40}
                          height={40}
                          className={`h-10 w-10 transition-opacity duration-300 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                          onLoadingComplete={() =>
                            handleImageLoad(category._id)
                          }
                          loading={index < 4 ? "eager" : "lazy"}
                          fetchPriority={index < 4 ? "high" : "auto"}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground duration-300 ease-in-out group-hover:text-foreground">
                        {category.name}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="text-muted-foreground text-center p-8 border rounded-md"
            role="status"
            aria-live="polite"
          >
            لا توجد فئات متاحة حاليًا
          </div>
        )}
      </div>
    </section>
  );
}

CategoriesSectionBase.displayName = "CategoriesSectionBase";

export const CategoriesSection = React.memo(CategoriesSectionBase);
