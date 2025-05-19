import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { AboutPageClient } from "./_components/about-page-client";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <AboutPageClient key="about-page" />
      </main>
      <Footer />
    </>
  );
}
