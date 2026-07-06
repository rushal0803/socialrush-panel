import type { MetadataRoute } from "next";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import {
  canonicalIndiaServicePaths,
  indiaServiceSlugs,
} from "@/lib/seo/india-service-pages";

const siteUrl = SEO_SITE_URL;

const staticRoutes = [
  "/",
  "/about",
  "/services",
  "/packages",
  "/pricing",
  "/blog",
  "/faq",
  "/contact",
  "/case-studies",
  "/privacy-policy",
  "/refund-policy",
  "/terms-and-conditions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [...new Set([
    ...staticRoutes,
    ...indiaServiceSlugs.map((slug) => canonicalIndiaServicePaths[slug]),
    ...blogArticles.map((article) => `/blog/${article.slug}`),
  ])];

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: now,
    changeFrequency: route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "/" ? 1 : indiaServiceSlugs.some((slug) => route === canonicalIndiaServicePaths[slug]) ? 0.9 : 0.7,
  }));
}
