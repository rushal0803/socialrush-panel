import { Suspense } from "react";
import OrderSummaryContent from "./content";

export const dynamic = "force-dynamic";

export default function OrderSummaryPage() {
  return (
    <Suspense fallback={null}>
      <OrderSummaryContent />
    </Suspense>
  );
}
