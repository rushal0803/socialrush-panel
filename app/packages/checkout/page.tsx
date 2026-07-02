import { Suspense } from "react";
import type { Metadata } from "next";
import PackageCheckoutContent from "@/components/marketing/packages/PackageCheckoutContent";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function PackageCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(165deg,#FFF8F1_0%,#FFF8F1_30%,#FFF8F1_55%,#FFF8F1_80%,#FFF8F1_100%)]" />}>
      <PackageCheckoutContent />
    </Suspense>
  );
}
