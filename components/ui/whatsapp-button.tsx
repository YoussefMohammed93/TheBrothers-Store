"use client";

import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function WhatsAppButton() {
  const settings = useQuery(api.settings.get);

  if (settings === undefined) {
    return null;
  }

  if (!settings?.storePhone) {
    return null;
  }

  const formattedPhone = settings.storePhone.replace(/\D/g, "");

  const whatsappUrl = `https://wa.me/${formattedPhone}`;

  return (
    <div className="fixed bottom-6 left-6 z-50 transition-all duration-500">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="size-12 cursor-pointer"
              aria-label="تواصل معنا عبر واتساب"
              onClick={() => window.open(whatsappUrl, "_blank")}
            >
              <Image
                src="/whatsapp.png"
                alt="WhatsApp"
                width={48}
                height={48}
                priority
                className="rounded-full"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>تواصل معنا عبر واتساب</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
