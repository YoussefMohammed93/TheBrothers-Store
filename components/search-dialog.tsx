"use client";

import Link from "next/link";
import * as React from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DialogTitle } from "@/components/ui/dialog";
import { CommandDialog } from "@/components/ui/command";
import { useCurrency } from "@/contexts/currency-context";
import { Loader2, Search, ShoppingBag, Tag } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SearchDialogBase({ open, onOpenChange }: SearchDialogProps) {
  // State declarations
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Data fetching and formatting
  const products = useQuery(api.products.getProducts);
  const { formatPrice } = useCurrency();

  // Computed values
  const filteredProducts = useMemo(() => {
    if (!products || !searchQuery.trim()) return [];

    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [products, searchQuery]);

  // Event handlers
  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const saveRecentSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      const newRecentSearches = [
        query,
        ...recentSearches.filter((item) => item !== query),
      ].slice(0, 5);

      setRecentSearches(newRecentSearches);
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    },
    [recentSearches]
  );

  const handleSelectRecentSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleViewAllResults = useCallback(() => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      onOpenChange(false);
    }
  }, [searchQuery, saveRecentSearch, onOpenChange]);

  const handleProductClick = useCallback(() => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      onOpenChange(false);
    }
  }, [searchQuery, saveRecentSearch, onOpenChange]);

  // Effects
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch {
      // Silent fail if localStorage is not available
    }
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange, open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">بحث المنتجات</DialogTitle>
      <div role="dialog" aria-label="بحث المنتجات">
        <div className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
            <input
              className="flex h-11 w-full rounded-md bg-transparent py-3 px-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              aria-label="ابحث عن منتج"
              role="searchbox"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {!products && searchQuery && (
              <div
                className="flex items-center justify-center py-6"
                role="status"
                aria-label="جاري التحميل"
              >
                <Loader2
                  className="h-6 w-6 animate-spin text-primary"
                  aria-hidden="true"
                />
                <span className="sr-only">جاري التحميل...</span>
              </div>
            )}
            {searchQuery && filteredProducts.length === 0 && (
              <div
                className="py-6 text-center text-sm"
                role="status"
                aria-live="polite"
              >
                لم يتم العثور على نتائج
              </div>
            )}
            {!searchQuery && recentSearches.length > 0 && (
              <div
                className="px-2 py-3"
                role="region"
                aria-label="عمليات البحث الأخيرة"
              >
                <div className="px-2 text-xs font-medium text-muted-foreground">
                  عمليات البحث الأخيرة
                </div>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSelectRecentSearch(search)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent text-left"
                    type="button"
                    aria-label={`البحث عن ${search}`}
                  >
                    <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && filteredProducts.length > 0 && (
              <div className="px-2 py-3" role="region" aria-label="نتائج البحث">
                <div className="px-2 text-xs font-medium text-muted-foreground mb-2">
                  المنتجات
                </div>
                <ul className="list-none p-0 m-0">
                  {filteredProducts.map((product) => {
                    const discountedPrice =
                      product.discountPercentage > 0
                        ? product.price * (1 - product.discountPercentage / 100)
                        : product.price;

                    return (
                      <li key={product._id}>
                        <Link
                          href={`/products/${product._id}`}
                          onClick={handleProductClick}
                          className="flex items-center gap-2 rounded-sm p-2 hover:bg-accent"
                          aria-label={`${product.name} - ${formatPrice(discountedPrice)}`}
                        >
                          <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                            {product.mainImageUrl && (
                              <Image
                                src={product.mainImageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" aria-hidden="true" />
                                {product.discountPercentage > 0 ? (
                                  <span className="text-primary font-medium">
                                    {formatPrice(discountedPrice)}
                                    <span className="text-muted-foreground line-through mr-1">
                                      {formatPrice(product.price)}
                                    </span>
                                  </span>
                                ) : (
                                  <span>{formatPrice(product.price)}</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href={`/search?search=${encodeURIComponent(searchQuery)}`}
                  onClick={handleViewAllResults}
                  className="flex justify-center rounded-sm px-2 py-1.5 text-primary text-sm font-medium hover:bg-accent"
                  aria-label="عرض كل نتائج البحث"
                >
                  عرض كل النتائج
                </Link>
              </div>
            )}
            {!searchQuery && (
              <div
                className="px-2 py-3"
                role="navigation"
                aria-label="روابط سريعة"
              >
                <div className="px-2 text-xs font-medium text-muted-foreground mb-2">
                  روابط سريعة
                </div>
                <Link
                  href="/products"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2 rounded-sm p-2 text-sm hover:bg-accent"
                  aria-label="تصفح جميع المنتجات"
                >
                  <ShoppingBag
                    className="h-4 w-4 opacity-50"
                    aria-hidden="true"
                  />
                  <span>تصفح جميع المنتجات</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </CommandDialog>
  );
}

SearchDialogBase.displayName = "SearchDialogBase";

export const SearchDialog = React.memo(SearchDialogBase);
