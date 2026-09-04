import type { Metadata } from "next";
import PackageCheckoutContent from "@/components/marketing/packages/PackageCheckoutContent";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function PackageCheckoutPage() {
  return <PackageCheckoutContent />;
}
