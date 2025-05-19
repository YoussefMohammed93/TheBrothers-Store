import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { OrdersClient } from "./_components/orders-client";

export default function OrdersPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <OrdersClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
