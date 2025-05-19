"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlist } from "@/contexts/wishlist-context";
import { ProductCard } from "@/components/ui/product-card";
import { Heart, Trash2, ArrowLeft, Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const WishlistSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 mt-20 sm:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="h-[465px] md:h-[520px] lg:h-[470px] xl:h-[430px] flex flex-col p-0"
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

const EmptyWishlist = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <Heart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">قائمة المفضلة فارغة</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        لم تقم بإضافة أي منتجات إلى قائمة المفضلة بعد. استعرض منتجاتنا وأضف ما
        يعجبك.
      </p>
      <Button asChild>
        <Link href="/products" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          تصفح المنتجات
        </Link>
      </Button>
    </div>
  );
};

export default function WishlistPage() {
  const { wishlistItems, isLoading, clearWishlist } = useWishlist();

  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return <WishlistSkeleton />;
  }

  const handleClearWishlist = async () => {
    setIsDeleting(true);
    try {
      await clearWishlist();
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const totalPages = Math.ceil(wishlistItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = wishlistItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-16">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">المفضلة</h1>
                <p className="text-muted-foreground">
                  {wishlistItems.length > 0
                    ? `لديك ${wishlistItems.length} ${wishlistItems.length === 1 ? "منتج" : "منتجات"} في المفضلة`
                    : "لا توجد منتجات في المفضلة"}
                </p>
              </div>
              {wishlistItems.length > 0 && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  حذف المفضلة
                </Button>
              )}
            </div>
            {wishlistItems.length === 0 ? (
              <EmptyWishlist />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedItems.map((item) => (
                    <ProductCard
                      key={item._id}
                      product={item.product}
                      showWishlistButton={true}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={
                            currentPage === i + 1 ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(i + 1)}
                          className={cn(
                            "w-10 h-10",
                            currentPage === i + 1 && "pointer-events-none"
                          )}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف المفضلة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف جميع المنتجات من المفضلة بشكل نهائي ولا يمكن التراجع عن
              هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearWishlist}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
