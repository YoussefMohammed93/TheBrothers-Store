"use client";

import { Building2 } from "lucide-react";

export function AboutPageNotVisible() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="bg-muted mx-auto w-16 h-16 rounded-full flex items-center justify-center">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">هذه الصفحة غير متاحة حالياً</h1>
        <p className="text-muted-foreground">يرجى العودة لاحقاً.</p>
      </div>
    </div>
  );
}
