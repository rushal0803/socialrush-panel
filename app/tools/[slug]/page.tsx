import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import PublicShell from "@/components/marketing/PublicShell";
import ToolsContent from "@/components/marketing/tools/ToolsContent";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";
import { tools, toolBySlug } from "@/lib/tools/catalog";

type RelatedServiceGuide = {
  heading: string;
  explanation: string;
  links: readonly { label: string; href: string }[];
};

const relatedServiceGuides: Record<string, RelatedServiceGuide> = {
  "youtube-watch-time-calculator": {
    heading: "Watch-time planning vs YouTube service requirements",
    explanation: "This calculator estimates hours from your own inputs; the result is not an official YouTube Analytics value or proof of eligible public watch hours. YouTube independently decides Partner Program eligibility. Review video-link and delivery requirements before comparing any service.",
    links: [
      { label: "Review YouTube watch-hours requirements", href: "/buy-youtube-watch-hours-india" },
      { label: "Compare YouTube views", href: "/youtube-views" },
    ],
  },
  "instagram-engagement-rate-calculator": {
    heading: "Compare comments, saves and shares separately",
    explanation: "This calculator measures engagement from the values you enter. Comments, saves and shares are different interactions, and paid activity does not guarantee organic reach, authentic audience interest or follower growth. Check public post or Reel eligibility and live terms before ordering.",
    links: [
      { label: "Instagram comments for posts and Reels", href: "/buy-instagram-comments-india" },
      { label: "Instagram saves for public posts", href: "/buy-instagram-saves-india" },
      { label: "Instagram shares for public posts", href: "/buy-instagram-shares-india" },
    ],
  },
};

export function generateStaticParams() { return tools.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params: paramsPromise }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await paramsPromise;
  const tool = toolBySlug[params.slug];
  if (!tool) return {};
  return createPageMetadata({ title: tool.title, description: tool.description, path: `/tools/${tool.slug}`, keywords: tool.slug === "youtube-thumbnail-preview" ? [...tool.keywords, "YouTube thumbnail preview tool", "YouTube video title checker", "preview YouTube thumbnail"] : [...tool.keywords] });
}
export default async function ToolPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = await paramsPromise;
  // Preserve the historical planner URL without creating a duplicate tool page.
  if (params.slug === "social-media-growth-goal-planner") {
    permanentRedirect("/tools/creator-growth-goal-planner");
  }
  const legacySlug = {
    "youtube-thumbnail-preview-title-checker": "youtube-thumbnail-preview",
    "instagram-caption-character-counter": "instagram-caption-counter",
  }[params.slug];
  if (legacySlug) redirect(`/tools/${legacySlug}`);
  const tool = toolBySlug[params.slug];
  if (!tool) notFound();
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "WebApplication", name: tool.title, applicationCategory: "CreatorApplication", operatingSystem: "Web", description: tool.description, url: `${SEO_SITE_URL}/tools/${tool.slug}` }, { "@type": "FAQPage", mainEntity: tool.faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }] };
  const serviceGuide = relatedServiceGuides[tool.slug];
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <ToolsContent activeSlug={params.slug} />
    {serviceGuide && (
      <section aria-labelledby="related-service-guidance" className="bg-[#10151e] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-orange-300">Understand the difference</p>
          <h2 id="related-service-guidance" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{serviceGuide.heading}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{serviceGuide.explanation}</p>
          <nav aria-label="Related service requirements" className="mt-6 flex flex-wrap gap-3">
            {serviceGuide.links.map(({ label, href }) => (
              <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-xl border border-orange-300/30 px-4 py-2 text-sm font-semibold text-orange-200 underline-offset-4 hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    )}
  </PublicShell>;
}
