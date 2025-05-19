import { Suspense } from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import ProductsSkeleton from "./products-skeleton";
import ProductsContent from "./products-content-fixed";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 mt-20 sm:mt-16 lg:mt-0">
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
