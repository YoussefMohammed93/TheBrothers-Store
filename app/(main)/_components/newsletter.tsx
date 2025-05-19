"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import { SectionHeading } from "@/components/ui/section-heading";
import { SendIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState, useCallback, useEffect, useMemo, useRef, memo } from "react";

const NewsletterSkeleton = memo(() => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-3 -space-x-52 opacity-10 dark:opacity-5">
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-800 dark:from-blue-700" />
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-600 to-sky-500 dark:to-indigo-600" />
        <div className="blur-[106px] h-32 bg-gradient-to-br from-primary to-purple-800 dark:from-blue-700" />
      </div>
      <div className="max-w-7xl mx-auto px-5 relative">
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <Card className="max-w-3xl mx-auto p-8 backdrop-blur-sm bg-background/80">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
});

NewsletterSkeleton.displayName = "NewsletterSkeleton";

export const NewsletterSection = memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [featureImagesLoaded, setFeatureImagesLoaded] = useState<
    Record<number, boolean>
  >({});

  const pageData = useQuery(api.newsletter.get);
  const subscribe = useMutation(api.newsletter.subscribe);
  const feature1Url = useQuery(
    api.files.getImageUrl,
    pageData?.featureOneImage
      ? { storageId: pageData.featureOneImage as Id<"_storage"> }
      : "skip"
  );
  const feature2Url = useQuery(
    api.files.getImageUrl,
    pageData?.featureTwoImage
      ? { storageId: pageData.featureTwoImage as Id<"_storage"> }
      : "skip"
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(sectionRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const structuredData = useMemo(() => {
    if (!pageData) return null;

    return {
      "@context": "https://schema.org",
      "@type": "NewsletterSignup",
      name: pageData?.title || "انضم إلى نشرتنا البريدية",
      description:
        pageData?.description ||
        "كن أول من يعلم عن أحدث المنتجات والعروض الحصرية",
      url: typeof window !== "undefined" ? window.location.origin : "",
    };
  }, [pageData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        await subscribe({ email });
        setStatus("success");
        setEmail("");
      } catch (error: unknown) {
        console.error("Subscription error:", error);
        setStatus("error");
        setErrorMessage(
          String(error).includes("Email already subscribed")
            ? "هذا البريد الإلكتروني مشترك بالفعل."
            : "حدث خطأ، يرجى المحاولة مرة أخرى."
        );
      } finally {
        setLoading(false);
        setTimeout(() => {
          setStatus("idle");
          setErrorMessage("");
        }, 5000);
      }
    },
    [subscribe, email]
  );

  const handleImageLoad = useCallback((index: number) => {
    setFeatureImagesLoaded((prev) => ({
      ...prev,
      [index]: true,
    }));
  }, []);

  const features = useMemo(
    () => [
      {
        image: feature1Url || "/bell.png",
        text: pageData?.featureOneTitle || "تنبيهات فورية عن العروض الحصرية",
      },
      {
        image: feature2Url || "/mail.png",
        text: pageData?.featureTwoTitle || "آخر المنتجات والتحديثات كل أسبوع",
      },
    ],
    [
      feature1Url,
      feature2Url,
      pageData?.featureOneTitle,
      pageData?.featureTwoTitle,
    ]
  );

  if (pageData === undefined) {
    return <NewsletterSkeleton />;
  }

  if (!pageData) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 -space-x-52 opacity-10 dark:opacity-5">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-800 dark:from-blue-700" />
          <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-600 to-sky-500 dark:to-indigo-600" />
          <div className="blur-[106px] h-32 bg-gradient-to-br from-primary to-purple-800 dark:from-blue-700" />
        </div>
        <div className="max-w-7xl mx-auto px-5 relative">
          <div className="text-center mb-12">
            <SectionHeading
              title="انضم إلى نشرتنا البريدية"
              description="كن أول من يعلم عن أحدث المنتجات والعروض الحصرية"
            />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              النشرة البريدية غير متاحة حالياً
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (pageData && pageData.isVisible === false) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="newsletter"
      className="py-16 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden"
      aria-labelledby="newsletter-heading"
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="absolute inset-0 grid grid-cols-3 -space-x-52 opacity-10 dark:opacity-5">
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-800 dark:from-blue-700" />
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-600 to-sky-500 dark:to-indigo-600" />
        <div className="blur-[106px] h-32 bg-gradient-to-br from-primary to-purple-800 dark:from-blue-700" />
      </div>
      <div className="max-w-7xl mx-auto px-5 relative">
        <div className="text-center mb-12">
          <SectionHeading
            id="newsletter-heading"
            title={pageData?.title || "انضم إلى نشرتنا البريدية"}
            description={
              pageData?.description ||
              "كن أول من يعلم عن أحدث المنتجات والعروض الحصرية"
            }
          />
        </div>
        <Card className="max-w-3xl mx-auto p-8 backdrop-blur-sm bg-background/80">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {!featureImagesLoaded[index] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                      )}
                      <Image
                        src={feature.image}
                        alt={feature.text}
                        width={20}
                        height={20}
                        className={`text-primary transition-opacity duration-300 ${featureImagesLoaded[index] ? "opacity-100" : "opacity-0"}`}
                        onLoadingComplete={() => handleImageLoad(index)}
                        loading="lazy"
                      />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                aria-labelledby="newsletter-form-heading"
              >
                <div className="relative" aria-label="Email input field">
                  <label htmlFor="newsletter-email" className="sr-only">
                    البريد الإلكتروني
                  </label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-4 pl-12"
                    required
                    aria-required="true"
                    aria-invalid={status === "error" ? "true" : "false"}
                  />
                  <SendIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 text-base"
                  aria-busy={loading ? "true" : "false"}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      جاري الاشتراك...
                    </span>
                  ) : (
                    pageData?.buttonText || "اشترك الآن"
                  )}
                </Button>
              </form>
              {status === "success" && (
                <div
                  className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md"
                  role="alert"
                  aria-live="polite"
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <p className="text-sm">تم الاشتراك بنجاح! شكراً لك.</p>
                </div>
              )}
              {status === "error" && (
                <div
                  className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md"
                  role="alert"
                  aria-live="assertive"
                >
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
});

NewsletterSection.displayName = "NewsletterSection";
