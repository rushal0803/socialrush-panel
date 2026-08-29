/* eslint-disable @typescript-eslint/no-explicit-any */
import PublicShell from "@/components/marketing/PublicShell";
import CaseStudiesShowcase from "@/components/marketing/CaseStudiesShowcase";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({ title: "Social Media Growth Case Studies", description: "Explore SocialRUSH growth planning examples for Instagram, YouTube, local businesses and agencies. Illustrative scenarios only, with no guaranteed results.", path: "/case-studies", keywords: ["social media growth case studies", "social media growth examples", "Instagram growth strategy examples", "YouTube growth strategy examples", "social media campaign planning"] });
export const dynamic = "force-dynamic";

export default async function CaseStudies() {
  const { data } = await createAdminClient().from("case_studies").select("slug,title,platform,service_name,customer_type,challenge,outcome,delivery_timeline").eq("published", true).eq("permission_confirmed", true).order("featured", { ascending: false }).order("published_at", { ascending: false });
  return <PublicShell><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Case Studies", path: "/case-studies" }]} /><CaseStudiesShowcase verified={(data ?? []) as any} /></PublicShell>;
}
