import BlogPageContent from "@/components/marketing/blog/BlogPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Guides",
  description:
    "Read practical social media guides for creators and brands, including campaign planning, public-link requirements, content and platform tools.",
  path: "/blog",
  keywords: ["social media growth blog India", "Instagram growth guides India"],
});

export default function BlogPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <BlogPageContent />
    </>
  );
}
