"use client";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";

export default function UsersPage() {
  const users = useQuery(api.users.getUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const [isUpdating, setIsUpdating] = useState<Id<"users"> | null>(null);

  const handleRoleChange = async (
    userId: Id<"users">,
    newRole: "user" | "admin"
  ) => {
    setIsUpdating(userId);
    try {
      await updateUserRole({ userId, newRole });
      toast.success(
        `تم تغيير دور المستخدم إلى ${newRole === "admin" ? "مدير النظام" : "مستخدم"}`
      );
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث دور المستخدم");
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground mt-2">
          إدارة أدوار المستخدمين وصلاحياتهم
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
          <CardDescription>
            قائمة بجميع المستخدمين المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users === undefined ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg border-2 border-dashed">
              <div className="space-y-3">
                <p className="text-foreground/80 text-lg font-medium">
                  لا يوجد مستخدمين
                </p>
                <p className="text-sm text-muted-foreground/80">
                  لم يتم العثور على أي مستخدمين مسجلين في النظام
                </p>
              </div>
            </div>
          ) : (
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">
                    البريد الإلكتروني
                  </TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.userRole === "admin" ? "default" : "outline"
                        }
                      >
                        {user.userRole === "admin" ? "مدير النظام" : "مستخدم"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.userRole === "admin" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user._id, "user")}
                          disabled={isUpdating === user._id}
                        >
                          {isUpdating === user._id
                            ? "جاري التحديث..."
                            : "تغيير إلى مستخدم"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user._id, "admin")}
                          disabled={isUpdating === user._id}
                        >
                          {isUpdating === user._id
                            ? "جاري التحديث..."
                            : "تغيير إلى مدير"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
