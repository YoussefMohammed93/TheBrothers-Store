/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "./loading-skeleton";
import { Loader2, Eye, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const saveContactPage = useMutation(api.contact.saveContactPage);

  type ContactPageData = {
    title: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    mapLocation: {
      lat: number;
      lng: number;
    };
    workingHours: string;
    formTitle: string;
    formDescription: string;
    mapTitle: string;
    mapDescription: string;
    _id?: string;
    _creationTime?: number;
  };

  const [formData, setFormData] = useState<ContactPageData>({
    title: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    mapLocation: {
      lat: 24.7136,
      lng: 46.6753,
    },
    workingHours: "",
    formTitle: "",
    formDescription: "",
    mapTitle: "",
    mapDescription: "",
  });

  const contactPageData = useQuery(api.contact.getContactPage);

  useEffect(() => {
    if (contactPageData && Object.keys(contactPageData).length > 0) {
      // Only set values that actually exist in the data
      const newFormData = { ...formData };
      Object.entries(contactPageData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          (newFormData as any)[key] = value;
        }
      });
      setFormData(newFormData);
    }
  }, [contactPageData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<
            string,
            string | number
          >),
          [child]:
            child === "lat" || child === "lng" ? parseFloat(value) : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { ...contactPageData } = formData;

      const updates: any = {
        mapLocation: contactPageData.mapLocation,
      };

      if (contactPageData) {
        Object.entries(contactPageData).forEach(([key, value]) => {
          if (key === "mapLocation") return;

          if (value !== undefined) {
            updates[key] = value;
          }
        });
      }

      await saveContactPage(updates);
      toast.success("تم حفظ إعدادات صفحة الاتصال بنجاح");
    } catch (error) {
      console.error("Error saving contact page:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    if (!contactPageData) return true;

    const typedContactPageData = contactPageData as ContactPageData;

    return (
      formData.title !== typedContactPageData.title ||
      formData.description !== typedContactPageData.description ||
      formData.phone !== typedContactPageData.phone ||
      formData.email !== typedContactPageData.email ||
      formData.address !== typedContactPageData.address ||
      formData.workingHours !== typedContactPageData.workingHours ||
      formData.formTitle !== typedContactPageData.formTitle ||
      formData.formDescription !== typedContactPageData.formDescription ||
      formData.mapTitle !== typedContactPageData.mapTitle ||
      formData.mapDescription !== typedContactPageData.mapDescription ||
      formData.mapLocation.lat !== typedContactPageData.mapLocation.lat ||
      formData.mapLocation.lng !== typedContactPageData.mapLocation.lng
    );
  };

  if (contactPageData === undefined) {
    return <LoadingSkeleton />;
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="إدارة صفحة الاتصال"
        description="تخصيص محتوى صفحة الاتصال وإدارة الرسائل المستلمة"
      />
      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}
        dir="rtl"
        className="w-full mt-5"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="contact-info">معلومات الاتصال</TabsTrigger>
          <TabsTrigger value="form-map">النموذج والخريطة</TabsTrigger>
        </TabsList>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6" dir="rtl">
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات العامة</CardTitle>
                <CardDescription>
                  تخصيص العنوان والوصف الرئيسي لصفحة الاتصال
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium block">
                    عنوان الصفحة
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="عنوان الصفحة"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium block"
                  >
                    وصف الصفحة
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="وصف الصفحة"
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contact-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الاتصال</CardTitle>
                <CardDescription>
                  تخصيص معلومات الاتصال وساعات العمل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium block">
                    رقم الهاتف
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="رقم الهاتف"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium block">
                    البريد الإلكتروني
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="البريد الإلكتروني"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="address"
                    className="text-sm font-medium block"
                  >
                    العنوان
                  </label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="العنوان"
                    rows={3}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="workingHours"
                    className="text-sm font-medium block"
                  >
                    ساعات العمل
                  </label>
                  <Textarea
                    id="workingHours"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    placeholder="ساعات العمل"
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="form-map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>نموذج الاتصال</CardTitle>
                <CardDescription>
                  تخصيص عنوان ووصف نموذج الاتصال
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="formTitle" className="text-sm font-medium">
                    عنوان النموذج
                  </label>
                  <Input
                    id="formTitle"
                    name="formTitle"
                    value={formData.formTitle}
                    onChange={handleChange}
                    placeholder="عنوان النموذج"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="formDescription"
                    className="text-sm font-medium"
                  >
                    وصف النموذج
                  </label>
                  <Textarea
                    id="formDescription"
                    name="formDescription"
                    value={formData.formDescription}
                    onChange={handleChange}
                    placeholder="وصف النموذج"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>الخريطة</CardTitle>
                <CardDescription>
                  تخصيص عنوان ووصف الخريطة وموقع المتجر
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="mapTitle" className="text-sm font-medium">
                    عنوان الخريطة
                  </label>
                  <Input
                    id="mapTitle"
                    name="mapTitle"
                    value={formData.mapTitle}
                    onChange={handleChange}
                    placeholder="عنوان الخريطة"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="mapDescription"
                    className="text-sm font-medium"
                  >
                    وصف الخريطة
                  </label>
                  <Textarea
                    id="mapDescription"
                    name="mapDescription"
                    value={formData.mapDescription}
                    onChange={handleChange}
                    placeholder="وصف الخريطة"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="mapLocation.lat"
                      className="text-sm font-medium"
                    >
                      خط العرض (Latitude)
                    </label>
                    <Input
                      id="mapLocation.lat"
                      name="mapLocation.lat"
                      type="number"
                      step="0.0001"
                      value={formData.mapLocation.lat}
                      onChange={handleChange}
                      placeholder="خط العرض"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="mapLocation.lng"
                      className="text-sm font-medium"
                    >
                      خط الطول (Longitude)
                    </label>
                    <Input
                      id="mapLocation.lng"
                      name="mapLocation.lng"
                      type="number"
                      step="0.0001"
                      value={formData.mapLocation.lng}
                      onChange={handleChange}
                      placeholder="خط الطول"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.open("/contact", "_blank");
              }}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              معاينة
            </Button>
            <Button
              type="submit"
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
        </form>
      </Tabs>
    </DashboardShell>
  );
}
