import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface UserAvatarProps {
  size?: number;
  lastName?: string;
  firstName?: string;
  className?: string;
  avatarUrl: string | null | undefined;
}

export default function UserAvatar({
  avatarUrl,
  firstName,
  lastName,
  size = 48,
  className,
}: UserAvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasImage = Boolean(avatarUrl);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center flex-none rounded-full bg-secondary dark:hover:bg-[#404346] dark:bg-[#333334]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {!isLoaded && (
        <Loader
          className="absolute animate-spin text-muted-foreground"
          size={size / 2}
        />
      )}

      {hasImage ? (
        <Image
          src={avatarUrl || ""}
          alt="User avatar"
          layout="fill"
          className={cn(
            "rounded-full object-cover transition-opacity duration-500 ease-in-out",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoadingComplete={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      ) : (
        <span className="text-xl font-semibold text-muted-foreground">
          {firstName?.[0]}
          {lastName?.[0]}
        </span>
      )}
    </div>
  );
}
