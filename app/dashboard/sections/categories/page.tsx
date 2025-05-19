"use client";

import {
  PlusIcon,
  Eye,
  Save,
  Loader2,
  X,
  TagIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loading from "./loading-skeleton";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { SortableCategory } from "./sortable-category";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryFormData {
  id?: Id<"categories">;
  name: string;
  image: Id<"_storage">;
}

interface Category {
  _id: Id<"categories">;
  name: string;
  image: Id<"_storage">;
  imageUrl?: string;
  order: number;
}

export default function Categories() {
  const categories = useQuery(api.categories.getCategories);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [originalCategories, setOriginalCategories] = useState<Category[]>([]);
  const pageData = useQuery(api.categories.getCategoriesPage);
  const savePageMutation = useMutation(api.categories.saveCategoriesPage);
  const saveCategoryMutation = useMutation(api.categories.saveCategory);
  const deleteCategoryMutation = useMutation(api.categories.deleteCategory);
  const updateOrderMutation = useMutation(api.categories.updateCategoriesOrder);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteStorageId = useMutation(api.files.deleteStorageId);

  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryFormData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image: null as Id<"_storage"> | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("page-settings");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVisible, setIsVisible] = useState(pageData?.isVisible ?? true);
  const [originalVisibility, setOriginalVisibility] = useState<boolean>(true);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (categories) {
      setLocalCategories(categories);
      setOriginalCategories(categories);
    }
  }, [categories]);

  useEffect(() => {
    if (pageData) {
      setPageTitle(pageData.title || "");
      setPageDescription(pageData.description || "");
      setIsVisible(pageData.isVisible ?? true);
      setOriginalVisibility(pageData.isVisible ?? true);
    }
  }, [pageData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const hasChanges = () => {
    if (activeTab === "page-settings") {
      const titleChanged = pageTitle.trim() !== (pageData?.title || "").trim();
      const descriptionChanged =
        pageDescription.trim() !== (pageData?.description || "").trim();
      return titleChanged || descriptionChanged;
    }

    if (activeTab === "display-settings") {
      return isVisible !== originalVisibility;
    }

    if (activeTab === "categories") {
      return localCategories.some((cat, index) => {
        const originalCat = originalCategories[index];
        return (
          !originalCat ||
          cat._id !== originalCat._id ||
          cat.order !== originalCat.order
        );
      });
    }

    if (isDialogOpen) {
      if (editingCategory) {
        const category = categories?.find((c) => c._id === editingCategory.id);
        if (!category) return false;

        const nameChanged = formData.name.trim() !== category.name.trim();
        const imageChanged = formData.image !== category.image;

        return nameChanged || imageChanged;
      } else {
        const hasName = formData.name.trim() !== "";
        const hasImage = formData.image !== null;

        return hasName && hasImage;
      }
    }

    return false;
  };

  const handleSaveChanges = async () => {
    if (!hasChanges()) return;

    setLoading(true);
    try {
      if (activeTab === "page-settings") {
        await savePageMutation({
          title: pageTitle,
          description: pageDescription,
        });
      } else if (activeTab === "display-settings") {
        await savePageMutation({
          isVisible: isVisible,
        });
      } else if (activeTab === "categories") {
        await updateOrderMutation({
          categories: localCategories.map((cat, index) => ({
            id: cat._id,
            order: index,
          })),
        });
        setOriginalCategories(localCategories);
      }

      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !localCategories) return;

    const oldIndex = localCategories.findIndex((cat) => cat._id === active.id);
    const newIndex = localCategories.findIndex((cat) => cat._id === over.id);

    const newCategories = arrayMove([...localCategories], oldIndex, newIndex);
    const categoriesWithNewOrder = newCategories.map((cat, index) => ({
      ...cat,
      order: index,
    }));

    setLocalCategories(categoriesWithNewOrder);
  };

  const handleDeleteCategory = async (id: Id<"categories">) => {
    try {
      await deleteCategoryMutation({ id });
    } catch {
      toast.error("حدث خطأ أثناء حذف الفئة");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("جميع الحقول مطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageStorageId = formData.image;

      if (editingCategory && selectedFile) {
        const existingCategory = categories?.find(
          (c) => c._id === editingCategory.id
        );
        if (existingCategory?.image) {
          try {
            await deleteStorageId({ storageId: existingCategory.image });
          } catch (error) {
            console.error("Failed to delete old image:", error);
          }
        }
      }

      if (selectedFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": selectedFile.type,
          },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      await saveCategoryMutation({
        id: editingCategory?.id,
        name: formData.name.trim(),
        image: imageStorageId as Id<"_storage">,
        order: editingCategory
          ? (categories?.find((c) => c._id === editingCategory.id)?.order ?? 0)
          : (categories?.length ?? 0),
      });

      setFormData({
        name: "",
        image: null,
      });

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      setSelectedFile(null);

      setIsDialogOpen(false);
      toast.success(
        editingCategory ? "تم تحديث الفئة بنجاح" : "تم إضافة الفئة بنجاح"
      );
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("حدث خطأ أثناء حفظ الفئة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageUrls = useQuery(
    api.files.getMultipleImageUrls,
    categories?.length
      ? {
          storageIds: categories
            .map((category) => category.image)
            .filter(Boolean),
        }
      : "skip"
  );

  const categoryImageUrls = useMemo(() => {
    if (!categories || !imageUrls) return {};

    return categories.reduce(
      (acc, category, index) => {
        if (category.image) {
          acc[category._id] = imageUrls[index] || undefined;
        }
        return acc;
      },
      {} as Record<Id<"categories">, string | undefined>
    );
  }, [categories, imageUrls]);

  const handleEditCategory = (category: Category) => {
    setEditingCategory({
      id: category._id,
      name: category.name,
      image: category.image,
    });
    setFormData({
      name: category.name,
      image: category.image,
    });
    setIsDialogOpen(true);
  };

  if (categories === undefined || pageData === undefined) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
          <Heading
            title="تحرير قسم الفئات"
            description="قم بإدارة وتعديل الفئات في متجرك الإلكتروني."
          />
        </div>
      </div>
      <Tabs
        defaultValue="page-settings"
        className="w-full"
        dir="rtl"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="page-settings" className="flex-1">
            إعدادات القسم
          </TabsTrigger>
          <TabsTrigger value="display-settings" className="flex-1">
            إعدادات العرض
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex-1">
            الفئات
          </TabsTrigger>
        </TabsList>
        <TabsContent value="page-settings">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">إعدادات قسم الفئات</h3>
              <p className="text-sm text-muted-foreground">
                قم بتخصيص عنوان ووصف القسم
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان القسم</label>
                <Input
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="أدخل عنوان القسم"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">وصف القسم</label>
                <Input
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  placeholder="أدخل وصف القسم"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="display-settings">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">إعدادات العرض</h3>
              <p className="text-sm text-muted-foreground">
                تحكم في ظهور وإخفاء القسم
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">إظهار القسم</label>
                  <p className="text-sm text-muted-foreground">
                    عند التعطيل، لن يظهر هذا القسم في الموقع
                  </p>
                </div>
                <Button
                  variant={isVisible ? "default" : "outline"}
                  onClick={() => setIsVisible(!isVisible)}
                  className="w-full sm:w-auto gap-2"
                  size="sm"
                >
                  {isVisible ? (
                    <>
                      <EyeIcon className="h-4 w-4" />
                      ظاهر
                    </>
                  ) : (
                    <>
                      <EyeOffIcon className="h-4 w-4" />
                      مخفي
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-semibold">قائمة الفئات</h3>
                  <Badge variant="outline">
                    {categories?.length || 0} فئات
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {localCategories.length === 0
                    ? "لا توجد فئات حتى الآن"
                    : "اسحب وأفلت لإعادة ترتيب الفئات"}
                </p>
              </div>
              <Button
                className="gap-2"
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ name: "", image: null });
                  setIsDialogOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4" />
                إضافة فئة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              {!localCategories?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <TagIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">لا توجد فئات</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ابدأ بإضافة فئات جديدة لمتجرك الإلكتروني
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localCategories?.map((cat) => cat._id) ?? []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {localCategories?.map((category) => (
                        <SortableCategory
                          key={category._id}
                          category={{
                            ...category,
                            imageUrl:
                              categoryImageUrls?.[category._id] ?? undefined,
                          }}
                          onDelete={handleDeleteCategory}
                          onEdit={handleEditCategory}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => {
            const previewWindow = window.open("/", "_blank");
            if (previewWindow) {
              previewWindow.postMessage(
                {
                  type: "PREVIEW_DATA",
                  data: {
                    title: pageTitle,
                    description: pageDescription,
                    categories: localCategories,
                    isVisible: isVisible,
                  },
                },
                "*"
              );
            }
          }}
        >
          <Eye className="h-4 w-4" />
          معاينة
        </Button>
        <Button
          onClick={handleSaveChanges}
          disabled={loading || !hasChanges()}
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
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (imagePreview) {
              URL.revokeObjectURL(imagePreview);
              setImagePreview(null);
            }
            setIsDialogOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم الفئة</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="أدخل اسم الفئة"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">صورة الفئة</label>
              {(imagePreview ||
                (editingCategory &&
                  typeof editingCategory.id === "string" &&
                  categoryImageUrls?.[
                    editingCategory.id as keyof typeof categoryImageUrls
                  ])) && (
                <div className="relative group mb-4 w-24 h-24 mt-4">
                  <Image
                    src={
                      imagePreview ||
                      (editingCategory?.id &&
                        categoryImageUrls?.[
                          editingCategory.id as keyof typeof categoryImageUrls
                        ]) ||
                      ""
                    }
                    alt="Category preview"
                    fill
                    className="object-cover rounded-lg border"
                    sizes="96px"
                  />
                  {!editingCategory && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (imagePreview) {
                          URL.revokeObjectURL(imagePreview);
                          setImagePreview(null);
                        }
                        setFormData((prev) => ({ ...prev, image: null }));
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <ImageUpload
                onFileSelect={(file) => {
                  const previewUrl = URL.createObjectURL(file);
                  setImagePreview(previewUrl);
                  setSelectedFile(file);
                }}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.name ||
                  (!editingCategory && !selectedFile)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : editingCategory ? (
                  "تحديث"
                ) : (
                  "إضافة"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
