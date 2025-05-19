"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FolderX } from "lucide-react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
}: {
  reset: () => void;
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("Category page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center pb-20 pt-32">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">الفئة غير موجودة</h2>
          <p className="text-muted-foreground mb-6">
            عذراً، الفئة التي تبحث عنها غير موجودة أو تم حذفها
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">العودة إلى الصفحة الرئيسية</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
