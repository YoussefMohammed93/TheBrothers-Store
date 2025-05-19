/* eslint-disable @next/next/no-img-element */
"use client";

import {
  StarIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpIcon,
  MessageCircleIcon,
  TrashIcon,
  PackageIcon,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReviewsSkeleton from "./reviews-skeleton";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent } from "@/components/ui/card";

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState<string | null>(
    null
  );
  const ITEMS_PER_PAGE = 5;

  const allReviews = useQuery(api.reviews.getAllReviews);
  const deleteReviewMutation = useMutation(api.reviews.adminDeleteReview);
  const toggleFeaturedMutation = useMutation(api.reviews.toggleReviewFeatured);

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      await deleteReviewMutation({
        reviewId: reviewToDelete as Id<"reviews">,
      });
      toast.success("تم حذف التقييم بنجاح");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("حدث خطأ أثناء حذف التقييم");
    } finally {
      setIsDeleting(false);
      setReviewToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleFeatured = async (reviewId: string, featured: boolean) => {
    setIsTogglingFeatured(reviewId);
    try {
      await toggleFeaturedMutation({
        reviewId: reviewId as Id<"reviews">,
        featured: !featured,
      });
      toast.success(
        !featured
          ? "تم إضافة التقييم للعرض في الصفحة الرئيسية"
          : "تم إزالة التقييم من العرض في الصفحة الرئيسية"
      );
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة العرض");
    } finally {
      setIsTogglingFeatured(null);
    }
  };

  const confirmDeleteReview = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteDialogOpen(true);
  };

  const filteredReviews = allReviews
    ? allReviews.filter((review) => {
        const matchesSearch =
          review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.productName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRating =
          ratingFilter === "all" || review.rating === parseInt(ratingFilter);

        return matchesSearch && matchesRating;
      })
    : [];

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return pages;
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRatingFilter = (value: string) => {
    setRatingFilter(value);
    setCurrentPage(1);
  };

  if (!allReviews) {
    return <ReviewsSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
          <Heading
            title="التقييمات"
            description="إدارة وعرض جميع التقييمات الواردة في متجرك."
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageCircleIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  إجمالي التقييمات
                </p>
                <p className="text-2xl font-bold">{allReviews?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/10 p-3 rounded-full">
                <StarIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                <p className="text-2xl font-bold">
                  {allReviews.length > 0
                    ? (
                        allReviews.reduce(
                          (acc, review) => acc + review.rating,
                          0
                        ) / allReviews.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <PackageIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  المنتجات المقيمة
                </p>
                <p className="text-2xl font-bold">
                  {new Set(allReviews.map((review) => review.productId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في التقييمات..."
              className="pr-9 w-full"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <Select value={ratingFilter} onValueChange={handleRatingFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="التقييم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="5">5 نجوم</SelectItem>
            <SelectItem value="4">4 نجوم</SelectItem>
            <SelectItem value="3">3 نجوم</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <FilterIcon className="h-4 w-4" />
          تصفية
        </Button>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <ArrowUpIcon className="h-4 w-4" />
          ترتيب
        </Button>
      </div>
      <div className="space-y-4">
        {paginatedReviews.length > 0 ? (
          paginatedReviews.map((review) => (
            <Card key={review._id} className="border">
              <CardContent className="px-6 py-0">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={review.productImage || "/placeholder-product.jpg"}
                      alt={review.productName}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start flex-col sm:flex-row justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-semibold">{review.userName}</h3>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          اسم المنتج : <strong>{review.productName}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          التعليق : <b>{review.comment}</b>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US"
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="size-8"
                          onClick={() =>
                            handleToggleFeatured(review._id, !!review.featured)
                          }
                          disabled={isTogglingFeatured === review._id}
                          title={
                            review.featured
                              ? "إزالة من العرض في الصفحة الرئيسية"
                              : "إضافة للعرض في الصفحة الرئيسية"
                          }
                        >
                          {isTogglingFeatured === review._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : review.featured ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          onClick={() => confirmDeleteReview(review._id)}
                          disabled={isDeleting}
                        >
                          {isDeleting && reviewToDelete === review._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-3">
              <MessageCircleIcon className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="font-semibold text-lg">
                لم يتم العثور على تقييمات
              </h3>
              <p className="text-muted-foreground text-sm">
                لا توجد تقييمات متطابقة مع معايير البحث الحالية
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {getPageNumbers().map((pageNumber, index) =>
              pageNumber === "..." ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={currentPage === pageNumber}
                    onClick={() => setCurrentPage(Number(pageNumber))}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              هل أنت متأكد من حذف هذا التقييم؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف التقييم نهائياً من قاعدة
              البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
