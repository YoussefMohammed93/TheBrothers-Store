import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactLoading() {
  return (
    <>
      <Header />
      <main>
        <section className="pt-28 pb-12 bg-muted">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="pt-6">
                    <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-32 mx-auto mb-4" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="mb-8">
                  <Skeleton className="h-8 w-48 mb-4" />
                  <Skeleton className="h-5 w-96" />
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <div className="mb-8">
                  <Skeleton className="h-8 w-48 mb-4" />
                  <Skeleton className="h-5 w-96" />
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="aspect-video w-full rounded-md mb-6" />
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-24 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-24 mb-2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4 mt-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
