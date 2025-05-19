"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "./skeleton";

interface ProductImageProps {
  alt: string;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  imageLoaded?: boolean;
  src: string | null | undefined;
}

export function ProductImage({
  src,
  alt,
  onLoad,
  className = "",
  priority = false,
  imageLoaded = false,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(!imageLoaded);
  const [hasError, setHasError] = useState(false);

  const imageSrc = src && src.trim() !== "" ? src : "/placeholder-product.jpg";

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 skeleton-loader">
          <Skeleton
            className="h-full w-full rounded-t-lg"
            aria-label="Loading product image"
          />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <Image
            src="/placeholder-product.jpg"
            alt={alt}
            fill
            className={`object-contain p-2 ${className}`}
          />
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className={`object-contain p-2 transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          } ${className}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoadingComplete={() => {
            setIsLoading(false);
            if (onLoad) onLoad();
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
            console.error(`Error loading image: ${imageSrc}`);
          }}
        />
      )}
    </div>
  );
}
