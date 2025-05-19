import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersLoading() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border border-muted animate-pulse"
                >
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-64 h-24 bg-muted rounded-md"></div>
                      <div className="flex-1 space-y-4">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                      <div className="w-32 h-8 bg-muted rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
