"use client";

import Link from "next/link";
import { JsonLd } from "../json-ld";
import { useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { FooterClient } from "./footer-client";
import { Skeleton } from "@/components/ui/skeleton";

function FooterSkeleton() {
  return (
    <footer
      className="bg-background border-t"
      aria-label="Loading footer content"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-5 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-8 w-32" aria-label="Loading store name" />
            <Skeleton
              className="mt-4 h-20 w-full md:w-80"
              aria-label="Loading store description"
            />
            <div className="flex items-center gap-4 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-5 w-5 rounded-full"
                  aria-label="Loading social link"
                />
              ))}
            </div>
          </div>
          {[1, 2].map((section) => (
            <div
              key={section}
              role="navigation"
              aria-label={`Loading footer section ${section}`}
            >
              <Skeleton
                className="h-6 w-24 mb-3"
                aria-label="Loading section title"
              />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((link) => (
                  <Skeleton
                    key={link}
                    className="h-4 w-32"
                    aria-label="Loading footer link"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t text-center">
          <Skeleton
            className="h-4 w-48 mx-auto"
            aria-label="Loading copyright text"
          />
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const footerData = useQuery(api.footer.getFooter);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (footerData !== undefined) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [footerData]);

  if (isLoading) {
    return <FooterSkeleton />;
  }

  const data = footerData || {
    storeName: "تسوق",
    description:
      "نقدم لكم أفضل المنتجات بأعلى جودة وأفضل الأسعار. تسوق معنا واستمتع بتجربة تسوق فريدة مع خدمة عملاء متميزة وشحن سريع لجميع أنحاء المملكة.",
    socialLinks: [
      {
        name: "فيسبوك",
        image: "./facebook.png",
        url: "https://facebook.com",
        order: 0,
      },
      {
        name: "انستغرام",
        image: "./instagram.png",
        url: "https://instagram.com",
        order: 1,
      },
      {
        name: "تويتر",
        image: "./twitter.png",
        url: "https://twitter.com",
        order: 2,
      },
    ],
    footerLinks: [
      {
        title: "تسوق",
        links: [
          { label: "المنتجات", href: "/products", order: 0 },
          { label: "المفضلة", href: "/wishlist", order: 1 },
          { label: "طلباتي", href: "/orders", order: 2 },
        ],
        order: 0,
      },
      {
        title: "الشركة",
        links: [
          { label: "من نحن", href: "/about", order: 0 },
          { label: "اتصل بنا", href: "/contact", order: 1 },
          { label: "الشروط والأحكام", href: "/terms", order: 2 },
        ],
        order: 1,
      },
    ],
  };

  const hasSocialLinks = Boolean(data.socialLinks?.length);

  const sortedSocialLinks = hasSocialLinks
    ? [...data.socialLinks].sort((a, b) => a.order - b.order)
    : [];

  const sortedFooterLinks = data.footerLinks?.length
    ? [...data.footerLinks].sort((a, b) => a.order - b.order)
    : [];

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.storeName,
    description: data.description,
    url: process.env.NEXT_PUBLIC_APP_URL || "https://example.com",
    sameAs: sortedSocialLinks.map((link) => link.url),
  };

  return (
    <footer
      className="bg-background border-t"
      aria-label="Footer"
      role="contentinfo"
    >
      <JsonLd data={organizationData} />
      <div className="max-w-7xl mx-auto px-5 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 relative"
              aria-label={`${data.storeName} homepage`}
            >
              <span className="text-2xl font-bold text-primary">
                {data.storeName}
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm md:max-w-sm">
              {data.description}
            </p>
            {hasSocialLinks && (
              <div className="flex items-center gap-4 mt-6">
                <FooterClient socialLinks={sortedSocialLinks} />
              </div>
            )}
          </div>
          {sortedFooterLinks.map((section) => {
            const sortedLinks = [...section.links].sort(
              (a, b) => a.order - b.order
            );
            return (
              <nav
                key={section.title}
                aria-labelledby={`footer-nav-${section.title}`}
              >
                <h3
                  id={`footer-nav-${section.title}`}
                  className="font-semibold mb-3"
                >
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {sortedLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {data.storeName}
          </p>
        </div>
      </div>
    </footer>
  );
}
