"use client";

import {
  Save,
  Loader2,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  BuildingIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { TeamMembers } from "./team-members";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import AboutLoadingSkeleton from "./loading-skeleton";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AboutPage() {
  const [, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [selectedMainImage, setSelectedMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mainImage: null as Id<"_storage"> | null,
    companyHistory: "",
    companyHistoryImage: null as Id<"_storage"> | null,
    companyHistoryVisible: true,
    vision: "",
    mission: "",
    values: "",
    visionMissionValuesVisible: true,
    teamTitle: "",
    teamDescription: "",
    teamVisible: true,
    isVisible: true,
  });

  // Fetch data from Convex
  const aboutPageData = useQuery(api.about.getAboutPage);
  const saveAboutPage = useMutation(api.about.saveAboutPage);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteStorageId = useMutation(api.files.deleteStorageId);

  // Load data when available
  useEffect(() => {
    if (aboutPageData) {
      setFormData({
        title: aboutPageData.title || "",
        description: aboutPageData.description || "",
        mainImage: aboutPageData.mainImage || null,
        companyHistory: aboutPageData.companyHistory || "",
        companyHistoryImage: aboutPageData.companyHistoryImage || null,
        companyHistoryVisible: aboutPageData.companyHistoryVisible ?? true,
        vision: aboutPageData.vision || "",
        mission: aboutPageData.mission || "",
        values: aboutPageData.values || "",
        visionMissionValuesVisible:
          aboutPageData.visionMissionValuesVisible ?? true,
        teamTitle: aboutPageData.teamTitle || "",
        teamDescription: aboutPageData.teamDescription || "",
        teamVisible: aboutPageData.teamVisible ?? true,
        isVisible: aboutPageData.isVisible ?? true,
      });
    }
  }, [aboutPageData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check if there are changes to save
  const hasChanges = () => {
    if (!aboutPageData) return true;

    return (
      formData.title !== (aboutPageData.title || "") ||
      formData.description !== (aboutPageData.description || "") ||
      formData.companyHistory !== (aboutPageData.companyHistory || "") ||
      formData.companyHistoryVisible !==
        (aboutPageData.companyHistoryVisible ?? true) ||
      formData.vision !== (aboutPageData.vision || "") ||
      formData.mission !== (aboutPageData.mission || "") ||
      formData.values !== (aboutPageData.values || "") ||
      formData.visionMissionValuesVisible !==
        (aboutPageData.visionMissionValuesVisible ?? true) ||
      formData.teamTitle !== (aboutPageData.teamTitle || "") ||
      formData.teamDescription !== (aboutPageData.teamDescription || "") ||
      formData.teamVisible !== (aboutPageData.teamVisible ?? true) ||
      formData.isVisible !== (aboutPageData.isVisible ?? true) ||
      selectedMainImage !== null
    );
  };

  // Save changes
  const handleSave = async () => {
    setLoading(true);
    try {
      let mainImageId = formData.mainImage;

      if (selectedMainImage) {
        if (formData.mainImage) {
          await deleteStorageId({ storageId: formData.mainImage });
        }

        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedMainImage.type },
          body: selectedMainImage,
        });
        const { storageId } = await result.json();
        mainImageId = storageId;
      }

      await saveAboutPage({
        title: formData.title,
        description: formData.description,
        mainImage: mainImageId || undefined,
        companyHistory: formData.companyHistory,
        companyHistoryImage: formData.companyHistoryImage || undefined,
        companyHistoryVisible: formData.companyHistoryVisible,
        vision: formData.vision,
        mission: formData.mission,
        values: formData.values,
        visionMissionValuesVisible: formData.visionMissionValuesVisible,
        teamTitle: formData.teamTitle,
        teamDescription: formData.teamDescription,
        teamVisible: formData.teamVisible,
        isVisible: formData.isVisible,
        teamMembers: undefined,
      });

      toast.success("تم حفظ التغييرات بنجاح");
      setSelectedMainImage(null);
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
        setMainImagePreview(null);
      }
    } catch (error) {
      console.error("Error saving about page:", error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setLoading(false);
    }
  };

  if (aboutPageData === undefined) {
    return <AboutLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <Heading
          title="صفحة من نحن"
          description="قم بتخصيص محتوى صفحة من نحن في متجرك الإلكتروني."
        />
        <Button
          variant={formData.isVisible ? "default" : "outline"}
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              isVisible: !prev.isVisible,
            }))
          }
          className="gap-2"
          size="sm"
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
      <Tabs
        defaultValue="general"
        className="w-full"
        dir="rtl"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4 flex-wrap gap-1 sm:gap-0">
          <TabsTrigger value="general" className="w-full sm:w-auto">
            <FileTextIcon className="h-4 w-4 ml-2" />
            معلومات عامة
          </TabsTrigger>
          <TabsTrigger value="company" className="w-full sm:w-auto">
            <BuildingIcon className="h-4 w-4 ml-2" />
            عن الشركة
          </TabsTrigger>
          <TabsTrigger value="team" className="w-full sm:w-auto">
            <UsersIcon className="h-4 w-4 ml-2" />
            فريق العمل
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">المعلومات العامة</h3>
                  <p className="text-sm text-muted-foreground">
                    قم بتعديل العنوان والوصف الرئيسي لصفحة من نحن
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان الصفحة</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="أدخل عنوان الصفحة"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">وصف الصفحة</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="أدخل وصف الصفحة"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الصورة الرئيسية</label>
                {(mainImagePreview || aboutPageData?.mainImageUrl) && (
                  <div className="relative w-60 h-40 mb-4">
                    <Image
                      src={
                        mainImagePreview || aboutPageData?.mainImageUrl || ""
                      }
                      alt="Main image preview"
                      fill
                      className="object-cover rounded-md border"
                    />
                  </div>
                )}
                <ImageUpload
                  onFileSelect={(file) => {
                    const previewUrl = URL.createObjectURL(file);
                    if (mainImagePreview) {
                      URL.revokeObjectURL(mainImagePreview);
                    }
                    setMainImagePreview(previewUrl);
                    setSelectedMainImage(file);
                  }}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">معلومات الشركة</h3>
                  <p className="text-sm text-muted-foreground">
                    قم بتعديل معلومات الشركة والرؤية والرسالة والقيم
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">تاريخ الشركة</label>
                <Textarea
                  name="companyHistory"
                  value={formData.companyHistory}
                  onChange={handleChange}
                  placeholder="أدخل نبذة عن تاريخ الشركة"
                  rows={4}
                />
              </div>
              <Separator className="mb-6 mt-8" />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    الرؤية والرسالة والقيم
                  </label>
                  <Button
                    variant={
                      formData.visionMissionValuesVisible
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        visionMissionValuesVisible:
                          !prev.visionMissionValuesVisible,
                      }))
                    }
                    className="gap-2"
                    size="sm"
                  >
                    {formData.visionMissionValuesVisible ? (
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
                <Textarea
                  name="vision"
                  value={formData.vision}
                  onChange={handleChange}
                  placeholder="أدخل رؤية الشركة"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الرسالة</label>
                <Textarea
                  name="mission"
                  value={formData.mission}
                  onChange={handleChange}
                  placeholder="أدخل رسالة الشركة"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">القيم</label>
                <Textarea
                  name="values"
                  value={formData.values}
                  onChange={handleChange}
                  placeholder="أدخل قيم الشركة"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">فريق العمل</h3>
                  <p className="text-sm text-muted-foreground">
                    قم بإدارة معلومات فريق العمل
                  </p>
                </div>
                <Button
                  variant={formData.teamVisible ? "default" : "outline"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      teamVisible: !prev.teamVisible,
                    }))
                  }
                  className="w-full sm:w-auto gap-2"
                  size="sm"
                >
                  {formData.teamVisible ? (
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
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان قسم الفريق</label>
                <Input
                  name="teamTitle"
                  value={formData.teamTitle}
                  onChange={handleChange}
                  placeholder="أدخل عنوان قسم الفريق"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">وصف قسم الفريق</label>
                <Textarea
                  name="teamDescription"
                  value={formData.teamDescription}
                  onChange={handleChange}
                  placeholder="أدخل وصف قسم الفريق"
                  rows={3}
                />
              </div>
              <TeamMembers
                aboutPageId={aboutPageData?._id}
                teamMembers={aboutPageData?.teamMembers}
                onTeamMembersChange={() => {
                  toast.success("تم تحديث الفريق بنجاح");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.open("/about", "_blank");
          }}
          className="gap-2"
        >
          <EyeIcon className="h-4 w-4" />
          معاينة
        </Button>
        <Button
          disabled={!hasChanges() || loading}
          onClick={handleSave}
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
    </div>
  );
}
