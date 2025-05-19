import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";

interface SortableCustomerImageProps {
  index: number;
  image: File | string | null;
  customerImagePreviews: Record<number, string>;
  customerImageUrls: Record<number, string>;
  onFileSelect: (index: number, file: File) => void;
  onRemove: (index: number) => void;
}

export function SortableCustomerImage({
  index,
  image,
  customerImagePreviews,
  customerImageUrls,
  onFileSelect,
  onRemove,
}: SortableCustomerImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: index.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`
          relative group rounded-lg
          ${isDragging ? "ring-2 ring-primary shadow-lg scale-105" : "hover:ring-2 hover:ring-primary/50"}
          ${isOver ? "ring-2 ring-primary/50 before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-primary before:border-dashed before:pointer-events-none" : ""}
          transition-all duration-200
        `}
      >
        <div className="aspect-square relative">
          {(!image ||
            (image instanceof File && !customerImagePreviews[index])) && (
            <ImageUpload
              onFileSelect={(file) => onFileSelect(index, file)}
              className={`h-full w-full ${isOver ? "opacity-50" : ""}`}
            />
          )}
          {typeof image === "string" && image && customerImageUrls?.[index] && (
            <div className="relative h-full w-full">
              <Image
                src={customerImageUrls[index]}
                alt={`Customer image ${index + 1}`}
                fill
                className={`
                  object-cover rounded-lg border
                  ${isDragging ? "brightness-95" : "brightness-100"}
                  ${isOver ? "opacity-50" : ""}
                  transition-all duration-200
                `}
              />
              <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <GripVertical className="h-6 w-6 text-white drop-shadow-md" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {image instanceof File && customerImagePreviews[index] && (
            <div className="relative h-full w-full">
              <Image
                src={customerImagePreviews[index]}
                alt={`Customer image preview ${index + 1}`}
                fill
                className={`
                  object-cover rounded-lg border
                  ${isDragging ? "brightness-95" : "brightness-100"}
                  ${isOver ? "opacity-50" : ""}
                  transition-all duration-200
                `}
              />
              <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <GripVertical className="h-6 w-6 text-white drop-shadow-md" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
