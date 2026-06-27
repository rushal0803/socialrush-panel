import { Suspense } from "react";
import PackageCheckoutContent from "@/components/marketing/packages/PackageCheckoutContent";

export default function PackageCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(165deg,#f0f9ff_0%,#fdf4ff_30%,#fff1f8_55%,#f5f3ff_80%,#ecfeff_100%)]" />}>
      <PackageCheckoutContent />
    </Suspense>
  );
}
