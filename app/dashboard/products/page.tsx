/* eslint-disable @next/next/no-img-element */
"use client";

import {
  PackageIcon,
  TagIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Eye,
} from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "./loading-skeleton";
import { ProductDialog } from "./product-dialog";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/contexts/currency-context";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Product {
  _id: string;
  name: string;
  description: string;
  mainImage: string;
  mainImageUrl?: string;
  gallery: string[];
  galleryUrls?: string[];
  price: number;
  discountPercentage: number;
  quantity: number;
  colors: Array<{
    name: string;
    value: string;
  }>;
  categoryId: string;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

const EmptyState = ({ onAdd }: { onAdd: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="bg-muted p-5 rounded-full mb-4">
        <PackageIcon className="h-9 w-9 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">لا توجد منتجات</h3>
      <p className="text-sm text-muted-foreground mb-4">
        لم تقم بإضافة أي منتجات بعد. ابدأ بإضافة منتجك الأول.
      </p>
      <Button onClick={onAdd} className="gap-2">
        <PlusIcon className="h-4 w-4" />
        إضافة منتج جديد
      </Button>
    </div>
  );
};

interface NoResultsMessageProps {
  filters: {
    search: string;
    category: string;
    status: "all" | "inStock" | "outOfStock" | "discount";
  };
  onClear: () => void;
}

