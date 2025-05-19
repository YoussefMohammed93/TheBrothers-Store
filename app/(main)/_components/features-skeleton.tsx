import { Skeleton } from "@/components/ui/skeleton";

export const FeaturesSkeleton = () => {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="block sm:hidden">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col my-5 items-center justify-center"
            >
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="relative rounded-lg bg-card">
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
