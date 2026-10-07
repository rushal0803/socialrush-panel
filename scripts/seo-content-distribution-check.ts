import { readFileSync } from "node:fs";
import { blogArticles } from "../components/marketing/blog/blogData.ts";
import { isValidDate, uniqueArticlesBySlug } from "../lib/blog.ts";
import {
  buildTrackedDistributionUrl,
  distributionChannels,
} from "../lib/marketing/content-distribution.ts";
import { SEO_SITE_URL } from "../lib/seo/metadata.ts";

const failures: string[] = [];

const publishedArticles = uniqueArticlesBySlug(blogArticles).filter(
  (article) => !article.redirectTo && isValidDate(article.publishedAt),
);

if (!publishedArticles.length) {
  failures.push("No published canonical articles are available for distribution.");
}

for (const article of publishedArticles) {
  for (const channel of Object.keys(distributionChannels) as Array<keyof typeof distributionChannels>) {
    const url = new URL(
      buildTrackedDistributionUrl({
        path: `/blog/${article.slug}`,
        channel,
        content: article.slug,
      }),
    );
    const expected = distributionChannels[channel];

    if (url.origin !== SEO_SITE_URL) {
      failures.push(`${article.slug}/${channel}: tracked URL escaped the canonical origin`);
    }
    if (url.pathname !== `/blog/${article.slug}`) {
      failures.push(`${article.slug}/${channel}: tracked URL changed the canonical article path`);
    }
    if (url.searchParams.get("utm_source") !== expected.source) {
      failures.push(`${article.slug}/${channel}: incorrect utm_source`);
    }
    if (url.searchParams.get("utm_medium") !== expected.medium) {
      failures.push(`${article.slug}/${channel}: incorrect utm_medium`);
    }
    if (url.searchParams.get("utm_campaign") !== "content_distribution") {
      failures.push(`${article.slug}/${channel}: incorrect utm_campaign`);
    }
    if (url.searchParams.get("utm_content") !== article.slug) {
      failures.push(`${article.slug}/${channel}: incorrect utm_content`);
    }
  }
}

const feedRoute = readFileSync("app/feed.xml/route.ts", "utf8");
const rootLayout = readFileSync("app/layout.tsx", "utf8");
const articleEnhancements = readFileSync(
  "components/marketing/blog/BlogArticleEnhancements.tsx",
  "utf8",
);
const distributionPage = readFileSync("app/admin/crm/distribution/page.tsx", "utf8");

if (!feedRoute.includes('application/rss+xml; charset=utf-8')) {
  failures.push("RSS route is missing the application/rss+xml content type.");
}
if (!feedRoute.includes("uniqueArticlesBySlug(blogArticles)")) {
  failures.push("RSS route is not sourcing the canonical blog inventory.");
}
if (!feedRoute.includes("!article.redirectTo")) {
  failures.push("RSS route does not exclude redirect-only article aliases.");
}
if (!rootLayout.includes('"application/rss+xml": "/feed.xml"')) {
  failures.push("Root metadata does not advertise /feed.xml.");
}
if (!articleEnhancements.includes("https://wa.me/?text=")) {
  failures.push("Reader share actions are missing WhatsApp.");
}
if (!articleEnhancements.includes("linkedin.com/sharing/share-offsite")) {
  failures.push("Reader share actions are missing LinkedIn.");
}
if (!articleEnhancements.includes("twitter.com/intent/tweet")) {
  failures.push("Reader share actions are missing X/Twitter.");
}
if (!distributionPage.includes("buildTrackedDistributionUrl")) {
  failures.push("Admin distribution queue is not using tracked distribution URLs.");
}
if (!distributionPage.includes("buildDistributionShareUrl")) {
  failures.push("Admin distribution queue is not using channel share composers.");
}
if (/auto.?post|guaranteed reach|guaranteed traffic/i.test(distributionPage)) {
  failures.push("Distribution workspace contains unsupported automation or reach claims.");
}

if (failures.length) {
  console.error("Phase 42 content distribution check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `PASS  ${publishedArticles.length} canonical articles are distribution-ready across ${Object.keys(distributionChannels).length} tracked channels.`,
  );
}
