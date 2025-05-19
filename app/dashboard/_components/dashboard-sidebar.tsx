"use client";

import {
  FileTextIcon,
  PhoneIcon,
  UsersIcon,
  StarIcon,
  HomeIcon,
  LayoutIcon,
  PackageIcon,
  SettingsIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

export function DashboardSidebar() {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sections: false,
    pages: false,
  });

  const subscribers = useQuery(api.newsletter.getUnreadSubscribers);
  const unreadOrdersCount = useQuery(api.orders.getUnreadOrdersCount);
  const markOrdersAsRead = useMutation(api.orders.markAllOrdersAsRead);
  const newContactSubmissions = useQuery(api.contact.getNewSubmissionsCount);

  useEffect(() => {
    if (
      pathname === "/dashboard/orders" &&
      unreadOrdersCount &&
      unreadOrdersCount > 0
    ) {
      markOrdersAsRead();
    }
  }, [pathname, unreadOrdersCount, markOrdersAsRead]);

  type SectionWithBadge = {
    label: string;
    href: string;
    badge?: number;
  };

  const mainSections: SectionWithBadge[] = [
    {
      label: "الهيدر",
      href: "/dashboard/sections/header",
    },
    {
      label: "الرئيسي",
      href: "/dashboard/sections/hero",
    },
    {
      label: "الفئات",
      href: "/dashboard/sections/categories",
    },
    {
      label: "تواصل معنا",
      href: "/dashboard/sections/contact",
    },
    {
      label: "شركاؤنا المعتمدون",
      href: "/dashboard/sections/partners",
    },
    {
      label: "نشرتنا البريدية",
      href: "/dashboard/sections/newsletter",
      badge: subscribers?.length || 0,
    },
    {
      label: "مميزات المتجر",
      href: "/dashboard/sections/store-features",
    },
    {
      label: "الفوتر",
      href: "/dashboard/sections/footer",
    },
  ];

  const pagesSections: SectionWithBadge[] = [
    {
      label: "من نحن",
      href: "/dashboard/pages/about",
    },
    {
      label: "الشروط والأحكام",
      href: "/dashboard/pages/terms",
    },
    {
      label: "تواصل معنا",
      href: "/dashboard/pages/contact",
    },
  ];

  const routes = [
    {
      icon: HomeIcon,
      label: "الرئيسية",
      tooltip: "الرئيسية",
      href: "/dashboard",
    },
    {
      icon: LayoutIcon,
      label: "الأقسام",
      tooltip: "الأقسام",
      id: "sections",
      sections: mainSections,
    },
    {
      icon: FileTextIcon,
      label: "الصفحات",
      tooltip: "الصفحات",
      id: "pages",
      sections: pagesSections,
    },
    {
      icon: PackageIcon,
      label: "المنتجات",
      tooltip: "المنتجات",
      href: "/dashboard/products",
    },
    {
      icon: ShoppingCartIcon,
      label: "الطلبات",
      tooltip: "الطلبات",
      href: "/dashboard/orders",
      badge: unreadOrdersCount || 0,
    },
    {
      icon: StarIcon,
      label: "التقييمات",
      tooltip: "التقييمات",
      href: "/dashboard/reviews",
    },
    {
      icon: PhoneIcon,
      label: "رسائل التواصل",
      tooltip: "رسائل التواصل",
      href: "/dashboard/pages/contact/submissions",
      badge: newContactSubmissions || 0,
    },
    {
      icon: UsersIcon,
      label: "المستخدمين",
      tooltip: "المستخدمين",
      href: "/dashboard/users",
    },
    {
      icon: SettingsIcon,
      label: "الإعدادات",
      tooltip: "الإعدادات",
      href: "/dashboard/settings",
    },
  ];

  return (
    <Sidebar side="right" className="border-r bg-background md:pt-14">
      <SidebarHeader className="px-4 h-14">
        <h2 className="text-lg font-bold">لوحة التحكم</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route, index) => (
            <SidebarMenuItem key={route.href || index}>
              {route.sections ? (
                <>
                  <SidebarMenuButton
                    tooltip={route.tooltip}
                    className="cursor-pointer"
                    isActive={route.sections.some(
                      (section) => pathname === section.href
                    )}
                    onClick={() => {
                      if (route.id) {
                        setOpenSections((prev) => ({
                          ...prev,
                          [route.id]: !prev[route.id],
                        }));
                      }
                    }}
                  >
                    <route.icon className="ml-1 h-5 w-5" />
                    <span>{route.label}</span>
                    <ChevronDownIcon
                      className={`h-4 w-4 mr-auto transition-transform ${
                        route.id && openSections[route.id]
                          ? "transform rotate-180"
                          : ""
                      }`}
                    />
                  </SidebarMenuButton>
                  {route.id && openSections[route.id] && (
                    <SidebarMenuSub>
                      {route.sections.map((section) => (
                        <SidebarMenuSubItem key={section.href}>
                          <SidebarMenuSubButton
                            asChild={true}
                            isActive={pathname === section.href}
                          >
                            <Link
                              href={section.href}
                              className="flex w-full items-center gap-2 relative"
                            >
                              <LayoutDashboardIcon className="h-4 w-4 ml-1" />
                              <span>{section.label}</span>
                              {typeof section.badge === "number" &&
                                section.badge > 0 && (
                                  <span className="absolute left-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    {section.badge}
                                  </span>
                                )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </>
              ) : (
                <SidebarMenuButton
                  asChild={true}
                  tooltip={route.tooltip}
                  className="cursor-pointer"
                  isActive={pathname === route.href}
                >
                  <Link
                    href={route.href}
                    className="flex w-full items-center relative"
                  >
                    <route.icon className="ml-1 h-5 w-5" />
                    <span>{route.label}</span>
                    {typeof route.badge === "number" && route.badge > 0 && (
                      <span className="absolute left-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {route.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
