import Image from "next/image";
import { useQuery } from "convex/react";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { Trash, GripVertical, Link, Upload } from "lucide-react";

interface SocialLinkItemProps {
  link: {
    name: string;
    image: Id<"_storage"> | string | null;
    url: string;
    order: number;
    _previewImage?: string;
  };
  index: number;
  onUpdate: (index: number, data: { name: string; url: string }) => void;
  onImageUpdate: (index: number, image: File) => void;
  onDelete: (index: number) => void;
}

export function SocialLinkItem({
  link,
  index,
  onUpdate,
  onImageUpdate,
  onDelete,
}: SocialLinkItemProps) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: `social-${index}` });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewImage(null);
  }, [link]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const imageUrl = useQuery(
    api.files.getImageUrl,
    link.image &&
      typeof link.image === "string" &&
      (link.image.startsWith(":") ||
        (!link.image.startsWith("http") &&
          !link.image.startsWith("./") &&
          !link.image.startsWith("/")))
      ? { storageId: link.image as Id<"_storage"> }
      : "skip"
  );

  const getImageSource = () => {
    if (previewImage) {
      return previewImage;
    } else if (link._previewImage) {
      return link._previewImage;
    } else if (
      link.image &&
      typeof link.image === "string" &&
      (link.image.startsWith(":") ||
        (!link.image.startsWith("http") &&
          !link.image.startsWith("./") &&
          !link.image.startsWith("/"))) &&
      imageUrl
    ) {
      return imageUrl;
    } else if (
      link.image &&
      typeof link.image === "string" &&
      link.image.startsWith("http")
    ) {
      return link.image;
    } else if (
      link.image &&
      typeof link.image === "string" &&
      (link.image.startsWith("./") || link.image.startsWith("/"))
    ) {
      return link.image.startsWith("./")
        ? link.image.replace("./", "/")
        : link.image;
    }
    return undefined;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    onImageUpdate(index, file);
  };

  const handleDeleteClick = () => {
    onDelete(index);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const displayImage = getImageSource();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex sm:items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors mb-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div {...attributes} {...listeners}>
          <Button variant="outline" className="cursor-move">
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Button
            variant="ghost"
            onClick={handleDeleteClick}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div
            className="relative h-9 w-9 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
            onClick={handleImageClick}
          >
            {displayImage ? (
              <Image
                src={displayImage}
                alt={link.name || "Social icon"}
                width={36}
                height={36}
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-4.5 w-4.5 text-white" />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:gap-4 w-full">
          <div className="relative flex-1">
            <Input
              placeholder="اسم الرابط"
              value={link.name}
              onChange={(e) =>
                onUpdate(index, { name: e.target.value, url: link.url })
              }
              className="pr-8"
            />
            <Link className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
          </div>
          <Input
            placeholder="رابط الموقع"
            value={link.url}
            onChange={(e) =>
              onUpdate(index, { name: link.name, url: e.target.value })
            }
            className="flex-1 placeholder:text-right"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}
