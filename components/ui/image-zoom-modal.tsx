"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  images?: Array<{ src: string; alt: string }>;
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
}

export function ImageZoomModal({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  images = [],
  currentImageIndex = 0,
  onImageChange,
}: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLDivElement>(null);

  const minScale = 1;
  const maxScale = 3;
  const scaleStep = 0.5;

  // Reset zoom when modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + scaleStep, maxScale));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - scaleStep, minScale));
    // Reset position when zooming out to minimum
    if (scale - scaleStep <= minScale) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handlePrevImage = () => {
    if (images.length > 1 && onImageChange && currentImageIndex > 0) {
      onImageChange(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (images.length > 1 && onImageChange && currentImageIndex < images.length - 1) {
      onImageChange(currentImageIndex + 1);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "0":
          handleReset();
          break;
        case "ArrowLeft":
          handlePrevImage();
          break;
        case "ArrowRight":
          handleNextImage();
          break;
      }
    },
    [isOpen, onClose, handleZoomIn, handleZoomOut, handleReset, handlePrevImage, handleNextImage]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] min-h-[85vh] sm:min-h-[90vh] rounded-none sm:rounded-lg w-full p-0 bg-black/95 border-none overflow-hidden">
        <DialogTitle className="sr-only">عرض الصورة بالتكبير</DialogTitle>
        <div className="relative w-full h-full flex flex-col">
          {/* Header with controls */}
          <div className="fixed top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-30 flex justify-between items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= minScale}
                className="h-8 w-8 sm:h-10 sm:w-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
              >
                <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= maxScale}
                className="h-8 w-8 sm:h-10 sm:w-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
              >
                <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleReset}
                className="h-8 w-8 sm:h-10 sm:w-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-white text-xs sm:text-sm bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-md">
                {Math.round(scale * 100)}%
              </span>
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 sm:h-10 sm:w-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Image container */}
          <div
            ref={imageRef}
            className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
            >
              <div className="w-[80vw] h-[70vh] sm:w-[70vw] sm:h-[65vh] flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={1200}
                  height={1200}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePrevImage}
                disabled={currentImageIndex <= 0}
                className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 h-12 w-12 sm:h-14 sm:w-14 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 disabled:opacity-30 z-20"
              >
                <ArrowLeft className="size-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleNextImage}
                disabled={currentImageIndex >= images.length - 1}
                className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 h-12 w-12 sm:h-14 sm:w-14 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 disabled:opacity-30 z-20"
              >
                <ArrowRight className="size-6" />
              </Button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base z-20">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
