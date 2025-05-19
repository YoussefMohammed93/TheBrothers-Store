"use client";

import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Script from "next/script";
import { cn } from "@/lib/utils";
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
import { StarIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { useCart } from "@/contexts/cart-context";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCurrency } from "@/contexts/currency-context";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState, useRef, useEffect, useMemo } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { Loader2, Minus, Plus, Heart, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProductReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  userImage?: string;
}

interface ReviewCardProps {
  review: ProductReview;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, newRating: number, newComment: string) => Promise<void>;
  isCurrentUserReview: boolean;
}

const ReviewCard = ({
  review,
  onDelete,
  onEdit,
  isCurrentUserReview,
}: ReviewCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [editedComment, setEditedComment] = useState(review.comment);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(review._id);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = async () => {
    try {
      setIsEditing(true);
      await onEdit(review._id, editedRating, editedComment);
      setShowEditDialog(false);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      <Card className="group p-0 relative">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className="hidden sm:block h-12 w-12 border-2 border-primary/10 self-start">
              <AvatarImage
                src={review.userImage}
                alt={review.userName}
                loading="lazy"
              />
              <AvatarFallback className="bg-primary/5">
                {review.userName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Avatar className="sm:hidden h-12 w-12 border-2 border-primary/10 self-start">
                  <AvatarImage
                    src={review.userImage}
                    alt={review.userName}
                    loading="lazy"
                  />
                  <AvatarFallback className="bg-primary/5">
                    {review.userName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
                  <div>
                    <div className="flex sm:items-center flex-col sm:flex-row flex-wrap gap-2">
                      <h3 className="font-semibold text-base sm:text-lg">
                        {review.userName}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                      >
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(review.createdAt).toLocaleDateString("ar-SA")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                            i < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                        ({review.rating} من 5)
                      </span>
                    </div>
                  </div>
                  {isCurrentUserReview && (
                    <div className="absolute top-1 left-3 sm:relative sm:top-auto sm:left-auto flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-2 sm:mt-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setShowEditDialog(true)}
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 mr-2 sm:mr-0 text-base sm:text-lg text-muted-foreground leading-relaxed break-words">
                {review.comment}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التقييم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف التقييم"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل التقييم</DialogTitle>
            <DialogDescription>
              قم بتعديل تقييمك وتعليقك على المنتج
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">التقييم</label>
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <button
                      key={index}
                      type="button"
                      className="hover:scale-110 transition cursor-pointer"
                      onClick={() => setEditedRating(starValue)}
                      onMouseEnter={() => setHoveredRating(starValue)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <StarIcon
                        className={`h-6 w-6 transition-colors ${
                          (
                            hoveredRating
                              ? hoveredRating >= starValue
                              : editedRating >= starValue
                          )
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  );
                })}
                {editedRating > 0 && (
                  <span className="text-sm text-muted-foreground mr-2 mt-1">
                    ({editedRating} من 5)
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">التعليق</label>
              <Textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                className="min-h-[100px]"
                disabled={isEditing}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isEditing}
            >
              إلغاء
            </Button>
            <Button onClick={handleEdit} disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التعديلات"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId as string;

  const product = useQuery(api.products.getProduct, {
    productId: productId as Id<"products">,
  });

  if (product === null) {
    notFound();
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProductDetails product={product} productId={productId as Id<"products">} />
  );
}

interface ProductType {
  _id: Id<"products">;
  name: string;
  description: string;
  mainImage: Id<"_storage">;
  mainImageUrl: string | null;
  gallery: Id<"_storage">[];
  galleryUrls: (string | null)[];
  price: number;
  discountPercentage: number;
  quantity: number;
  sizes: Array<{ name: string; price: number }>;
  colors: Array<{ name: string; value: string }>;
  categoryId: Id<"categories">;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

function ProductDetails({
  product,
  productId,
}: {
  product: ProductType;
  productId: Id<"products">;
}) {
  const category = useQuery(api.categories.getCategory, {
    categoryId: product?.categoryId as Id<"categories">,
  });

  const reviewsData = useQuery(api.reviews.getProductReviews, {
    productId: productId,
  });
  const reviews = useMemo(() => reviewsData || [], [reviewsData]);
  const currentUser = useQuery(api.users.currentUser);

  const addReviewMutation = useMutation(api.reviews.addReview);
  const deleteReviewMutation = useMutation(api.reviews.deleteReview);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTextClamped, setIsTextClamped] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isProductInCart } = useCart();
  const { formatPrice } = useCurrency();

  const isWishlisted = product?._id ? isInWishlist(product._id) : false;
  const isInCart = product?._id ? isProductInCart(product._id) : false;
  const isOutOfStock = product?.quantity !== undefined && product.quantity <= 0;

  const discountedPrice = useMemo(() => {
    if (!product) return 0;
    return product.price * (1 - product.discountPercentage / 100);
  }, [product]);

  const mainImageToShow = useMemo(() => {
    return selectedImage || product?.mainImageUrl || "/placeholder-product.jpg";
  }, [selectedImage, product?.mainImageUrl]);

  useEffect(() => {
    const checkIfClamped = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current;
        setIsTextClamped(
          !isExpanded && element.scrollHeight > element.clientHeight
        );
      }
    };

    checkIfClamped();

    let timeoutId: NodeJS.Timeout;
    const debouncedCheckIfClamped = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIfClamped, 100);
    };

    window.addEventListener("resize", debouncedCheckIfClamped);
    return () => {
      window.removeEventListener("resize", debouncedCheckIfClamped);
      clearTimeout(timeoutId);
    };
  }, [isExpanded]);

  useEffect(() => {
    console.log("Document title in client component:", document.title);
  }, []);

  const structuredData = useMemo(() => {
    if (!product || !product._id) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.mainImageUrl || "/placeholder-product.jpg",
      sku: product._id,
      offers: {
        "@type": "Offer",
        price: discountedPrice,
        priceCurrency: "SAR",
        availability:
          product.quantity > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
      ...(reviews.length > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue:
            reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length,
          reviewCount: reviews.length,
        },
      }),
    };
  }, [product, discountedPrice, reviews]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSubmitReview = async () => {
    if (!currentUser) {
      toast.error("يجب تسجيل الدخول لإضافة تقييم");
      return;
    }

    if (rating === 0) {
      toast.error("يرجى اختيار تقييم");
      return;
    }

    if (!comment.trim()) {
      toast.error("يرجى كتابة تعليق");
      return;
    }

    setIsSubmittingReview(true);

    try {
      await addReviewMutation({
        productId: productId as Id<"products">,
        rating,
        comment,
      });

      toast.success("تم إضافة تقييمك بنجاح");
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("حدث خطأ أثناء إضافة التقييم");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {structuredData && (
        <Script id="product-structured-data" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
      )}
      <main className="flex-1 bg-background py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-5 mt-20">
          <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12">
            <div className="space-y-4 w-full lg:w-[400px]">
              <AspectRatio ratio={1}>
                <div className="relative h-full border w-full rounded-lg overflow-hidden">
                  <ProductImage
                    src={mainImageToShow}
                    alt={product.name}
                    priority={true}
                    className="p-2 sm:p-4"
                  />
                  {product.discountPercentage > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 sm:top-4 right-2 sm:right-4"
                    >
                      خصم {product.discountPercentage}%
                    </Badge>
                  )}
                  {product.badges?.includes("جديد") && (
                    <Badge
                      variant="default"
                      className="absolute top-2 sm:top-4 right-2 sm:right-4 mt-8 bg-green-500"
                    >
                      جديد
                    </Badge>
                  )}
                  {product.badges?.includes("عرض خاص") && (
                    <Badge
                      variant="default"
                      className="absolute top-2 sm:top-4 right-2 sm:right-4 mt-16 bg-blue-500"
                    >
                      عرض خاص
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isWishlisted) {
                        removeFromWishlist(product._id);
                      } else {
                        addToWishlist(product._id);
                      }
                    }}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5",
                        isWishlisted
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </Button>
                </div>
              </AspectRatio>
              {product.galleryUrls && product.galleryUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-w-[400px]">
                  <div className="aspect-square relative">
                    <div className="relative h-full w-full">
                      <ProductImage
                        src={product.mainImageUrl ?? "/placeholder-product.jpg"}
                        alt={product.name}
                        className={`p-1.5 rounded-md cursor-pointer hover:opacity-80 transition ${
                          !selectedImage
                            ? "border-2 border-primary"
                            : "border-2 border-transparent"
                        }`}
                      />
                      <div
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => setSelectedImage(null)}
                        aria-label="View main product image"
                      />
                    </div>
                  </div>
                  {product.galleryUrls.map((url, index) => (
                    <div key={index} className="aspect-square relative">
                      <div className="relative h-full w-full">
                        <ProductImage
                          src={url || "/placeholder-product.jpg"}
                          alt={`${product.name} - ${index + 1}`}
                          className={`p-1.5 rounded-md cursor-pointer hover:opacity-80 transition ${
                            selectedImage === url
                              ? "border-2 border-primary"
                              : "border-2 border-transparent"
                          }`}
                          priority={index < 2}
                        />
                        <div
                          className="absolute inset-0 cursor-pointer"
                          onClick={() => setSelectedImage(url)}
                          aria-label={`View product image ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-6 flex-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {product.name}
                </h1>
                <p className="text-justify text-sm sm:text-base text-muted-foreground mt-2">
                  {product.description}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    {formatPrice(discountedPrice)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-base sm:text-lg text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs sm:text-sm px-4",
                    product.quantity > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {product.quantity > 0 ? "متوفر" : "غير متوفر"}
                </Badge>
              </div>
              <Separator className="my-4 sm:my-6" />
              {product.sizes.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-sm font-medium">اختر المقاس</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full sm:w-[200px] mt-2">
                      <SelectValue placeholder="اختر المقاس" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size.name} value={size.name}>
                          {size.name} -{" "}
                          {formatPrice(
                            size.price * (1 - product.discountPercentage / 100)
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedSize && (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {formatPrice(
                      (product.sizes.find((s) => s.name === selectedSize)
                        ?.price ?? product.price) *
                        (1 - product.discountPercentage / 100)
                    )}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(
                        product.sizes.find((s) => s.name === selectedSize)
                          ?.price ?? product.price
                      )}
                    </span>
                  )}
                </div>
              )}
              {product.colors.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-sm font-medium">اختر اللون</label>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={cn(
                          "group relative size-8 sm:size-10 rounded-full cursor-pointer transition-all",
                          "ring-offset-2 ring-offset-background",
                          selectedColor === color.name
                            ? "ring-2 ring-primary scale-105"
                            : "hover:ring-2 hover:ring-primary/50",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        <span className="sr-only">
                          {selectedColor === color.name
                            ? `اللون ${color.name} محدد`
                            : `اختر اللون ${color.name}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-sm font-medium">الكمية</label>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <span className="w-8 sm:w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (quantity >= product.quantity) {
                        toast.warning(
                          `عذراً، المتوفر في المخزون ${product.quantity} قطعة فقط`
                        );
                        return;
                      }
                      setQuantity(quantity + 1);
                    }}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
                <Button
                  className="w-full sm:flex-1 gap-2 py-5 sm:py-6"
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(
                      product._id,
                      quantity,
                      selectedSize,
                      selectedColor
                    );
                  }}
                  variant={
                    isInCart
                      ? "secondary"
                      : isOutOfStock
                        ? "destructive"
                        : "default"
                  }
                  disabled={isInCart || isOutOfStock}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isInCart
                    ? "في السلة"
                    : isOutOfStock
                      ? "نفذ المنتج"
                      : "إضافة للسلة"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 gap-2 py-5 sm:py-6"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isWishlisted) {
                      removeFromWishlist(product._id);
                    } else {
                      addToWishlist(product._id);
                    }
                  }}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isWishlisted ? "fill-primary text-primary" : ""
                    )}
                  />
                  {isWishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                </Button>
              </div>
              <div className="space-y-3 sm:space-y-4 mt-6">
                <h2 className="text-lg sm:text-xl font-semibold">
                  تفاصيل المنتج
                </h2>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs sm:text-sm",
                        product.quantity > 0
                          ? "border-transparent bg-green-500 text-white"
                          : "border-transparent bg-red-500 text-white"
                      )}
                    >
                      {product.quantity > 0 ? "متوفر" : "غير متوفر"}
                    </Badge>
                    {product.discountPercentage > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs sm:text-sm border-transparent bg-green-500 text-white"
                      >
                        خصم {product.discountPercentage}%
                      </Badge>
                    )}
                    {category && (
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        {category.name}
                      </Badge>
                    )}
                    {product.badges &&
                      product.badges.length > 0 &&
                      product.badges.map((badge) => (
                        <Badge
                          key={badge}
                          variant="outline"
                          className="text-xs sm:text-sm"
                        >
                          {badge}
                        </Badge>
                      ))}
                  </div>
                  <div className="relative">
                    <p
                      ref={descriptionRef}
                      className={cn(
                        "text-justify text-xs sm:text-sm text-muted-foreground",
                        !isExpanded && "line-clamp-2"
                      )}
                    >
                      {product.description}
                    </p>
                    {isTextClamped && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                          "cursor-pointer text-xs sm:text-sm hover:underline mt-1",
                          "text-primary"
                        )}
                      >
                        {isExpanded ? "عرض أقل" : "عرض المزيد"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t pt-10" id="reviews-section">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">التقييمات والمراجعات</h2>
                <p className="text-muted-foreground mt-1">
                  {reviews.length} تقييمات من عملائنا
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <StarIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      متوسط التقييم
                    </p>
                    <p className="text-2xl font-bold">
                      {reviews.length > 0
                        ? (
                            reviews.reduce(
                              (acc, review) => acc + review.rating,
                              0
                            ) / reviews.length
                          ).toFixed(1)
                        : "0.0"}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      عدد التقييمات
                    </p>
                    <p className="text-2xl font-bold">{reviews.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ThumbsUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">نسبة الرضا</p>
                    <p className="text-2xl font-bold">
                      {reviews.length > 0
                        ? Math.round(
                            (reviews.filter((r) => r.rating >= 4).length /
                              reviews.length) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <Card className="mb-8" id="add-review-section">
              <CardHeader>
                <CardTitle>أضف تقييمك</CardTitle>
                <CardDescription>شاركنا رأيك في المنتج</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    التقييم
                  </label>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, index) => {
                      const starValue = index + 1;
                      return (
                        <button
                          key={index}
                          type="button"
                          className="hover:scale-110 transition"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onMouseLeave={() => setHoveredRating(0)}
                        >
                          <StarIcon
                            className={`h-6 w-6 transition-colors ${
                              (
                                hoveredRating
                                  ? hoveredRating >= starValue
                                  : rating >= starValue
                              )
                                ? "text-amber-500 fill-amber-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    {rating > 0 && (
                      <span className="text-sm text-muted-foreground mr-2 mt-1">
                        ({rating} من 5)
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    التعليق
                  </label>
                  <Textarea
                    placeholder="اكتب تعليقك هنا..."
                    className="min-h-[100px]"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || !currentUser}
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال التقييم"
                  )}
                </Button>
                {!currentUser && (
                  <p className="text-sm text-red-500 mt-2">
                    يجب تسجيل الدخول لإضافة تقييم
                  </p>
                )}
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    isCurrentUserReview={currentUser?._id === review.userId}
                    onDelete={async (id) => {
                      try {
                        await deleteReviewMutation({
                          reviewId: id as Id<"reviews">,
                        });
                        toast.success("تم حذف التقييم بنجاح");
                      } catch {
                        toast.error("حدث خطأ أثناء حذف التقييم");
                      }
                    }}
                    onEdit={async (_reviewId, newRating, newComment) => {
                      try {
                        await addReviewMutation({
                          productId: productId as Id<"products">,
                          rating: newRating,
                          comment: newComment,
                        });
                        toast.success("تم تحديث التقييم بنجاح");
                      } catch {
                        toast.error("حدث خطأ أثناء تحديث التقييم");
                      }
                    }}
                  />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-10 px-4 sm:py-16 bg-muted/10 rounded-lg border border-dashed border-muted-foreground/50">
                  <div className="bg-primary/5 p-4 rounded-full mb-4">
                    <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-primary/60" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium mb-2">
                    لا توجد تقييمات
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base text-center max-w-md">
                    لا توجد تقييمات لهذا المنتج حتى الآن. كن أول من يشارك رأيه
                    ويساعد الآخرين في اتخاذ قرار الشراء.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 gap-2 group hover:bg-primary hover:text-white transition-all duration-300"
                    onClick={() =>
                      document
                        .getElementById("add-review-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <StarIcon className="h-4 w-4 group-hover:fill-white transition-all duration-300" />
                    أضف تقييمك الآن
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
