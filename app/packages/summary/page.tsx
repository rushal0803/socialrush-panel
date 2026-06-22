import { Suspense } from "react";
import PackageSummaryContent from "./content";

export default function PackageSummaryPage() {
  return (
    <Suspense fallback={null}>
      <PackageSummaryContent />
    </Suspense>
  );
}
