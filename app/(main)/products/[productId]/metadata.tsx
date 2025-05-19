import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata({
  params,
}: {
  params: { productId: string };
}): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    console.log("Product ID from params:", params.productId);
    const product = await convex.query(api.products.getProduct, {
      productId: params.productId as Id<"products">,
    });
    console.log("Product data fetched:", product ? product.name : "not found");

    if (!product) {
      return {
        title: `${storeName} | منتج غير موجود`,
        description: "المنتج المطلوب غير موجود",
        openGraph: {
          title: `${storeName} | منتج غير موجود`,
          description: "المنتج المطلوب غير موجود",
          type: "website",
          locale: "ar_SA",
          images: ["/placeholder-product.jpg"],
        },
      };
    }

    const rating = await convex.query(api.reviews.getProductRating, {
      productId: params.productId as Id<"products">,
    });

    const price = product.price;
    const discountedPrice =
      product.discountPercentage > 0
        ? price * (1 - product.discountPercentage / 100)
        : price;

    let productImageUrl = "/placeholder-product.jpg";
    if (product.mainImage) {
      const imageUrl = await convex.query(api.files.getImageUrl, {
        storageId: product.mainImage,
      });
      if (typeof imageUrl === "string") {
        productImageUrl = imageUrl;
      }
    }

    let logoUrl = "/favicon.ico";
    if (settings?.logo) {
      const imageUrl = await convex.query(api.files.getImageUrl, {
        storageId: settings.logo,
      });
      if (typeof imageUrl === "string") {
        logoUrl = imageUrl;
      }
    }

    const title = `${product.name} | ${storeName}`;
    console.log("Generated product page title:", title);
    const description =
      product.description || "تصفح منتجاتنا عالية الجودة بأسعار تنافسية";

    return {
      title: title,
      description,
      openGraph: {
        title,
        description,
        images: [productImageUrl],
        type: "website",
        locale: "ar_SA",
        siteName: storeName,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [productImageUrl],
      },
      icons: {
        icon: logoUrl,
        apple: logoUrl,
      },
      other: {
        "product:price:amount": discountedPrice.toString(),
        "product:price:currency": "SAR",
        "product:availability":
          product.quantity > 0 ? "in stock" : "out of stock",
        ...(rating &&
          rating.reviewCount > 0 && {
            "product:rating": rating.averageRating.toString(),
            "product:rating:scale": "5",
            "product:rating:count": rating.reviewCount.toString(),
          }),
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);

    let storeName = "تسوق";
    try {
      const settings = await convex.query(api.settings.get);
      if (settings?.storeName) {
        storeName = settings.storeName;
      }
    } catch (e) {
      console.error("Error fetching store name:", e);
    }

    return {
      title: `منتج | ${storeName}`,
      description: "تصفح منتجاتنا عالية الجودة بأسعار تنافسية",
      openGraph: {
        title: `منتج | ${storeName}`,
        description: "تصفح منتجاتنا عالية الجودة بأسعار تنافسية",
        type: "website",
        locale: "ar_SA",
        images: ["/placeholder-product.jpg"],
        siteName: storeName,
      },
    };
  }
}
