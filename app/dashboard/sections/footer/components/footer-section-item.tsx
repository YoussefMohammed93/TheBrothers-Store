import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Trash, GripVertical, Link as LinkIcon } from "lucide-react";

interface LinkItem {
  label: string;
  href: string;
  order: number;
}

interface SortableLinkItemProps {
  link: LinkItem;
  index: number;
  sectionIndex: number;
  onUpdate: (
    sectionIndex: number,
    data: { title: string; links: LinkItem[] }
  ) => void;
  onDeleteLink: (sectionIndex: number, linkIndex: number) => void;
  sectionTitle: string;
  sectionLinks: LinkItem[];
}

function SortableLinkItem({
  link,
  index: linkIndex,
  sectionIndex,
  onUpdate,
  onDeleteLink,
  sectionTitle,
  sectionLinks,
}: SortableLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `link-${sectionIndex}-${linkIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
            onClick={() => onDeleteLink(sectionIndex, linkIndex)}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:gap-4 w-full">
        <div className="relative flex-1">
          <Input
            placeholder="عنوان الرابط"
            value={link.label}
            onChange={(e) => {
              const newLinks = [...sectionLinks];
              newLinks[linkIndex] = {
                ...link,
                label: e.target.value,
              };
              onUpdate(sectionIndex, {
                title: sectionTitle,
                links: newLinks,
              });
            }}
            className="pr-8"
          />
          <LinkIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
        </div>
        <Input
          placeholder="الرابط"
          value={link.href}
          onChange={(e) => {
            const newLinks = [...sectionLinks];
            newLinks[linkIndex] = {
              ...link,
              href: e.target.value,
            };
            onUpdate(sectionIndex, {
              title: sectionTitle,
              links: newLinks,
            });
          }}
          className="flex-1 placeholder:text-right"
          dir="ltr"
        />
      </div>
    </div>
  );
}

interface FooterSectionItemProps {
  section: {
    title: string;
    links: Array<{
      label: string;
      href: string;
      order: number;
    }>;
    order: number;
  };
  index: number;
  onUpdate: (
    sectionIndex: number,
    data: {
      title: string;
      links: Array<{
        label: string;
        href: string;
        order: number;
      }>;
    }
  ) => void;
  onAddLink: (sectionIndex: number) => void;
  onDeleteLink: (sectionIndex: number, linkIndex: number) => void;
  onDeleteSection: (index: number) => void;
}

export function FooterSectionItem({
  section,
  index,
  onUpdate,
  onAddLink,
  onDeleteLink,
  onDeleteSection,
}: FooterSectionItemProps) {
  const [titleValue, setTitleValue] = useState(section.title);
  const [originalTitle, setOriginalTitle] = useState(section.title);

  useEffect(() => {
    setTitleValue(section.title);
    setOriginalTitle(section.title);
  }, [section.title]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: `section-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card className="w-full group bg-card/50 hover:bg-card/80 transition-colors border">
        <CardHeader className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3 w-full">
            <div className="flex gap-2">
              <div {...attributes} {...listeners}>
                <Button variant="outline" className="cursor-move">
                  <GripVertical className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => onDeleteSection(index)}
                variant="ghost"
                className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                <Input
                  value={titleValue}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setTitleValue(newValue);
                    if (newValue !== originalTitle) {
                      onUpdate(index, {
                        title: newValue,
                        links: section.links,
                      });
                    }
                  }}
                  placeholder="عنوان القسم"
                  className="w-full sm:max-w-xs"
                />
                <Badge variant="outline" className="mt-2 sm:mt-0">
                  {section.links.length} روابط
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                قم بإضافة روابط لهذا القسم
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <Button
              onClick={() => onAddLink(index)}
              variant="outline"
              className="gap-2 flex-1 md:flex-none"
            >
              <Plus className="h-4 w-4" />
              إضافة رابط
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {section.links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                لا توجد روابط في هذا القسم. قم بإضافة روابط جديدة.
              </p>
              <Button
                onClick={() => onAddLink(index)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة رابط جديد
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={async (event) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                  const oldIndex = parseInt(active.id.toString().split("-")[2]);
                  const newIndex = parseInt(over.id.toString().split("-")[2]);

                  const newLinks = arrayMove(
                    section.links,
                    oldIndex,
                    newIndex
                  ).map((link, idx) => ({ ...link, order: idx }));

                  const reorderedLinks = newLinks.map((link, idx) => ({
                    ...link,
                    order: idx,
                  }));

                  const dataWithFlag = {
                    title: section.title,
                    links: reorderedLinks,
                    _isReordering: true,
                  };

                  onUpdate(index, dataWithFlag);
                }
              }}
              modifiers={[]}
            >
              <SortableContext
                items={section.links.map((_, idx) => `link-${index}-${idx}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <SortableLinkItem
                      key={linkIndex}
                      link={link}
                      index={linkIndex}
                      sectionIndex={index}
                      onUpdate={onUpdate}
                      onDeleteLink={onDeleteLink}
                      sectionTitle={section.title}
                      sectionLinks={section.links}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
