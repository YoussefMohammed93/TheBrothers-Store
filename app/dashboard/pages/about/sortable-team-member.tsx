import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Pencil, Trash2, GripVertical } from "lucide-react";

interface TeamMember {
  bio: string;
  name: string;
  order: number;
  position: string;
  imageUrl?: string;
  image?: Id<"_storage">;
}

interface SortableTeamMemberProps {
  member: TeamMember;
  onDelete: () => void;
  onEdit: (member: TeamMember) => void;
}

export function SortableTeamMember({
  member,
  onDelete,
  onEdit,
}: SortableTeamMemberProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: member.name,
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
          flex items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors
          ${isDragging ? "shadow-sm" : ""}
          ${isOver ? "border-primary/50" : ""}
        `}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-2 hover:bg-muted rounded-md"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={member.imageUrl || "/avatar.png"}
            alt={member.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-base truncate">{member.name}</h4>
          <p className="text-sm text-muted-foreground truncate">
            {member.position}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(member)}
            className="size-8 sm:size-9"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">تعديل</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="size-8 sm:size-9 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">حذف</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
