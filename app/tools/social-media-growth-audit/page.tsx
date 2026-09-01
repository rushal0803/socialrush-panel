import type { Metadata } from "next";
import PublicShell from "@/components/marketing/PublicShell";
import { GrowthAuditTool } from "@/components/marketing/GrowthTools";
import { createPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = createPageMetadata({ title: "Free Social Media Growth Audit | SocialRUSH", description: "Use a free SocialRUSH social media growth audit to review user-entered engagement, reach and posting consistency.", path: "/tools/social-media-growth-audit", keywords: ["social media growth audit", "free Instagram growth audit", "YouTube growth audit"] });
export default function Page() { return <PublicShell><GrowthAuditTool /></PublicShell>; }
