import { memo } from "react";
import Image from "next/image";

interface ContactItemProps {
  title: string;
  description: string;
  imageUrl: string;
}

export const ContactItem = memo(function ContactItem({
  title,
  description,
  imageUrl,
}: ContactItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/80 backdrop-blur-sm transition-colors hover:bg-card">
      <div className="shrink-0 p-3 rounded-full bg-primary/10 flex items-center justify-center">
        <Image
          src={imageUrl || "/placeholder-image.png"}
          alt={title}
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
          loading="lazy"
        />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
});
