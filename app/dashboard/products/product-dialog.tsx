"use client";

import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "convex/react";
import { ImageUpload } from "@/components/ui/image-upload";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    _id: Id<"products">;
    name: string;
    description: string;
    mainImage: Id<"_storage">;
    mainImageUrl?: string;
    gallery: Id<"_storage">[];
    galleryUrls?: string[];
    price: number;
    discountPercentage: number;
    quantity: number;
    sizes: string[];
    colors: Array<{ name: string; value: string }>;
    categoryId: Id<"categories">;
    badges: string[];
  };
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = [
  { name: "أسود", value: "#1a1a1a" },
  { name: "رمادي", value: "#6b7280" },
  { name: "أبيض", value: "#dedede" },
  { name: "أزرق", value: "#3b82f6" },
  { name: "أخضر", value: "#22c55e" },
  { name: "أحمر", value: "#ef4444" },
];
const AVAILABLE_BADGES = ["جديد", "الأكثر مبيعاً", "خصم", "عرض خاص"];

export function ProductDialog({
  isOpen,
  onClose,
  initialData,
}: ProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [remainingInitialGallery, setRemainingInitialGallery] = useState<
    string[]
  >([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPercentage: "0",
    quantity: "",
    sizes: [] as { name: string; price: number }[],
    colors: [] as { name: string; value: string }[],
    categoryId: "",
    badges: [] as string[],
  });
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState({
    name: false,
    price: false,
    quantity: false,
    sizes: false,
    colors: false,
    categoryId: false,
  });
  const [hasAnyImage, setHasAnyImage] = useState(true);

  const categories = useQuery(api.categories.getCategories);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveProduct = useMutation(api.products.saveProduct);
  const deleteStorageId = useMutation(api.files.deleteStorageId);

  const validateForm = (): boolean => {
    const errors = {
      name: formData.name.trim().length === 0,
      price: formData.price.trim().length === 0 || Number(formData.price) <= 0,
      quantity:
        formData.quantity.trim().length === 0 || Number(formData.quantity) < 0,
      sizes: formData.sizes.length === 0,
      colors: formData.colors.length === 0,
      categoryId: formData.categoryId.trim().length === 0,
    };

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const isFormValid = (): boolean => {
    const isEditMode = !!initialData;
    const hasMainImage = isEditMode
      ? mainImagePreview !== null ||
        (!!initialData.mainImageUrl && mainImageFile === null)
      : mainImageFile !== null;

    const hasGalleryImages =
      galleryPreviews.length > 0 || remainingInitialGallery.length > 0;

    const hasRequiredImages = isEditMode
      ? hasMainImage || hasGalleryImages
      : hasMainImage;

    const formIsValid =
      formData.name.trim().length > 0 &&
      formData.price.trim().length > 0 &&
      Number(formData.price) > 0 &&
      formData.quantity.trim().length > 0 &&
      Number(formData.quantity) >= 0 &&
      formData.sizes.length > 0 &&
      formData.colors.length > 0 &&
      formData.categoryId.trim().length > 0 &&
      hasRequiredImages;

    return formIsValid;
  };

  useEffect(() => {
    return () => {
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
      galleryPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [mainImagePreview, galleryPreviews]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price.toString(),
        discountPercentage: initialData.discountPercentage.toString(),
        quantity: initialData.quantity.toString(),
        sizes: initialData.sizes.map((size) => ({
          name: size,
          price: initialData.price,
        })),
        colors: initialData.colors,
        categoryId: initialData.categoryId,
        badges: initialData.badges,
      });

      if (initialData.mainImageUrl) {
        setMainImagePreview(initialData.mainImageUrl);
      }

      if (initialData.galleryUrls?.length) {
        setGalleryPreviews(initialData.galleryUrls);
        setRemainingInitialGallery(initialData.gallery as string[]);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discountPercentage: "0",
      quantity: "",
      sizes: [],
      colors: [],
      categoryId: "",
      badges: [],
    });

    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }
    galleryPreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    setMainImageFile(null);
    setMainImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setRemainingInitialGallery([]);
    setImagesToDelete([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      if (imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map((id) =>
            deleteStorageId({ storageId: id as Id<"_storage"> })
          )
        );
      }

      let mainImageId = initialData?.mainImage;
      let galleryIds = initialData?.gallery || [];

      if (mainImageFile) {
        if (initialData?.mainImage) {
          await deleteStorageId({ storageId: initialData.mainImage });
        }
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": mainImageFile.type },
          body: mainImageFile,
        });
        const { storageId } = await result.json();
        mainImageId = storageId;
      }

      if (galleryFiles.length > 0) {
        const newGalleryIds = await Promise.all(
          galleryFiles.map(async (file) => {
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            });
            const { storageId } = await result.json();
            return storageId;
          })
        );

        galleryIds = newGalleryIds;
      } else if (imagesToDelete.length > 0) {
        galleryIds =
          initialData?.gallery?.filter((id) => !imagesToDelete.includes(id)) ||
          [];
      }

      await saveProduct({
        id: initialData?._id,
        name: formData.name,
        description: formData.description,
        mainImage: mainImageId as Id<"_storage">,
        gallery: galleryIds as Id<"_storage">[],
        price: Number(formData.price),
        discountPercentage: Number(formData.discountPercentage),
        quantity: Number(formData.quantity),
        sizes: formData.sizes,
        colors: formData.colors,
        categoryId: formData.categoryId as Id<"categories">,
        badges: formData.badges,
      });

      toast.success(
        initialData ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح"
      );

      resetForm();
      setImagesToDelete([]);
      onClose();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const existingSize = prev.sizes.find((s) => s.name === size);
      if (existingSize) {
        return {
          ...prev,
          sizes: prev.sizes.filter((s) => s.name !== size),
        };
      } else {
        return {
          ...prev,
          sizes: [
            ...prev.sizes,
            { name: size, price: Number(prev.price) || 0 },
          ],
        };
      }
    });
  };

  const updateSizePrice = (sizeName: string, price: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) =>
        s.name === sizeName ? { ...s, price: Number(price) || 0 } : s
      ),
    }));
  };

  const toggleColor = (color: { name: string; value: string }) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.some((c) => c.name === color.name)
        ? prev.colors.filter((c) => c.name !== color.name)
        : [...prev.colors, color],
    }));
  };

  const toggleBadge = (badge: string) => {
    setFormData((prev) => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter((b) => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  const handleGalleryImageRemove = (index: number) => {
    const currentImage = initialData?.gallery?.[index];

    if (currentImage) {
      setImagesToDelete((prev) => [...prev, currentImage]);
      setRemainingInitialGallery((prev) =>
        prev.filter((id) => id !== currentImage)
      );
    }

    if (galleryPreviews[index]) {
      URL.revokeObjectURL(galleryPreviews[index]);
    }

    const newGalleryPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryPreviews(newGalleryPreviews);
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));

    const hasMainImg = mainImagePreview !== null;
    const hasGalleryImgs = newGalleryPreviews.length > 0;
    setHasAnyImage(hasMainImg || hasGalleryImgs);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-2xl max-h-[600px] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "تعديل منتج" : "إضافة منتج جديد"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                اسم المنتج
              </label>
              <Input
                id="name"
                placeholder="اسم المنتج"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setFormErrors({ ...formErrors, name: false });
                }}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <span className="text-xs text-red-500">اسم المنتج مطلوب</span>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                وصف المنتج
              </label>
              <Textarea
                id="description"
                placeholder="وصف المنتج"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                السعر
              </label>
              <Input
                id="price"
                type="number"
                placeholder="السعر"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  setFormErrors({ ...formErrors, price: false });
                }}
                className={formErrors.price ? "border-red-500" : ""}
              />
              {formErrors.price && (
                <span className="text-xs text-red-500">
                  السعر يجب أن يكون أكبر من صفر
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="discount" className="text-sm font-medium">
                نسبة الخصم
              </label>
              <Input
                id="discount"
                type="number"
                max={100}
                min={0}
                placeholder="نسبة الخصم"
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercentage: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                الكمية المتوفرة
              </label>
              <Input
                id="quantity"
                type="number"
                placeholder="الكمية المتوفرة"
                value={formData.quantity}
                onChange={(e) => {
                  setFormData({ ...formData, quantity: e.target.value });
                  setFormErrors({ ...formErrors, quantity: false });
                }}
                className={formErrors.quantity ? "border-red-500" : ""}
              />
              {formErrors.quantity && (
                <span className="text-xs text-red-500">
                  الكمية يجب أن تكون صفر أو أكثر
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                الفئة
              </label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-3">
              <label className="text-sm font-medium block">
                المقاسات المتوفرة
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_SIZES.map((size) => (
                  <div
                    key={size}
                    className="flex flex-col bg-secondary/20 rounded-lg p-2 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center mb-2">
                      <Checkbox
                        id={`size-${size}`}
                        className="ml-2 size-5"
                        checked={formData.sizes.some((s) => s.name === size)}
                        onCheckedChange={() => toggleSize(size)}
                      />
                      <label
                        htmlFor={`size-${size}`}
                        className="text-sm font-medium leading-none cursor-pointer flex-1 mt-1"
                      >
                        {size}
                      </label>
                    </div>
                    {formData.sizes.some((s) => s.name === size) && (
                      <Input
                        type="number"
                        placeholder="السعر"
                        value={
                          formData.sizes.find((s) => s.name === size)?.price ||
                          ""
                        }
                        onChange={(e) => updateSizePrice(size, e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-3">
              <label className="text-sm font-medium block">
                الألوان المتوفرة
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_COLORS.map((color) => (
                  <div
                    key={color.value}
                    className="flex items-center bg-secondary/20 rounded-lg p-2 hover:bg-secondary/30 transition-colors"
                  >
                    <Checkbox
                      id={`color-${color.name}`}
                      checked={formData.colors.some(
                        (c) => c.name === color.name
                      )}
                      onCheckedChange={() => toggleColor(color)}
                      className="ml-2 size-5"
                    />
                    <div
                      className="size-5 rounded-full ml-2"
                      style={{ backgroundColor: color.value }}
                    />
                    <label
                      htmlFor={`color-${color.name}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1 mt-1"
                    >
                      {color.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-3">
              <label className="text-sm font-medium block">شارات المنتج</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {AVAILABLE_BADGES.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center bg-secondary/20 rounded-lg p-2 hover:bg-secondary/30 transition-colors"
                  >
                    <Checkbox
                      id={`badge-${badge}`}
                      checked={formData.badges.includes(badge)}
                      onCheckedChange={() => toggleBadge(badge)}
                      className="ml-2"
                    />
                    <label
                      htmlFor={`badge-${badge}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      {badge}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">الصورة الرئيسية</label>
              {mainImagePreview ? (
                <div className="relative group mb-4 w-24 h-24 mt-4">
                  <Image
                    src={mainImagePreview}
                    alt="Main image preview"
                    fill
                    className="object-cover rounded-lg border"
                    sizes="96px"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      URL.revokeObjectURL(mainImagePreview!);
                      setMainImagePreview(null);
                      setMainImageFile(null);
                      setHasAnyImage(galleryPreviews.length > 0);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <ImageUpload
                  onFileSelect={(file) => {
                    const previewUrl = URL.createObjectURL(file);
                    setMainImagePreview(previewUrl);
                    setMainImageFile(file);
                    setHasAnyImage(true);
                  }}
                />
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">معرض الصور</label>
              <div className="p-4 border-2 border-dashed rounded-lg bg-secondary/10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="relative w-full h-full">
                        <Image
                          src={preview}
                          alt={`Gallery image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg border"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleGalleryImageRemove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="aspect-square">
                    <ImageUpload
                      onFileSelect={(file) => {
                        const previewUrl = URL.createObjectURL(file);
                        setGalleryPreviews([...galleryPreviews, previewUrl]);
                        setGalleryFiles([...galleryFiles, file]);
                        setHasAnyImage(true);
                      }}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid() || !hasAnyImage}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : initialData ? (
                "تحديث"
              ) : (
                "إضافة"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
