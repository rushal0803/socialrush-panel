import { NextResponse } from "next/server";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { uniqueArticlesBySlug } from "@/lib/blog";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import {
  canonicalIndiaServicePaths,
  indiaServiceSlugs,
} from "@/lib/seo/india-service-pages";
import { createAdminClient } from "@/lib/supabase/admin";
import { countryServicePaths, internationalHubPaths } from "@/lib/seo/international";

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
  "/instagram-growth-india",
  "/youtube-growth-india",
  "/facebook-growth-india",
  "/linkedin-growth-india",
  "/x-growth-india",
  "/tiktok-growth-india",
  "/services/linkedin-usa-connections",
  "/services/linkedin-usa-post-likes",
  "/services/linkedin-usa-group-members",
  "/services/linkedin-usa-followers",
  "/buy-youtube-watch-hours-india",
  "/tools/youtube-engagement-rate-calculator",
  "/tools/youtube-revenue-calculator",
  "/tools/social-media-growth-budget-calculator",
  "/tools/creator-growth-checklist",
  "/tools/creator-growth-goal-planner",
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
  const uniqueBlogArticles = uniqueArticlesBySlug(blogArticles);
  const blogRoutes = uniqueBlogArticles.map((article) => `/blog/${article.slug}`);
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
      ...internationalHubPaths,
      ...countryServicePaths,
      ...serviceRoutes,
      ...blogRoutes,
      ...caseStudyRoutes,
    ]),
  ];
  const lastModified = new Map<string, string>();
  uniqueBlogArticles.forEach((article) => {
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
