import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | الشروط والأحكام`;

    let logoUrl = "/favicon.ico";
    if (settings?.logo) {
      const imageUrl = await convex.query(api.files.getImageUrl, {
        storageId: settings.logo,
      });
      if (typeof imageUrl === "string") {
        logoUrl = imageUrl;
      }
    }

    return {
      title,
      description:
        "تصفح مجموعتنا الواسعة من المنتجات عالية الجودة بأسعار تنافسية",
      openGraph: {
        title,
        description:
          "تصفح مجموعتنا الواسعة من المنتجات عالية الجودة بأسعار تنافسية",
        type: "website",
        locale: "ar_SA",
        images: ["/products-banner.jpg"],
        siteName: storeName,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description:
          "تصفح مجموعتنا الواسعة من المنتجات عالية الجودة بأسعار تنافسية",
        images: ["/products-banner.jpg"],
      },
      icons: {
        icon: logoUrl,
        apple: logoUrl,
      },
    };
  } catch (error) {
    console.error("Error generating products page metadata:", error);

    return {
      title: "تسوق | الشروط والأحكام",
      description:
        "تصفح مجموعتنا الواسعة من المنتجات عالية الجودة بأسعار تنافسية",
      openGraph: {
        title: "تسوق | الشروط والأحكام",
        description:
          "تصفح مجموعتنا الواسعة من المنتجات عالية الجودة بأسعار تنافسية",
        type: "website",
        locale: "ar_SA",
        images: ["/products-banner.jpg"],
      },
    };
  }
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
