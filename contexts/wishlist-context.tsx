"use client";

import React, {
  useState,
  useEffect,
  ReactNode,
  useContext,
  createContext,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";

type WishlistItem = {
  _id: Id<"wishlist">;
  productId: Id<"products">;
  addedAt: string;
  product: {
    _id: Id<"products">;
    name: string;
    description: string;
    price: number;
    discountPercentage: number;
    quantity: number;
    mainImage: Id<"_storage">;
    gallery: Id<"_storage">[];
    mainImageUrl: string | null;
    galleryUrls: (string | null)[];
    categoryId: Id<"categories">;
    _creationTime: number;
    createdAt: string;
    updatedAt: string;
  };
};

type WishlistContextType = {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  isInWishlist: (productId: Id<"products">) => boolean;
  addToWishlist: (productId: Id<"products">) => Promise<void>;
  removeFromWishlist: (productId: Id<"products">) => Promise<void>;
  clearWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  // Auth state
  const { isSignedIn } = useAuth();

  // State declarations
  const [isLoading, setIsLoading] = useState(true);

  // API queries
  const wishlistQuery = useQuery(api.wishlist.getUserWishlist);
  const wishlistItems = React.useMemo(
    () => wishlistQuery || [],
    [wishlistQuery]
  );
  const wishlistCount = useQuery(api.wishlist.getWishlistCount) || 0;

  // API mutations
  const addToWishlistMutation = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlistMutation = useMutation(
    api.wishlist.removeFromWishlist
  );
  const clearWishlistMutation = useMutation(api.wishlist.clearWishlist);

  // Effects
  useEffect(() => {
    if (wishlistItems !== undefined) {
      setIsLoading(false);
    }
  }, [wishlistItems]);

  // Helper functions
  const isInWishlist = (productId: Id<"products">) => {
    return wishlistItems.some((item) => item?.productId === productId);
  };

  // Wishlist operation handlers
  const addToWishlist = async (productId: Id<"products">) => {
    if (!isSignedIn) {
      toast.error("يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة");
      return;
    }

    try {
      await addToWishlistMutation({ productId });
      toast.success("تمت إضافة المنتج إلى المفضلة");
    } catch {
      toast.error("فشل في إضافة المنتج إلى المفضلة");
    }
  };

  const removeFromWishlist = async (productId: Id<"products">) => {
    if (!isSignedIn) return;

    try {
      await removeFromWishlistMutation({ productId });
      toast.success("تمت إزالة المنتج من المفضلة");
    } catch {
      toast.error("فشل في إزالة المنتج من المفضلة");
    }
  };

  const clearWishlist = async () => {
    if (!isSignedIn) return;

    try {
      await clearWishlistMutation();
      toast.success("تم مسح المفضلة");
    } catch {
      toast.error("فشل في مسح المفضلة");
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: (wishlistQuery || []).filter(
          (item): item is NonNullable<typeof item> => item !== null
        ),
        wishlistCount,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
