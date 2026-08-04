"use client";

import { usePathname } from "next/navigation";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";

/**
 * Shared frame for service discovery and editorial pages.  These used to ship
 * their own header, which made the public site feel like several products.
 */
export default function BlogShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main key={pathname} className="public-dark min-h-screen overflow-x-clip bg-[#07080D] text-white">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </main>
  );
}
