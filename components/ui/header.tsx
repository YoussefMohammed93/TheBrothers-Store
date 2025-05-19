"use client";

import React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import UserButton from "../user-button";
import { UserIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Skeleton } from "@/components/ui/skeleton";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { ShoppingCart, Heart, Search, Menu, Package } from "lucide-react";

const SearchDialog = lazy(() =>
  import("@/components/search-dialog").then((mod) => ({
    default: mod.SearchDialog,
  }))
);

const HeaderLinkSkeletonBase = ({
  isMobile = false,
}: {
  isMobile?: boolean;
}) => {
  return isMobile ? (
    <Skeleton className="h-9 w-full rounded-md" />
  ) : (
    <Skeleton className="h-6 w-20" />
  );
};

HeaderLinkSkeletonBase.displayName = "HeaderLinkSkeletonBase";
const HeaderLinkSkeleton = React.memo(HeaderLinkSkeletonBase);

const defaultHeaderLinks = [
  { _id: "default-1", name: "الرئيسية", href: "/", order: 0 },
  { _id: "default-2", name: "المنتجات", href: "/products", order: 1 },
  { _id: "default-3", name: "من نحن", href: "/about", order: 2 },
  { _id: "default-4", name: "اتصل بنا", href: "/contact", order: 3 },
  { _id: "default-5", name: "الشروط والأحكام", href: "/terms", order: 4 },
];

