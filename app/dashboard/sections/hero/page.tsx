/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Plus,
  X,
  Eye,
  UsersIcon,
  Image as ImageIcon,
  Loader2,
  Save,
} from "lucide-react";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Image from "next/image";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { ImageUpload } from "@/components/ui/image-upload";
import { SortableCustomerImage } from "./sortable-customer-image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col" dir="rtl">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex h-auto items-center justify-start rounded-lg bg-muted px-0.5 py-1 text-muted-foreground w-full md:w-fit">
            <div className="w-full flex items-center justify-between gap-1 p-1">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-10 w-full sm:w-1/2" />
                        <Skeleton className="h-10 w-full sm:w-1/2" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-10 w-full sm:w-1/2" />
                        <Skeleton className="h-10 w-full sm:w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-10 w-full sm:w-1/2" />
                        <Skeleton className="h-10 w-full sm:w-1/2" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-10 w-full sm:w-1/2" />
                        <Skeleton className="h-10 w-full sm:w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormData {
  title: string;
  description: string;
  mainImage: string | null;
  mainImageToDelete?: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
  customerCount: number;
  customerText: string;
  customerImages: Array<string | File>;
}

export default function Hero() {
  const [isUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    mainImage: "",
    primaryButtonText: "",
    primaryButtonHref: "",
    secondaryButtonText: "",
    secondaryButtonHref: "",
    customerCount: 0,
    customerText: "",
    customerImages: [""],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [customerImagePreviews, setCustomerImagePreviews] = useState<
    Record<number, string>
  >({});
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const heroData = useQuery(api.hero.getHero);

  const mainImageUrl = useQuery(
    api.files.getImageUrl,
    formData.mainImage
      ? { storageId: formData.mainImage as Id<"_storage"> }
      : "skip"
  );

  const customerImageUrls = useQuery(api.files.getMultipleImageUrls, {
    storageIds: formData.customerImages
      .filter(
        (image): image is string => typeof image === "string" && Boolean(image)
      )
      .map((id) => id as Id<"_storage">),
  });

  const saveHero = useMutation(api.hero.saveHero);
  const deleteStorageId = useMutation(api.files.deleteStorageId);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  useEffect(() => {
    if (heroData) {
      setFormData({
        title: heroData.title,
        description: heroData.description,
        mainImage: heroData.mainImage?.toString() ?? "",
        primaryButtonText: heroData.primaryButtonText,
        primaryButtonHref: heroData.primaryButtonHref,
        secondaryButtonText: heroData.secondaryButtonText,
        secondaryButtonHref: heroData.secondaryButtonHref,
        customerCount: heroData.customerCount,
        customerText: heroData.customerText,
        customerImages: heroData.customerImages.map((id) => id.toString()),
      });
    } else {
      setFormData({
        title: "العنوان الرئيسي",
        description: "وصف القسم الرئيسي",
        mainImage: "",
        primaryButtonText: "الزر الرئيسي",
        primaryButtonHref: "/",
        secondaryButtonText: "الزر الثانوي",
        secondaryButtonHref: "/",
        customerCount: 1000,
        customerText: "عميل سعيد",
        customerImages: [""],
      });
    }
  }, [heroData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "customerCount" ? parseInt(value) || 0 : value,
    }));
  };

  const addCustomerImage = () => {
    setFormData((prev) => ({
      ...prev,
      customerImages: [...prev.customerImages, ""],
    }));
  };

  const handleCustomerImageRemove = (index: number) => {
    const image = formData.customerImages[index];

    if (typeof image === "string" && image) {
      setImagesToDelete((prev) => [...prev, image]);
    }

    if (customerImagePreviews[index]) {
      URL.revokeObjectURL(customerImagePreviews[index]);
      setCustomerImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        return newPreviews;
      });
    }

    setFormData((prev) => ({
      ...prev,
      customerImages: prev.customerImages.filter((_, i) => i !== index),
    }));
  };

  const handleMainImageSelect = (file: File) => {
    setMainImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setMainImagePreview(previewUrl);
  };

  const handleCustomerImageSelect = (index: number, file: File) => {
    const previewUrl = URL.createObjectURL(file);

    setCustomerImagePreviews((prev) => {
      const newPreviews = {
        ...prev,
        [index]: previewUrl,
      };
      return newPreviews;
    });

    setFormData((prev) => {
      const newImages = [...prev.customerImages];
      newImages[index] = file;
      return {
        ...prev,
        customerImages: newImages,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges()) return;

    setLoading(true);
    setIsSavingOrder(true);

    try {
      for (const imageId of imagesToDelete) {
        try {
          await deleteStorageId({ storageId: imageId as Id<"_storage"> });
        } catch (error) {
          console.error("Failed to delete image:", imageId, error);
        }
      }

      let mainImageStorageId = formData.mainImage;
      const newCustomerImageIds: string[] = [];

      if (mainImageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": mainImageFile.type,
          },
          body: mainImageFile,
        });
        const { storageId } = await result.json();
        mainImageStorageId = storageId;
      }

      for (let i = 0; i < formData.customerImages.length; i++) {
        const image = formData.customerImages[i];
        if (image instanceof File) {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              "Content-Type": image.type,
            },
            body: image,
          });
          const { storageId } = await result.json();
          newCustomerImageIds[i] = storageId;
        } else if (typeof image === "string" && image) {
          newCustomerImageIds[i] = image;
        }
      }

      if (formData.mainImageToDelete) {
        await deleteStorageId({
          storageId: formData.mainImageToDelete as Id<"_storage">,
        });
      }

      const { mainImageToDelete: _, ...dataToSave } = formData;

      await saveHero({
        ...dataToSave,
        mainImage: mainImageStorageId
          ? (mainImageStorageId as Id<"_storage">)
          : null,
        customerImages: newCustomerImageIds
          .filter(Boolean)
          .map((id) => id as Id<"_storage">),
      });

      setMainImageFile(null);
      setCustomerImagePreviews({});
      setImagesToDelete([]);

      toast.success("تم حفظ التغييرات بنجاح", {
        description: "تم تحديث القسم الرئيسي بنجاح",
      });
    } catch (error) {
      console.error("Failed to save hero section:", error);
      toast.error("فشل في حفظ التغييرات", {
        description: "يرجى المحاولة مرة أخرى",
      });
    } finally {
      setLoading(false);
      setIsSavingOrder(false);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = parseInt(active.id as string);
    const newIndex = parseInt(over.id as string);

    setFormData((prev) => {
      const newCustomerImages = arrayMove(
        prev.customerImages,
        oldIndex,
        newIndex
      );
      return {
        ...prev,
        customerImages: newCustomerImages,
      };
    });

    setHasOrderChanged(true);
  };

  const hasChanges = () => {
    if (imagesToDelete.length > 0 || formData.mainImageToDelete) {
      return true;
    }

    if (mainImageFile !== null || mainImagePreview !== null) {
      return true;
    }

    const hasNewCustomerImages = formData.customerImages.some(
      (image) => image instanceof File
    );
    const hasCustomerPreviews = Object.keys(customerImagePreviews).length > 0;

    if (hasNewCustomerImages || hasCustomerPreviews) {
      return true;
    }

    if (!heroData) {
      return (
        formData.title.trim() !== "" ||
        formData.description.trim() !== "" ||
        formData.primaryButtonText.trim() !== "" ||
        formData.customerCount !== 0
      );
    }

    return (
      heroData.title !== formData.title ||
      heroData.description !== formData.description ||
      heroData.primaryButtonText !== formData.primaryButtonText ||
      heroData.primaryButtonHref !== formData.primaryButtonHref ||
      heroData.secondaryButtonText !== formData.secondaryButtonText ||
      heroData.secondaryButtonHref !== formData.secondaryButtonHref ||
      heroData.customerCount !== formData.customerCount ||
      heroData.customerText !== formData.customerText ||
      (heroData.mainImage !== formData.mainImage && !mainImageFile) ||
      hasOrderChanged ||
      JSON.stringify(heroData.customerImages) !==
        JSON.stringify(
          formData.customerImages.filter((img) => typeof img === "string")
        )
    );
  };

  if (heroData === undefined) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col" dir="rtl">
      <div className="pt-14 mb-8">
        <Heading
          title="تحرير القسم الرئيسي"
          description="قم بتخصيص محتوى وعناصر القسم الرئيسي للصفحة الرئيسية."
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="content" className="w-full" dir="rtl">
          <TabsList className="mb-4">
            <TabsTrigger value="content" className="w-full">
              المحتوى الرئيسي
            </TabsTrigger>
            <TabsTrigger value="buttons" className="w-full">
              الأزرار
            </TabsTrigger>
            <TabsTrigger value="customers" className="w-full">
              قسم العملاء
            </TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <Card>
              <CardContent className="px-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      العنوان الرئيسي
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="أدخل العنوان الرئيسي"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <span className="text-sm text-red-500 mt-1">
                        {errors.title}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      الوصف
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="أدخل الوصف"
                      rows={4}
                    />
                  </div>
                  <Separator className="mb-6 mt-8" />
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      الصورة الرئيسية
                    </label>
                    <div className="flex items-start gap-4">
                      {!formData.mainImage && !mainImagePreview ? (
                        <div className="text-center py-6 rounded-lg border-2 border-dashed w-full">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>لا توجد صورة رئيسية</p>
                            <p className="text-sm mt-2">
                              قم بإضافة صورة رئيسية لعرضها في الصفحة الرئيسية
                            </p>
                            <ImageUpload
                              onFileSelect={handleMainImageSelect}
                              className="cursor-pointer mt-4 w-[200px] sm:w-[300px]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <Image
                            src={
                              mainImagePreview || mainImageUrl || "/hero.png"
                            }
                            alt="Main image preview"
                            width={224}
                            height={160}
                            className="object-cover rounded-lg border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              if (mainImagePreview) {
                                URL.revokeObjectURL(mainImagePreview);
                                setMainImagePreview(null);
                                setMainImageFile(null);
                              }
                              if (formData.mainImage) {
                                setFormData((prev) => ({
                                  ...prev,
                                  mainImageToDelete:
                                    prev.mainImage ?? undefined,
                                  mainImage: null,
                                }));
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="buttons">
            <Card>
              <CardContent className="px-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">الزر الرئيسي</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        النص
                      </label>
                      <Input
                        name="primaryButtonText"
                        value={formData.primaryButtonText}
                        onChange={handleChange}
                        placeholder="نص الزر"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        الرابط
                      </label>
                      <Input
                        name="primaryButtonHref"
                        value={formData.primaryButtonHref}
                        onChange={handleChange}
                        placeholder="رابط الزر"
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-4">الزر الثانوي</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        النص
                      </label>
                      <Input
                        name="secondaryButtonText"
                        value={formData.secondaryButtonText}
                        onChange={handleChange}
                        placeholder="نص الزر"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        الرابط
                      </label>
                      <Input
                        name="secondaryButtonHref"
                        value={formData.secondaryButtonHref}
                        onChange={handleChange}
                        placeholder="رابط الزر"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="customers">
            <Card>
              <CardContent className="px-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      عدد العملاء
                    </label>
                    <Input
                      type="number"
                      name="customerCount"
                      value={formData.customerCount}
                      onChange={handleChange}
                      placeholder="أدخل عدد العملاء"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      نص العملاء
                    </label>
                    <Input
                      name="customerText"
                      value={formData.customerText}
                      onChange={handleChange}
                      placeholder="مثال: عميل سعيد"
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium">صور العملاء</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomerImage}
                    >
                      إضافة صورة
                      <Plus className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                  <DndContext onDragEnd={onDragEnd}>
                    <SortableContext
                      items={formData.customerImages.map((_, index) =>
                        index.toString()
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      {formData.customerImages.length === 0 ? (
                        <div className="text-center py-6 rounded-lg">
                          <div className="text-muted-foreground">
                            <UsersIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>لا توجد صور للعملاء</p>
                            <p className="text-sm">
                              قم بإضافة صور العملاء لعرضها في الصفحة الرئيسية
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4">
                          {formData.customerImages.map((image, index) => (
                            <SortableCustomerImage
                              key={index}
                              index={index}
                              image={image}
                              customerImagePreviews={customerImagePreviews}
                              customerImageUrls={Object.fromEntries(
                                (customerImageUrls ?? [])
                                  .map((url, index) => [index, url])
                                  .filter(([_, url]) => url !== null)
                              )}
                              onFileSelect={handleCustomerImageSelect}
                              onRemove={handleCustomerImageRemove}
                            />
                          ))}
                        </div>
                      )}
                    </SortableContext>
                  </DndContext>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const previewWindow = window.open("/", "_blank");
              if (previewWindow) {
                previewWindow.postMessage(
                  { type: "PREVIEW_DATA", data: formData },
                  "*"
                );
              }
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            معاينة
          </Button>
          <Button
            type="submit"
            disabled={loading || isUploading || !hasChanges()}
            onClick={handleSubmit}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
