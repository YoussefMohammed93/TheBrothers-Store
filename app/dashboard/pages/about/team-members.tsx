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
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Loader2, X, Save } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { SortableTeamMember } from "./sortable-team-member";

interface TeamMember {
  bio: string;
  name: string;
  order: number;
  position: string;
  imageUrl?: string;
  image?: Id<"_storage">;
}

interface TeamMembersProps {
  onTeamMembersChange?: () => void;
  teamMembers: TeamMember[] | undefined;
  aboutPageId: Id<"aboutPage"> | undefined;
}

export function TeamMembers({
  aboutPageId,
  teamMembers,
  onTeamMembersChange,
}: TeamMembersProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    image: null as Id<"_storage"> | null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const saveTeamMember = useMutation(api.about.saveTeamMember);
  const deleteTeamMember = useMutation(api.about.deleteTeamMember);
  const updateTeamMembersOrder = useMutation(api.about.updateTeamMembersOrder);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteStorageId = useMutation(api.files.deleteStorageId);

  const [localTeamMembers, setLocalTeamMembers] = useState<TeamMember[]>([]);
  const [originalTeamMembers, setOriginalTeamMembers] = useState<TeamMember[]>(
    []
  );

  useEffect(() => {
    if (teamMembers) {
      const sortedMembers = [...teamMembers].sort((a, b) => a.order - b.order);
      setLocalTeamMembers(sortedMembers);
      setOriginalTeamMembers(sortedMembers);
    }
  }, [teamMembers]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !localTeamMembers) return;

    const oldIndex = localTeamMembers.findIndex(
      (member) => member.name === active.id
    );
    const newIndex = localTeamMembers.findIndex(
      (member) => member.name === over.id
    );

    const newMembers = arrayMove([...localTeamMembers], oldIndex, newIndex);
    const membersWithNewOrder = newMembers.map((member, index) => ({
      ...member,
      order: index,
    }));

    setLocalTeamMembers(membersWithNewOrder);
  };

  const hasChanges = () => {
    return localTeamMembers.some((localMember, index) => {
      const originalMember = originalTeamMembers?.[index];
      return (
        !originalMember ||
        localMember.name !== originalMember.name ||
        localMember.order !== originalMember.order
      );
    });
  };

  const handleSaveChanges = async () => {
    if (!hasChanges() || !aboutPageId) return;

    setLoading(true);
    try {
      await updateTeamMembersOrder({
        aboutPageId,
        teamMembers: localTeamMembers.map((member, index) => ({
          name: member.name,
          order: index,
        })),
      });

      setOriginalTeamMembers([...localTeamMembers]);
      toast.success("تم حفظ ترتيب الفريق بنجاح");
      if (onTeamMembersChange) {
        onTeamMembersChange();
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
      setLocalTeamMembers([...originalTeamMembers]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutPageId) return;

    setIsSubmitting(true);

    try {
      let imageStorageId = formData.image;

      if (selectedFile) {
        if (editingMember?.image) {
          await deleteStorageId({ storageId: editingMember.image });
        }

        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      const newOrder = editingMember
        ? localTeamMembers.find((m) => m.name === editingMember.name)?.order ||
          0
        : localTeamMembers.length;

      await saveTeamMember({
        aboutPageId,
        memberId: editingMember?.name,
        name: formData.name.trim(),
        position: formData.position.trim(),
        bio: formData.bio.trim(),
        image: imageStorageId ?? undefined,
        order: newOrder,
      });

      setFormData({ name: "", position: "", bio: "", image: null });
      setImagePreview(null);
      setSelectedFile(null);
      setIsDialogOpen(false);
      toast.success(
        editingMember ? "تم تحديث العضو بنجاح" : "تم إضافة العضو بنجاح"
      );
      if (onTeamMembersChange) {
        onTeamMembersChange();
      }
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("حدث خطأ أثناء حفظ العضو");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (name: string) => {
    if (!aboutPageId) return;

    try {
      await deleteTeamMember({
        aboutPageId,
        memberName: name,
      });
      toast.success("تم حذف العضو بنجاح");
      if (onTeamMembersChange) {
        onTeamMembersChange();
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("حدث خطأ أثناء حذف العضو");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">أعضاء الفريق</h3>
            <Badge variant="outline">
              {localTeamMembers?.length || 0} أعضاء
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {localTeamMembers?.length === 0
              ? "لا يوجد أعضاء حتى الآن"
              : "قائمة أعضاء فريق العمل"}
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingMember(null);
            setFormData({ name: "", position: "", bio: "", image: null });
            setImagePreview(null);
            setSelectedFile(null);
            setIsDialogOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4" />
          إضافة عضو جديد
        </Button>
      </div>
      {!localTeamMembers?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted p-4 rounded-full mb-4">
            <PlusIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">لا يوجد أعضاء</h3>
          <p className="text-sm text-muted-foreground mb-4">
            ابدأ بإضافة أعضاء فريق العمل
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localTeamMembers?.map((member) => member.name) ?? []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {localTeamMembers?.map((member) => (
                <SortableTeamMember
                  key={member.name}
                  member={member}
                  onDelete={() => handleDeleteMember(member.name)}
                  onEdit={(member) => {
                    setEditingMember(member);
                    setFormData({
                      name: member.name,
                      position: member.position,
                      bio: member.bio,
                      image: member.image || null,
                    });
                    setIsDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {localTeamMembers.length > 0 && (
        <div className="flex justify-end">
          <Button
            disabled={!hasChanges() || loading}
            onClick={handleSaveChanges}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ ترتيب الفريق
              </>
            )}
          </Button>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "تعديل عضو الفريق" : "إضافة عضو جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMember} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="أدخل اسم العضو"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">المنصب</label>
              <Input
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, position: e.target.value }))
                }
                placeholder="أدخل المنصب الوظيفي"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">نبذة</label>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="أدخل نبذة عن العضو"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الصورة الشخصية</label>
              {(imagePreview || editingMember?.imageUrl) && (
                <div className="relative group mb-4 w-24 h-24 mt-4">
                  <Image
                    src={imagePreview || editingMember?.imageUrl || ""}
                    alt="Member preview"
                    fill
                    className="object-cover rounded-lg border"
                    sizes="96px"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className={cn(
                      "absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                      editingMember && !imagePreview && "hidden"
                    )}
                    onClick={() => {
                      if (imagePreview) {
                        URL.revokeObjectURL(imagePreview);
                        setImagePreview(null);
                      }
                      setFormData((prev) => ({ ...prev, image: null }));
                      setSelectedFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <ImageUpload
                onFileSelect={(file) => {
                  const previewUrl = URL.createObjectURL(file);
                  if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                  }
                  setImagePreview(previewUrl);
                  setSelectedFile(file);
                }}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.name ||
                  !formData.position ||
                  !formData.bio ||
                  (!editingMember?.image && !selectedFile && !formData.image)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : editingMember ? (
                  "تحديث"
                ) : (
                  "إضافة"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
