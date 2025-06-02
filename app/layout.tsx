import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { El_Messiri } from "next/font/google";
import { api } from "@/convex/_generated/api";
import { Toaster } from "@/components/ui/sonner";
import { ConvexHttpClient } from "convex/browser";
import { CartProvider } from "@/contexts/cart-context";
import { AdhkarProvider } from "@/contexts/adhkar-context";
import { StripeProvider } from "./providers/stripe-provider";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { ConvexClientProvider } from "./convex-client-provider";
import { ViewTracker } from "./components/analytics/view-tracker";

const elMessiri = El_Messiri({
  variable: "--font-el-messiri",
  subsets: ["latin", "arabic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  try {
    const settings = await convex.query(api.settings.get);
    const heroData = await convex.query(api.hero.getHero);

    const storeName = settings?.storeName || "تسوق";

    const heroTitle = heroData?.title || "العنوان الرئيسي";

    const defaultTitle = `${storeName} | ${heroTitle}`;

    return {
      title: {
        template: "%s",
        default: defaultTitle,
      },
      description:
        heroData?.description ||
        "متجر إلكتروني يقدم أفضل المنتجات بأعلى جودة وأسعار منافسة",
    };
  } catch (error) {
    console.error("Error generating root metadata:", error);

    return {
      title: {
        template: "%s",
        default: "تسوق | الصفحة الرئيسية",
      },
      description: "متجر إلكتروني يقدم أفضل المنتجات بأعلى جودة وأسعار منافسة",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${elMessiri.variable} antialiased`}>
          <ConvexClientProvider>
            <CurrencyProvider>
              <WishlistProvider>
                <CartProvider>
                  <StripeProvider>
                    <AdhkarProvider>
                      <ViewTracker />
                      {children}
                      <Toaster
                        richColors
                        closeButton
                        position="bottom-right"
                        dir="rtl"
                      />
                    </AdhkarProvider>
                  </StripeProvider>
                </CartProvider>
              </WishlistProvider>
            </CurrencyProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
