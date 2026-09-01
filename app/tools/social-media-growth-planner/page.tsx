import type { Metadata } from "next";
import { Suspense } from "react";
import PublicShell from "@/components/marketing/PublicShell";
import { GrowthPlannerTool } from "@/components/marketing/GrowthTools";
import { createPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = createPageMetadata({ title: "Social Media Growth Planner | SocialRUSH", description: "Build a practical social media growth plan using active SocialRUSH services, current catalog pricing and your budget.", path: "/tools/social-media-growth-planner", keywords: ["social media growth planner", "Instagram growth planner", "social media marketing budget calculator"] });
export default function Page() { return <PublicShell><Suspense fallback={<main className="min-h-screen bg-[#080a10]" />}><GrowthPlannerTool /></Suspense></PublicShell>; }
