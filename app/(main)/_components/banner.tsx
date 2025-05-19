import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { ContactForm } from "./contact-form";
import { ContactItem } from "./contact-item";
import { ContactItem as ContactItemType } from "../../../lib/contact-api";

export async function BannerSection() {
  const defaultTitle = "تواصل معنا";
  const defaultDescription =
    "نحن هنا لمساعدتك! راسلنا للحصول على المزيد من المعلومات حول منتجاتنا وخدماتنا.";

  let contactBannerData;
  let contactItemImageUrls: string[] = [];
  let sortedContactItems: ContactItemType[] = [];

  try {
    const { getContactBanner } = await import("../../../lib/contact-api");
    const { getMultipleImageUrls } = await import("../../../lib/image-utils");

    contactBannerData = await getContactBanner();

    if (contactBannerData?.contactItems) {
      sortedContactItems = [...contactBannerData.contactItems].sort(
        (a, b) => a.order - b.order
      );

      if (sortedContactItems.length > 0) {
        contactItemImageUrls = await getMultipleImageUrls(
          sortedContactItems.map((item) => item.image)
        );
      }
    }
  } catch (error) {
    console.error("Error fetching contact data:", error);
  }

  if (
    contactBannerData === undefined ||
    (sortedContactItems.length > 0 && contactItemImageUrls === undefined)
  ) {
    return (
      <section
        className="py-16 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden"
        aria-labelledby="contact-heading"
        aria-busy="true"
      >
        <div className="max-w-7xl mx-auto px-5 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-10 w-3/4 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
              </div>
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-background/80 backdrop-blur-sm"
                  >
                    <div className="shrink-0 p-3 rounded-full bg-muted animate-pulse">
                      <div className="h-6 w-6" />
                    </div>
                    <div className="w-full">
                      <div className="h-5 w-1/3 bg-muted animate-pulse rounded-md mb-2" />
                      <div className="h-4 w-2/3 bg-muted animate-pulse rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Card className="p-6 backdrop-blur-sm bg-background/80">
                <div className="h-[400px] flex items-center justify-center">
                  <p>جاري تحميل النموذج...</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (contactBannerData && !contactBannerData.isVisible) {
    return null;
  }

  return (
    <section
      className="py-16 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden"
      aria-labelledby="contact-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: contactBannerData?.title || defaultTitle,
            description: contactBannerData?.description || defaultDescription,
          }),
        }}
      />
      <div className="absolute inset-0 grid grid-cols-3 -space-x-52 opacity-10 dark:opacity-5">
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-800 dark:from-blue-700" />
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-600 to-sky-500 dark:to-indigo-600" />
        <div className="blur-[106px] h-32 bg-gradient-to-br from-primary to-purple-800 dark:from-blue-700" />
      </div>
      <div className="max-w-7xl mx-auto px-5 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2
                id="contact-heading"
                className="text-4xl font-bold tracking-tight"
              >
                {contactBannerData?.title || defaultTitle}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {contactBannerData?.description || defaultDescription}
              </p>
            </div>
            <div className="grid gap-6">
              {sortedContactItems.length > 0 ? (
                sortedContactItems.map((item, index) => (
                  <ContactItem
                    key={index}
                    title={item.title}
                    description={item.description}
                    imageUrl={
                      contactItemImageUrls &&
                      contactItemImageUrls[index] &&
                      typeof contactItemImageUrls[index] === "string" &&
                      contactItemImageUrls[index].startsWith("http")
                        ? contactItemImageUrls[index]
                        : "/placeholder-image.png"
                    }
                  />
                ))
              ) : (
                <div className="text-muted-foreground">
                  لا توجد معلومات اتصال متاحة حاليًا
                </div>
              )}
            </div>
          </div>
          <div>
            <Card className="p-6 backdrop-blur-sm bg-background/80">
              <Suspense
                fallback={
                  <div className="h-[400px] flex items-center justify-center">
                    <p>جاري تحميل النموذج...</p>
                  </div>
                }
              >
                <ContactForm />
              </Suspense>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
