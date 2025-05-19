import { Suspense } from "react";
import TermsLoading from "./loading";
import { TermsServer } from "./terms-server";

export default function TermsPage() {
  return (
    <Suspense fallback={<TermsLoading />}>
      <TermsServer />
    </Suspense>
  );
}
