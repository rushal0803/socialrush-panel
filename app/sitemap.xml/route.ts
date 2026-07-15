import { NextResponse } from "next/server";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import {
  canonicalIndiaServicePaths,
  indiaServiceSlugs,
} from "@/lib/seo/india-service-pages";

export const dynamic = "force-static";

const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/packages",
  "/blog",
  "/contact",
  "/faq",
  "/case-studies",
  "/testimonials",
  "/privacy-policy",
  "/refund-policy",
  "/terms-and-conditions",
] as const;

const canonicalServiceDetailRoutes = [
  "/services/facebook-views",
  "/services/facebook-shares",
  "/services/tiktok-likes",
  "/services/tiktok-views",
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

export function GET() {
  const now = new Date().toISOString();
  const serviceRoutes = indiaServiceSlugs.map(sitemapServicePath);
  const blogRoutes = blogArticles.map((article) => `/blog/${article.slug}`);
  const routes = [
    ...new Set([
      ...publicRoutes,
      ...serviceRoutes,
      ...canonicalServiceDetailRoutes,
      ...blogRoutes,
    ]),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    const isHome = route === "/";
    const isBlogArticle = route.startsWith("/blog/");
    const isServicePage = serviceRoutes.includes(route);
    const changefreq = isBlogArticle ? "weekly" : "monthly";
    const priority = isHome ? "1.0" : isServicePage ? "0.9" : route === "/blog" ? "0.8" : "0.7";

    return `  <url>
    <loc>${escapeXml(absoluteUrl(route))}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
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
