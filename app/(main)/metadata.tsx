import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const heroData = await convex.query(api.hero.getHero);

    const storeName = settings?.storeName || "تسوق";

    const heroTitle = heroData?.title || "العنوان الرئيسي";

    const title = `${storeName} || ${heroTitle}`;

    const description =
      heroData?.description ||
      "متجر إلكتروني يقدم أفضل المنتجات بأعلى جودة وأسعار منافسة";

    let logoUrl = "/favicon.ico";
    if (settings?.logo) {
      const imageUrl = await convex.query(api.files.getImageUrl, {
        storageId: settings.logo,
      });
      if (typeof imageUrl === "string") {
        logoUrl = imageUrl;
      }
    }

    let heroImageUrl = "/hero.png";
    if (heroData?.mainImage) {
      const imageUrl = await convex.query(api.files.getImageUrl, {
        storageId: heroData.mainImage,
      });
      if (typeof imageUrl === "string") {
        heroImageUrl = imageUrl;
      }
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "ar_SA",
        images: [heroImageUrl],
        siteName: storeName,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [heroImageUrl],
      },
      icons: {
        icon: logoUrl,
        apple: logoUrl,
      },
      alternates: {
        canonical: "/",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      other: {
        "format-detection": "telephone=no",
      },
    };
  } catch (error) {
    console.error("Error generating home page metadata:", error);

    return {
      title: "تسوق || الصفحة الرئيسية",
      description: "متجر إلكتروني يقدم أفضل المنتجات بأعلى جودة وأسعار منافسة",
      openGraph: {
        title: "تسوق || الصفحة الرئيسية",
        description:
          "متجر إلكتروني يقدم أفضل المنتجات بأعلى جودة وأسعار منافسة",
        type: "website",
        locale: "ar_SA",
        images: ["/hero.png"],
        siteName: "تسوق",
      },
    };
  }
}
