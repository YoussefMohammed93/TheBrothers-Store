"use client";

import {
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Trash2,
  CheckCircle,
  Archive,
  MessageSquare,
  Save,
  Edit,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { DashboardShell } from "@/components/dashboard/shell";
import ContactSubmissionsLoadingSkeleton from "./loading-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Submission = {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: string;
  message: string;
  subject?: string;
  createdAt: string;
  updatedAt?: string;
  _id: Id<"contactSubmissions">;
};

const statusColors = {
  new: "bg-blue-500",
  read: "bg-green-500",
  replied: "bg-purple-500",
  archived: "bg-gray-500",
};

const statusLabels = {
  new: "جديد",
  read: "مقروء",
  replied: "تم الرد",
  archived: "مؤرشف",
};

const subjectLabels = {
  general: "استفسار عام",
  support: "الدعم الفني",
  sales: "المبيعات",
  feedback: "اقتراحات وملاحظات",
  other: "أخرى",
};

export default function ContactSubmissionsPage() {
  const submissions = useQuery(api.contact.getContactSubmissions);
  const updateStatus = useMutation(api.contact.updateContactSubmissionStatus);
  const deleteSubmission = useMutation(api.contact.deleteContactSubmission);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");

  if (submissions === undefined) {
    return <ContactSubmissionsLoadingSkeleton />;
  }

  const getFilteredSubmissions = (tabValue: string) => {
    return submissions?.filter((submission) => {
      const matchesSearch =
        submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.message.toLowerCase().includes(searchQuery.toLowerCase());

      if (tabValue === "all") return matchesSearch;
      return matchesSearch && submission.status === tabValue;
    });
  };

  const handleStatusChange = async (
    id: Id<"contactSubmissions">,
    status: string
  ) => {
    try {
      await updateStatus({ id, status, notes });
      toast.success(
        `تم تغيير حالة الرسالة إلى "${statusLabels[status as keyof typeof statusLabels]}"`
      );
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("حدث خطأ أثناء تحديث الحالة");
    }
  };

  const handleDelete = async (id: Id<"contactSubmissions">) => {
    try {
      await deleteSubmission({ id });
      toast.success("تم حذف الرسالة بنجاح");
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("حدث خطأ أثناء حذف الرسالة");
    }
  };

  const openDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setNotes(submission.notes || "");
    setIsDetailsOpen(true);

    if (submission.status === "new") {
      updateStatus({ id: submission._id, status: "read" });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col rtl" dir="rtl">
        <div className="mb-8">
          <Heading
            title="رسائل التواصل"
            description="إدارة ومتابعة رسائل التواصل الواردة من العملاء."
          />
        </div>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الرسائل..."
              className="pr-9 w-full max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          dir="rtl"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="new">جديد</TabsTrigger>
            <TabsTrigger value="read">مقروء</TabsTrigger>
            <TabsTrigger value="replied">تم الرد</TabsTrigger>
            <TabsTrigger value="archived">مؤرشف</TabsTrigger>
          </TabsList>
          {["all", "new", "read", "replied", "archived"].map((tabValue) => (
            <TabsContent
              key={tabValue}
              value={tabValue}
              className="mt-6 rtl"
              dir="rtl"
            >
              {getFilteredSubmissions(tabValue)?.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">لا توجد رسائل</h3>
                  <p className="text-muted-foreground mt-2">
                    لم يتم العثور على رسائل في هذه الفئة
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredSubmissions(tabValue)?.map((submission) => (
                    <Card
                      key={submission._id}
                      className="overflow-hidden min-h-[320px] flex flex-col"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {submission.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {submission.subject
                                ? `الموضوع: ${subjectLabels[submission.subject as keyof typeof subjectLabels] || submission.subject}`
                                : "بدون موضوع"}
                            </CardDescription>
                          </div>
                          <Badge
                            className={`${
                              statusColors[
                                submission.status as keyof typeof statusColors
                              ]
                            } text-white`}
                          >
                            {
                              statusLabels[
                                submission.status as keyof typeof statusLabels
                              ]
                            }
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 flex-1">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {submission.email}
                            </span>
                          </div>
                          {submission.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {submission.phone}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {formatDate(submission.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm line-clamp-3">
                            {submission.message}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(submission)}
                        >
                          عرض التفاصيل
                        </Button>
                        <AlertDialog>
                          <DropdownMenu dir="rtl">
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="rtl">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(submission._id, "read")
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                                تحديد كمقروء
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(submission._id, "replied")
                                }
                              >
                                <MessageSquare className="h-4 w-4" />
                                تحديد كتم الرد
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(submission._id, "archived")
                                }
                              >
                                <Archive className="h-4 w-4" />
                                أرشفة
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  حذف
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent className="rtl" dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف هذه الرسالة نهائtığımız ولا يمكن
                                استعادتها.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(submission._id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          {selectedSubmission && (
            <DialogContent
              className="!max-w-xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rtl"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle>تفاصيل الرسالة</DialogTitle>
                <DialogDescription>
                  رسالة من {selectedSubmission.name} -{" "}
                  {formatDate(selectedSubmission.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">الاسم</h4>
                    <p>{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      البريد الإلكتروني
                    </h4>
                    <p>{selectedSubmission.email}</p>
                  </div>
                  {selectedSubmission.phone && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">رقم الهاتف</h4>
                      <p>{selectedSubmission.phone}</p>
                    </div>
                  )}
                  {selectedSubmission.subject && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">الموضوع</h4>
                      <p>
                        {subjectLabels[
                          selectedSubmission.subject as keyof typeof subjectLabels
                        ] || selectedSubmission.subject}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">الرسالة</h4>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">ملاحظات</h4>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أضف ملاحظات حول هذه الرسالة..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">الحالة:</h4>
                  <Badge
                    className={`${
                      statusColors[
                        selectedSubmission.status as keyof typeof statusColors
                      ]
                    } text-white`}
                  >
                    {
                      statusLabels[
                        selectedSubmission.status as keyof typeof statusLabels
                      ]
                    }
                  </Badge>
                </div>
              </div>
              <DialogFooter className="flex justify-between flex-col gap-2 sm:gap-4">
                <div className="w-full flex gap-2">
                  <Button
                    variant="default"
                    className="w-1/2"
                    onClick={() => {
                      updateStatus({
                        id: selectedSubmission._id,
                        status: selectedSubmission.status,
                        notes,
                      });
                      setIsDetailsOpen(false);
                      toast.success("تم حفظ الملاحظات بنجاح");
                    }}
                  >
                    <Save className="size-4" />
                    حفظ الملاحظات
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-1/2">
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rtl" dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف هذه الرسالة نهائياً ولا يمكن استعادتها.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(selectedSubmission._id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="w-full flex gap-2">
                  <DropdownMenu dir="rtl">
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-1/2">
                        <Edit className="size-4" />
                        تغيير الحالة
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rtl">
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(selectedSubmission._id, "new")
                        }
                      >
                        جديد
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(selectedSubmission._id, "read")
                        }
                      >
                        مقروء
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(selectedSubmission._id, "replied")
                        }
                      >
                        تم الرد
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(selectedSubmission._id, "archived")
                        }
                      >
                        أرشفة
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    onClick={() => setIsDetailsOpen(false)}
                    className="w-1/2"
                  >
                    إغلاق
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </DashboardShell>
  );
}
