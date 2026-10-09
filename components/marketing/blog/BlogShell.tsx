"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";

// The bridge imports the complete editorial catalog. Discovery and package
// pages share this shell but never render it; keep that catalog off their path.
// Retain SSR for article links and SEO content.
const BlogRevenueBridge = dynamic(() => import("./BlogRevenueBridge"));

/**
 * Shared frame for service discovery and editorial pages. These used to ship
 * their own header, which made the public site feel like several products.
 */
export default function BlogShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="public-dark min-h-screen overflow-x-clip bg-[#07080D] text-white">
      <MarketingHeader />
      {children}
      {pathname.startsWith("/blog/") ? <BlogRevenueBridge /> : null}
      <MarketingFooter />
    </main>
  );
}
