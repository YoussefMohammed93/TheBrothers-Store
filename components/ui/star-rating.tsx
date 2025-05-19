import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  className,
  size = "md",
  maxRating = 5,
  showValue = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(maxRating)].map((_, i) => (
        <StarIcon
          key={i}
          className={cn(
            sizeClasses[size],
            i < Math.floor(rating)
              ? "text-amber-500 fill-amber-500"
              : i < rating && i + 1 > rating
                ? "text-amber-500 fill-amber-500 opacity-50"
                : "text-gray-300"
          )}
        />
      ))}
      {showValue && (
        <span className="text-sm text-muted-foreground mr-1 mt-0.5">
          ( {rating.toFixed(1)} )
        </span>
      )}
    </div>
  );
}
