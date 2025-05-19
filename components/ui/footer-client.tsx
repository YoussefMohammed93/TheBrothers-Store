"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface SocialLink {
  url: string;
  name: string;
  order: number;
  image?: string | null;
}

interface FooterClientProps {
  socialLinks: SocialLink[];
}

export function FooterClient({ socialLinks }: FooterClientProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoadedImages({});
  }, [socialLinks]);

  const handleImageLoad = (name: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  return (
    <>
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {social.image ? (
            <div className="relative h-5.5 w-5.5">
              <Image
                src={
                  social.image.startsWith("./")
                    ? social.image.replace("./", "/")
                    : social.image
                }
                alt={social.name}
                width={22}
                height={22}
                className={`h-5.5 w-5.5 object-contain transition-opacity duration-300 ${
                  loadedImages[social.name] ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => handleImageLoad(social.name)}
                loading="lazy"
                fetchPriority="low"
              />
              {!loadedImages[social.name] && (
                <div className="absolute inset-0 h-5 w-5 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs">{social.name.charAt(0)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-5 w-5 bg-muted rounded-full flex items-center justify-center">
              <span className="text-xs">{social.name.charAt(0)}</span>
            </div>
          )}
          <span className="sr-only">{social.name}</span>
        </a>
      ))}
    </>
  );
}
