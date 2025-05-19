import { Suspense } from "react";
import SearchContent, { SearchSkeleton } from "./search-content";

export default function SearchPage() {
  return (
    <div className="py-4 sm:py-8">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
