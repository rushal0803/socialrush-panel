import type { Metadata } from "next";
import PublicShell from "@/components/marketing/PublicShell";
import InteractiveHomepageShell from "@/components/marketing/InteractiveHomepageShell";
import ToolsContent from "@/components/marketing/tools/ToolsContent";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Free Social Media Creator Tools | SocialRUSH",
  description: "Free social media creator tools for India, including service cost, engagement, budget, image, YouTube, Instagram and UTM calculators.",
  path: "/tools",
  keywords: ["free social media tools", "creator tools", "social media calculator", "social media service cost calculator India", "followers cost calculator"],
});

export default function ToolsPage() { return <PublicShell><InteractiveHomepageShell><div className="service-money-page"><ToolsContent /></div></InteractiveHomepageShell></PublicShell>; }