const NoResultsMessage = ({ filters, onClear }: NoResultsMessageProps) => {
  const categories = useQuery(api.categories.getCategories);
  const activeFilters = [];

  if (filters.search) {
    activeFilters.push(`البحث: "${filters.search}"`);
  }
  if (filters.category !== "all") {
    const categoryName =
      categories?.find((cat) => cat._id === filters.category)?.name ??
      filters.category;
    activeFilters.push(`الفئة: "${categoryName}"`);
  }
  if (filters.status !== "all") {
    const statusLabels = {
      inStock: "متوفر",
      outOfStock: "نفذ",
      discount: "خصم",
    };
    activeFilters.push(`الحالة: "${statusLabels[filters.status]}"`);
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="bg-muted p-5 rounded-full mb-4">
        <PackageIcon className="h-9 w-9 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">لم يتم العثور على منتجات</h3>
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
};

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const { formatPrice } = useCurrency();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "inStock" | "outOfStock" | "discount"
  >("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setFilterStatus("all");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      scrollToTop();
    },
    [scrollToTop]
  );

  const products = useQuery(api.products.getProducts);
  const categories = useQuery(api.categories.getCategories);
  const deleteProductMutation = useMutation(api.products.deleteProduct);

  // Debug logging
  console.log("Dashboard - Products data:", products);
  console.log("Dashboard - Products length:", products?.length);
  console.log("Dashboard - Categories data:", categories);

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      await deleteProductMutation({
        productId: deletingProduct._id as Id<"products">,
      });
      toast.success("تم حذف المنتج بنجاح");
      setShowDeleteDialog(false);
    } catch {
      toast.error("حدث خطأ أثناء حذف المنتج");
    } finally {
      setIsDeleting(false);
      setDeletingProduct(null);
    }
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter;

    const matchesStatus = () => {
      switch (filterStatus) {
        case "inStock":
          return product.quantity > 0;
        case "outOfStock":
          return product.quantity === 0;
        case "discount":
          return product.discountPercentage > 0;
        default:
          return true;
      }
    };

    return matchesSearch && matchesCategory && matchesStatus();
  });

  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sortedProducts.length);
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

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

  const handleFilterClick = () => {
    const states: ("all" | "inStock" | "outOfStock" | "discount")[] = [
      "all",
      "inStock",
      "outOfStock",
      "discount",
    ];
    const currentIndex = states.indexOf(filterStatus);
    const nextIndex = (currentIndex + 1) % states.length;
    setFilterStatus(states[nextIndex]);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handlePreviewProduct = (product: Product) => {
    setPreviewProduct(product);
    setIsPreviewOpen(true);
  };

  if (!products || !categories) {
    return <LoadingSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="pt-14 mb-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
            <Heading
              title="المنتجات"
              description="إدارة وعرض جميع المنتجات المتاحة في متجرك."
            />
          </div>
        </div>
        <EmptyState onAdd={handleAddProduct} />
        <ProductDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          initialData={
            editingProduct
              ? {
                  ...editingProduct,
                  _id: editingProduct._id as Id<"products">,
                  mainImage: editingProduct.mainImage as Id<"_storage">,
                  gallery: editingProduct.gallery as Id<"_storage">[],
                  categoryId: editingProduct.categoryId as Id<"categories">,
                }
              : undefined
          }
        />
      </div>
    );
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
          <Heading
            title="المنتجات"
            description="إدارة وعرض جميع المنتجات المتاحة في متجرك."
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleAddProduct}
          >
            <PlusIcon className="h-4 w-4" />
            إضافة منتج جديد
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <PackageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{products?.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  المنتجات المتوفرة
                </p>
                <p className="text-2xl font-bold">
                  {products?.filter((p) => p.quantity > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-red-500/10 p-3 rounded-full">
                <ArrowDownIcon className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">منتجات نفذت</p>
                <p className="text-2xl font-bold">
                  {products?.filter((p) => p.quantity === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border py-4">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <TagIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">منتجات بخصم</p>
                <p className="text-2xl font-bold">
                  {products?.filter((p) => p.discountPercentage > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="relative md:col-span-6">
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن منتج..."
            className="pr-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <Button
            variant="outline"
            className="gap-2 flex-1"
            onClick={handleFilterClick}
          >
            <FilterIcon className="h-4 w-4" />
            {filterStatus === "all"
              ? "تصفية"
              : filterStatus === "inStock"
                ? "متوفر"
                : filterStatus === "outOfStock"
                  ? "نفذ"
                  : "خصم"}
          </Button>
        </div>
        <div className="md:col-span-2">
          <Select
            dir="rtl"
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-full text-right">
              <SelectValue placeholder="كل الفئات" />
            </SelectTrigger>
            <SelectContent className="text-right">
              <SelectItem value="all" className="pr-2">
                كل الفئات
              </SelectItem>
              {categories?.map((category) => (
                <SelectItem
                  key={category._id}
                  value={category._id}
                  className="pr-2"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {sortedProducts?.length === 0 ? (
        <NoResultsMessage
          filters={{
            search: searchQuery,
            category: categoryFilter,
            status: filterStatus,
          }}
          onClear={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {paginatedProducts.map((product) => (
            <Card key={product._id} className="border p-0 pt-3 pr-3">
              <CardContent className="p-0">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={product.mainImageUrl ?? "/placeholder-product.jpg"}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                    {product.discountPercentage > 0 && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white px-1 py-0.5 text-xs">
                        {product.discountPercentage}%
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1 pl-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatPrice(
                          product.price *
                            (1 - (product.discountPercentage || 0) / 100)
                        )}
                      </span>
                      {product.discountPercentage > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 pr-0 pl-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      product.quantity > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.quantity > 0 ? "متوفر" : "نفذ المخزون"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    المخزون: {product.quantity}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      handlePreviewProduct({
                        ...product,
                        mainImageUrl: product.mainImageUrl ?? undefined,
                        galleryUrls:
                          product.galleryUrls?.filter(
                            (url: string | undefined | null): url is string =>
                              url !== undefined && url !== null
                          ) ?? [],

                      })
                    }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      handleEditProduct({
                        ...product,
                        mainImageUrl: product.mainImageUrl ?? undefined,
                        galleryUrls:
                          product.galleryUrls?.filter(
                            (url: string | undefined | null): url is string =>
                              url !== undefined && url !== null
                          ) ?? [],

                      })
                    }
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                    onClick={() => {
                      setDeletingProduct({
                        ...product,
                        mainImageUrl: product.mainImageUrl ?? undefined,
                        galleryUrls:
                          product.galleryUrls?.filter(
                            (url: string | undefined | null): url is string =>
                              url !== undefined && url !== null
                          ) ?? [],

                      });
                      setShowDeleteDialog(true);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {sortedProducts.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground">
            عرض {startIndex + 1} إلى {Math.min(endIndex, sortedProducts.length)}{" "}
            من {sortedProducts.length} منتج
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
                        onClick={() => handlePageChange(Number(pageNumber))}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
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
          )}
        </div>
      )}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialData={
          editingProduct
            ? {
                ...editingProduct,
                _id: editingProduct._id as Id<"products">,
                mainImage: editingProduct.mainImage as Id<"_storage">,
                gallery: editingProduct.gallery as Id<"_storage">[],
                categoryId: editingProduct.categoryId as Id<"categories">,
              }
            : undefined
        }
      />
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المنتج؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المنتج بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
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
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent side="right" className="w-full !max-w-xl overflow-y-auto">
          <SheetHeader className="space-y-4 px-6 pb-4 border-b">
            <SheetTitle className="text-2xl">معاينة المنتج</SheetTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={previewProduct?.quantity ? "outline" : "destructive"}
              >
                {previewProduct?.quantity ? "متوفر" : "نفذ المخزون"}
              </Badge>
              <Badge variant="outline">
                المخزون: {previewProduct?.quantity}
              </Badge>
            </div>
          </SheetHeader>
          {previewProduct && (
            <div className="space-y-6 p-6">
              <AspectRatio
                ratio={16 / 9}
                className="bg-muted rounded-lg overflow-hidden"
              >
                <Image
                  src={
                    previewProduct.mainImageUrl ?? "/placeholder-product.jpg"
                  }
                  alt={previewProduct.name}
                  fill
                  className="object-contain p-3 sm:p-5"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </AspectRatio>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {previewProduct.name}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {previewProduct.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div>
                      <Label>السعر الأساسي</Label>
                      <div className="text-2xl font-bold text-primary mt-1">
                        {formatPrice(previewProduct.price)}
                      </div>
                    </div>
                    {previewProduct.discountPercentage > 0 && (
                      <div>
                        <Label>السعر بعد الخصم</Label>
                        <div className="text-2xl font-bold text-muted-foreground mt-1">
                          {formatPrice(
                            previewProduct.price *
                              (1 -
                                (previewProduct.discountPercentage || 0) / 100)
                          )}
                          <Badge variant="secondary" className="mr-2">
                            خصم {previewProduct.discountPercentage}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <Label>الألوان المتوفرة</Label>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {previewProduct.colors.map((color) => (
                          <div
                            key={color.name}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color.value }}
                            />
                            <span className="text-sm">{color.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {previewProduct.badges.length > 0 && (
                      <div>
                        <Label>الشارات</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {previewProduct.badges.map((badge) => (
                            <Badge key={badge} variant="outline">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
