import { blogArticles, getBlogPlatform } from "@/components/marketing/blog/blogData";
import { getArticleWords, isValidDate, uniqueArticlesBySlug } from "@/lib/blog";
import { contentClusters, type ContentPlatform } from "@/lib/seo/content-clusters";
import { instagramContentGapCandidates } from "@/lib/seo/instagram-content-gap";
import { linkedInContentGapCandidates } from "@/lib/seo/linkedin-content-gap";

const REVIEW_AFTER_DAYS = 120;

export type ContentEngineArticleStatus = "healthy" | "review" | "action";

export type ContentEngineArticle = {
  slug: string;
  path: string;
  title: string;
  category: string;
  platform: ContentPlatform | null;
  wordCount: number;
  publishedAt: string | null;
  updatedAt: string | null;
  ageDays: number | null;
  hasHubLink: boolean;
  hasServiceLink: boolean;
  hasFaqs: boolean;
  metadataReady: boolean;
  status: ContentEngineArticleStatus;
  action: string;
};

export type ContentClusterHealth = {
  platform: ContentPlatform;
  label: string;
  hubPath: string;
  guideCount: number;
  publishedGuides: number;
  missingGuides: string[];
  serviceCount: number;
};

export type ContentGapPlan = {
  source: "Instagram" | "LinkedIn";
  id: string;
  queryTheme: string;
  decision: "implement" | "defer" | "covered";
  primaryTarget: string;
  targetExists: boolean;
  cannibalizationRisk: "low" | "medium" | "high";
  reason: string;
};

export type SeoContentEngineSnapshot = {
  generatedAt: string;
  editorialReviewWindowDays: number;
  articles: ContentEngineArticle[];
  clusters: ContentClusterHealth[];
  gapPlans: ContentGapPlan[];
  summary: {
    articles: number;
    healthy: number;
    review: number;
    action: number;
    platformArticles: number;
    clusterGuideCoverage: number;
    plannedImplementationsMissing: number;
  };
  note: string;
};

function articleSlugFromBlogPath(path: string) {
  const match = path.match(/^\/blog\/([^/?#]+)$/);
  return match?.[1] ?? null;
}

function ageInDays(value: string | undefined, now: Date) {
  if (!isValidDate(value)) return null;
  return Math.max(0, Math.floor((now.getTime() - Date.parse(value as string)) / 86_400_000));
}

function buildGapPlans(articlePaths: Set<string>): ContentGapPlan[] {
  const sources = [
    ...instagramContentGapCandidates.map((candidate) => ({ source: "Instagram" as const, candidate })),
    ...linkedInContentGapCandidates.map((candidate) => ({ source: "LinkedIn" as const, candidate })),
  ];

  return sources.map(({ source, candidate }) => ({
    source,
    id: candidate.id,
    queryTheme: candidate.queryTheme,
    decision: candidate.decision,
    primaryTarget: candidate.primaryTarget,
    targetExists: candidate.primaryTarget.startsWith("/blog/")
      ? articlePaths.has(candidate.primaryTarget)
      : true,
    cannibalizationRisk: candidate.cannibalizationRisk,
    reason: candidate.reason,
  }));
}

export function buildSeoContentEngineSnapshot(now = new Date()): SeoContentEngineSnapshot {
  const uniqueArticles = uniqueArticlesBySlug(blogArticles);
  const articlePaths = new Set(uniqueArticles.map((article) => `/blog/${article.slug}`));

  const articles: ContentEngineArticle[] = uniqueArticles.map((article) => {
    const platform = getBlogPlatform(article);
    const cluster = platform ? contentClusters[platform] : null;
    const related = new Set((article.relatedLinks ?? []).map((link) => link.href));
    const hasHubLink = cluster ? related.has(cluster.hubPath) : true;
    const hasServiceLink = cluster
      ? cluster.serviceLinks.some((link) => related.has(link.href))
      : true;
    const metadataReady = Boolean(
      article.title.trim() &&
      article.description.trim() &&
      article.intro.trim() &&
      article.sections.length > 0 &&
      isValidDate(article.publishedAt) &&
      isValidDate(article.updatedAt),
    );
    const ageDays = ageInDays(article.updatedAt, now);
    const futureDate =
      (isValidDate(article.publishedAt) && Date.parse(article.publishedAt as string) > now.getTime()) ||
      (isValidDate(article.updatedAt) && Date.parse(article.updatedAt as string) > now.getTime());

    let status: ContentEngineArticleStatus = "healthy";
    let action = "No editorial action required";

    if (!metadataReady) {
      status = "action";
      action = "Complete missing editorial metadata or dates";
    } else if (futureDate) {
      status = "action";
      action = "Review future-dated publish/update metadata";
    } else if (!hasHubLink || !hasServiceLink) {
      status = "action";
      action = !hasHubLink
        ? "Add a relevant platform hub link"
        : "Add a relevant canonical service link";
    } else if (ageDays !== null && ageDays >= REVIEW_AFTER_DAYS) {
      status = "review";
      action = `Editorial freshness review due (${ageDays} days since update)`;
    }

    return {
      slug: article.slug,
      path: `/blog/${article.slug}`,
      title: article.title,
      category: article.category,
      platform,
      wordCount: getArticleWords(article),
      publishedAt: article.publishedAt ?? null,
      updatedAt: article.updatedAt ?? null,
      ageDays,
      hasHubLink,
      hasServiceLink,
      hasFaqs: Boolean(article.faqs?.length),
      metadataReady,
      status,
      action,
    };
  });

  const clusters: ContentClusterHealth[] = Object.values(contentClusters).map((cluster) => {
    const guidePaths = cluster.guideLinks
      .map((guide) => guide.href)
      .filter((href) => href.startsWith("/blog/"));
    const missingGuides = guidePaths.filter((path) => {
      const slug = articleSlugFromBlogPath(path);
      return !slug || !articlePaths.has(path);
    });

    return {
      platform: cluster.platform,
      label: cluster.label,
      hubPath: cluster.hubPath,
      guideCount: guidePaths.length,
      publishedGuides: guidePaths.length - missingGuides.length,
      missingGuides,
      serviceCount: cluster.serviceLinks.length,
    };
  });

  const gapPlans = buildGapPlans(articlePaths);
  const totalClusterGuides = clusters.reduce((sum, cluster) => sum + cluster.guideCount, 0);
  const publishedClusterGuides = clusters.reduce((sum, cluster) => sum + cluster.publishedGuides, 0);

  return {
    generatedAt: now.toISOString(),
    editorialReviewWindowDays: REVIEW_AFTER_DAYS,
    articles,
    clusters,
    gapPlans,
    summary: {
      articles: articles.length,
      healthy: articles.filter((article) => article.status === "healthy").length,
      review: articles.filter((article) => article.status === "review").length,
      action: articles.filter((article) => article.status === "action").length,
      platformArticles: articles.filter((article) => article.platform !== null).length,
      clusterGuideCoverage: totalClusterGuides
        ? Math.round((publishedClusterGuides / totalClusterGuides) * 100)
        : 100,
      plannedImplementationsMissing: gapPlans.filter(
        (plan) => plan.decision === "implement" && !plan.targetExists,
      ).length,
    },
    note:
      "This engine uses repository content, cluster links and editorial dates. It does not claim Google rankings, impressions, clicks or search volume without Search Console or another verified data source.",
  };
}
