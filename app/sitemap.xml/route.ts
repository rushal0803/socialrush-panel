import { NextResponse } from "next/server";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import {
  canonicalIndiaServicePaths,
  indiaServiceSlugs,
} from "@/lib/seo/india-service-pages";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/packages",
  "/blog",
  "/contact",
  "/support",
  "/faq",
  "/case-studies",
  "/reviews",
  "/trust",
  "/compare",
  "/compare/ytviews",
  "/compare/socialking",
  "/compare/media-mister",
  "/privacy-policy",
  "/refund-policy",
  "/terms-and-conditions",
  "/tools",
  "/tools/instagram-engagement-rate-calculator",
  "/tools/social-media-image-resizer",
  "/tools/youtube-thumbnail-preview",
  "/tools/instagram-caption-counter",
  "/tools/utm-link-builder",
  "/creator-growth",
  "/tools/youtube-engagement-rate-calculator",
  "/tools/youtube-revenue-calculator",
  "/tools/social-media-growth-budget-calculator",
  "/tools/creator-growth-checklist",
] as const;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function absoluteUrl(path: string) {
  return new URL(path, `${SEO_SITE_URL}/`).toString();
}

function sitemapServicePath(slug: (typeof indiaServiceSlugs)[number]) {
  if (slug === "buy-instagram-followers-india") {
    return "/buy-instagram-followers-india";
  }

  return canonicalIndiaServicePaths[slug];
}

type CaseStudySitemapEntry = { slug: string; published_at: string | null };

export async function GET() {
  const serviceRoutes = indiaServiceSlugs.map(sitemapServicePath);
  const blogRoutes = blogArticles.map((article) => `/blog/${article.slug}`);
  const { data: caseStudies } = await createAdminClient()
    .from("case_studies")
    .select("slug,published_at")
    .eq("published", true)
    .eq("permission_confirmed", true);
  const approvedCaseStudies = (caseStudies ?? []) as CaseStudySitemapEntry[];
  const caseStudyRoutes = approvedCaseStudies.map((study) => `/case-studies/${study.slug}`);
  const routes = [
    ...new Set([
      ...publicRoutes,
      ...serviceRoutes,
      ...blogRoutes,
      ...caseStudyRoutes,
    ]),
  ];
  const lastModified = new Map<string, string>();
  blogArticles.forEach((article) => {
    if (article.updatedAt) lastModified.set(`/blog/${article.slug}`, article.updatedAt);
  });
  approvedCaseStudies.forEach((study) => {
    if (study.published_at) lastModified.set(`/case-studies/${study.slug}`, study.published_at);
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    const lastmod = lastModified.get(route);

    return `  <url>
    <loc>${escapeXml(absoluteUrl(route))}</loc>${lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
