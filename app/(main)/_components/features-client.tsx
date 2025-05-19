"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { FeaturesSkeleton } from "./features-skeleton";
import { useInView } from "react-intersection-observer";
import { SectionHeading } from "@/components/ui/section-heading";

export const FeaturesClient = () => {
  const { ref } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const sectionRef = useRef<HTMLElement>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const features = useQuery(api.features.getFeatures);
  const pageData = useQuery(api.features.getFeaturesPage);

  if (features === undefined || pageData === undefined) {
    return <FeaturesSkeleton />;
  }

  if (pageData && pageData.isVisible === false) {
    return null;
  }

  if (!features?.length) {
    return (
      <section
        ref={sectionRef}
        className="py-12 bg-background"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <SectionHeading
              id="features-heading"
              title={pageData?.title || "مميزات المتجر"}
              description={
                pageData?.description ||
                "نقدم لكم أفضل الخدمات لتجربة تسوق مميزة"
              }
            />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              لا توجد مميزات متاحة حالياً
            </p>
          </div>
        </div>
      </section>
    );
  }

  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: sortedFeatures.map((feature, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: feature.name,
        description: feature.description,
        image: feature.imageUrl,
      },
    })),
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <section
      ref={sectionRef}
      className="py-12 bg-background contain-layout"
      aria-labelledby="features-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <SectionHeading
            id="features-heading"
            title={pageData?.title || "مميزات المتجر"}
            description={
              pageData?.description || "نقدم لكم أفضل الخدمات لتجربة تسوق مميزة"
            }
          />
        </div>
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          role="list"
          aria-label="مميزات المتجر"
        >
          {sortedFeatures.map((feature, index) => (
            <div
              key={feature._id}
              className="group relative p-6 rounded-lg border bg-card overflow-hidden contain-paint"
              role="listitem"
              aria-label={feature.name}
            >
              <div
                className="absolute inset-0 bg-primary translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0 will-change-transform"
                aria-hidden="true"
              />
              <div className="relative z-10 flex flex-col items-center text-center transition-colors duration-300">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-white/10">
                  {feature.imageUrl && (
                    <div className="relative h-10 w-10">
                      <Image
                        src={feature.imageUrl}
                        alt={feature.name}
                        fill
                        sizes="40px"
                        className={`object-contain transition-opacity duration-300 ${
                          loadedImages[feature._id]
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                        loading={index < 4 ? "eager" : "lazy"}
                        onLoad={() => handleImageLoad(feature._id)}
                        priority={index < 2}
                      />
                      {!loadedImages[feature._id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-full">
                          <div className="h-5 w-5 rounded-full animate-pulse bg-primary/20" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-2 transition-colors duration-300 group-hover:text-white">
                  {feature.name}
                </h3>
                <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-white/80">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
