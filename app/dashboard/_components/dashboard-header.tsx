import UserButton from "@/components/user-button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <header className="w-full border-b bg-background fixed top-0 left-0 z-50">
      <div className="flex h-14 items-center justify-between px-6 w-full">
        <SidebarTrigger />
        <UserButton />
      </div>
    </header>
  );
}
