"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/ui/section-heading";

const PartnersSectionSkeleton = () => {
  return (
    <section
      className="py-12 bg-background"
      aria-label="شركاؤنا المعتمدون - جاري التحميل"
      aria-busy="true"
    >
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-64 mx-auto mb-4" aria-hidden="true" />
          <Skeleton className="h-6 w-96 mx-auto" aria-hidden="true" />
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-16"
          aria-label="قائمة الشركاء - جاري التحميل"
        >
          {[...Array(2)].map((_, index) => (
            <div
              key={`mobile-skeleton-${index}`}
              className="flex flex-col items-center justify-center sm:hidden"
              aria-hidden="true"
            >
              <Skeleton className="w-full aspect-square mb-4 rounded-md" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
          {[...Array(8)].map((_, index) => (
            <div
              key={`desktop-skeleton-${index}`}
              className="hidden sm:flex flex-col items-center justify-center"
              aria-hidden="true"
            >
              <Skeleton className="w-full aspect-square mb-4 rounded-md" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const PartnersSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const partners = useQuery(api.partners.getPartners);
  const pageData = useQuery(api.partners.getPartnersPage);

  const sortedPartners = useMemo(() => {
    if (!partners?.length) return [];
    return [...partners].sort((a, b) => a.order - b.order);
  }, [partners]);

  const gridCols = useMemo(() => {
    const itemCount = sortedPartners.length;
    if (itemCount <= 2) return "lg:grid-cols-2";
    if (itemCount === 3) return "lg:grid-cols-3";
    if (itemCount === 4) return "lg:grid-cols-4";
    if (itemCount === 5) return "lg:grid-cols-5";
    if (itemCount === 6) return "lg:grid-cols-6";
    if (itemCount === 7) return "lg:grid-cols-7";
    return "lg:grid-cols-8";
  }, [sortedPartners.length]);

  const structuredData = useMemo(() => {
    if (!sortedPartners.length) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: sortedPartners.map((partner, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Organization",
          name: partner.name,
          image: partner.imageUrl || "/placeholder.png",
          url: typeof window !== "undefined" ? window.location.origin : "",
        },
      })),
    };
  }, [sortedPartners]);

  if (partners === undefined || pageData === undefined) {
    return <PartnersSectionSkeleton />;
  }

  if (pageData && pageData.isVisible === false) {
    return null;
  }

  const title = pageData?.title || "شركاؤنا المعتمدون";
  const description =
    pageData?.description || "نفخر بشراكتنا مع أكبر العلامات التجارية العالمية";

  if (!sortedPartners.length) {
    return (
      <section
        className="py-12 bg-background"
        aria-labelledby="partners-heading"
      >
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <SectionHeading
              id="partners-heading"
              title={title}
              description={description}
            />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              لا يوجد شركاء متاحين حالياً
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="py-12 bg-background"
      aria-labelledby="partners-heading"
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <SectionHeading
            id="partners-heading"
            title={title}
            description={description}
          />
        </div>
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${gridCols} gap-16`}
          role="list"
          aria-label="قائمة الشركاء"
        >
          {sortedPartners.map((partner, index) => (
            <div
              key={partner._id}
              className="flex flex-col items-center justify-center group"
              role="listitem"
              aria-label={`شريك: ${partner.name}`}
            >
              <div className="relative w-full aspect-[1/1] mb-4 overflow-hidden rounded-md">
                <Image
                  src={partner.imageUrl || "/placeholder.png"}
                  alt={`شعار ${partner.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
                  className="object-contain"
                  loading={index < 4 ? "eager" : "lazy"}
                  priority={index < 4}
                />
              </div>
              <p className="text-sm sm:text-lg sm:font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                {partner.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
