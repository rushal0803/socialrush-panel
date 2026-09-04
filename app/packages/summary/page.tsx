import type { Metadata } from "next";
import PackageSummaryContent from "./content";

// This is a transaction-specific review screen, not a public landing page.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

// This screen depends on request-specific package query data and the signed-in
// wallet session, so it must render on demand rather than during SSG.
export const dynamic = "force-dynamic";

export default function PackageSummaryPage() {
  return <PackageSummaryContent />;
}
