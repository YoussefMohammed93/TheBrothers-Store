"use client";

import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ScrollToTopButton />
      <WhatsAppButton />
    </>
  );
}
