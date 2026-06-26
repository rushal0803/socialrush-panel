import type { MetadataRoute } from "next";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { growthServices } from "@/lib/growth-services";
import { activeSmmServices } from "@/lib/smm-service-catalog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://socialrush.in";

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
  "/support",
  "/privacy-policy",
  "/refund-policy",
  "/terms-and-conditions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    ...staticRoutes,
    ...growthServices.map((service) => `/services/${service.slug}`),
    ...activeSmmServices.map((service) => `/services/${service.code}`),
    "/services/smm-panel-india",
    ...blogArticles.map((article) => `/blog/${article.slug}`),
  ];

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: now,
    changeFrequency: route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/services/") ? 0.85 : 0.7,
  }));
}