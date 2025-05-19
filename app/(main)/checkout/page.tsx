"use client";

import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  MapPin,
  CheckCircle,
  ShoppingBag,
  Truck,
  Phone,
  User,
  Mail,
  Home,
  MapPinned,
  Building,
  Loader2,
  Ticket,
  Download,
  MessageCircle as MessageCircleIcon,
  Calendar,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { useCurrency } from "@/contexts/currency-context";
import { StripePaymentForm } from "../_components/stripe-payment-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StripeProvider } from "@/app/providers/stripe-provider";

function CheckoutSummarySkeleton() {
  return (
    <div className="space-y-4 p-4 border rounded-lg animate-pulse">
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <Separator />
      <div className="flex justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    </div>
  );
}

function CheckoutFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    isLoading: cartLoading,
    cartTotal,
    coupon,
    discountAmount,
    removeCoupon,
  } = useCart();
  const { formatPrice, currency } = useCurrency();
  const shippingSettings = useQuery(api.settings.getShippingSettings);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    district: "",
    street: "",
    postalCode: "",
    notes: "",
  });

  const [activeStep, setActiveStep] = useState("shipping");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(
    null
  );
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<
    string | null
  >(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const subtotal = cartTotal;
  const calculateShipping = (subtotal: number) => {
    if (!shippingSettings) return 15;

    const { shippingCost, freeShippingThreshold } = shippingSettings;

    if (freeShippingThreshold && subtotal >= freeShippingThreshold) {
      return 0;
    }
    return shippingCost;
  };

  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.country ||
      !formData.city ||
      !formData.district ||
      !formData.street
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    const phoneRegex = /^\d{9,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[+\s-]/g, ""))) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setActiveStep("payment");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const createOrderMutation = useMutation(api.orders.createOrder);
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    orderNumber: string;
    orderSubtotal?: number;
    orderShipping?: number;
    orderDiscount?: number;
    orderTotal?: number;
  } | null>(null);

  const createPaymentIntent = useCallback(async () => {
    if (paymentMethod !== "stripe") return;

    setStripeLoading(true);
    try {
      const response = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          currency: "SAR",
          metadata: {
            customer_name: formData.fullName,
            customer_email: formData.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      setStripeClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast.error("حدث خطأ أثناء تجهيز بوابة الدفع");
    } finally {
      setStripeLoading(false);
    }
  }, [paymentMethod, total, formData.fullName, formData.email]);

  useEffect(() => {
    if (
      activeStep === "payment" &&
      paymentMethod === "stripe" &&
      !stripeClientSecret
    ) {
      createPaymentIntent();
    }
  }, [activeStep, paymentMethod, stripeClientSecret, createPaymentIntent]);

  const handleStripePaymentSuccess = (paymentIntentId: string) => {
    setStripePaymentIntentId(paymentIntentId);
    if (activeStep !== "confirmation") {
      handlePaymentSubmit(paymentIntentId);
    }
  };

  const handleStripePaymentError = () => {
    if (activeStep !== "confirmation") {
      toast.error("حدث خطأ أثناء عملية الدفع. يرجى المحاولة مرة أخرى.");
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeStep]);

  const handlePaymentSubmit = async (stripePaymentId?: string) => {
    if (activeStep === "confirmation" || orderDetails !== null) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (
        paymentMethod === "stripe" &&
        !stripePaymentId &&
        !stripePaymentIntentId
      ) {
        setIsSubmitting(false);
        return;
      }

      const result = await createOrderMutation({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        district: formData.district,
        street: formData.street,
        postalCode: formData.postalCode || undefined,
        notes: formData.notes || undefined,
        paymentMethod: paymentMethod,
        couponCode: coupon?.code,
        couponDiscount: discountAmount,
        stripePaymentId: stripePaymentId || stripePaymentIntentId || undefined,
      });

      setOrderDetails({
        ...result,
        orderSubtotal: subtotal,
        orderShipping: shipping,
        orderDiscount: discountAmount,
        orderTotal: total,
      });

      if (coupon) {
        removeCoupon();
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setActiveStep("confirmation");

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);

      toast.success("تم تأكيد طلبك بنجاح!");
    } catch (error) {
      console.error("Error creating order:", error);
      if (activeStep !== "confirmation") {
        toast.error("حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      !cartLoading &&
      cartItems.length === 0 &&
      activeStep !== "confirmation"
    ) {
      router.push("/cart");
    }
  }, [cartItems, cartLoading, router, activeStep]);

  useEffect(() => {
    if (cartItems.length > 0 && shippingSettings !== undefined) {
      setLocalLoading(false);
    } else {
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [cartItems, shippingSettings]);

  const handleDownloadOrderCard = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not supported");

      canvas.width = 400;
      canvas.height = 600;

      const roundRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };

      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      roundRect(20, 20, canvas.width - 40, 80, 8);
      ctx.fill();
      ctx.strokeStyle = "#e9ecef";
      ctx.stroke();

      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "right";
      ctx.direction = "rtl";
      ctx.fillText("تسوق", canvas.width - 30, 50);

      ctx.font = "14px Arial";
      ctx.fillStyle = "#6c757d";
      ctx.fillText(
        `رقم الطلب: ${orderDetails?.orderNumber || ""}`,
        canvas.width - 30,
        80
      );
      ctx.textAlign = "left";
      ctx.fillText(`${new Date().toLocaleDateString("ar-SA")}`, 30, 80);

      ctx.fillStyle = "#ffffff";
      roundRect(20, 120, canvas.width - 40, 440, 8);
      ctx.fill();
      ctx.strokeStyle = "#e9ecef";
      ctx.stroke();

      let y = 150;
      ctx.textAlign = "right";

      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 18px Arial";
      ctx.fillText("معلومات العميل", canvas.width - 30, y);

      ctx.beginPath();
      ctx.moveTo(canvas.width - 30, y + 5);
      ctx.lineTo(canvas.width - 150, y + 5);
      ctx.strokeStyle = "#007bff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      y += 35;
      ctx.font = "14px Arial";
      ctx.fillStyle = "#495057";

      const details = [
        { label: "الاسم", value: formData.fullName },
        { label: "البريد الإلكتروني", value: formData.email },
        { label: "رقم الجوال", value: formData.phone },
        { label: "البلد", value: formData.country },
        { label: "المدينة", value: formData.city },
        { label: "الحي / المنطقة", value: formData.district },
        { label: "الشارع", value: formData.street },
        { label: "الرمز البريدي", value: formData.postalCode || "" },
      ];

      details.forEach((detail) => {
        ctx.fillStyle = "#6c757d";
        ctx.font = "14px Arial";
        ctx.fillText(`${detail.label}:`, canvas.width - 30, y);
        ctx.fillStyle = "#212529";
        ctx.font = "bold 14px Arial";
        ctx.fillText(detail.value, canvas.width - 120, y);
        y += 25;
      });

      y += 20;
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 18px Arial";
      ctx.fillText("ملخص الطلب", canvas.width - 30, y);

      ctx.beginPath();
      ctx.moveTo(canvas.width - 30, y + 5);
      ctx.lineTo(canvas.width - 130, y + 5);
      ctx.strokeStyle = "#007bff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      y += 30;
      ctx.fillStyle = "#f8f9fa";
      roundRect(30, y, canvas.width - 60, 140, 8);
      ctx.fill();

      y += 30;
      ctx.fillStyle = "#495057";
      ctx.font = "14px Arial";

      ctx.textAlign = "right";
      ctx.fillText(`المجموع الفرعي:`, canvas.width - 40, y);
      ctx.textAlign = "left";
      ctx.fillText(
        `${orderDetails?.orderSubtotal?.toFixed(2)} ${currency.symbol}`,
        40,
        y
      );

      y += 25;
      ctx.textAlign = "right";
      ctx.fillText(`رسوم الشحن:`, canvas.width - 40, y);
      ctx.textAlign = "left";
      ctx.fillText(
        `${orderDetails?.orderShipping?.toFixed(2)} ${currency.symbol}`,
        40,
        y
      );

      if (orderDetails?.orderDiscount && orderDetails.orderDiscount > 0) {
        y += 25;
        ctx.textAlign = "right";
        ctx.fillStyle = "#dc3545";
        ctx.fillText(`الخصم:`, canvas.width - 40, y);
        ctx.textAlign = "left";
        ctx.fillText(
          `- ${orderDetails.orderDiscount.toFixed(2)} ${currency.symbol}`,
          40,
          y
        );
      }

      y += 35;
      ctx.fillStyle = "#007bff";
      roundRect(30, y - 20, canvas.width - 60, 40, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`الإجمالي:`, canvas.width - 40, y);
      ctx.textAlign = "left";
      ctx.fillText(
        `${orderDetails?.orderTotal?.toFixed(2)} ${currency.symbol}`,
        40,
        y
      );

      ctx.fillStyle = "#6c757d";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("شكراً لتسوقكم معنا", canvas.width / 2, canvas.height - 30);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `order-${orderDetails?.orderNumber || "receipt"}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("تم تحميل إيصال الطلب بنجاح");
    } catch (error) {
      console.error("Error generating order card image:", error);
      toast.error("حدث خطأ أثناء تحميل إيصال الطلب");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold">إتمام الطلب</h1>
              <Button variant="outline" size="sm" asChild>
                <Link href="/cart" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  العودة للسلة
                </Link>
              </Button>
            </div>
            {cartLoading || localLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="py-0 px-6">
                      <CheckoutFormSkeleton />
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <CheckoutSummarySkeleton />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="py-0 px-6">
                      <Tabs value={activeStep} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                          <TabsTrigger
                            value="shipping"
                            disabled={activeStep !== "shipping"}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                معلومات الشحن
                              </span>
                              <span className="sm:hidden">الشحن</span>
                            </div>
                          </TabsTrigger>
                          <TabsTrigger
                            value="payment"
                            disabled={activeStep !== "payment"}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span className="hidden sm:inline">الدفع</span>
                              <span className="sm:hidden">الدفع</span>
                            </div>
                          </TabsTrigger>
                          <TabsTrigger
                            value="confirmation"
                            disabled={activeStep !== "confirmation"}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                تأكيد الطلب
                              </span>
                              <span className="sm:hidden">التأكيد</span>
                            </div>
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent
                          value="shipping"
                          className="mt-0"
                          dir="rtl"
                        >
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Truck className="h-5 w-5 text-primary" />
                              </div>
                              <h2 className="text-xl font-semibold">
                                معلومات الشحن
                              </h2>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              يرجى تعبئة بيانات الشحن الخاصة بك بدقة لضمان وصول
                              طلبك بشكل صحيح
                            </p>
                          </div>
                          <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="bg-muted/30 rounded-lg p-5 border">
                              <h3 className="text-base font-medium mb-4 flex items-center gap-2 border-b pb-2">
                                <User className="h-4 w-4 text-primary" />
                                المعلومات الشخصية
                              </h3>
                              <div className="space-y-4">
                                <div className="relative">
                                  <Label
                                    htmlFor="fullName"
                                    className="text-right block mb-2 font-medium"
                                  >
                                    الاسم الكامل{" "}
                                    <span className="text-destructive">*</span>
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      id="fullName"
                                      name="fullName"
                                      value={formData.fullName}
                                      onChange={handleInputChange}
                                      placeholder="أدخل الاسم الكامل"
                                      required
                                      className="text-right pr-10 transition-all focus:border-primary bg-white"
                                    />
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <Label
                                      htmlFor="email"
                                      className="text-right block mb-2 font-medium"
                                    >
                                      البريد الإلكتروني{" "}
                                      <span className="text-destructive">
                                        *
                                      </span>
                                    </Label>
                                    <div className="relative">
                                      <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="example@example.com"
                                        required
                                        className="text-right pr-10 transition-all focus:border-primary bg-white"
                                      />
                                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <Label
                                      htmlFor="phone"
                                      className="text-right block mb-2 font-medium"
                                    >
                                      رقم الجوال{" "}
                                      <span className="text-destructive">
                                        *
                                      </span>
                                    </Label>
                                    <div className="relative">
                                      <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="05xxxxxxxx"
                                        required
                                        className="text-right pr-10 transition-all focus:border-primary bg-white"
                                      />
                                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-5 border">
                              <h3 className="text-base font-medium mb-4 flex items-center gap-2 border-b pb-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                عنوان التوصيل
                              </h3>
                              <div className="space-y-4">
                                <div className="relative">
                                  <Label
                                    htmlFor="country"
                                    className="text-right block mb-2 font-medium"
                                  >
                                    البلد{" "}
                                    <span className="text-destructive">*</span>
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      id="country"
                                      name="country"
                                      value={formData.country}
                                      onChange={handleInputChange}
                                      placeholder="أدخل اسم البلد"
                                      required
                                      className="text-right pr-10 transition-all focus:border-primary bg-white"
                                    />
                                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <Label
                                      htmlFor="city"
                                      className="text-right block mb-2 font-medium"
                                    >
                                      المدينة{" "}
                                      <span className="text-destructive">
                                        *
                                      </span>
                                    </Label>
                                    <div className="relative">
                                      <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="أدخل اسم المدينة"
                                        required
                                        className="text-right pr-10 transition-all focus:border-primary bg-white"
                                      />
                                      <Building className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <Label
                                      htmlFor="district"
                                      className="text-right block mb-2 font-medium"
                                    >
                                      الحي / المنطقة{" "}
                                      <span className="text-destructive">
                                        *
                                      </span>
                                    </Label>
                                    <div className="relative">
                                      <Input
                                        id="district"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        placeholder="أدخل اسم الحي أو المنطقة"
                                        required
                                        className="text-right pr-10 transition-all focus:border-primary bg-white"
                                      />
                                      <MapPinned className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <Label
                                      htmlFor="street"
                                      className="text-right block mb-2 font-medium"
                                    >
                                      اسم الشارع{" "}
                                      <span className="text-destructive">
                                        *
                                      </span>
                                    </Label>
                                    <div className="relative">
                                      <Input
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        placeholder="أدخل اسم الشارع"
                                        required
                                        className="text-right pr-10 transition-all focus:border-primary bg-white"
                                      />
                                      <Home className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <Label
                                      htmlFor="postalCode"
                                      className="text-right block mb-2 font-medium"
                                    >
                                      الرمز البريدي
                                    </Label>
                                    <div className="relative">
                                      <Input
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="أدخل الرمز البريدي (اختياري)"
                                        className="text-right pr-10 transition-all focus:border-primary bg-white"
                                      />
                                      <MapPinned className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-5 border">
                              <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                                <MessageCircleIcon className="h-4 w-4 text-primary" />
                                ملاحظات إضافية
                              </h3>
                              <div>
                                <Textarea
                                  id="notes"
                                  name="notes"
                                  value={formData.notes}
                                  onChange={handleInputChange}
                                  placeholder="أي ملاحظات إضافية حول طلبك أو تعليمات خاصة بالتوصيل"
                                  className="text-right min-h-[100px] transition-all focus:border-primary bg-white"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t">
                              <Button
                                type="button"
                                onClick={() => {
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });

                                  setTimeout(() => {
                                    setActiveStep("payment");
                                  }, 100);
                                }}
                              >
                                متابعة للدفع
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                              <div className="text-sm text-muted-foreground">
                                <span className="text-destructive">*</span>{" "}
                                الحقول المطلوبة
                              </div>
                            </div>
                          </form>
                        </TabsContent>
                        <TabsContent value="payment" className="mt-0" dir="rtl">
                          <div className="space-y-8">
                            <div className="bg-white p-6 rounded-lg border">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                  <div className="bg-primary/10 p-1.5 rounded-full">
                                    <MapPin className="h-5 w-5 text-primary" />
                                  </div>
                                  معلومات الشحن
                                </h3>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setActiveStep("shipping");

                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                >
                                  تعديل
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/65">
                                  <User className="h-4 w-4 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      الاسم
                                    </p>
                                    <p className="font-medium">
                                      {formData.fullName}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/65">
                                  <Phone className="h-4 w-4 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      رقم الجوال
                                    </p>
                                    <p className="font-medium">
                                      {formData.phone}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/65">
                                  <Mail className="h-4 w-4 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      البريد الإلكتروني
                                    </p>
                                    <p className="font-medium">
                                      {formData.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/65">
                                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      البلد
                                    </p>
                                    <p className="font-medium">
                                      {formData.country}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/65">
                                  <Building className="h-4 w-4 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      المدينة
                                    </p>
                                    <p className="font-medium">
                                      {formData.city}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/65">
                                  <MapPinned className="h-4 w-4 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      الحي / المنطقة
                                    </p>
                                    <p className="font-medium">
                                      {formData.district}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/65">
                                  <Home className="h-4 w-4 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      الشارع
                                    </p>
                                    <p className="font-medium">
                                      {formData.street}
                                    </p>
                                  </div>
                                </div>
                                {formData.postalCode && (
                                  <div className="flex items-start gap-3 p-3 rounded-md bg-muted/65">
                                    <Ticket className="h-4 w-4 text-primary mt-0.5" />
                                    <div>
                                      <p className="text-muted-foreground text-xs mb-1">
                                        الرمز البريدي
                                      </p>
                                      <p className="font-medium">
                                        {formData.postalCode}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg border">
                              <h3 className="font-semibold text-lg flex items-center gap-2 mb-5">
                                <div className="bg-primary/10 p-1.5 rounded-full">
                                  <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                اختر طريقة الدفع
                              </h3>
                              <RadioGroup
                                value={paymentMethod}
                                onValueChange={setPaymentMethod}
                                className="space-y-4"
                              >
                                <div
                                  className={`border-2 rounded-lg p-4 transition-all ${
                                    paymentMethod === "cash_on_delivery"
                                      ? "bg-primary/5 border-primary"
                                      : "bg-card border-muted hover:border-muted-foreground/20"
                                  }
                                    flex items-center gap-4`}
                                >
                                  <div className="flex items-center justify-center">
                                    <RadioGroupItem
                                      value="cash_on_delivery"
                                      id="cash_on_delivery"
                                      className="h-5 w-5"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label
                                      htmlFor="cash_on_delivery"
                                      className="flex items-start gap-3 cursor-pointer"
                                    >
                                      <div className="bg-muted/50 p-2 rounded-full">
                                        <ShoppingBag className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <span className="font-medium block mb-1">
                                          الدفع عند الاستلام
                                        </span>
                                        <span className="text-sm text-muted-foreground block">
                                          ادفع نقدًا عند استلام طلبك
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                                <div
                                  className={`border-2 rounded-lg p-4 transition-all ${
                                    paymentMethod === "stripe"
                                      ? "bg-primary/5 border-primary"
                                      : "bg-card border-muted hover:border-muted-foreground/20"
                                  }
                                    flex items-center gap-4`}
                                >
                                  <div className="flex items-center justify-center">
                                    <RadioGroupItem
                                      value="stripe"
                                      id="stripe"
                                      className="h-5 w-5"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label
                                      htmlFor="stripe"
                                      className="flex items-start gap-3 cursor-pointer"
                                    >
                                      <div className="bg-muted/50 p-2 rounded-full">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <span className="font-medium block mb-1">
                                          بطاقة ائتمان
                                        </span>
                                        <span className="text-sm text-muted-foreground block">
                                          ادفع باستخدام بطاقة الائتمان أو مدى
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              </RadioGroup>
                              {paymentMethod === "stripe" && (
                                <div className="mt-6 border rounded-lg p-6 bg-white">
                                  <h4 className="font-medium mb-5 flex items-center gap-2">
                                    <div className="bg-primary/10 p-1 rounded-full">
                                      <CreditCard className="h-4 w-4 text-primary" />
                                    </div>
                                    تفاصيل الدفع
                                  </h4>
                                  {stripeLoading ? (
                                    <div className="flex flex-col items-center justify-center py-10 bg-muted/20 rounded-lg">
                                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                      <span className="text-muted-foreground">
                                        جاري تجهيز بوابة الدفع...
                                      </span>
                                    </div>
                                  ) : stripeClientSecret ? (
                                    <div className="bg-muted/10 p-4 rounded-lg">
                                      <StripeProvider
                                        clientSecret={stripeClientSecret}
                                      >
                                        <StripePaymentForm
                                          clientSecret={stripeClientSecret}
                                          amount={total}
                                          onSuccess={handleStripePaymentSuccess}
                                          onError={handleStripePaymentError}
                                        />
                                      </StripeProvider>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 bg-red-50 rounded-lg">
                                      <p className="text-red-600 mb-3">
                                        حدث خطأ أثناء تجهيز بوابة الدفع
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={createPaymentIntent}
                                        className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      >
                                        <Loader2 className="h-3.5 w-3.5" />
                                        إعادة المحاولة
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-row-reverse justify-between pt-4 border-t">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setActiveStep("shipping");
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                                className="gap-2 hover:bg-muted/50"
                              >
                                العودة
                                <ArrowLeft className="h-4 w-4" />
                              </Button>
                              {paymentMethod === "cash_on_delivery" && (
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault();

                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });

                                    setTimeout(() => {
                                      handlePaymentSubmit();
                                    }, 300);
                                  }}
                                  disabled={isSubmitting}
                                  className="gap-2 bg-primary hover:bg-primary/90"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      جاري المعالجة...
                                    </>
                                  ) : (
                                    <>
                                      تأكيد الطلب
                                      <ArrowRight className="h-4 w-4" />
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="confirmation" className="mt-0">
                          <div className="space-y-8">
                            <div className="relative">
                              <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute -top-10 left-1/4 w-2 h-2 bg-primary/60 rounded-full animate-confetti-1"></div>
                                <div className="absolute -top-10 left-1/3 w-3 h-3 bg-green-400/60 rounded-full animate-confetti-2"></div>
                                <div className="absolute -top-10 left-1/2 w-2 h-2 bg-yellow-400/60 rounded-full animate-confetti-3"></div>
                                <div className="absolute -top-10 left-2/3 w-3 h-3 bg-primary/60 rounded-full animate-confetti-2"></div>
                                <div className="absolute -top-10 left-3/4 w-2 h-2 bg-green-400/60 rounded-full animate-confetti-1"></div>
                              </div>
                              <div className="text-center">
                                <div className="mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-6 w-28 h-28 flex items-center justify-center shadow-lg animate-bounce-slow">
                                  <CheckCircle className="h-14 w-14 text-primary animate-pulse-slow" />
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                                تم تأكيد طلبك بنجاح!
                              </h2>
                              <p className="text-muted-foreground max-w-md mx-auto text-base">
                                شكراً لك على طلبك. سيتم التواصل معك قريباً
                                لتأكيد التفاصيل وإتمام عملية الشحن.
                              </p>
                            </div>
                            <div className="max-w-2xl mx-auto px-4">
                              <div className="flex flex-row-reverse justify-between items-center mb-2">
                                <div className="text-center">
                                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-1">
                                    <CheckCircle className="h-5 w-5" />
                                  </div>
                                  <span className="text-xs font-medium block">
                                    تم التأكيد
                                  </span>
                                </div>
                                <div
                                  className="flex-1 h-1 bg-primary/20 mx-2 relative"
                                  dir="rtl"
                                >
                                  <div className="absolute inset-0 bg-primary w-0 animate-progress-25"></div>
                                </div>
                                <div className="text-center">
                                  <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-1">
                                    <Truck className="h-5 w-5" />
                                  </div>
                                  <span className="text-xs font-medium block">
                                    قيد التجهيز
                                  </span>
                                </div>
                                <div className="flex-1 h-1 bg-muted mx-2"></div>
                                <div className="text-center">
                                  <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-1">
                                    <MapPin className="h-5 w-5" />
                                  </div>
                                  <span className="text-xs font-medium block">
                                    قيد الشحن
                                  </span>
                                </div>
                                <div className="flex-1 h-1 bg-muted mx-2"></div>
                                <div className="text-center">
                                  <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-1">
                                    <ShoppingBag className="h-5 w-5" />
                                  </div>
                                  <span className="text-xs font-medium block">
                                    تم التسليم
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div
                              className="max-w-2xl mx-auto bg-white rounded-xl overflow-hidden border"
                              dir="rtl"
                            >
                              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-32 h-32 rounded-br-full -translate-x-16 -translate-y-16 bg-primary/5"></div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full translate-x-16 translate-y-16 bg-primary/5"></div>
                                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
                                  <div>
                                    <h3 className="text-xl font-bold text-primary mb-1">
                                      تفاصيل الطلب
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      شكراً لثقتك بنا ونتمنى أن تكون راضياً عن
                                      تجربة التسوق معنا.
                                    </p>
                                  </div>
                                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">
                                      رقم الطلب
                                    </div>
                                    <div className="font-bold text-primary">
                                      {orderDetails?.orderNumber ||
                                        "#ORD-000000"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-muted rounded-lg p-4 flex items-start gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                      <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground mb-1">
                                        طريقة الدفع
                                      </div>
                                      <div className="font-medium">
                                        {paymentMethod === "stripe"
                                          ? "بطاقة ائتمان"
                                          : "الدفع عند الاستلام"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-muted rounded-lg p-4 flex items-start gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                      <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground mb-1">
                                        تاريخ الطلب
                                      </div>
                                      <div className="font-medium">
                                        {new Date().toLocaleDateString("ar-SA")}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                                    <Receipt className="h-4 w-4 text-primary" />
                                    ملخص الطلب
                                  </h4>
                                  <div className="bg-muted rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-muted">
                                      <span className="text-muted-foreground">
                                        المجموع الفرعي
                                      </span>
                                      <span className="font-medium">
                                        {orderDetails?.orderSubtotal?.toFixed(
                                          2
                                        ) || "0.00"}{" "}
                                        {currency.symbol}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-muted">
                                      <span className="text-muted-foreground">
                                        الشحن
                                      </span>
                                      <span className="font-medium">
                                        {orderDetails?.orderShipping === 0 ? (
                                          <span className="text-green-600">
                                            مجاني
                                          </span>
                                        ) : (
                                          `${
                                            orderDetails?.orderShipping?.toFixed(
                                              2
                                            ) || "0.00"
                                          } ${currency.symbol}`
                                        )}
                                      </span>
                                    </div>
                                    {(activeStep === "confirmation"
                                      ? (orderDetails?.orderDiscount ?? 0) > 0
                                      : (discountAmount ?? 0) > 0) && (
                                      <div className="flex justify-between items-center pb-2 border-b border-dashed border-muted">
                                        <span className="flex items-center gap-1 text-green-600">
                                          <Ticket className="h-4 w-4" />
                                          خصم{" "}
                                          {activeStep !== "confirmation" &&
                                            coupon &&
                                            `(${coupon.discountPercentage}%)`}
                                        </span>
                                        <span className="font-medium text-green-600">
                                          -{" "}
                                          {activeStep === "confirmation"
                                            ? (
                                                orderDetails?.orderDiscount ?? 0
                                              ).toFixed(2)
                                            : (discountAmount ?? 0).toFixed(
                                                2
                                              )}{" "}
                                          {currency.symbol}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold">
                                        الإجمالي
                                      </span>
                                      <span className="font-bold text-lg text-primary">
                                        {orderDetails?.orderTotal?.toFixed(2) ||
                                          "0.00"}{" "}
                                        {currency.symbol}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    عنوان الشحن
                                  </h4>
                                  <div className="bg-muted rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                      <div className="bg-primary/10 p-2 rounded-full">
                                        <User className="h-5 w-5 text-primary" />
                                      </div>
                                      <div className="space-y-1">
                                        <div className="font-medium">
                                          {formData.fullName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formData.phone}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formData.email}
                                        </div>
                                        <div className="text-sm mt-2">
                                          {formData.street}، {formData.district}
                                          ، {formData.city}، {formData.country}
                                          {formData.postalCode && (
                                            <span>
                                              {" "}
                                              ({formData.postalCode})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="border-t border-muted p-6 flex flex-wrap gap-3 justify-center">
                                <Button asChild size="lg">
                                  <Link href="/products">
                                    <ShoppingBag className="h-5 w-5" />
                                    متابعة التسوق
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={handleDownloadOrderCard}
                                  disabled={isDownloading}
                                >
                                  {isDownloading ? (
                                    <>
                                      جاري التحميل...
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    </>
                                  ) : (
                                    <>
                                      تحميل الإيصال
                                      <Download className="h-5 w-5" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="max-w-2xl mx-auto bg-muted/20 rounded-xl text-center">
                              <h4 className="font-medium mb-2">
                                هل تحتاج إلى مساعدة؟
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                فريق خدمة العملاء متاح للمساعدة في أي استفسارات
                                تتعلق بطلبك
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Link href="/contact" className="flex gap-1">
                                  <MessageCircleIcon className="h-4 w-4" />
                                  تواصل معنا
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardContent className="py-0">
                      <h3 className="text-lg font-semibold mb-4">ملخص الطلب</h3>
                      <div className="space-y-4 mb-4">
                        {cartItems.map((item) => {
                          const discountedPrice =
                            item.product.price *
                            (1 - item.product.discountPercentage / 100);
                          const itemTotal = discountedPrice * item.quantity;
                          return (
                            <div
                              key={item._id}
                              className="flex gap-3 py-2 border-b last:border-0"
                            >
                              <div className="relative h-16 w-16 bg-muted/30 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  src={
                                    item.product.mainImageUrl || "/hoodie.png"
                                  }
                                  alt={item.product.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {item.product.name}
                                </h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <div className="text-xs bg-muted px-2 py-1 rounded">
                                    الكمية: {item.quantity}
                                  </div>
                                  {item.selectedSize && (
                                    <div className="text-xs bg-muted px-2 py-1 rounded">
                                      المقاس: {item.selectedSize}
                                    </div>
                                  )}
                                  {item.selectedColor && (
                                    <div className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                                      <span
                                        className="inline-block h-2 w-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            item.product.colors.find(
                                              (c) =>
                                                c.name === item.selectedColor
                                            )?.value || "#000",
                                        }}
                                      />
                                      {item.selectedColor}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-1 text-sm font-medium text-primary">
                                  {formatPrice(itemTotal)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            المجموع الفرعي
                          </span>
                          <span>
                            {activeStep === "confirmation"
                              ? formatPrice(orderDetails?.orderSubtotal || 0)
                              : formatPrice(subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الشحن</span>
                          <span>
                            {activeStep === "confirmation"
                              ? orderDetails?.orderShipping === 0
                                ? "مجاني"
                                : formatPrice(orderDetails?.orderShipping || 0)
                              : shipping === 0
                              ? "مجاني"
                              : formatPrice(shipping)}
                          </span>
                        </div>
                        {(activeStep === "confirmation"
                          ? (orderDetails?.orderDiscount ?? 0) > 0
                          : (discountAmount ?? 0) > 0) && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <Ticket className="h-4 w-4" />
                              خصم{" "}
                              {activeStep !== "confirmation" &&
                                coupon &&
                                `(${coupon.discountPercentage}%)`}
                            </span>
                            <span>
                              -{" "}
                              {activeStep === "confirmation"
                                ? formatPrice(orderDetails?.orderDiscount ?? 0)
                                : formatPrice(discountAmount ?? 0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between font-bold mb-4">
                        <span>الإجمالي</span>
                        <span className="text-primary">
                          {activeStep === "confirmation"
                            ? formatPrice(orderDetails?.orderTotal || 0)
                            : formatPrice(total)}
                        </span>
                      </div>
                      <div className="bg-muted p-3 rounded-lg text-sm flex items-start gap-3 mt-4">
                        <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">معلومات الشحن</p>
                          <p className="text-muted-foreground">
                            {shippingSettings?.freeShippingThreshold
                              ? `الشحن مجاني للطلبات التي تزيد عن ${formatPrice(
                                  shippingSettings.freeShippingThreshold
                                )}`
                              : "سيتم إضافة تكلفة الشحن حسب منطقتك"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