function HeaderBase() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const settings = useQuery(api.settings.get);
  const headerLinks = useQuery(api.header.getHeaderLinks);
  const getLogoUrl = useQuery(
    api.files.getImageUrl,
    settings?.logo && settings?.showLogo ? { storageId: settings.logo } : "skip"
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === href;
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const handleSearchOpen = useCallback(() => setSearchOpen(true), []);
  const handleMenuOpen = useCallback(() => setIsOpen(true), []);
  const handleMenuClose = useCallback(() => setIsOpen(false), []);

  const linksToRender = useMemo(() => {
    if (!headerLinks) return null;
    return headerLinks.length === 0 ? defaultHeaderLinks : headerLinks;
  }, [headerLinks]);

  const structuredData = useMemo(() => {
    if (!settings) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: settings.storeName || "تسوق",
      url: typeof window !== "undefined" ? window.location.origin : "",
      logo: getLogoUrl || "",
    };
  }, [settings, getLogoUrl]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b"
      role="banner"
      aria-label="Site header"
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <nav className="max-w-7xl mx-auto px-5" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            {!settings ? (
              <div className="flex items-center gap-2">
                <Skeleton
                  className="h-8 w-24"
                  aria-label="جاري تحميل اسم المتجر"
                />
              </div>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 relative"
                aria-label="Home page"
              >
                {settings.showLogo && settings.logo ? (
                  <div className="flex items-center gap-2">
                    <span className="relative h-10 w-10">
                      {getLogoUrl === undefined || getLogoUrl === null ? (
                        <Skeleton
                          className="h-10 w-10 rounded-full"
                          aria-label="جاري تحميل الشعار"
                        />
                      ) : (
                        <Image
                          src={getLogoUrl as string}
                          alt={settings.storeName || "شعار المتجر"}
                          width={40}
                          height={40}
                          priority
                          className="object-contain"
                          fetchPriority="high"
                          loading="eager"
                          onLoadingComplete={(img) => {
                            img.classList.add("animate-fadeIn");
                          }}
                        />
                      )}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {settings.storeName || "تسوق"}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {settings.storeName || "تسوق"}
                  </span>
                )}
              </Link>
            )}
          </div>
          <div
            className="hidden md:flex items-center gap-6"
            role="navigation"
            aria-label="Main menu"
          >
            {!headerLinks ? (
              <>
                <HeaderLinkSkeleton />
                <HeaderLinkSkeleton />
                <HeaderLinkSkeleton />
                <HeaderLinkSkeleton />
                <HeaderLinkSkeleton />
              </>
            ) : (
              linksToRender?.map((item) => (
                <Link
                  key={item._id}
                  href={item.href}
                  className={cn(
                    "relative py-1.5 text-sm font-medium transition-colors",
                    "hover:text-primary",
                    "after:absolute after:left-0 after:right-0 after:-bottom-[1.5px] after:h-0.5 after:rounded-full after:bg-primary after:transition-transform",
                    isActive(item.href)
                      ? "text-primary after:scale-x-100"
                      : "text-foreground/70 after:scale-x-0 hover:after:scale-x-100"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))
            )}
          </div>
          <div
            className="flex items-center gap-2.5"
            role="navigation"
            aria-label="User menu"
          >
            {useMemo(
              () => (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "flex transition-colors hover:bg-primary/10",
                      pathname === "/search" &&
                        "text-primary bg-primary/10 hover:bg-primary/10"
                    )}
                    onClick={handleSearchOpen}
                    aria-label="بحث"
                    aria-haspopup="dialog"
                  >
                    <Search className="h-5 w-5" />
                    <span className="sr-only">بحث</span>
                  </Button>
                  <Suspense fallback={null}>
                    {searchOpen && (
                      <SearchDialog
                        open={searchOpen}
                        onOpenChange={setSearchOpen}
                      />
                    )}
                  </Suspense>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "transition-colors hover:bg-primary/10",
                      pathname === "/cart" &&
                        "text-primary bg-primary/10 hover:bg-primary/10"
                    )}
                    asChild
                  >
                    <Link
                      href="/cart"
                      className="relative"
                      aria-label={`السلة - ${cartCount} منتج`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span
                          className="absolute -top-2 -right-2 h-5.5 w-5.5 rounded-full bg-primary text-sm pt-0.5 font-medium text-primary-foreground flex items-center justify-center"
                          aria-hidden="true"
                        >
                          {cartCount}
                        </span>
                      )}
                      <span className="sr-only">السلة</span>
                    </Link>
                  </Button>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                  <SignedOut>
                    <Button variant="outline" asChild>
                      <Link href="/sign-in" aria-label="تسجيل الدخول">
                        <UserIcon className="h-5 w-5 hidden sm:block" />
                        <span className="text-xs sm:text-sm">تسجيل الدخول</span>
                      </Link>
                    </Button>
                  </SignedOut>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={handleMenuOpen}
                    aria-label="القائمة"
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">القائمة</span>
                  </Button>
                </>
              ),
              [
                pathname,
                cartCount,
                searchOpen,
                isOpen,
                handleSearchOpen,
                handleMenuOpen,
              ]
            )}
          </div>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="right"
            className="w-full max-w-xs p-0"
            role="dialog"
            aria-label="Mobile menu"
          >
            <SheetHeader className="p-4 text-right border-b">
              <SheetTitle>القائمة</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col">
              <div className="flex-1 p-4">
                <div
                  className="space-y-1"
                  role="navigation"
                  aria-label="Mobile navigation"
                >
                  {!headerLinks ? (
                    <div className="space-y-2">
                      <HeaderLinkSkeleton isMobile />
                      <HeaderLinkSkeleton isMobile />
                      <HeaderLinkSkeleton isMobile />
                      <HeaderLinkSkeleton isMobile />
                      <HeaderLinkSkeleton isMobile />
                    </div>
                  ) : (
                    linksToRender?.map((item) => (
                      <Link
                        key={item._id}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground/70 hover:bg-primary/5 hover:text-foreground"
                        )}
                        onClick={handleMenuClose}
                        aria-current={isActive(item.href) ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
              <div className="border-t p-4">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full gap-2",
                      pathname === "/orders" &&
                        "bg-primary/10 text-primary border-primary"
                    )}
                    asChild
                  >
                    <Link
                      href="/orders"
                      onClick={handleMenuClose}
                      aria-label="طلباتي"
                    >
                      <Package className="h-4 w-4" aria-hidden="true" />
                      طلباتي
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full gap-2",
                      pathname === "/wishlist" &&
                        "bg-primary/10 text-primary border-primary"
                    )}
                    asChild
                  >
                    <Link
                      href="/wishlist"
                      onClick={handleMenuClose}
                      aria-label="المفضلة"
                    >
                      <Heart className="h-4 w-4" aria-hidden="true" />
                      المفضلة
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

HeaderBase.displayName = "HeaderBase";
export const Header = React.memo(HeaderBase);
