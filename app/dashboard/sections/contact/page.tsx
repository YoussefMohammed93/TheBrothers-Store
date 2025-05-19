/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  EyeIcon,
  EyeOffIcon,
  Loader2,
  PlusIcon,
  GripVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save } from "lucide-react";
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
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { Separator } from "@/components/ui/separator";
import ContactLoadingSkeleton from "./loading-skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContactItem {
  order: number;
  title: string;
  description: string;
  image: Id<"_storage">;
}

interface SortableContactItemProps {
  item: ContactItem & { _id: string };
  onDelete: (id: string) => Promise<boolean>;
  onEdit: (item: ContactItem & { _id: string }) => void;
}

function SortableContactItem({
  item,
  onDelete,
  onEdit,
}: SortableContactItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const imageUrl = useQuery(
    api.files.getImageUrl,
    item.image ? { storageId: item.image } : "skip"
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
    position: "relative" as const,
  };

  const handleEdit = async () => {
    setIsEditing(true);
    try {
      // Call onEdit with the item
      onEdit(item);
      // Success will be handled in the dialog
    } catch (error) {
      console.error(`Error editing item ${item._id}:`, error);
      toast.error("حدث خطأ أثناء تحرير عنصر الاتصال");
    } finally {
      setTimeout(() => setIsEditing(false), 500);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDelete(item._id);

      if (result) {
        setShowDeleteDialog(false);
      } else {
        toast.error("لم يتم حذف العنصر. حاول مرة أخرى");
      }
    } catch (error) {
      console.error(`Error deleting item ${item._id}:`, error);
      toast.error("حدث خطأ أثناء حذف عنصر الاتصال");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card className="border p-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="flex items-start gap-2 sm:gap-4 p-2 sm:p-4">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "cursor-move shrink-0 transition-all duration-300",
                  "hover:bg-primary/10 hover:text-primary"
                )}
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
              <div className="flex-1 space-y-2 sm:space-y-4">
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {typeof imageUrl === "string" && imageUrl ? (
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 relative rounded-xl overflow-hidden ring-2 ring-border/50 transition-all duration-300">
                          <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover p-1 sm:p-2"
                            sizes="(max-width: 640px) 48px, 64px"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-muted/50 ring-2 ring-border/50 flex items-center justify-center">
                        <Image
                          src="/placeholder-image.png"
                          alt={item.title}
                          width={40}
                          height={40}
                          className="h-8 w-8 sm:h-10 sm:w-10 object-cover opacity-50"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base sm:text-xl tracking-tight">
                          {item.title}
                        </h3>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "size-8 sm:size-9 transition-colors duration-200",
                        isEditing
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-primary/10 hover:text-primary"
                      )}
                      onClick={() => handleEdit()}
                      disabled={isDeleting || isEditing}
                    >
                      {isEditing ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-8 sm:size-9 transition-colors duration-200",
                        isDeleting
                          ? "bg-destructive/20 text-destructive"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                      )}
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                    <Separator
                      orientation="vertical"
                      className="mx-0.5 sm:mx-1 h-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setShowDeleteDialog(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا العنصر؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف هذا العنصر نهائيًا من
              قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center">
            {isDeleting && (
              <div className="mr-auto flex items-center text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                جاري حذف العنصر...
              </div>
            )}
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ContactPage() {
  const deleteStorageId = useMutation(api.files.deleteStorageId);
  const contactBannerData = useQuery(api.contact.getContactBanner);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveContactBanner = useMutation(api.contact.saveContactBanner);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isItemLoading, setIsItemLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [originalContactItems, setOriginalContactItems] = useState<
    (ContactItem & { _id: string })[]
  >([]);

  const [contactItems, setContactItems] = useState<
    (ContactItem & { _id: string })[]
  >([]);

  useEffect(() => {
    console.log("Current contact items:", contactItems);
  }, [contactItems]);
  const [editingItem, setEditingItem] = useState<
    (ContactItem & { _id: string }) | null
  >(null);
  const [showItemDialog, setShowItemDialog] = useState(false);

  const [itemFormData, setItemFormData] = useState({
    title: "",
    description: "",
    image: null as Id<"_storage"> | null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const itemImageUrl = useQuery(
    api.files.getImageUrl,
    itemFormData.image ? { storageId: itemFormData.image } : "skip"
  );

  useEffect(() => {
    if (contactBannerData) {
      const titleValue = contactBannerData.title || "تواصل معنا";
      const descriptionValue =
        contactBannerData.description ||
        "نحن هنا لمساعدتك! راسلنا للحصول على المزيد من المعلومات حول منتجاتنا وخدماتنا.";
      const isVisibleValue = contactBannerData.isVisible ?? true;

      setTitle(titleValue);
      setDescription(descriptionValue);
      setIsVisible(isVisibleValue);

      setOriginalTitle(titleValue);
      setOriginalDescription(descriptionValue);

      let itemsArray: (ContactItem & { _id: string })[] = [];

      if (
        contactBannerData.contactItems &&
        contactBannerData.contactItems.length > 0
      ) {
        itemsArray = contactBannerData.contactItems.map((item, index) => ({
          ...item,
          _id: `item-${index}`,
        }));
        setContactItems(itemsArray);
        setOriginalContactItems(itemsArray);
      } else {
        setContactItems([]);
        setOriginalContactItems([]);
      }
    }
  }, [contactBannerData]);

  const handleSaveItem = async () => {
    if (
      !itemFormData.title ||
      !itemFormData.description ||
      (!itemFormData.image && !selectedFile)
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setIsItemLoading(true);
      let imageStorageId = itemFormData.image;

      if (selectedFile) {
        if (editingItem?.image) {
          await deleteStorageId({
            storageId: editingItem.image,
          });
        }

        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload image: ${result.statusText}`);
        }

        const { storageId } = await result.json();
        if (!storageId) {
          throw new Error("Failed to get storage ID from upload response");
        }

        imageStorageId = storageId;
      }

      let updatedItems: (ContactItem & { _id: string })[] = [];

      if (editingItem) {
        updatedItems = contactItems.map((item) =>
          item._id === editingItem._id
            ? {
                ...item,
                title: itemFormData.title,
                description: itemFormData.description,
                image: imageStorageId as Id<"_storage">,
              }
            : item
        );
        setContactItems(updatedItems);
      } else {
        const newItem = {
          title: itemFormData.title,
          description: itemFormData.description,
          image: imageStorageId as Id<"_storage">,
          order: contactItems.length,
          _id: `item-${Date.now()}`,
        };
        updatedItems = [...contactItems, newItem];
        setContactItems(updatedItems);
      }

      try {
        const itemsToSave = updatedItems.map(({ _id: _, ...item }) => item);

        await saveContactBanner({
          title,
          description,
          isVisible,
          contactItems: itemsToSave,
        });

        setItemFormData({
          title: "",
          description: "",
          image: null,
        });
        setSelectedFile(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview(null);
        }
        setEditingItem(null);
        setShowItemDialog(false);

        toast.success(
          editingItem
            ? "تم تحديث عنصر الاتصال بنجاح"
            : "تم إضافة عنصر الاتصال بنجاح"
        );
      } catch (saveError) {
        console.error("Failed to save to database:", saveError);
        toast.error("حدث خطأ أثناء حفظ التغييرات في قاعدة البيانات");
      }
    } catch (error) {
      console.error("Failed to save contact item:", error);
      toast.error("حدث خطأ أثناء حفظ عنصر الاتصال");
    } finally {
      setIsItemLoading(false);
    }
  };

  const handleEditItem = (item: ContactItem & { _id: string }) => {
    setEditingItem(item);
    setItemFormData({
      title: item.title,
      description: item.description,
      image: item.image,
    });
    setShowItemDialog(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const itemToDelete = contactItems.find((item) => item._id === itemId);
      if (!itemToDelete) {
        console.error("Item not found for deletion:", itemId);
        toast.error("لم يتم العثور على العنصر للحذف");
        return false;
      }

      if (itemToDelete.image) {
        try {
          await deleteStorageId({
            storageId: itemToDelete.image,
          });
          console.log("Successfully deleted image:", itemToDelete.image);
        } catch (imageError) {
          console.error("Failed to delete image:", imageError);
        }
      }

      const updatedItems = contactItems.filter((item) => item._id !== itemId);

      const reorderedItems = updatedItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      setContactItems(reorderedItems);
      try {
        const itemsToSave = reorderedItems.map(({ _id, ...item }) => item);

        await saveContactBanner({
          title,
          description,
          isVisible,
          contactItems: itemsToSave,
        });

        setOriginalContactItems(reorderedItems);

        toast.success("تم حذف عنصر الاتصال بنجاح");
      } catch (saveError) {
        console.error("Failed to save to database after deletion:", saveError);
        toast.error("تم حذف العنصر محليًا ولكن حدث خطأ أثناء حفظ التغييرات");
      }

      return true;
    } catch (error) {
      console.error("Failed to delete contact item:", error);
      toast.error("حدث خطأ أثناء حذف عنصر الاتصال");
      throw error;
    }
  };

  const hasChanges = () => {
    if (activeTab === "general") {
      return (
        title.trim() !== originalTitle.trim() ||
        description.trim() !== originalDescription.trim()
      );
    }

    if (activeTab === "items") {
      if (contactItems.length !== originalContactItems.length) return true;

      return contactItems.some((item, index) => {
        const originalItem = originalContactItems[index];
        return (
          !originalItem ||
          item._id !== originalItem._id ||
          item.order !== originalItem.order
        );
      });
    }

    return false;
  };

  const handleSaveChanges = async () => {
    if (!hasChanges()) return;

    setIsLoading(true);
    try {
      if (activeTab === "general") {
        const itemsToSave = contactItems.map(({ _id, ...item }) => item);

        await saveContactBanner({
          title,
          description,
          isVisible,
          contactItems: itemsToSave,
        });

        setOriginalTitle(title);
        setOriginalDescription(description);

        toast.success("تم حفظ المعلومات العامة بنجاح");
      } else if (activeTab === "items") {
        const itemsToSave = contactItems.map(({ _id, ...item }) => item);

        await saveContactBanner({
          title,
          description,
          isVisible,
          contactItems: itemsToSave,
        });

        setOriginalContactItems([...contactItems]);

        toast.success("تم حفظ ترتيب عناصر الاتصال بنجاح");
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = contactItems.findIndex((item) => item._id === active.id);
      const newIndex = contactItems.findIndex((item) => item._id === over.id);

      const newItems = [...contactItems];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      setContactItems(reorderedItems);

      try {
        const itemsToSave = reorderedItems.map(({ _id, ...item }) => item);

        await saveContactBanner({
          title,
          description,
          isVisible,
          contactItems: itemsToSave,
        });

        setOriginalContactItems(reorderedItems);

        toast.success("تم إعادة ترتيب العناصر بنجاح");
      } catch (saveError) {
        console.error("Failed to save reordering to database:", saveError);
        toast.error("حدث خطأ أثناء حفظ ترتيب العناصر");
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingItem(null);
      setItemFormData({
        title: "",
        description: "",
        image: null,
      });
      setSelectedFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
    }
    setShowItemDialog(open);
  };

  if (contactBannerData === undefined) {
    return <ContactLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
          <Heading
            title="تحرير قسم تواصل معنا"
            description="قم بإدارة وتعديل قسم تواصل معنا في متجرك الإلكتروني."
          />
          <div className="flex items-center gap-4">
            <Button
              variant={isVisible ? "default" : "outline"}
              onClick={async () => {
                setIsVisible(!isVisible);
                try {
                  setIsLoading(true);
                  const itemsToSave = contactItems.map(
                    ({ _id, ...item }) => item
                  );
                  await saveContactBanner({
                    title,
                    description,
                    isVisible: !isVisible,
                    contactItems: itemsToSave,
                  });

                  toast.success("تم تغيير حالة الظهور بنجاح");
                } catch (error) {
                  console.error("Failed to save visibility change:", error);
                  toast.error("حدث خطأ أثناء حفظ تغيير حالة الظهور");
                  setIsVisible(isVisible);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : isVisible ? (
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
        </div>
      </div>
      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
        dir="rtl"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">المعلومات العامة</TabsTrigger>
          <TabsTrigger value="items">عناصر الاتصال</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>العنوان والوصف</CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium block">
                  العنوان
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="أدخل عنوان قسم التواصل"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium block"
                >
                  الوصف
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل وصف قسم التواصل"
                  rows={3}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSaveChanges}
                  disabled={isLoading || !hasChanges()}
                  className="gap-2"
                >
                  {isLoading ? (
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="items" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
              <div>
                <h3 className="text-lg font-semibold">عناصر الاتصال</h3>
                <p className="text-sm text-muted-foreground">
                  أضف وعدل عناصر الاتصال التي ستظهر في القسم
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setItemFormData({
                    title: "",
                    description: "",
                    image: null,
                  });
                  setShowItemDialog(true);
                }}
                className="gap-2 w-full sm:w-auto"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
                إضافة عنصر جديد
              </Button>
            </CardHeader>
            <CardContent>
              {contactItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
                      <rect width="18" height="12" x="3" y="4" rx="2" />
                      <circle cx="12" cy="10" r="2" />
                      <line x1="8" x2="8" y1="2" y2="4" />
                      <line x1="16" x2="16" y1="2" y2="4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    لا توجد عناصر اتصال
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ابدأ بإضافة عناصر اتصال جديدة لقسم التواصل
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={contactItems.map((item) => item._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {contactItems.map((item) => (
                        <SortableContactItem
                          key={item._id}
                          item={item}
                          onDelete={handleDeleteItem}
                          onEdit={handleEditItem}
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
      <Dialog
        open={showItemDialog}
        onOpenChange={(open) => {
          if (isItemLoading) return;
          handleDialogClose(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "تعديل عنصر اتصال" : "إضافة عنصر اتصال جديد"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveItem();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">العنوان</label>
              <Input
                value={itemFormData.title}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, title: e.target.value })
                }
                placeholder="مثال: اتصل بنا"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف</label>
              <Input
                value={itemFormData.description}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    description: e.target.value,
                  })
                }
                placeholder="مثال: نستجيب لرسائلك خلال 24 ساعة."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الصورة</label>
              {(imagePreview || itemFormData.image) && (
                <div className="relative mb-4">
                  <div className="w-full h-40 rounded-lg overflow-hidden bg-muted/50 ring-2 ring-border/50 flex items-center justify-center relative">
                    <div className="relative w-[100px] h-[100px]">
                      <Image
                        src={
                          imagePreview ||
                          (typeof itemImageUrl === "string" && itemImageUrl
                            ? itemImageUrl
                            : "/placeholder-image.png")
                        }
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 size-8 rounded-full"
                    onClick={() => {
                      if (imagePreview) {
                        URL.revokeObjectURL(imagePreview);
                        setImagePreview(null);
                      }
                      setSelectedFile(null);
                      setItemFormData({ ...itemFormData, image: null });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!imagePreview && !itemFormData.image && (
                <ImageUpload
                  onFileSelect={(file: File) => {
                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl);
                    setSelectedFile(file);
                  }}
                  className="w-full h-[96px]"
                />
              )}
            </div>
            <div className="flex items-center justify-between mt-6">
              {isItemLoading && (
                <div className="text-sm text-muted-foreground">
                  {editingItem
                    ? "جاري تحديث العنصر..."
                    : "جاري إضافة العنصر..."}
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  disabled={isItemLoading}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isItemLoading ||
                    !itemFormData.title ||
                    !itemFormData.description ||
                    (!itemFormData.image && !selectedFile)
                  }
                  className={isItemLoading ? "bg-primary/80" : ""}
                >
                  {isItemLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      {editingItem ? "تحديث..." : "إضافة..."}
                    </>
                  ) : editingItem ? (
                    "تحديث"
                  ) : (
                    "إضافة"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
