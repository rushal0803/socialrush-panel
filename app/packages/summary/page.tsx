import { Suspense } from "react";
import type { Metadata } from "next";
import PackageSummaryContent from "./content";

// This is a transaction-specific review screen, not a public landing page.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function PackageSummaryPage() {
  return (
    <Suspense fallback={null}>
      <PackageSummaryContent />
    </Suspense>
  );
}
