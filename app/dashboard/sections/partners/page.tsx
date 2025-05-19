"use client";

import {
  PlusIcon,
  Loader2,
  EyeIcon,
  EyeOffIcon,
  X,
  Building2,
  Save,
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
import { toast } from "sonner";
import Image from "next/image";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { SortablePartner } from "./sortable-partner";
import Loading from "../categories/loading-skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PartnerFormData {
  id?: Id<"partners">;
  name: string;
  image: Id<"_storage">;
  imageUrl?: string;
}

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState("page-settings");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: null as Id<"_storage"> | null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerFormData | null>(
    null
  );

  const partners = useQuery(api.partners.getPartners);
  const pageData = useQuery(api.partners.getPartnersPage);
  const savePageMutation = useMutation(api.partners.savePage);
  const savePartnerMutation = useMutation(api.partners.savePartner);
  const deletePartnerMutation = useMutation(api.partners.deletePartner);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteStorageId = useMutation(api.files.deleteStorageId);
  const updatePartnersOrderMutation = useMutation(
    api.partners.updatePartnersOrder
  );

  useEffect(() => {
    if (pageData) {
      setPageTitle(pageData.title || "");
      setPageDescription(pageData.description || "");
      setIsVisible(pageData.isVisible ?? true);
    }
  }, [pageData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [localPartners, setLocalPartners] = useState<
    Array<{
      _id: Id<"partners">;
      name: string;
      image: Id<"_storage">;
      imageUrl?: string;
      order: number;
    }>
  >([]);

  const [originalPartners, setOriginalPartners] = useState<
    Array<{
      _id: Id<"partners">;
      name: string;
      image: Id<"_storage">;
      imageUrl?: string;
      order: number;
    }>
  >([]);

  useEffect(() => {
    const sortedPartners = [...(partners || [])].sort(
      (a, b) => a.order - b.order
    );

    const mappedPartners = sortedPartners.map((partner) => ({
      _id: partner._id,
      name: partner.name,
      image: partner.image,
      imageUrl: partner.imageUrl || undefined,
      order: partner.order,
    }));

    setLocalPartners(mappedPartners);
    setOriginalPartners(mappedPartners);
  }, [partners]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !localPartners) return;

    const oldIndex = localPartners.findIndex(
      (partner) => partner._id === active.id
    );
    const newIndex = localPartners.findIndex(
      (partner) => partner._id === over.id
    );

    const newPartners = arrayMove([...localPartners], oldIndex, newIndex);
    const partnersWithNewOrder = newPartners.map((partner, index) => ({
      ...partner,
      order: index,
    }));

    setLocalPartners(partnersWithNewOrder);
  };

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
    if (activeTab === "partners") {
      return localPartners.some((localPartner, index) => {
        const originalPartner = originalPartners?.[index];
        return (
          !originalPartner ||
          localPartner._id !== originalPartner._id ||
          localPartner.order !== originalPartner.order
        );
      });
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
          isVisible: isVisible,
        });
      } else if (activeTab === "display-settings") {
        await savePageMutation({
          title: pageTitle,
          description: pageDescription,
          isVisible: isVisible,
        });
      } else if (activeTab === "partners") {
        await updatePartnersOrderMutation({
          partners: localPartners.map((partner, index) => ({
            id: partner._id,
            order: index,
          })),
        });
        setOriginalPartners([...localPartners]);
      }

      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");

      if (activeTab === "partners") {
        setLocalPartners([...originalPartners]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageStorageId = formData.image;

      if (selectedFile) {
        if (editingPartner?.image) {
          await deleteStorageId({ storageId: editingPartner.image });
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

      const newOrder = editingPartner
        ? localPartners.find((p) => p._id === editingPartner.id)?.order || 0
        : localPartners.length;

      await savePartnerMutation({
        id: editingPartner?.id,
        name: formData.name.trim(),
        image: imageStorageId as Id<"_storage">,
        order: newOrder,
      });

      setFormData({ name: "", image: null });
      setImagePreview(null);
      setSelectedFile(null);
      setIsDialogOpen(false);
      toast.success(
        editingPartner ? "تم تحديث الشريك بنجاح" : "تم إضافة الشريك بنجاح"
      );
    } catch {
      toast.error("حدث خطأ أثناء حفظ الشريك");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePartner = async (id: Id<"partners">) => {
    try {
      await deletePartnerMutation({ id });
      toast.success("تم حذف الشريك بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حذف الشريك");
    }
  };

  if (partners === undefined || pageData === undefined) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <Heading
          title="تحرير قسم الشركاء"
          description="قم بإدارة وتعديل قسم الشركاء في متجرك الإلكتروني."
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
          <TabsTrigger value="partners">الشركاء</TabsTrigger>
        </TabsList>
        <TabsContent value="page-settings">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">إعدادات قسم الشركاء</h3>
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
        <TabsContent value="partners">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-semibold">قائمة الشركاء</h3>
                  <Badge variant="outline">{partners?.length || 0} شركاء</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {partners?.length === 0
                    ? "لا يوجد شركاء حتى الآن"
                    : "قائمة الشركاء المعتمدين"}
                </p>
              </div>
              <Button
                className="gap-2"
                onClick={() => {
                  setEditingPartner(null);
                  setFormData({ name: "", image: null });
                  setIsDialogOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4" />
                إضافة شريك جديد
              </Button>
            </CardHeader>
            <CardContent>
              {!localPartners?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">لا يوجد شركاء</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ابدأ بإضافة شركاء جدد لمتجرك الإلكتروني
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localPartners?.map((partner) => partner._id) ?? []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {localPartners?.map((partner) => (
                        <SortablePartner
                          key={partner._id}
                          partner={{
                            ...partner,
                            imageUrl: partner.imageUrl || undefined,
                          }}
                          onDelete={handleDeletePartner}
                          onEdit={(partner) => {
                            setEditingPartner({
                              id: partner._id,
                              name: partner.name,
                              image: partner.image,
                              imageUrl: partner.imageUrl,
                            });
                            setFormData({
                              name: partner.name,
                              image: partner.image,
                            });
                            setIsDialogOpen(true);
                          }}
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
                    partners: localPartners,
                  },
                },
                "*"
              );
            }
          }}
          className="gap-2"
        >
          <EyeIcon className="h-4 w-4" />
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
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? "تعديل الشريك" : "إضافة شريك جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePartner} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم الشريك</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="أدخل اسم الشريك"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">شعار الشريك</label>
              {(imagePreview || editingPartner?.imageUrl) && (
                <div className="relative group mb-4 w-24 h-24 mt-4">
                  <Image
                    src={imagePreview || editingPartner?.imageUrl || ""}
                    alt="Partner preview"
                    fill
                    className="object-cover rounded-lg border"
                    sizes="96px"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className={cn(
                      "absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                      editingPartner && "hidden"
                    )}
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
                  (!editingPartner && !selectedFile)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : editingPartner ? (
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
