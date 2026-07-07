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
  "/privacy-policy",
  "/refund-policy",
  "/terms-and-conditions",
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

export function GET() {
  const now = new Date().toISOString();
  const serviceRoutes = indiaServiceSlugs.map((slug) => canonicalIndiaServicePaths[slug]);
  const blogRoutes = blogArticles.map((article) => `/blog/${article.slug}`);
  const routes = [...new Set([...publicRoutes, ...serviceRoutes, ...blogRoutes])];

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
