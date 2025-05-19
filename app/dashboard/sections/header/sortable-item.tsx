import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Link as LinkIcon } from "lucide-react";

interface HeaderLink {
  id: string;
  name: string;
  href: string;
  order: number;
}

interface SortableItemProps {
  id: string;
  link: HeaderLink;
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof HeaderLink, value: string) => void;
}

export function SortableItem({
  id,
  link,
  index,
  onRemove,
  onChange,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex sm:items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors ${
        isDragging ? "shadow-sm" : ""
      }`}
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
            onClick={() => onRemove(index)}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="اسم الرابط"
            value={link.name}
            onChange={(e) => onChange(index, "name", e.target.value)}
            className="pr-8"
          />
          <LinkIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
        </div>
        <Input
          placeholder="مسار الرابط"
          value={link.href}
          onChange={(e) => onChange(index, "href", e.target.value)}
          className="flex-1 placeholder:text-right"
          dir="ltr"
        />
      </div>
    </div>
  );
}
