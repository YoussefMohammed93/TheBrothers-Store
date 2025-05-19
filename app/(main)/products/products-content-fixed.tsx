"use client";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Script from "next/script";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, FilterIcon } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { useCurrency } from "@/contexts/currency-context";
import ProductsSkeleton, { EmptyState } from "./products-skeleton";

const ITEMS_PER_PAGE = 9;

const MemoizedProductCard = React.memo(ProductCard);

function useIntersectionObserver() {
  const [visibleProducts, setVisibleProducts] = useState<Set<string>>(
    new Set()
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  const registerProduct = useCallback(
    (productId: string, element: HTMLElement) => {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const productId = entry.target.getAttribute("data-product-id");
              if (productId) {
                setVisibleProducts((prev) => {
                  const newSet = new Set(prev);
                  if (entry.isIntersecting) {
                    newSet.add(productId);
                  }
                  return newSet;
                });
              }
            });
          },
          { rootMargin: "200px", threshold: 0.1 }
        );
      }

      if (element) {
        element.setAttribute("data-product-id", productId);
        observerRef.current.observe(element);
      }

      return () => {
        if (element && observerRef.current) {
          observerRef.current.unobserve(element);
        }
      };
    },
    []
  );

  return { visibleProducts, registerProduct };
}

export default function ProductsContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { visibleProducts, registerProduct } = useIntersectionObserver();

  const currency = useCurrency();

  const products = useQuery(api.products.getProducts);
  const categoriesData = useQuery(api.categories.getCategories);
  const productRatings = useQuery(api.reviews.getProductsRatings, {
    productIds: products?.map((product) => product._id) || [],
  });

  const colors = useMemo(
    () => [
      { name: "أسود", value: "#1a1a1a" },
      { name: "رمادي", value: "#6b7280" },
      { name: "أبيض", value: "#dedede" },
      { name: "أزرق", value: "#3b82f6" },
      { name: "أخضر", value: "#22c55e" },
      { name: "أحمر", value: "#ef4444" },
    ],
    []
  );

  const sizes = useMemo(() => ["XS", "S", "M", "L", "XL", "XXL"], []);

  const statusOptions = useMemo(
    () => [
      { id: "all", label: "الكل" },
      { id: "جديد", label: "جديد" },
      { id: "الأكثر مبيعاً", label: "الأكثر مبيعاً" },
      { id: "خصم", label: "خصم" },
      { id: "عرض خاص", label: "عرض خاص" },
    ],
    []
  );

  const categories = useMemo(() => {
    if (!categoriesData) return [{ _id: "all", name: "الكل" }];
    return [{ _id: "all", name: "الكل" }, ...categoriesData];
  }, [categoriesData]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesStatus =
        selectedStatus === "all"
          ? true
          : selectedStatus === "خصم"
            ? product.discountPercentage > 0
            : product.badges.includes(selectedStatus);

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "الكل" ||
        categoriesData?.find((cat) => cat.name === selectedCategory)?._id ===
          product.categoryId;

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      const matchesColors =
        selectedColors.length === 0 ||
        selectedColors.some((colorName) =>
          product.colors.some((color) => color.name === colorName)
        );

      const matchesSizes =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) =>
          product.sizes.some((productSize) => productSize.name === size)
        );

      return (
        matchesStatus &&
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesColors &&
        matchesSizes
      );
    });
  }, [
    products,
    selectedStatus,
    searchQuery,
    selectedCategory,
    categoriesData,
    priceRange,
    selectedColors,
    selectedSizes,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      scrollToTop();
    },
    [scrollToTop]
  );

  const getPageNumbers = useCallback(() => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pageNumbers.push(i);
      } else if (
        typeof pageNumbers[pageNumbers.length - 1] === "number" &&
        (pageNumbers[pageNumbers.length - 1] as number) + 1 < i
      ) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  }, [currentPage, totalPages]);

  const FiltersContent = useCallback(
    () => (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">الفئات</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category._id} className="flex items-center">
                <Checkbox
                  id={`category-${category._id}`}
                  className="ml-2"
                  checked={selectedCategory === category.name}
                  onCheckedChange={() => {
                    setSelectedCategory(category.name);
                    setCurrentPage(1);
                  }}
                />
                <label htmlFor={`category-${category._id}`} className="text-sm">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">نطاق السعر</h3>
          <Slider
            defaultValue={priceRange}
            max={1000}
            min={0}
            step={1}
            className="mb-2"
            onValueChange={(value) => {
              setPriceRange(value as [number, number]);
              setCurrentPage(1);
            }}
          />
          <div className="flex justify-between text-sm">
            <span>{currency.formatPrice(priceRange[0])}</span>
            <span>{currency.formatPrice(priceRange[1])}</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">الألوان</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                className={cn(
                  "size-8 rounded-full cursor-pointer mx-0.5 transition-all",
                  "ring-offset-2 ring-offset-background",
                  selectedColors.includes(color.name)
                    ? "ring-2 ring-primary"
                    : "",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                style={{ backgroundColor: color.value }}
                aria-label={color.name}
                onClick={() => {
                  setSelectedColors((prev) =>
                    prev.includes(color.name)
                      ? prev.filter((c) => c !== color.name)
                      : [...prev, color.name]
                  );
                  setCurrentPage(1);
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">المقاسات</h3>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={selectedSizes.includes(size) ? "default" : "outline"}
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedSizes((prev) =>
                    prev.includes(size)
                      ? prev.filter((s) => s !== size)
                      : [...prev, size]
                  );
                  setCurrentPage(1);
                }}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
        {(selectedCategory !== "الكل" ||
          priceRange[0] !== 0 ||
          priceRange[1] !== 1000 ||
          selectedColors.length > 0 ||
          selectedSizes.length > 0 ||
          selectedStatus !== "all" ||
          searchQuery) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSelectedCategory("الكل");
              setPriceRange([0, 1000]);
              setSelectedColors([]);
              setSelectedSizes([]);
              setSelectedStatus("all");
              setSearchQuery("");
              setCurrentPage(1);
              setIsMobileFiltersOpen(false);
            }}
          >
            مسح جميع المرشحات
          </Button>
        )}
      </div>
    ),
    [
      categories,
      selectedCategory,
      priceRange,
      selectedColors,
      selectedSizes,
      selectedStatus,
      searchQuery,
      colors,
      sizes,
      currency,
      setSelectedCategory,
      setCurrentPage,
      setPriceRange,
      setSelectedColors,
      setSelectedSizes,
      setSelectedStatus,
      setSearchQuery,
      setIsMobileFiltersOpen,
    ]
  );

  const NoResultsMessage = useCallback(
    ({
      filters,
      onClear,
    }: {
      filters: {
        search: string;
        status: string;
        category: string;
        priceRange: [number, number];
        colors: string[];
        sizes: string[];
      };
      onClear: () => void;
    }) => {
      const activeFilters = [];

      if (filters.search) {
        activeFilters.push(`البحث: "${filters.search}"`);
      }
      if (filters.status !== "all") {
        activeFilters.push(
          `الحالة: "${statusOptions.find((s) => s.id === filters.status)?.label}"`
        );
      }
      if (filters.category !== "الكل") {
        activeFilters.push(`الفئة: "${filters.category}"`);
      }
      if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) {
        activeFilters.push(
          `السعر: ${filters.priceRange[0]} - ${filters.priceRange[1]} ر.س`
        );
      }
      if (filters.colors.length > 0) {
        activeFilters.push(`الألوان: ${filters.colors.join("، ")}`);
      }
      if (filters.sizes.length > 0) {
        activeFilters.push(`المقاسات: ${filters.sizes.join("، ")}`);
      }

      return (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="bg-muted p-5 rounded-full mb-4">
            <Search className="h-9 w-9 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">لم يتم العثور على نتائج</h3>
          {activeFilters.length > 0 && (
            <p className="text-sm text-muted-foreground mb-2">
              المرشحات المطبقة: {activeFilters.join(" ، ")}
            </p>
          )}
          <Button variant="outline" onClick={onClear} className="mt-4">
            مسح المرشحات
          </Button>
        </div>
      );
    },
    [statusOptions]
  );

  const structuredData = useMemo(() => {
    if (!products || !Array.isArray(products) || products.length === 0)
      return null;
    if (
      !paginatedProducts ||
      !Array.isArray(paginatedProducts) ||
      paginatedProducts.length === 0
    )
      return null;
    if (!productRatings) return null;

    try {
      const maxProductsInStructuredData = 6;
      const limitedProducts = paginatedProducts.slice(
        0,
        maxProductsInStructuredData
      );

      return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: limitedProducts
          .map((product, index) => {
            try {
              const productId = product._id.toString();
              const rating = productRatings[productId];

              return {
                "@type": "ListItem",
                position: startIndex + index + 1,
                item: {
                  "@type": "Product",
                  name: product.name || "",
                  image: product.mainImageUrl || "/placeholder-product.jpg",
                  description: product.description || "",
                  offers: {
                    "@type": "Offer",
                    price: product.price || 0,
                    priceCurrency: "SAR",
                    availability:
                      product.quantity > 0
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                  },
                  ...(rating && {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: rating.averageRating || 0,
                      reviewCount: rating.reviewCount || 0,
                    },
                  }),
                },
              };
            } catch (error) {
              console.error(
                "Error generating structured data for product:",
                error
              );
              return null;
            }
          })
          .filter(Boolean),
      };
    } catch (error) {
      console.error("Error generating structured data:", error);
      return null;
    }
  }, [paginatedProducts, productRatings, startIndex, products]);

  useEffect(() => {
    let title = "المنتجات";
    if (selectedCategory !== "الكل") {
      title = `${selectedCategory} - ${title}`;
    }
    if (selectedStatus !== "all" && selectedStatus !== "الكل") {
      const statusLabel = statusOptions.find(
        (s) => s.id === selectedStatus
      )?.label;
      if (statusLabel) {
        title = `${statusLabel} - ${title}`;
      }
    }
    if (searchQuery) {
      title = `${searchQuery} - ${title}`;
    }

    document.title = `${title} | تسوق`;
  }, [selectedCategory, selectedStatus, searchQuery, statusOptions]);

  if (!products || !categoriesData || !productRatings) {
    return <ProductsSkeleton />;
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {structuredData && (
        <Script id="product-structured-data" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
      )}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsMobileFiltersOpen(true)}
        >
          <FilterIcon className="h-4 w-4 ml-2" />
          تصفية المنتجات
          {(selectedCategory !== "الكل" ||
            selectedColors.length > 0 ||
            selectedSizes.length > 0) && (
            <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-medium text-white bg-primary rounded-full">
              {(selectedCategory !== "الكل" ? 1 : 0) +
                selectedColors.length +
                selectedSizes.length}
            </span>
          )}
        </Button>
      </div>
      <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
        <SheetContent side="right" className="w-full max-w-md p-5">
          <SheetHeader className="p-0">
            <SheetTitle>تصفية المنتجات</SheetTitle>
          </SheetHeader>
          <FiltersContent />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button
              className="w-full"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              عرض النتائج
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block w-64 flex-shrink-0 mt-16">
          <div className="sticky h-fit top-24 space-y-5 overflow-y-auto pb-8 contain-paint will-change-transform">
            <FiltersContent />
          </div>
        </div>
        <div className="flex-1 mt-4 lg:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="relative lg:col-span-6">
              <Search className="absolute right-3 top-4.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن منتج..."
                className="pr-9 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 lg:col-span-6">
              {statusOptions.map((status) => (
                <Button
                  key={status.id}
                  variant={selectedStatus === status.id ? "default" : "outline"}
                  className="w-full text-sm"
                  onClick={() => {
                    setSelectedStatus(status.id);
                    setCurrentPage(1);
                  }}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => {
                const rating = productRatings[product._id.toString()];
                const productId = product._id.toString();
                const isVisible = visibleProducts.has(productId);

                return (
                  <div
                    key={productId}
                    className="product-card-container contain-layout contain-paint"
                    ref={(el) => {
                      if (el) registerProduct(productId, el);
                    }}
                  >
                    <MemoizedProductCard
                      product={{
                        ...product,
                        rating: rating?.averageRating || 0,
                        reviewCount: rating?.reviewCount || 0,
                      }}
                      priority={isVisible}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <NoResultsMessage
              filters={{
                search: searchQuery,
                status: selectedStatus,
                category: selectedCategory,
                priceRange,
                colors: selectedColors,
                sizes: selectedSizes,
              }}
              onClear={() => {
                setSelectedCategory("الكل");
                setPriceRange([0, 1000]);
                setSelectedColors([]);
                setSelectedSizes([]);
                setSelectedStatus("all");
                setSearchQuery("");
                setCurrentPage(1);
              }}
            />
          )}
          {filteredProducts.length > 0 && (
            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4 contain-layout">
              <div className="text-xs sm:text-sm text-muted-foreground">
                عرض {startIndex + 1} إلى{" "}
                {Math.min(endIndex, filteredProducts.length)} من{" "}
                {filteredProducts.length} منتج
              </div>
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent className="flex-wrap justify-center gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                        aria-label="الصفحة السابقة"
                      />
                    </PaginationItem>
                    {getPageNumbers().map((pageNumber, i) =>
                      pageNumber === "..." ? (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={currentPage === pageNumber}
                            onClick={() => handlePageChange(Number(pageNumber))}
                            aria-label={`الصفحة ${pageNumber}`}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                        aria-label="الصفحة التالية"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
