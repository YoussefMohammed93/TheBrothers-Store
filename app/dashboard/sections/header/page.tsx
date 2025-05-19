/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { SortableItem } from "./sortable-item";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import { Loader2, Plus, Save, Link as LinkIcon, Eye } from "lucide-react";

interface HeaderLink {
  id: string;
  name: string;
  href: string;
  order: number;
}

export default function Header() {
  const [links, setLinks] = useState<HeaderLink[]>([]);
  const [originalLinks, setOriginalLinks] = useState<HeaderLink[]>([]);
  const [loading, setLoading] = useState(false);

  const headerLinks = useQuery(api.header.getHeaderLinks);
  const saveLinks = useMutation(api.header.saveHeaderLinks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (headerLinks) {
      const formattedLinks = headerLinks.map(
        (
          link: { name: string; href: string; order: number },
          index: number
        ) => ({
          id: `link-${index}`,
          name: link.name,
          href: link.href,
          order: link.order,
        })
      );
      setLinks(formattedLinks);
      setOriginalLinks(formattedLinks);
    }
  }, [headerLinks]);

  const hasChanges = () => {
    if (links.length !== originalLinks.length) return true;
    return JSON.stringify(links) !== JSON.stringify(originalLinks);
  };

  const handleAddLink = () => {
    const newLink = {
      id: `link-${links.length}`,
      name: "",
      href: "",
      order: links.length,
    };
    setLinks([...links, newLink]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (
    index: number,
    field: keyof HeaderLink,
    value: string
  ) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const invalidLinks = links.filter(
        (link) => !link.name.trim() || !link.href.trim()
      );
      if (invalidLinks.length > 0) {
        throw new Error("جميع الحقول مطلوبة");
      }

      const linksToSave = links.map(({ id, ...link }) => link);
      await saveLinks({ links: linksToSave });

      toast.success("تم حفظ التغييرات بنجاح", {
        description: "تم تحديث روابط التنقل في الهيدر بنجاح",
      });
    } catch (error) {
      console.error("Failed to save links:", error);
      toast.error(
        error instanceof Error ? error.message : "فشل في حفظ التغييرات",
        {
          description: "يرجى التحقق من المدخلات والمحاولة مرة أخرى",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!headerLinks) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
          <Heading
            title="الهيدر"
            description="هنا يمكنك تعديل الهيدر الخاص بالصفحة الرئيسية."
          />
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                const previewWindow = window.open("/", "_blank");
                if (previewWindow) {
                  previewWindow.postMessage(
                    { type: "PREVIEW_DATA", data: links },
                    "*"
                  );
                }
              }}
            >
              <Eye className="h-4 w-4" />
              معاينة
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !hasChanges()}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <Card className="p-6 pb-1 pt-2 border-2 border-dashed">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:align-baseline justify-between">
            <div className="w-full sm:w-auto flex items-center gap-3">
              <LinkIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">روابط التنقل</h2>
              <Badge variant="outline" className="ml-2">
                {links.length} روابط
              </Badge>
            </div>
            <Button
              onClick={handleAddLink}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto hover:bg-primary/5 mt-5"
            >
              <Plus className="h-4 w-4" />
              إضافة رابط
            </Button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {links.map((link, index) => (
                  <SortableItem
                    key={link.id}
                    id={link.id}
                    link={link}
                    index={index}
                    onRemove={handleRemoveLink}
                    onChange={handleLinkChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {links.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <LinkIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد روابط حاليا</p>
              <Button
                variant="link"
                onClick={handleAddLink}
                className="mt-2 text-primary hover:text-primary/80"
              >
                إضافة رابط جديد
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="pt-14 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-full sm:w-96" />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-32" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </div>
      </div>
      <Card className="p-6 border-2 border-dashed">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-9 w-full sm:w-28" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex sm:items-center gap-4 p-4 rounded-lg border bg-card/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                </div>
                <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                  <div className="relative flex-1">
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
