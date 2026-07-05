import { Suspense } from "react";
import type { Metadata } from "next";
import OrderSummaryContent from "./content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function OrderSummaryPage() {
  return (
    <Suspense fallback={null}>
      <OrderSummaryContent />
    </Suspense>
  );
}
