"use client";

import { usePathname } from "next/navigation";
import ArticleRevenueBridge from "@/components/marketing/blog/ArticleRevenueBridge";
import { contentClusters, type ContentPlatform } from "@/lib/seo/content-clusters";

const platformSignals: Array<[ContentPlatform, string[]]> = [
  ["instagram", ["instagram"]],
  ["youtube", ["youtube"]],
  ["linkedin", ["linkedin"]],
  ["twitter", ["twitter", "x-growth"]],
  ["facebook", ["facebook"]],
  ["tiktok", ["tiktok"]],
];

function inferPlatform(slug: string): ContentPlatform | null {
  for (const [platform, signals] of platformSignals) {
    if (signals.some((signal) => slug.includes(signal))) return platform;
  }
  return null;
}

export default function BlogRevenueBridge() {
  const pathname = usePathname();
  if (!pathname.startsWith("/blog/")) return null;

  const articleSlug = pathname.slice("/blog/".length).split("/")[0] ?? "";
  if (!articleSlug) return null;

  const platform = inferPlatform(articleSlug);
  if (!platform) return null;

  return (
    <div className="bg-[#07080D] px-5 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <ArticleRevenueBridge articleSlug={articleSlug} cluster={contentClusters[platform]} />
      </div>
    </div>
  );
}
