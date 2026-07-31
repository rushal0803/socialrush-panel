import type { Metadata } from "next";
import PublicShell from "@/components/marketing/PublicShell";
import ToolsContent from "@/components/marketing/tools/ToolsContent";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Free Social Media Creator Tools",
  description: "Free, privacy-first creator tools for engagement, image sizing, YouTube previews, Instagram captions and UTM links.",
  path: "/tools",
  keywords: ["free social media tools", "creator tools", "social media calculator"],
});

export default function ToolsPage() { return <PublicShell><ToolsContent /></PublicShell>; }
