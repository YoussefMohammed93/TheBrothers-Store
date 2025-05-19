"use client";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import UserAvatar from "./user-avatar";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Separator } from "./ui/separator";
import { api } from "@/convex/_generated/api";
import { LogOut, Heart, Package, Settings } from "lucide-react";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const auth = useAuth();
  const currentUser = useQuery(api.users.currentUser);

  const handleSignout = () => {
    auth.signOut();
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger
        asChild
        className="outline-none focus:outline-none cursor-pointer"
      >
        <button className={cn("flex-none rounded-full", className)}>
          <UserAvatar avatarUrl={currentUser?.imageUrl} size={34} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          مرحباً{" "}
          {currentUser?.firstName && currentUser?.lastName
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : currentUser?.username || "المستخدم"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/orders">
          <DropdownMenuItem>
            <Package className="size-4" />
            طلباتي
          </DropdownMenuItem>
        </Link>
        <Link href="/wishlist">
          <DropdownMenuItem>
            <Heart className="size-4" />
            المفضلة
          </DropdownMenuItem>
        </Link>
        {currentUser?.userRole === "admin" && (
          <Link href="/dashboard">
            <DropdownMenuItem>
              <Settings className="size-4" />
              لوحة التحكم
            </DropdownMenuItem>
          </Link>
        )}
        <Separator className="my-1" />
        <DropdownMenuItem onClick={() => handleSignout()}>
          <LogOut className="size-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
