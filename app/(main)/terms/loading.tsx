import { memo } from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const SectionHeaderSkeleton = memo(() => (
  <div className="flex items-center gap-4 mb-4">
    <div className="bg-primary/10 p-3 rounded-full">
      <Skeleton className="h-6 w-6" aria-hidden="true" />
    </div>
    <Skeleton className="h-8 w-48" aria-label="جاري تحميل عنوان القسم" />
  </div>
));
SectionHeaderSkeleton.displayName = "SectionHeaderSkeleton";

const ContentSkeleton = memo(
  ({ isContactSection = false }: { isContactSection?: boolean }) => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" aria-label="جاري تحميل المحتوى" />
      <Skeleton className="h-4 w-[90%]" aria-hidden="true" />
      <Skeleton className="h-4 w-[95%]" aria-hidden="true" />
      {isContactSection && (
        <div className="mt-6 space-y-2">
          <Skeleton
            className="h-4 w-48"
            aria-label="جاري تحميل معلومات الاتصال"
          />
          <Skeleton className="h-4 w-64" aria-hidden="true" />
          <Skeleton className="h-4 w-72" aria-hidden="true" />
        </div>
      )}
    </div>
  )
);
ContentSkeleton.displayName = "ContentSkeleton";

const SectionCardSkeleton = memo(
  ({ isContactSection = false }: { isContactSection?: boolean }) => (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <SectionHeaderSkeleton />
        <ContentSkeleton isContactSection={isContactSection} />
      </CardContent>
    </Card>
  )
);
SectionCardSkeleton.displayName = "SectionCardSkeleton";

export default function TermsLoading() {
  const sectionNames = [
    "مقدمة",
    "شروط الحساب",
    "شروط الدفع",
    "سياسة الشحن",
    "سياسة الإرجاع",
    "معلومات الاتصال",
  ];

  return (
    <>
      <Header />
      <main className="pt-16 pb-8" aria-label="جاري تحميل صفحة الشروط والأحكام">
        <section
          className="bg-muted py-12 mb-12"
          aria-label="جاري تحميل العنوان الرئيسي"
        >
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto">
              <Skeleton
                className="h-10 w-96 mx-auto mb-6"
                aria-label="جاري تحميل عنوان الصفحة"
              />
              <Skeleton
                className="h-6 w-[500px] mx-auto"
                aria-label="جاري تحميل وصف الصفحة"
              />
            </div>
          </div>
        </section>
        <div className="max-w-4xl mx-auto px-5">
          <div className="mb-12 text-center">
            <Skeleton
              className="h-4 w-32 mx-auto"
              aria-label="جاري تحميل تاريخ آخر تحديث"
            />
          </div>
          {sectionNames.map((sectionName, index) => (
            <div key={index} aria-label={`جاري تحميل قسم ${sectionName}`}>
              <SectionCardSkeleton isContactSection={index === 5} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
