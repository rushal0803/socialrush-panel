import { blogArticles } from "@/components/marketing/blog/blogData";
import { isValidDate, sortArticles, uniqueArticlesBySlug } from "@/lib/blog";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

const FEED_PATH = "/feed.xml";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const articles = sortArticles(
    uniqueArticlesBySlug(blogArticles).filter(
      (article) => !article.redirectTo && isValidDate(article.publishedAt),
    ),
  );

  const latestDate = articles
    .map((article) => article.updatedAt || article.publishedAt)
    .filter((value): value is string => isValidDate(value))
    .map((value) => Date.parse(value))
    .sort((a, b) => b - a)[0];

  const items = articles
    .map((article) => {
      const url = new URL(`/blog/${article.slug}`, SEO_SITE_URL).toString();
      const publishedAt = new Date(article.publishedAt as string).toUTCString();
      return [
        "<item>",
        `<title>${escapeXml(article.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<description>${escapeXml(article.description)}</description>`,
        `<pubDate>${publishedAt}</pubDate>`,
        `<category>${escapeXml(article.category)}</category>`,
        "</item>",
      ].join("");
    })
    .join("");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    "<title>SocialRUSH Growth Library</title>",
    `<link>${SEO_SITE_URL}/blog</link>`,
    "<description>Practical SocialRUSH guides on social media growth, pricing, safety and campaign planning.</description>",
    '<language>en-IN</language>',
    `<atom:link href="${SEO_SITE_URL}${FEED_PATH}" rel="self" type="application/rss+xml" />`,
    latestDate ? `<lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>` : "",
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(body, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
