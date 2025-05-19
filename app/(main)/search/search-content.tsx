"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PackageX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ui/product-card";

const ITEMS_PER_PAGE = 12;

const EmptyStateMessage = ({ searchQuery }: { searchQuery: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="bg-muted p-5 rounded-full mb-4">
        <PackageX className="h-9 w-9 text-muted-foreground" />
      </div>
      <h3 className="text-lg sm:text-xl font-medium mb-2">
        لم يتم العثور على نتائج
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-[500px]">
        {searchQuery
          ? `لم نتمكن من العثور على أي منتجات تطابق "${searchQuery}"`
          : "يرجى إدخال كلمات البحث للعثور على المنتجات"}
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
};

export function SearchSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-20 sm:mt-16">
      <div className="max-w-lg mx-auto mb-8">
        <Skeleton className="h-10 w-48 mx-auto mb-6" />
        <div className="relative">
          <Skeleton className="h-14 w-full" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(12)].map((_, i) => (
          <Card
            key={i}
            className="h-[450px] sm:h-[470px] lg:h-[450px] xl:h-[430px] flex flex-col p-0"
          >
            <div className="relative aspect-[4/3]">
              <Skeleton className="absolute inset-0 w-full h-full rounded-t-lg" />
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
            <div className="p-3 pt-0 sm:p-4 flex flex-col gap-2 flex-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-10 w-full mt-auto" />
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-md" />
          ))}
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const products = useQuery(api.products.getProducts);

  if (!products) {
    return <SearchSkeleton />;
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 pt-12">
        <h2 className="text-center mb-8 text-xl sm:text-2xl">
          نتائج البحث عن :{" "}
          <b>
            <q> {searchQuery} </q>
          </b>
        </h2>
        <div className="relative max-w-xl mx-auto">
          <Input
            placeholder="ابحث عن المنتجات..."
            className="pr-12 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("search", searchQuery);
              window.history.pushState(
                {},
                "",
                `${window.location.pathname}?${params}`
              );
            }}
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      {filteredProducts.length === 0 ? (
        <EmptyStateMessage searchQuery={searchQuery} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                aspectRatio="portrait"
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">الصفحة السابقة</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
                {(() => {
                  const getPageNumbers = (): (number | string)[] => {
                    const pages: (number | string)[] = [];
                    for (let i = 1; i <= totalPages; i++) {
                      if (
                        i === 1 ||
                        i === totalPages ||
                        (i >= currentPage - 1 && i <= currentPage + 1)
                      ) {
                        pages.push(i);
                      } else if (
                        i === currentPage - 2 ||
                        i === currentPage + 2
                      ) {
                        pages.push("...");
                      }
                    }
                    return pages;
                  };
                  return getPageNumbers().map(
                    (page: number | string, i: number) => (
                      <Button
                        key={i}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => {
                          if (typeof page === "number") {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        disabled={typeof page !== "number"}
                      >
                        {page}
                      </Button>
                    )
                  );
                })()}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">الصفحة التالية</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 rotate-180"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
