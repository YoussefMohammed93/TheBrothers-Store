"use client";

import {
  Sparkles,
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
  Save,
  Eye,
  Loader2,
  X,
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
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { SortableFeature } from "./sortable-feature";
import Loading from "../categories/loading-skeleton";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Feature {
  _id: Id<"features">;
  name: string;
  description: string;
  image: Id<"_storage">;
  imageUrl?: string;
  order: number;
}

interface FeatureFormData {
  id?: Id<"features">;
  name: string;
  description: string;
  image: Id<"_storage">;
  imageUrl?: string;
}

export default function StoreFeatures() {
  const [activeTab, setActiveTab] = useState("page-settings");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localFeatures, setLocalFeatures] = useState<Array<Feature>>([]);
  const [editingFeature, setEditingFeature] = useState<FeatureFormData | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as Id<"_storage"> | null,
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const features = useQuery(api.features.getFeatures);
  const pageData = useQuery(api.features.getFeaturesPage);
  const savePage = useMutation(api.features.saveFeaturesPage);
  const updateOrder = useMutation(api.features.updateFeaturesOrder);
  const deleteFeatureMutation = useMutation(api.features.deleteFeature);
  const saveFeature = useMutation(api.features.saveFeature);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteStorageId = useMutation(api.files.deleteStorageId);

  const imageUrls = useQuery(
    api.files.getMultipleImageUrls,
    features?.length
      ? {
          storageIds: features.map((feature) => feature.image).filter(Boolean),
        }
      : "skip"
  );

  const featureImageUrls = useMemo(() => {
    if (!features || !imageUrls) return {};

    return features.reduce(
      (acc, feature) => {
        if (
          feature.image &&
          typeof imageUrls[feature.image as keyof typeof imageUrls] === "string"
        ) {
          acc[feature._id] = imageUrls[
            feature.image as keyof typeof imageUrls
          ] as string;
        }
        return acc;
      },
      {} as Record<Id<"features">, string>
    );
  }, [features, imageUrls]);

  useEffect(() => {
    if (features) {
      setLocalFeatures(
        features.map((feature) => ({
          ...feature,
          imageUrl: feature.imageUrl || undefined,
        }))
      );
    }
  }, [features]);

  useEffect(() => {
    if (pageData) {
      setPageTitle(pageData.title || "");
      setPageDescription(pageData.description || "");
      setIsVisible(pageData.isVisible ?? true);
    }
  }, [pageData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !features) return;

    const oldIndex = features.findIndex((feature) => feature._id === active.id);
    const newIndex = features.findIndex((feature) => feature._id === over.id);

    const newFeatures = arrayMove([...features], oldIndex, newIndex);
    const featuresWithNewOrder = newFeatures.map((feature, index) => ({
      ...feature,
      order: index,
    }));

    setLocalFeatures(
      featuresWithNewOrder.map((feature) => ({
        ...feature,
        imageUrl: feature.imageUrl || undefined,
      }))
    );
  };

  const handleDeleteFeature = async (id: Id<"features">) => {
    try {
      await deleteFeatureMutation({ id });
      toast.success("تم حذف الميزة بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حذف الميزة");
    }
  };

  const handleEditFeature = (feature: Feature) => {
    const imageUrl = feature.imageUrl || featureImageUrls[feature._id];
    setEditingFeature({
      id: feature._id,
      name: feature.name,
      description: feature.description,
      image: feature.image,
      imageUrl: imageUrl,
    });
    setFormData({
      name: feature.name,
      description: feature.description,
      image: feature.image,
    });
    setIsDialogOpen(true);
  };

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
      return (
        pageTitle.trim() !== (pageData?.title || "").trim() ||
        pageDescription.trim() !== (pageData?.description || "").trim()
      );
    }
    if (activeTab === "display-settings") {
      return isVisible !== (pageData?.isVisible ?? true);
    }
    if (activeTab === "features") {
      return localFeatures.some((localFeature, index) => {
        const originalFeature = features?.[index];
        return (
          !originalFeature ||
          localFeature._id !== originalFeature._id ||
          localFeature.order !== originalFeature.order
        );
      });
    }
    return false;
  };

  const handleSaveChanges = async () => {
    if (!hasChanges()) return;

    setLoading(true);
    try {
      if (activeTab === "page-settings" || activeTab === "display-settings") {
        await savePage({
          title: pageTitle,
          description: pageDescription,
          isVisible: isVisible,
        });
      } else if (activeTab === "features") {
        await updateOrder({
          features: localFeatures.map((feature, index) => ({
            id: feature._id,
            order: index,
          })),
        });
      }

      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageStorageId = formData.image;

      if (selectedFile) {
        if (editingFeature?.image) {
          await deleteStorageId({
            storageId: editingFeature.image as Id<"_storage">,
          });
        }

        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      const newOrder = editingFeature
        ? localFeatures.find((f) => f._id === editingFeature.id)?.order || 0
        : localFeatures.length;

      await saveFeature({
        id: editingFeature?.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageStorageId as Id<"_storage">,
        order: newOrder,
      });

      toast.success(
        editingFeature ? "تم تحديث الميزة بنجاح" : "تمت إضافة الميزة بنجاح"
      );
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("حدث خطأ أثناء حفظ الميزة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", image: null });
    setSelectedFile(null);
    setImagePreview(null);
    setEditingFeature(null);
  };

  if (features === undefined || pageData === undefined) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <Heading
          title="مميزات المتجر"
          description="إدارة وعرض مميزات متجرك الإلكتروني."
        />
      </div>
      <Tabs
        defaultValue="page-settings"
        className="w-full"
        dir="rtl"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="page-settings">إعدادات القسم</TabsTrigger>
          <TabsTrigger value="display-settings">إعدادات العرض</TabsTrigger>
          <TabsTrigger value="features">المميزات</TabsTrigger>
        </TabsList>
        <TabsContent value="page-settings">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">إعدادات قسم المميزات</h3>
              <p className="text-sm text-muted-foreground">
                قم بتخصيص عنوان ووصف القسم
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان القسم</label>
                <Input
                  placeholder="أدخل عنوان القسم"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">وصف القسم</label>
                <Input
                  placeholder="أدخل وصف القسم"
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
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
                    تحكم في ظهور القسم في الصفحة الرئيسية
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
        <TabsContent value="features">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-semibold">قائمة المميزات</h3>
                  <Badge variant="outline">{features?.length || 0} ميزات</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {features?.length === 0
                    ? "لا توجد مميزات حتى الآن"
                    : "اسحب وأفلت لإعادة ترتيب المميزات"}
                </p>
              </div>
              <Button
                className="gap-2"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4" />
                إضافة ميزة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              {!features?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">لا توجد مميزات</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ابدأ بإضافة مميزات جديدة لمتجرك الإلكتروني
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localFeatures
                      .sort((a, b) => a.order - b.order)
                      .map((feature) => feature._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {localFeatures
                        .sort((a, b) => a.order - b.order)
                        .map((feature) => (
                          <SortableFeature
                            key={feature._id}
                            feature={feature}
                            onDelete={handleDeleteFeature}
                            onEdit={handleEditFeature}
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
          onClick={() => {
            const previewWindow = window.open("/", "_blank");
            if (previewWindow) {
              previewWindow.postMessage(
                {
                  type: "PREVIEW_DATA",
                  data: {
                    pageTitle,
                    pageDescription,
                    isVisible,
                    features: localFeatures,
                  },
                },
                "*"
              );
            }
          }}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          معاينة
        </Button>
        <Button
          disabled={!hasChanges() || loading}
          onClick={handleSaveChanges}
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
              {hasChanges() ? "حفظ التغييرات" : "حفظ التغييرات"}
            </>
          )}
        </Button>
      </div>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFeature ? "تعديل الميزة" : "إضافة ميزة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFeature} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم الميزة</label>
              <Input
                placeholder="أدخل اسم الميزة"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">وصف الميزة</label>
              <Textarea
                placeholder="أدخل وصف الميزة"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">صورة الميزة</label>
              {(imagePreview || editingFeature?.imageUrl) && (
                <div className="relative group mb-4 w-24 h-24 mt-4">
                  <Image
                    src={imagePreview || editingFeature?.imageUrl || ""}
                    alt="Feature preview"
                    fill
                    className="object-cover rounded-lg border p-2"
                    sizes="96px"
                  />
                  {!editingFeature && (
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
                  !formData.description ||
                  (!editingFeature && !selectedFile)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : editingFeature ? (
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
