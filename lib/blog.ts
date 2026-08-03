import type { BlogArticle } from "@/components/marketing/blog/blogData";

const WORDS_PER_MINUTE = 220;

export function isValidDate(value?: string) {
  return Boolean(value && !Number.isNaN(Date.parse(value)));
}

export function formatArticleDate(value?: string) {
  return isValidDate(value) ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value as string)) : null;
}

export function getArticleWords(article: Pick<BlogArticle, "intro" | "keyTakeaway" | "sections" | "comparison" | "faqs">) {
  return [
    article.intro, article.keyTakeaway,
    ...article.sections.flatMap((section) => [section.heading, section.body, ...(section.tips ?? [])]),
    article.comparison?.heading, article.comparison?.intro,
    ...(article.comparison?.rows.flatMap((row) => [row.factor, row.followers, row.engagement]) ?? []),
    ...(article.faqs?.flatMap((faq) => [faq.question, faq.answer]) ?? []),
  ].filter(Boolean).join(" ").trim().split(/\s+/).filter(Boolean).length;
}

export function getReadingTime(article: Parameters<typeof getArticleWords>[0]) {
  return `${Math.max(1, Math.ceil(getArticleWords(article) / WORDS_PER_MINUTE))} min read`;
}

export function sortArticles<T extends Pick<BlogArticle, "publishedAt" | "updatedAt">>(articles: T[]) {
  return [...articles].sort((left, right) => {
    const leftPublished = isValidDate(left.publishedAt) ? Date.parse(left.publishedAt as string) : -Infinity;
    const rightPublished = isValidDate(right.publishedAt) ? Date.parse(right.publishedAt as string) : -Infinity;
    if (rightPublished !== leftPublished) return rightPublished - leftPublished;
    const leftUpdated = isValidDate(left.updatedAt) ? Date.parse(left.updatedAt as string) : -Infinity;
    const rightUpdated = isValidDate(right.updatedAt) ? Date.parse(right.updatedAt as string) : -Infinity;
    return rightUpdated - leftUpdated;
  });
}

export function getSearchText(article: BlogArticle) {
  return [article.title, article.description, article.category, article.intro, ...article.sections.flatMap((section) => [section.heading, section.body, ...section.tips]), ...(article.faqs?.flatMap((faq) => [faq.question, faq.answer]) ?? [])].join(" ").toLowerCase();
}
