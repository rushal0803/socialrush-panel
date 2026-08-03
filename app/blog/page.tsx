import BlogPageContent from "@/components/marketing/blog/BlogPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { getManagedPublishedArticles } from "@/lib/managed-blog";

export const metadata = createPageMetadata({
  title: "Social Media Growth Blog India",
  description:
    "Read practical guides about Instagram growth, YouTube views and subscribers, LinkedIn followers, Twitter growth and social media campaign planning in India.",
  path: "/blog",
  keywords: ["social media growth blog India", "Instagram growth guides India"],
});

export default async function BlogPage() {
  const managed = await getManagedPublishedArticles().catch(() => []);
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <BlogPageContent articles={[...managed, ...blogArticles.filter((legacy) => !managed.some((item) => item.slug === legacy.slug))]} />
    </>
  );
}
