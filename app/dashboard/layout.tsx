"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "./_components/dashboard-header";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { DashboardSidebar } from "@/app/dashboard/_components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAdmin = useQuery(api.users.isAdmin);

  useEffect(() => {
    if (isAdmin === false) {
      toast.error("لا يمكنك الوصول إلى لوحة التحكم", {
        description: "أنت لست مديرًا للنظام.",
      });
      router.push("/");
    }
  }, [isAdmin, router]);

  return (
    <>
      <SignedIn>
        {isAdmin === undefined ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
          </div>
        ) : isAdmin === true ? (
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full flex-col">
              <DashboardHeader />
              <div className="flex flex-1">
                <DashboardSidebar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        ) : null}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
