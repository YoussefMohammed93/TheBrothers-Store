"use client";

import { usePathname } from "next/navigation";
import { Heading } from "@/components/ui/heading";

interface DashboardHeaderProps {
  heading: string;
  description?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  children,
  description,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  return (
    <div
      className={`flex items-center justify-between ${pathname === "/orders/orderId" ? "mb-8" : "mb-0"}`}
    >
      <div>
        <Heading title={heading} description={description || ""} />
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
