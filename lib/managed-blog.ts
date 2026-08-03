import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogArticle } from "@/components/marketing/blog/blogData";

export type ArticleBlock = { type: "paragraph" | "heading" | "bullet_list" | "quote" | "tip" | "important" | "warning" | "example" | "checklist"; text: string; items?: string[] };
type Row = { id: string; slug: string; title: string; description: string; category: string; status: string; featured: boolean; author_name: string | null; hero_image_url: string | null; hero_image_alt: string | null; content: ArticleBlock[]; faq_items: { question: string; answer: string }[]; related_slugs: string[]; seo_title: string | null; seo_description: string | null; published_at: string | null; updated_at: string; redirect_to: string | null };

export function managedToArticle(row: Row): BlogArticle {
  const sections = (row.content || []).filter((b) => b.type === "heading" || b.type === "paragraph").reduce<{ heading: string; body: string; tips: string[] }[]>((out, block) => {
    if (block.type === "heading") out.push({ heading: block.text, body: "", tips: [] });
    else if (out.length) out[out.length - 1].body += `${out[out.length - 1].body ? "\n\n" : ""}${block.text}`;
    return out;
  }, []);
  const intro = (row.content || []).find((b) => b.type === "paragraph")?.text || row.description;
  return { slug: row.slug, title: row.title, description: row.description, category: row.category, image: row.hero_image_url || "/og-image.png", imageAlt: row.hero_image_alt || row.title, intro, sections: sections.length ? sections : [{ heading: "Overview", body: intro, tips: [] }], faqs: row.faq_items || [], relatedLinks: (row.related_slugs || []).map((slug) => ({ label: "Related article", href: `/blog/${slug}` })), metaTitle: row.seo_title || undefined, metaDescription: row.seo_description || undefined, author: row.author_name || undefined, featured: row.featured, publishedAt: row.published_at || undefined, updatedAt: row.updated_at, readingTime: "1 min read", redirectTo: row.redirect_to || undefined };
}

export const getManagedPublishedArticles = unstable_cache(async () => {
  const { data } = await createAdminClient().from("blog_articles").select("id,slug,title,description,category,status,featured,author_name,hero_image_url,hero_image_alt,content,faq_items,related_slugs,seo_title,seo_description,published_at,updated_at,redirect_to").eq("status", "published").order("published_at", { ascending: false });
  return ((data || []) as Row[]).map(managedToArticle);
}, ["managed-published-blog"], { revalidate: 300, tags: ["managed-blog"] });

export async function getManagedArticle(slug: string) {
  const { data } = await createAdminClient().from("blog_articles").select("id,slug,title,description,category,status,featured,author_name,hero_image_url,hero_image_alt,content,faq_items,related_slugs,seo_title,seo_description,published_at,updated_at,redirect_to").eq("slug", slug).in("status", ["published", "redirect"]).maybeSingle();
  return data ? managedToArticle(data as Row) : null;
}
