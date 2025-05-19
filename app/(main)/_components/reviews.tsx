"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import "keen-slider/keen-slider.min.css";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useKeenSlider } from "keen-slider/react";
import { Calendar, StarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";

const ReviewSkeletonItem = memo(() => {
  return (
    <div className="keen-slider__slide">
      <Card className="p-6 pb-0 h-[200px]">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-4 w-4" />
              ))}
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-2" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2 mt-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

export const ReviewsSectionSkeleton = memo(() => {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-10">
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 sm:w-96 mx-auto" />
        </div>
        <div className="relative">
          <div className="keen-slider">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ReviewSkeletonItem />
              <div className="hidden sm:block">
                <ReviewSkeletonItem />
              </div>
              <div className="hidden lg:block">
                <ReviewSkeletonItem />
              </div>
            </div>
          </div>
          <Skeleton className="absolute top-1/2 -translate-y-1/2 -left-4 xl:-left-16 h-10 w-10 rounded-md hidden md:block" />
          <Skeleton className="absolute top-1/2 -translate-y-1/2 -right-4 xl:-right-16 h-10 w-10 rounded-md hidden md:block" />
          <div className="flex flex-row-reverse justify-center gap-2 mt-4 md:hidden">
            <Skeleton className="w-2 h-2 rounded-full" />
            <div className="hidden sm:block">
              <Skeleton className="w-2 h-2 rounded-full" />
            </div>
            <div className="hidden lg:block">
              <Skeleton className="w-2 h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

interface ReviewItemProps {
  review: {
    _id: string;
    userId: string;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    createdAt?: string;
  };
}

const ReviewItem = memo(({ review }: ReviewItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="keen-slider__slide">
      <Card className="p-6 pb-0 h-[200px]">
        <div className="flex items-start gap-4">
          <div className="relative w-10 h-10">
            <Image
              src={review.userImage || "/avatar.png"}
              alt={review.userName}
              fill
              className={`object-contain rounded-full transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              sizes="40px"
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{review.userName}</h3>
            <div
              className="flex items-center gap-1 mb-2"
              aria-label={`تقييم ${review.rating} من 5 نجوم`}
            >
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-muted-foreground line-clamp-3">
              {review.comment}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground mt-3">
              <Calendar className="size-3.5" aria-hidden="true" />
              <p className="text-sm mt-1">
                {review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

ReviewItem.displayName = "ReviewItem";

const ReviewsSectionBase = () => {
  const [loaded, setLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredReviews = useQuery(api.reviews.getFeaturedReviews);
  const isLoading = featuredReviews === undefined;

  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
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

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    rtl: true,
    slides: {
      perView: 1,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 2, spacing: 16 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 16 },
      },
    },
    slideChanged(slider: { track: { details: { rel: number } } }) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft" && instanceRef.current) {
        instanceRef.current.next();
      } else if (e.key === "ArrowRight" && instanceRef.current) {
        instanceRef.current.prev();
      }
    },
    [instanceRef]
  );

  const { totalSlides, isAtStart, isAtEnd } = useMemo(() => {
    const totalSlides = instanceRef?.current?.track.details.slides.length || 0;
    const perView =
      typeof instanceRef?.current?.options.slides === "object"
        ? instanceRef?.current?.options?.slides &&
          "perView" in instanceRef.current.options.slides
          ? instanceRef.current.options.slides.perView
          : 1
        : 1;
    const isAtStart = currentSlide === 0;
    const isAtEnd =
      currentSlide >= totalSlides - (typeof perView === "number" ? perView : 1);

    return { totalSlides, perView, isAtStart, isAtEnd };
  }, [currentSlide, instanceRef]);

  if (isLoading) {
    return <ReviewsSectionSkeleton />;
  }

  if (featuredReviews && featuredReviews.length === 0) {
    return (
      <section
        className="py-12 bg-background"
        aria-labelledby="reviews-heading"
      >
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-10">
            <SectionHeading
              id="reviews-heading"
              title="آراء العملاء"
              description="ماذا يقول عملاؤنا عن تجربتهم معنا"
            />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              لا توجد تقييمات حالياً
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
      aria-labelledby="reviews-heading"
      onKeyDown={handleKeyNavigation}
      tabIndex={0}
    >
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-10">
          <SectionHeading
            id="reviews-heading"
            title="آراء العملاء"
            description="ماذا يقول عملاؤنا عن تجربتهم معنا"
          />
        </div>
        <div className="relative">
          {featuredReviews && featuredReviews.length > 0 && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Product",
                  name: "متجرنا",
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue:
                      featuredReviews.reduce(
                        (sum, review) => sum + review.rating,
                        0
                      ) / featuredReviews.length,
                    reviewCount: featuredReviews.length,
                  },
                  review: featuredReviews.map((review) => ({
                    "@type": "Review",
                    author: {
                      "@type": "Person",
                      name: review.userName,
                    },
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: review.rating,
                    },
                    reviewBody: review.comment,
                    datePublished: review.createdAt,
                  })),
                }),
              }}
            />
          )}
          <div
            ref={sliderRef}
            className="keen-slider"
            role="region"
            aria-label="آراء العملاء"
            aria-roledescription="carousel"
          >
            {featuredReviews &&
              featuredReviews.map((review) => (
                <ReviewItem key={review._id} review={review} />
              ))}
          </div>
          {loaded && instanceRef.current && (
            <>
              <Button
                size="icon"
                className={`absolute top-1/2 -translate-y-1/2 -left-2 sm:-left-4 xl:-left-16 rounded-full flex ${
                  isAtEnd ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => instanceRef.current?.next()}
                disabled={isAtEnd}
                aria-label="التالي"
                aria-controls="reviews-slider"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                className={`absolute top-1/2 -translate-y-1/2 -right-2 sm:-right-4 xl:-right-16 rounded-full flex ${
                  isAtStart ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => instanceRef.current?.prev()}
                disabled={isAtStart}
                aria-label="السابق"
                aria-controls="reviews-slider"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
              <div
                className="flex justify-center gap-2 mt-6 sm:hidden"
                role="tablist"
                aria-label="اختر شريحة"
              >
                {[...Array(totalSlides)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === idx ? "bg-primary w-4" : "bg-primary/20"
                    }`}
                    aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
                    aria-selected={currentSlide === idx}
                    role="tab"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export const ReviewsSection = memo(ReviewsSectionBase);

ReviewsSectionBase.displayName = "ReviewsSectionBase";
ReviewsSectionSkeleton.displayName = "ReviewsSectionSkeleton";
ReviewSkeletonItem.displayName = "ReviewSkeletonItem";
