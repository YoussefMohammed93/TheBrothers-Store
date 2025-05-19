"use client";

import {
  Eye,
  EyeIcon,
  EyeOffIcon,
  Loader2,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import Loading from "./loading-skeleton";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewsletterPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const pageData = useQuery(api.newsletter.get);
  const subscribers = useQuery(api.newsletter.getSubscribers);
  const saveNewsletter = useMutation(api.newsletter.save);
  const deleteStorageId = useMutation(api.files.deleteStorageId);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const removeSubscriber = useMutation(api.newsletter.removeSubscriber);
  const markAsRead = useMutation(api.newsletter.markAsRead);

  useEffect(() => {
    if (activeTab === "subscribers" && subscribers && subscribers.length > 0) {
      if (subscribers.some((sub) => !sub.isRead)) {
        markAsRead();
      }
    }
  }, [activeTab, subscribers, markAsRead]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isVisible: true,
    feature1Title: "",
    feature1Image: "",
    feature2Title: "",
    feature2Image: "",
    buttonText: "",
  });

  const [feature1ImageFile, setFeature1ImageFile] = useState<File | null>(null);
  const [feature2ImageFile, setFeature2ImageFile] = useState<File | null>(null);
  const [feature1ImagePreview, setFeature1ImagePreview] = useState<
    string | null
  >(null);
  const [feature2ImagePreview, setFeature2ImagePreview] = useState<
    string | null
  >(null);

  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const feature1Url = useQuery(
    api.files.getImageUrl,
    formData.feature1Image &&
      typeof formData.feature1Image === "string" &&
      formData.feature1Image.length > 0
      ? { storageId: formData.feature1Image as Id<"_storage"> }
      : "skip"
  );

  const feature2Url = useQuery(
    api.files.getImageUrl,
    formData.feature2Image &&
      typeof formData.feature2Image === "string" &&
      formData.feature2Image.length > 0
      ? { storageId: formData.feature2Image as Id<"_storage"> }
      : "skip"
  );

  useEffect(() => {
    if (pageData !== undefined) {
      setFormData({
        title: pageData?.title || "اشترك في نشرتنا البريدية",
        description:
          pageData?.description ||
          "كن أول من يعلم عن أحدث المنتجات والعروض الحصرية",
        isVisible: pageData?.isVisible ?? true,
        feature1Title: pageData?.featureOneTitle || "",
        feature1Image: pageData?.featureOneImage || "",
        feature2Title: pageData?.featureTwoTitle || "",
        feature2Image: pageData?.featureTwoImage || "",
        buttonText: pageData?.buttonText || "اشترك الآن",
      });
    }
  }, [pageData]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      for (const imageId of imagesToDelete) {
        try {
          await deleteStorageId({ storageId: imageId as Id<"_storage"> });
        } catch (error) {
          console.error("Failed to delete image:", imageId, error);
        }
      }

      let feature1ImageUrl = formData.feature1Image;
      let feature2ImageUrl = formData.feature2Image;

      if (feature1ImageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": feature1ImageFile.type,
          },
          body: feature1ImageFile,
        });
        const { storageId } = await result.json();
        feature1ImageUrl = storageId;
      }

      if (feature2ImageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": feature2ImageFile.type,
          },
          body: feature2ImageFile,
        });
        const { storageId } = await result.json();
        feature2ImageUrl = storageId;
      }

      await saveNewsletter({
        title: formData.title,
        description: formData.description,
        isVisible: formData.isVisible,
        featureOneTitle: formData.feature1Title,
        featureOneImage: feature1ImageUrl,
        featureTwoTitle: formData.feature2Title,
        featureTwoImage: feature2ImageUrl,
        buttonText: formData.buttonText,
      });

      setImagesToDelete([]);

      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error("Error saving newsletter:", error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscriber = async (email: string) => {
    setIsDeleting(true);
    try {
      await removeSubscriber({ email });
      toast.success("تم حذف المشترك بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حذف المشترك");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletingEmail(null);
    }
  };

  const filteredSubscribers =
    subscribers && subscribers.length > 0
      ? subscribers.filter((subscriber) =>
          subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleFeature1ImageSelect = (file: File) => {
    setFeature1ImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFeature1ImagePreview(previewUrl);
  };

  const handleFeature2ImageSelect = (file: File) => {
    setFeature2ImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFeature2ImagePreview(previewUrl);
  };

  const handleFeature1ImageRemove = async () => {
    if (formData.feature1Image) {
      setImagesToDelete((prev) => [...prev, formData.feature1Image]);
    }

    if (feature1ImagePreview) {
      URL.revokeObjectURL(feature1ImagePreview);
      setFeature1ImagePreview(null);
    }

    setFeature1ImageFile(null);
    setFormData((prev) => ({
      ...prev,
      feature1Image: "",
    }));
  };

  const handleFeature2ImageRemove = async () => {
    if (formData.feature2Image) {
      setImagesToDelete((prev) => [...prev, formData.feature2Image]);
    }

    if (feature2ImagePreview) {
      URL.revokeObjectURL(feature2ImagePreview);
      setFeature2ImagePreview(null);
    }

    setFeature2ImageFile(null);
    setFormData((prev) => ({
      ...prev,
      feature2Image: "",
    }));
  };

  const hasChanges = () => {
    const defaultData = {
      title: "اشترك في نشرتنا البريدية",
      description: "كن أول من يعلم عن أحدث المنتجات والعروض الحصرية",
      isVisible: true,
      featureOneTitle: "",
      featureOneImage: "",
      featureTwoTitle: "",
      featureTwoImage: "",
      buttonText: "اشترك الآن",
    };

    const originalData = pageData || defaultData;

    const changes = {
      title: formData.title !== originalData.title,
      description: formData.description !== originalData.description,
      isVisible: formData.isVisible !== originalData.isVisible,
      feature1Title: formData.feature1Title !== originalData.featureOneTitle,
      feature2Title: formData.feature2Title !== originalData.featureTwoTitle,
      buttonText: formData.buttonText !== originalData.buttonText,
      feature1Image: formData.feature1Image !== originalData.featureOneImage,
      feature2Image: formData.feature2Image !== originalData.featureTwoImage,
      hasNewImages: feature1ImageFile !== null || feature2ImageFile !== null,
      hasPendingDeletes: imagesToDelete.length > 0,
    };

    return Object.values(changes).some((changed) => changed === true);
  };

  if (loading || pageData === undefined || subscribers === undefined) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-14 mb-8">
        <Heading
          title="النشرة البريدية"
          description="إدارة النشرة البريدية وإعداداتها."
        />
        <div className="w-full sm:w-auto flex mt-5 gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-1/2 sm:w-auto"
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
            <Eye className="h-4 w-4" />
            معاينة
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !hasChanges()}
            className="w-1/2 sm:w-auto gap-2"
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
      </div>
      <Tabs defaultValue="general" dir="rtl" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="w-full sm:w-auto">
            الإعدادات العامة
          </TabsTrigger>
          <TabsTrigger value="display" className="w-full sm:w-auto">
            إعدادات العرض
          </TabsTrigger>
          <TabsTrigger
            value="subscribers"
            className="w-full sm:w-auto relative"
          >
            المشتركين
            {activeTab !== "subscribers" &&
              subscribers &&
              subscribers.length > 0 &&
              subscribers.some((sub) => !sub.isRead) && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {subscribers.filter((sub) => !sub.isRead).length}
                </span>
              )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">الإعدادات الرئيسية</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      عنوان النشرة البريدية
                    </label>
                    <Input
                      placeholder="أدخل عنوان النشرة البريدية"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      وصف النشرة البريدية
                    </label>
                    <Input
                      placeholder="أدخل وصف النشرة البريدية"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">المميزات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">الميزة الأولى</h4>
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        العنوان
                      </label>
                      <Input
                        placeholder="عنوان الميزة الأولى"
                        value={formData.feature1Title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            feature1Title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        صورة الميزة الأولى
                      </label>
                      {feature1ImagePreview || formData.feature1Image ? (
                        <div className="relative group mb-4 w-24 h-24 mt-4">
                          <Image
                            src={
                              feature1ImagePreview ||
                              feature1Url ||
                              "/placeholder-image.png"
                            }
                            alt="Feature 1 preview"
                            fill
                            className="object-cover rounded-lg border"
                            sizes="96px"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleFeature1ImageRemove}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <ImageUpload
                          onFileSelect={handleFeature1ImageSelect}
                          className="w-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">الميزة الثانية</h4>
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        العنوان
                      </label>
                      <Input
                        placeholder="عنوان الميزة الثانية"
                        value={formData.feature2Title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            feature2Title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        صورة الميزة الثانية
                      </label>
                      {feature2ImagePreview || formData.feature2Image ? (
                        <div className="relative group mb-4 w-24 h-24 mt-4">
                          <Image
                            src={
                              feature2ImagePreview ||
                              feature2Url ||
                              "/placeholder-image.png"
                            }
                            alt="Feature 2 preview"
                            fill
                            className="object-cover rounded-lg border"
                            sizes="96px"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleFeature2ImageRemove}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <ImageUpload
                          onFileSelect={handleFeature2ImageSelect}
                          className="w-full"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">إعدادات الزر</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    نص زر الاشتراك
                  </label>
                  <Input
                    placeholder="مثال : اشترك الآن"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        buttonText: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">إعدادات العرض</h3>
              <p className="text-sm text-muted-foreground">
                تحكم في ظهور وإخفاء النشرة البريدية
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    إظهار النشرة البريدية
                  </label>
                  <p className="text-sm text-muted-foreground">
                    عند التعطيل، لن يظهر نموذج الاشتراك في النشرة البريدية
                    للزوار
                  </p>
                </div>
                <Button
                  variant={formData.isVisible ? "default" : "outline"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isVisible: !prev.isVisible,
                    }))
                  }
                  className="w-full sm:w-auto gap-2"
                >
                  {formData.isVisible ? (
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
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">قائمة المشتركين</h3>
                  <Badge variant="outline">
                    {subscribers?.length || 0} مشترك
                  </Badge>
                </div>
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث عن مشترك..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-md border">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center whitespace-nowrap w-[60px]">
                        #
                      </TableHead>
                      <TableHead className="text-right whitespace-nowrap min-w-[200px]">
                        البريد الإلكتروني
                      </TableHead>
                      <TableHead className="text-right whitespace-nowrap min-w-[150px]">
                        تاريخ الاشتراك
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap w-[100px]">
                        الإجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers?.map((subscriber, index) => (
                      <TableRow key={subscriber.email}>
                        <TableCell className="text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="block truncate">
                            {subscriber.email}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatDate(subscriber.subscribedAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                            onClick={() => {
                              setDeletingEmail(subscriber.email);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filteredSubscribers?.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          لا يوجد مشتركين
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              هل أنت متأكد من حذف هذا المشترك؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المشترك بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingEmail && handleRemoveSubscriber(deletingEmail)
              }
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
