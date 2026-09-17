"use client";

import { usePathname } from "next/navigation";
import ArticleRevenueBridge from "@/components/marketing/blog/ArticleRevenueBridge";
import { blogArticles, getBlogPlatform } from "@/components/marketing/blog/blogData";
import { getContentCluster } from "@/lib/seo/content-clusters";

export default function BlogRevenueBridge() {
  const pathname = usePathname();
  if (!pathname.startsWith("/blog/")) return null;

  const articleSlug = pathname.slice("/blog/".length).split("/")[0] ?? "";
  if (!articleSlug) return null;

  const article = blogArticles.find((candidate) => candidate.slug === articleSlug);
  if (!article) return null;

  const cluster = getContentCluster(getBlogPlatform(article));
  if (!cluster) return null;

  return (
    <div className="bg-[#07080D] px-5 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <ArticleRevenueBridge articleSlug={articleSlug} cluster={cluster} />
      </div>
    </div>
  );
}
