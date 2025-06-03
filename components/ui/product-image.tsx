"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "./skeleton";
import { ZoomIn } from "lucide-react";

interface ProductImageProps {
  alt: string;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  imageLoaded?: boolean;
  src: string | null | undefined;
  showZoomIcon?: boolean;
  onImageClick?: () => void;
}

export function ProductImage({
  src,
  alt,
  onLoad,
  className = "",
  priority = false,
  imageLoaded = false,
  showZoomIcon = false,
  onImageClick,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(!imageLoaded);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imageSrc = src && src.trim() !== "" ? src : "/placeholder-product.jpg";

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onImageClick) {
      onImageClick();
    }
  };

  return (
    <div
      className="relative w-full h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          } ${className} ${showZoomIcon && onImageClick ? 'cursor-pointer' : ''}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onClick={handleImageClick}
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

      {/* Zoom Icon Overlay */}
      {showZoomIcon && onImageClick && isHovered && !isLoading && !hasError && (
        <div
          className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 cursor-pointer z-20"
          onClick={handleImageClick}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg pointer-events-none">
            <ZoomIn className="h-6 w-6 text-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}
