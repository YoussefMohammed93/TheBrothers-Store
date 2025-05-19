import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical, Pencil, Trash2, ImageIcon, Loader2 } from "lucide-react";

interface Feature {
  _id: Id<"features">;
  name: string;
  description: string;
  image: Id<"_storage">;
  imageUrl?: string;
  order: number;
}

interface SortableFeatureProps {
  feature: Feature;
  onDelete: (id: Id<"features">) => Promise<void>;
  onEdit: (feature: Feature) => void;
}

export function SortableFeature({
  feature,
  onDelete,
  onEdit,
}: SortableFeatureProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: feature._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
    position: "relative" as const,
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(feature._id);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card className="border p-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="flex items-start gap-2 sm:gap-4 p-2 sm:p-4">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "cursor-move shrink-0 transition-all duration-300",
                  "hover:bg-primary/10 hover:text-primary"
                )}
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
              <div className="flex-1 space-y-2 sm:space-y-4">
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {feature.imageUrl ? (
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 relative rounded-xl overflow-hidden ring-2 ring-border/50 transition-all duration-300">
                          <Image
                            src={feature.imageUrl}
                            alt={feature.name}
                            fill
                            className="object-cover p-1 sm:p-2"
                            sizes="(max-width: 640px) 48px, 64px"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-muted/50 ring-2 ring-border/50 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base sm:text-xl tracking-tight">
                          {feature.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 sm:size-9 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                      onClick={() => onEdit(feature)}
                    >
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 sm:size-9 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الميزة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الميزة بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
