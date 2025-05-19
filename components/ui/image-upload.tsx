import { toast } from "sonner";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  className?: string;
  defaultImage?: string;
  onFileSelect: (file: File) => void;
}

export function ImageUpload({
  className,
  onFileSelect,
  defaultImage,
}: ImageUploadProps) {
  const [isLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    onFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (defaultImage) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-md">
          <Image
            src={defaultImage}
            alt="Default icon"
            width={48}
            height={48}
            className="object-contain w-full h-full"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute bottom-0 right-0 w-full h-full opacity-0 hover:opacity-80 transition-opacity bg-background/80 rounded-md"
          disabled={isLoading}
          onClick={handleButtonClick}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading}
        onClick={handleButtonClick}
      >
        <Upload className="h-4 w-4 mr-2" />
        اختر صورة
      </Button>
    </div>
  );
}
