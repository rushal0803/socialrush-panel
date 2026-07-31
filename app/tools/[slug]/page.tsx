import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicShell from "@/components/marketing/PublicShell";
import ToolsContent from "@/components/marketing/tools/ToolsContent";
import { createPageMetadata } from "@/lib/seo/metadata";
import { tools, toolBySlug } from "@/lib/tools/catalog";

export function generateStaticParams() { return tools.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = toolBySlug[params.slug];
  if (!tool) return {};
  return createPageMetadata({ title: tool.title, description: tool.description, path: `/tools/${tool.slug}`, keywords: [...tool.keywords] });
}
export default function ToolPage({ params }: { params: { slug: string } }) {
  const legacySlug = {
    "youtube-thumbnail-preview-title-checker": "youtube-thumbnail-preview",
    "instagram-caption-character-counter": "instagram-caption-counter",
  }[params.slug];
  if (legacySlug) redirect(`/tools/${legacySlug}`);
  const tool = toolBySlug[params.slug];
  if (!tool) notFound();
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: tool.faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  return <PublicShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><ToolsContent activeSlug={params.slug} /></PublicShell>;
}
