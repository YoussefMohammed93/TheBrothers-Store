import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { HeroSection } from "./_components/hero";
import { SalesSection } from "./_components/sales";
import { BannerSection } from "./_components/banner";
import { ReviewsSection } from "./_components/reviews";
import { FeaturesSection } from "./_components/features";
import { PartnersSection } from "./_components/partners";
import { CategoriesSection } from "./_components/categories";
import { NewsletterSection } from "./_components/newsletter";
import { NewArrivalsSection } from "./_components/new-arrivals";
import { ProductsSection } from "./_components/featured-products";

export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <CategoriesSection />
      <SalesSection />
      <NewArrivalsSection />
      <ProductsSection />
      <BannerSection />
      <ReviewsSection />
      <PartnersSection />
      <NewsletterSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}
