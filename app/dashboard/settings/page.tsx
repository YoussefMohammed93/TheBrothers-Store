"use client";

import {
  StoreIcon,
  CreditCardIcon,
  SaveIcon,
  Loader2,
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  RefreshCwIcon,
  TruckIcon,
  Save,
  ImageIcon,
  BookOpenIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCurrency,
  CurrencyCode,
  CURRENCIES,
} from "@/contexts/currency-context";
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
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { Upload, EyeIcon, EyeOffIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Coupon = {
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _id: Id<"coupons">;
  usageLimit?: number;
  usageCount?: number;
  discountPercentage: number;
};

export default function SettingsPage() {
  const settings = useQuery(api.settings.get);
  const saveSettings = useMutation(api.settings.save);

  const [shippingCost, setShippingCost] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  const [adhkarEnabled, setAdhkarEnabled] = useState(false);
  const [adhkarInterval, setAdhkarInterval] = useState("5");

  const [originalValues, setOriginalValues] = useState({
    shippingCost: "",
    freeShippingThreshold: "",
    storeName: "",
    storePhone: "",
    storeEmail: "",
    storeAddress: "",
    defaultCurrency: "",
    showLogo: true,
    adhkarEnabled: false,
    adhkarInterval: "5",
  });

  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    if (settings) {
      const shippingCostValue = settings.shippingCost?.toString() || "15";
      const freeShippingThresholdValue =
        settings.freeShippingThreshold?.toString() || "";
      const storeNameValue = settings.storeName || "";
      const storePhoneValue = settings.storePhone || "";
      const storeEmailValue = settings.storeEmail || "";
      const storeAddressValue = settings.storeAddress || "";

      setShippingCost(shippingCostValue);
      setFreeShippingThreshold(freeShippingThresholdValue);
      setStoreName(storeNameValue);
      setStorePhone(storePhoneValue);
      setStoreEmail(storeEmailValue);
      setStoreAddress(storeAddressValue);
      setAdhkarEnabled(settings.adhkarEnabled ?? false);
      setAdhkarInterval(settings.adhkarInterval?.toString() ?? "5");

      setOriginalValues({
        shippingCost: shippingCostValue,
        freeShippingThreshold: freeShippingThresholdValue,
        storeName: storeNameValue,
        storePhone: storePhoneValue,
        storeEmail: storeEmailValue,
        storeAddress: storeAddressValue,
        defaultCurrency: settings.defaultCurrency || currency.code,
        showLogo: settings.showLogo ?? true,
        adhkarEnabled: settings.adhkarEnabled ?? false,
        adhkarInterval: settings.adhkarInterval?.toString() ?? "5",
      });
    }
  }, [settings, currency.code]);

  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [isEditCouponOpen, setIsEditCouponOpen] = useState(false);
  const [isDeleteCouponOpen, setIsDeleteCouponOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const hasChanges = () => {
    return (
      shippingCost !== originalValues.shippingCost ||
      freeShippingThreshold !== originalValues.freeShippingThreshold ||
      storeName !== originalValues.storeName ||
      storePhone !== originalValues.storePhone ||
      storeEmail !== originalValues.storeEmail ||
      storeAddress !== originalValues.storeAddress ||
      currency.code !== originalValues.defaultCurrency ||
      showLogo !== originalValues.showLogo ||
      adhkarEnabled !== originalValues.adhkarEnabled ||
      adhkarInterval !== originalValues.adhkarInterval ||
      logoFile !== null ||
      logoToDelete !== null
    );
  };

  const [couponName, setCouponName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponUsageLimit, setCouponUsageLimit] = useState("");

  const coupons = useQuery(api.coupons.getCoupons) || [];

  const createCouponMutation = useMutation(api.coupons.createCoupon);
  const updateCouponMutation = useMutation(api.coupons.updateCoupon);
  const deleteCouponMutation = useMutation(api.coupons.deleteCoupon);
  const generateCouponCodeMutation = useMutation(
    api.coupons.generateCouponCode
  );
  const deleteStorageId = useMutation(api.files.deleteStorageId);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (logoToDelete) {
        await deleteStorageId({ storageId: logoToDelete });
      }

      let logoId = settings?.logo;
      if (logoFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": logoFile.type,
          },
          body: logoFile,
        });
        const { storageId } = await result.json();
        logoId = storageId;
      }

      await saveSettings({
        shippingCost: Number(shippingCost) || 15,
        freeShippingThreshold: freeShippingThreshold
          ? Number(freeShippingThreshold)
          : null,
        defaultCurrency: currency.code,
        storeName,
        storePhone,
        storeEmail,
        storeAddress,
        logo: logoId,
        showLogo,
        adhkarEnabled,
        adhkarInterval: Number(adhkarInterval) || 5,
      });

      setLogoFile(null);
      setLogoToDelete(null);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    }
    setLoading(false);
  };

  const handleGenerateCouponCode = async () => {
    try {
      const code = await generateCouponCodeMutation();
      setCouponCode(code);
    } catch (error) {
      console.error("Failed to generate coupon code:", error);
      toast.error("فشل في إنشاء كود الكوبون");
    }
  };

  const handleAddCoupon = async () => {
    if (!couponName.trim() || !couponCode.trim() || !couponDiscount.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    const discountValue = parseFloat(couponDiscount);
    if (isNaN(discountValue) || discountValue <= 0 || discountValue > 100) {
      toast.error("يرجى إدخال نسبة خصم صحيحة بين 1 و 100");
      return;
    }

    let usageLimitValue: number | undefined = undefined;
    if (couponUsageLimit.trim()) {
      usageLimitValue = parseInt(couponUsageLimit);
      if (isNaN(usageLimitValue) || usageLimitValue <= 0) {
        toast.error("يرجى إدخال عدد مرات استخدام صحيح");
        return;
      }
    }

    setIsAddLoading(true);
    try {
      await createCouponMutation({
        name: couponName,
        code: couponCode.trim().toUpperCase(),
        discountPercentage: discountValue,
        usageLimit: usageLimitValue,
      });

      toast.success("تم إضافة الكوبون بنجاح");
      resetCouponForm();
      setIsAddCouponOpen(false);
    } catch (error) {
      console.error("Failed to add coupon:", error);
      toast.error("فشل في إضافة الكوبون");
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleEditCoupon = async () => {
    if (!selectedCoupon) return;

    if (!couponName.trim() || !couponCode.trim() || !couponDiscount.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    const discountValue = parseFloat(couponDiscount);
    if (isNaN(discountValue) || discountValue <= 0 || discountValue > 100) {
      toast.error("يرجى إدخال نسبة خصم صحيحة بين 1 و 100");
      return;
    }

    let usageLimitValue: number | undefined = undefined;
    if (couponUsageLimit.trim()) {
      usageLimitValue = parseInt(couponUsageLimit);
      if (isNaN(usageLimitValue) || usageLimitValue <= 0) {
        toast.error("يرجى إدخال عدد مرات استخدام صحيح");
        return;
      }
    }

    setIsEditLoading(true);
    try {
      await updateCouponMutation({
        id: selectedCoupon._id,
        name: couponName,
        code: couponCode.trim().toUpperCase(),
        discountPercentage: discountValue,
        usageLimit: usageLimitValue,
      });

      toast.success("تم تحديث الكوبون بنجاح");
      resetCouponForm();
      setIsEditCouponOpen(false);
    } catch (error) {
      console.error("Failed to update coupon:", error);
      toast.error("فشل في تحديث الكوبون");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    setIsDeleteLoading(true);
    try {
      await deleteCouponMutation({ id: selectedCoupon._id });
      toast.success("تم حذف الكوبون بنجاح");
      setIsDeleteCouponOpen(false);
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      toast.error("فشل في حذف الكوبون");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const resetCouponForm = () => {
    setCouponName("");
    setCouponCode("");
    setCouponDiscount("");
    setCouponUsageLimit("");
    setSelectedCoupon(null);
  };

  const openEditDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCouponName(coupon.name);
    setCouponCode(coupon.code);
    setCouponDiscount(coupon.discountPercentage.toString());
    setCouponUsageLimit(coupon.usageLimit?.toString() || "");
    setIsEditCouponOpen(true);
  };

  const openDeleteDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteCouponOpen(true);
  };

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoToDelete, setLogoToDelete] = useState<Id<"_storage"> | null>(null);
  const [showLogo, setShowLogo] = useState(settings?.showLogo ?? true);

  const getLogoUrl = useQuery(
    api.files.getImageUrl,
    settings?.logo ? { storageId: settings.logo } : "skip"
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <Heading title="الإعدادات" description="إدارة إعدادات متجرك." />
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <StoreIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">إعدادات المتجر</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              قم بتحديث المعلومات الأساسية لمتجرك
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المتجر</label>
                <Input
                  placeholder="أدخل اسم المتجر"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الهاتف</label>
                <Input
                  placeholder="أدخل رقم الهاتف"
                  type="tel"
                  dir="rtl"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input
                  placeholder="أدخل البريد الإلكتروني"
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">العنوان</label>
                <Input
                  placeholder="أدخل عنوان المتجر"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">شعار المتجر</label>
                <div className="flex items-start gap-4">
                  <div className="border rounded-lg overflow-hidden w-24 h-24 relative">
                    {logoFile || settings?.logo ? (
                      <Image
                        src={
                          logoPreview ||
                          (settings?.logo && getLogoUrl
                            ? getLogoUrl
                            : "/placeholder-image.png")
                        }
                        alt="شعار المتجر"
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="logo-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error(
                                  "يجب أن يكون حجم الصورة أقل من 5 ميجابايت"
                                );
                                return;
                              }
                              setLogoFile(file);
                              setLogoPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            type="button"
                            className="gap-2"
                            onClick={() =>
                              document.getElementById("logo-upload")?.click()
                            }
                          >
                            <Upload className="h-4 w-4" />
                            اختر صورة
                          </Button>
                          {(logoFile || settings?.logo) && (
                            <Button
                              variant="destructive"
                              size="icon"
                              type="button"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview(null);
                                if (settings?.logo) {
                                  setLogoToDelete(settings.logo);
                                }
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium mt-1">
                          إظهار الشعار :
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={showLogo ? "default" : "outline"}
                          onClick={() => setShowLogo(!showLogo)}
                          className="gap-2"
                        >
                          {showLogo ? (
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <CreditCardIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">إعدادات الدفع</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              إدارة طرق الدفع وإعدادات المعاملات المالية
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">العملة الافتراضية</label>
                <Select
                  value={currency.code}
                  onValueChange={(value) => setCurrency(value as CurrencyCode)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">
                      {CURRENCIES.SAR.name} ({CURRENCIES.SAR.code})
                    </SelectItem>
                    <SelectItem value="EGP">
                      {CURRENCIES.EGP.name} ({CURRENCIES.EGP.code})
                    </SelectItem>
                    <SelectItem value="USD">
                      {CURRENCIES.USD.name} ({CURRENCIES.USD.code})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <TicketIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">كوبونات الخصم</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              إدارة كوبونات الخصم لمتجرك
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">الكوبونات النشطة</h3>
                <Dialog
                  open={isAddCouponOpen}
                  onOpenChange={setIsAddCouponOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                      <PlusIcon className="h-4 w-4" />
                      إضافة كوبون
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة كوبون جديد</DialogTitle>
                      <DialogDescription>
                        أضف كوبون خصم جديد لعملائك
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          اسم الكوبون
                        </label>
                        <Input
                          placeholder="مثال: خصم العيد"
                          value={couponName}
                          onChange={(e) => setCouponName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          كود الكوبون
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="مثال: SALE50"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={handleGenerateCouponCode}
                            type="button"
                          >
                            <RefreshCwIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          نسبة الخصم (%)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="مثال: 10"
                          value={couponDiscount}
                          onChange={(e) => setCouponDiscount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          عدد مرات الاستخدام
                        </label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="اتركه فارغًا للاستخدام غير المحدود"
                          value={couponUsageLimit}
                          onChange={(e) => setCouponUsageLimit(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          اتركه فارغًا للاستخدام غير المحدود
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddCouponOpen(false)}
                      >
                        إلغاء
                      </Button>
                      <Button
                        onClick={handleAddCoupon}
                        disabled={isAddLoading}
                        className="gap-2"
                      >
                        {isAddLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري الإضافة...
                          </>
                        ) : (
                          <>
                            <PlusIcon className="h-4 w-4" />
                            إضافة الكوبون
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-3">
                {coupons.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    لا توجد كوبونات حال
                  </div>
                ) : (
                  coupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <TicketIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{coupon.name}</div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {coupon.code}
                            </code>
                            <Badge variant="outline" className="text-xs">
                              {coupon.discountPercentage}%
                            </Badge>
                            {coupon.usageLimit && (
                              <Badge variant="secondary" className="text-xs">
                                {coupon.usageCount || 0}/{coupon.usageLimit}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 sm:size-9 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                          onClick={() => openDeleteDialog(coupon)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Dialog open={isEditCouponOpen} onOpenChange={setIsEditCouponOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الكوبون</DialogTitle>
              <DialogDescription>قم بتعديل بيانات الكوبون</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم الكوبون</label>
                <Input
                  placeholder="مثال: خصم العيد"
                  value={couponName}
                  onChange={(e) => setCouponName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">كود الكوبون</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="مثال: SALE50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleGenerateCouponCode}
                    type="button"
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">نسبة الخصم (%)</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="مثال: 10"
                  value={couponDiscount}
                  onChange={(e) => setCouponDiscount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  عدد مرات الاستخدام
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="اتركه فارغًا للاستخدام غير المحدود"
                  value={couponUsageLimit}
                  onChange={(e) => setCouponUsageLimit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  اتركه فارغًا للاستخدام غير المحدود
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditCouponOpen(false);
                  resetCouponForm();
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleEditCoupon}
                disabled={isEditLoading}
                className="gap-2"
              >
                {isEditLoading ? (
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={isDeleteCouponOpen}
          onOpenChange={setIsDeleteCouponOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف الكوبون &quot;{selectedCoupon?.name}&quot; نهائ. هذا
                الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteCouponOpen(false);
                  setSelectedCoupon(null);
                }}
              >
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCoupon}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isDeleteLoading}
              >
                {isDeleteLoading ? (
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <TruckIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">إعدادات الشحن</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              تحديد تكلفة الشحن للطلبات
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  تكلفة الشحن الثابتة
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    placeholder="مثال: 15"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-[180px]"
                  />
                  <span className="text-sm text-muted-foreground">
                    {currency.symbol}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  الشحن المجاني للطلبات فوق
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    placeholder="مثال: 200"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="w-[180px]"
                  />
                  <span className="text-sm text-muted-foreground">
                    {currency.symbol}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  اتركها فارغة لتعطيل الشحن المجاني
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <BookOpenIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">إعدادات الأذكار</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              تحكم في عرض الأذكار الإسلامية للمستخدمين
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">تفعيل الأذكار</label>
                  <p className="text-sm text-muted-foreground">
                    عرض الأذكار الإسلامية للمستخدمين في جميع الصفحات
                  </p>
                </div>
                <Button
                  type="button"
                  variant={adhkarEnabled ? "default" : "outline"}
                  onClick={() => setAdhkarEnabled(!adhkarEnabled)}
                  className="gap-2"
                >
                  {adhkarEnabled ? "مفعل" : "معطل"}
                </Button>
              </div>
              {adhkarEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    فترة عرض الأذكار (بالدقائق)
                  </label>
                  <Select
                    value={adhkarInterval}
                    onValueChange={setAdhkarInterval}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">كل دقيقة</SelectItem>
                      <SelectItem value="2">كل دقيقتين</SelectItem>
                      <SelectItem value="3">كل 3 دقائق</SelectItem>
                      <SelectItem value="4">كل 4 دقائق</SelectItem>
                      <SelectItem value="5">كل 5 دقائق</SelectItem>
                      <SelectItem value="10">كل 10 دقائق</SelectItem>
                      <SelectItem value="15">كل 15 دقيقة</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    سيتم عرض ذكر عشوائي كل {adhkarInterval} دقيقة/دقائق
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading || !hasChanges()}
            className="gap-2 w-full md:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin size-5" />
                <span>جاري الحفظ...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SaveIcon className="h-4 w-4" />
                <span>حفظ الإعدادات</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
