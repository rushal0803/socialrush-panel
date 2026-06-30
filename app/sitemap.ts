import type { MetadataRoute } from "next";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { growthServices } from "@/lib/growth-services";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { seoServiceSlugs } from "@/lib/seo/service-landing-pages";

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
  "/testimonials",
  "/privacy-policy",
  "/refund-policy",
  "/terms-and-conditions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [...new Set([
    ...staticRoutes,
    ...growthServices.map((service) => `/services/${service.slug}`),
    ...activeSmmServices.map((service) => `/services/${service.code}`),
    ...seoServiceSlugs.map((slug) => `/${slug}`),
    "/services/smm-panel-india",
    ...blogArticles.map((article) => `/blog/${article.slug}`),
  ])];

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: now,
    changeFrequency: route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "/" ? 1 : seoServiceSlugs.some((slug) => route === `/${slug}`) ? 0.9 : route.startsWith("/services/") ? 0.85 : 0.7,
  }));
}
