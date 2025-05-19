"use client";

import {
  Save,
  Truck,
  Loader2,
  EyeIcon,
  RefreshCw,
  EyeOffIcon,
  HelpCircle,
  CreditCard,
  ShieldCheck,
  FileTextIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import TermsLoadingSkeleton from "./loading";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormData {
  title: string;
  description: string;
  introduction: string;
  introductionVisible: boolean;
  accountTerms: string;
  accountTermsVisible: boolean;
  paymentTerms: string;
  paymentTermsVisible: boolean;
  shippingPolicy: string;
  shippingPolicyVisible: boolean;
  returnPolicy: string;
  returnPolicyVisible: boolean;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  contactInfoVisible: boolean;
  isVisible: boolean;
}

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    introduction: "",
    introductionVisible: true,
    accountTerms: "",
    accountTermsVisible: true,
    paymentTerms: "",
    paymentTermsVisible: true,
    shippingPolicy: "",
    shippingPolicyVisible: true,
    returnPolicy: "",
    returnPolicyVisible: true,
    contactInfo: {
      email: "",
      phone: "",
      address: "",
    },
    contactInfoVisible: true,
    isVisible: true,
  });

  const termsData = useQuery(api.terms.get);
  const saveTerms = useMutation(api.terms.update);

  const hasChanges = () => {
    const defaultTitle = "الشروط والأحكام";
    const defaultDescription = "الشروط والأحكام الخاصة بالمتجر";

    if (termsData === undefined) return false;

    const compareData = termsData || {
      title: defaultTitle,
      description: defaultDescription,
      introduction: "",
      accountTerms: "",
      accountTermsVisible: true,
      paymentTerms: "",
      paymentTermsVisible: true,
      shippingPolicy: "",
      shippingPolicyVisible: true,
      returnPolicy: "",
      returnPolicyVisible: true,
      contactInfo: {
        email: "",
        phone: "",
        address: "",
      },
      contactInfoVisible: true,
      isVisible: true,
    };

    return (
      formData.title !== (compareData.title || defaultTitle) ||
      formData.description !==
        (compareData.description || defaultDescription) ||
      formData.introduction !== (compareData.introduction || "") ||
      formData.accountTerms !== (compareData.accountTerms || "") ||
      formData.accountTermsVisible !==
        (compareData.accountTermsVisible ?? true) ||
      formData.paymentTerms !== (compareData.paymentTerms || "") ||
      formData.paymentTermsVisible !==
        (compareData.paymentTermsVisible ?? true) ||
      formData.shippingPolicy !== (compareData.shippingPolicy || "") ||
      formData.shippingPolicyVisible !==
        (compareData.shippingPolicyVisible ?? true) ||
      formData.returnPolicy !== (compareData.returnPolicy || "") ||
      formData.returnPolicyVisible !==
        (compareData.returnPolicyVisible ?? true) ||
      formData.contactInfo.email !== (compareData.contactInfo?.email || "") ||
      formData.contactInfo.phone !== (compareData.contactInfo?.phone || "") ||
      formData.contactInfo.address !==
        (compareData.contactInfo?.address || "") ||
      formData.contactInfoVisible !==
        (compareData.contactInfoVisible ?? true) ||
      formData.isVisible !== (compareData.isVisible ?? true)
    );
  };

  useEffect(() => {
    if (termsData !== undefined) {
      const defaultTitle = "الشروط والأحكام";
      const defaultDescription = "الشروط والأحكام الخاصة بالمتجر";

      setFormData({
        title: termsData?.title || defaultTitle,
        description: termsData?.description || defaultDescription,
        introduction: termsData?.introduction || "",
        introductionVisible: true,
        accountTerms: termsData?.accountTerms || "",
        accountTermsVisible: termsData?.accountTermsVisible ?? true,
        paymentTerms: termsData?.paymentTerms || "",
        paymentTermsVisible: termsData?.paymentTermsVisible ?? true,
        shippingPolicy: termsData?.shippingPolicy || "",
        shippingPolicyVisible: termsData?.shippingPolicyVisible ?? true,
        returnPolicy: termsData?.returnPolicy || "",
        returnPolicyVisible: termsData?.returnPolicyVisible ?? true,
        contactInfo: {
          email: termsData?.contactInfo?.email || "",
          phone: termsData?.contactInfo?.phone || "",
          address: termsData?.contactInfo?.address || "",
        },
        contactInfoVisible: termsData?.contactInfoVisible ?? true,
        isVisible: termsData?.isVisible ?? true,
      });
    }
  }, [termsData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "email" || name === "phone" || name === "address") {
      setFormData((prev) => {
        const updatedContactInfo = { ...prev.contactInfo };
        updatedContactInfo[name] = value;

        return {
          ...prev,
          contactInfo: updatedContactInfo,
        };
      });
    }
  };

  const handleVisibilityChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isVisible: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        title,
        description,
        introduction,
        introductionVisible,
        accountTerms,
        accountTermsVisible,
        paymentTerms,
        paymentTermsVisible,
        shippingPolicy,
        shippingPolicyVisible,
        returnPolicy,
        returnPolicyVisible,
        contactInfo,
        contactInfoVisible,
        isVisible,
      } = formData;

      await saveTerms({
        title,
        description,
        introduction,
        introductionVisible,
        accountTerms,
        accountTermsVisible,
        paymentTerms,
        paymentTermsVisible,
        shippingPolicy,
        shippingPolicyVisible,
        returnPolicy,
        returnPolicyVisible,
        isVisible,
        contactInfo,
        contactInfoVisible,
      });

      toast.success("تم حفظ الشروط والأحكام بنجاح");
    } catch (error) {
      console.error("Error saving terms:", error);
      toast.error("حدث خطأ أثناء حفظ الشروط والأحكام");
    } finally {
      setLoading(false);
    }
  };

  if (termsData === undefined) {
    return <TermsLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5">
          <Heading
            title="الشروط والأحكام"
            description="إدارة محتوى صفحة الشروط والأحكام في متجرك الإلكتروني."
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={formData.isVisible ? "default" : "outline"}
                onClick={() => handleVisibilityChange(!formData.isVisible)}
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
            <Button
              onClick={handleSubmit}
              disabled={loading || !hasChanges()}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Tabs
          defaultValue="general"
          className="w-full"
          dir="rtl"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4 flex-wrap gap-1 sm:gap-0">
            <TabsTrigger value="general" className="w-full sm:w-auto">
              <FileTextIcon className="h-4 w-4 ml-2" />
              معلومات عامة
            </TabsTrigger>
            <TabsTrigger value="account" className="w-full sm:w-auto">
              <ShieldCheck className="h-4 w-4 ml-2" />
              شروط الحساب
            </TabsTrigger>
            <TabsTrigger value="payment" className="w-full sm:w-auto">
              <CreditCard className="h-4 w-4 ml-2" />
              شروط الدفع
            </TabsTrigger>
            <TabsTrigger value="shipping" className="w-full sm:w-auto">
              <Truck className="h-4 w-4 ml-2" />
              سياسة الشحن
            </TabsTrigger>
            <TabsTrigger value="return" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 ml-2" />
              سياسة الإرجاع
            </TabsTrigger>
            <TabsTrigger value="contact" className="w-full sm:w-auto">
              <HelpCircle className="h-4 w-4 ml-2" />
              معلومات الاتصال
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">معلومات عامة</h3>
                    <p className="text-sm text-muted-foreground">
                      قم بتعديل العنوان والوصف ومقدمة الشروط والأحكام
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">العنوان</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="أدخل عنوان الصفحة"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الوصف</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="أدخل وصف الصفحة"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">المقدمة</label>
                  <Textarea
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleChange}
                    placeholder="أدخل مقدمة الشروط والأحكام"
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    يمكنك استخدام السطر الجديد لفصل الفقرات.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">شروط الحساب</h3>
                    <p className="text-sm text-muted-foreground">
                      قم بتعديل شروط إنشاء واستخدام الحسابات في المتجر
                    </p>
                  </div>
                  <Button
                    variant={
                      formData.accountTermsVisible ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        accountTermsVisible: !prev.accountTermsVisible,
                      }))
                    }
                    className="w-full sm:w-auto gap-2"
                    size="sm"
                  >
                    {formData.accountTermsVisible ? (
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
                  <label className="text-sm font-medium">شروط الحساب</label>
                  <Textarea
                    name="accountTerms"
                    value={formData.accountTerms}
                    onChange={handleChange}
                    placeholder="أدخل شروط الحساب"
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    يمكنك استخدام السطر الجديد لفصل الفقرات.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">شروط الدفع</h3>
                    <p className="text-sm text-muted-foreground">
                      قم بتعديل شروط وطرق الدفع في المتجر
                    </p>
                  </div>
                  <Button
                    variant={
                      formData.paymentTermsVisible ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentTermsVisible: !prev.paymentTermsVisible,
                      }))
                    }
                    className="w-full sm:w-auto gap-2"
                    size="sm"
                  >
                    {formData.paymentTermsVisible ? (
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
                  <label className="text-sm font-medium">شروط الدفع</label>
                  <Textarea
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    placeholder="أدخل شروط الدفع"
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    يمكنك استخدام السطر الجديد لفصل الفقرات.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">سياسة الشحن</h3>
                    <p className="text-sm text-muted-foreground">
                      قم بتعديل سياسة الشحن في المتجر
                    </p>
                  </div>
                  <Button
                    variant={
                      formData.shippingPolicyVisible ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        shippingPolicyVisible: !prev.shippingPolicyVisible,
                      }))
                    }
                    className="w-full sm:w-auto gap-2"
                    size="sm"
                  >
                    {formData.shippingPolicyVisible ? (
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
                  <label className="text-sm font-medium">سياسة الشحن</label>
                  <Textarea
                    name="shippingPolicy"
                    value={formData.shippingPolicy}
                    onChange={handleChange}
                    placeholder="أدخل سياسة الشحن"
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    يمكنك استخدام السطر الجديد لفصل الفقرات.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="return">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">سياسة الإرجاع</h3>
                    <p className="text-sm text-muted-foreground">
                      قم بتعديل سياسة الإرجاع في المتجر
                    </p>
                  </div>
                  <Button
                    variant={
                      formData.returnPolicyVisible ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        returnPolicyVisible: !prev.returnPolicyVisible,
                      }))
                    }
                    className="w-full sm:w-auto gap-2"
                    size="sm"
                  >
                    {formData.returnPolicyVisible ? (
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
                  <label className="text-sm font-medium">سياسة الإرجاع</label>
                  <Textarea
                    name="returnPolicy"
                    value={formData.returnPolicy}
                    onChange={handleChange}
                    placeholder="أدخل سياسة الإرجاع"
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    يمكنك استخدام السطر الجديد لفصل الفقرات.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">معلومات الاتصال</h3>
                    <p className="text-sm text-muted-foreground">
                      قم بتعديل معلومات الاتصال في المتجر
                    </p>
                  </div>
                  <Button
                    variant={
                      formData.contactInfoVisible ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        contactInfoVisible: !prev.contactInfoVisible,
                      }))
                    }
                    className="w-full sm:w-auto gap-2"
                    size="sm"
                  >
                    {formData.contactInfoVisible ? (
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
                  <label className="text-sm font-medium">
                    البريد الإلكتروني
                  </label>
                  <Input
                    name="email"
                    value={formData.contactInfo.email}
                    onChange={handleContactChange}
                    placeholder="أدخل البريد الإلكتروني"
                    dir="ltr"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف</label>
                  <Input
                    name="phone"
                    value={formData.contactInfo.phone}
                    onChange={handleContactChange}
                    placeholder="أدخل رقم الهاتف"
                    dir="ltr"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">العنوان</label>
                  <Textarea
                    name="address"
                    value={formData.contactInfo.address}
                    onChange={handleContactChange}
                    placeholder="أدخل العنوان"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
