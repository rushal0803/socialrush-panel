import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { articleSlugs, blogArticles, blogRedirects, getArticleBySlug, getBlogPlatform } from "@/components/marketing/blog/blogData";
import BlogArticleEnhancements from "@/components/marketing/blog/BlogArticleEnhancements";
import { ArticleFlowDiagram, ArticleHeroVisual, ArticleSafetyCallout } from "@/components/marketing/blog/ArticleVisuals";
import { formatArticleDate, getArticleWords, getReadingTime, isValidDate } from "@/lib/blog";
import SafeImage from "@/components/SafeImage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import TrackedLink from "@/components/analytics/TrackedLink";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const whatsappUrl =
  "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20social%20media%20growth%20service";
// Keep statically generated articles fast, while allowing a newly published
// data-backed article to resolve if it was not included in a prior prerender
// manifest. Unknown slugs still return `notFound()` below.
export const dynamicParams = true;

function toSectionId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanTocLabel(value: string) {
  return value.replace(/^\s*\d{1,2}[\.)]\s+(?=[A-Za-z])/u, "");
}

function getUniqueSectionIds(sections: Array<{ heading: string }>) {
  const counts = new Map<string, number>();

  return sections.map((section) => {
    const baseId = toSectionId(section.heading) || "section";
    const nextCount = (counts.get(baseId) ?? 0) + 1;
    counts.set(baseId, nextCount);
    return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
  });
}

function getArticleImage(image?: string | null) {
  return image || "/og-image.png";
}

function getArticleSections(article: ReturnType<typeof getArticleBySlug>) {
  return article?.sections?.length ? article.sections : [];
}

export function generateStaticParams() {
  return [...articleSlugs, ...blogRedirects.map((entry) => entry.slug)].map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const redirect = blogRedirects.find((entry) => entry.slug === params.slug);
  if (redirect) return { robots: { index: false, follow: true } };
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: "Blog Article Not Found",
      description: "The requested SocialRUSH blog article could not be found.",
    };
  }

  const metadata = createPageMetadata({
    title: article.metaTitle || article.title || "SocialRUSH Blog",
    description: article.metaDescription || article.description || article.intro || "Read practical SocialRUSH social media growth guidance for creators, brands and businesses.",
    path: `/blog/${article.slug}`,
    keywords: [article.title, article.category, "social media growth India"],
  });
  const articleImage = getArticleImage(article.image);
  const articleImageUrl = new URL(articleImage, SEO_SITE_URL).toString();

  return {
    ...metadata,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      title: article.openGraphTitle || metadata.openGraph?.title,
      description: article.openGraphDescription || metadata.openGraph?.description,
      publishedTime: isValidDate(article.publishedAt) ? article.publishedAt : undefined,
      modifiedTime: isValidDate(article.updatedAt) ? article.updatedAt : undefined,
      images: [
        {
          url: articleImageUrl,
          width: 1200,
          height: 800,
          alt: article.imageAlt ?? article.title,
        },
      ],
    },
    twitter: {
      ...metadata.twitter,
      title: article.openGraphTitle || metadata.twitter?.title,
      description: article.openGraphDescription || metadata.twitter?.description,
      images: [articleImageUrl],
    },
  };
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const redirect = blogRedirects.find((entry) => entry.slug === params.slug);
  if (redirect) permanentRedirect(redirect.destination);
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const articleUrl = new URL(`/blog/${article.slug}`, SEO_SITE_URL).toString();
  const articleImage = getArticleImage(article.image);
  const articleAuthor = article.author;
  const breadcrumbTitle = article.breadcrumbTitle ?? article.title;
  const articleSections = getArticleSections(article);
  const articleSectionIds = getUniqueSectionIds(articleSections);
  const tocSections = articleSections;
  const articleFaqs = article.faqs ?? [];
  const articleRelatedLinks = article.relatedLinks ?? [];
  const articleComparison = article.comparison;
  const articleWordCount = getArticleWords(article);
  const articlePlatform = getBlogPlatform(article);
  const relatedArticles = blogArticles
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => ({
      candidate,
      score:
        Number(getBlogPlatform(candidate) === articlePlatform) * 4 +
        Number(candidate.category === article.category) * 2 +
        Number((candidate.relatedLinks ?? []).some((link) => link.href === `/blog/${article.slug}`)),
    }))
    .sort((left, right) => right.score - left.score || Date.parse(right.candidate.publishedAt ?? "0") - Date.parse(left.candidate.publishedAt ?? "0"))
    .slice(0, 3)
    .map(({ candidate }) => candidate);
  const showToc = articleSections.length >= 4 || articleWordCount >= 900;
  const isUpiGuide = article.slug === "instagram-followers-upi-payment-guide-india";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    url: articleUrl,
    image: [new URL(articleImage, SEO_SITE_URL).toString()],
    ...(isValidDate(article.publishedAt) ? { datePublished: article.publishedAt } : {}),
    ...(isValidDate(article.updatedAt) ? { dateModified: article.updatedAt } : {}),
    articleSection: article.category,
    wordCount: articleWordCount,
    inLanguage: "en-IN",
    ...(articleAuthor
      ? { author: { "@type": articleAuthor === "SocialRUSH Editorial Team" ? "Organization" : "Person", name: articleAuthor } }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "SocialRUSH",
      logo: {
        "@type": "ImageObject",
        url: new URL("/images/brand/socialrush-logo-transparent.png", SEO_SITE_URL).toString(),
      },
    },
  };
  const faqSchema = articleFaqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: articleFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <BlogShell>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: article.category, path: "/blog" },
          { name: breadcrumbTitle, path: `/blog/${article.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <article className="blog-article-page relative bg-[#07080D] px-5 pb-24 pt-8 text-white sm:px-6 lg:px-8 lg:pt-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-6%] top-0 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl" />
          <div className="absolute bottom-10 right-[-8%] h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-300">
            <Link href="/" className="transition hover:text-[#FF7A00]">Home</Link>
            <span aria-hidden="true" className="text-[#FF9F00]">/</span>
            <Link href="/blog" className="transition hover:text-[#FF7A00]">Blog</Link>
            <span aria-hidden="true" className="text-[#FF9F00]">/</span>
            <span className="text-slate-400">{article.category}</span>
            <span aria-hidden="true" className="text-[#FF9F00]">/</span>
            <span className="text-white">{breadcrumbTitle}</span>
          </nav>
          <Link href="/blog#guides" className="inline-flex rounded-xl border border-white/15 bg-white/[.04] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-orange-400/50">
            Back to Blog
          </Link>

          <header className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-[#0E121B] p-5 shadow-[0_20px_48px_rgba(0,0,0,.25)] sm:p-8">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-orange-200">
                <span className="rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1.5">{article.category}</span>
                <span>{getReadingTime(article)}</span>
                {articleAuthor ? <span>By {articleAuthor}</span> : null}
                {formatArticleDate(article.publishedAt) ? <span>Published {formatArticleDate(article.publishedAt)}</span> : null}
                {formatArticleDate(article.updatedAt) ? <span>Updated {formatArticleDate(article.updatedAt)}</span> : null}
              </div>
              <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{article.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">{article.intro}</p>
            </div>
            <div className="mt-7 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
              <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-[#090B12]">
                <SafeImage
                  src={articleImage}
                  fallbackSrc={articleImage.replace(/\.(png|jpg|jpeg)$/i, ".webp")}
                  alt={article.imageAlt ?? article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                  priority
                />
              </div>
              <ArticleHeroVisual category={article.category} title={article.title} variant="inline" />
            </div>

            {showToc ? <BlogArticleEnhancements toc={tocSections.map((section, index) => ({ id: articleSectionIds[index], label: cleanTocLabel(section.heading) }))} articleUrl={articleUrl} showProgress desktopToc={false} /> : null}
          </header>

          {article.keyTakeaway ? (
            <aside className="mt-8 rounded-3xl border border-[#FFC400]/45 bg-gradient-to-br from-[#0B0B0F] via-[#151515] to-[#2a1600] p-6 text-white shadow-[0_18px_42px_rgba(255, 122, 0, .24)]">
              <h2 className="text-xl font-extrabold">Key takeaway</h2>
              <p className="mt-3 text-sm leading-7 text-orange-100">{article.keyTakeaway}</p>
            </aside>
          ) : null}

          <nav aria-label="Table of contents" className="mt-8 hidden">
            <h2 className="text-xl font-extrabold text-[#0B0B0F]">Table of contents</h2>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {tocSections.map((section, index) => (
                <li key={`${articleSectionIds[index]}-toc`}>
                  <a
                    href={`#${articleSectionIds[index]}`}
                    className="inline-flex text-sm font-semibold leading-6 text-[#FF9F00] transition hover:text-[#FF7A00]"
                  >
                    {cleanTocLabel(section.heading)}
                  </a>
                </li>
              ))}
              {articleSections.length > tocSections.length ? (
                <li className="text-sm font-semibold leading-6 text-[#111827]">
                  More detailed sections continue in the full guide below.
                </li>
              ) : null}
              {articleComparison ? (
                <li>
                  <a href="#followers-vs-engagement-comparison" className="inline-flex text-sm font-semibold leading-6 text-[#FF9F00] transition hover:text-[#FF7A00]">
                    {cleanTocLabel(articleComparison.heading)}
                  </a>
                </li>
              ) : null}
              {article.faqs?.length ? (
                <li>
                  <a href="#frequently-asked-questions" className="inline-flex text-sm font-semibold leading-6 text-[#FF9F00] transition hover:text-[#FF7A00]">
                    Frequently asked questions
                  </a>
                </li>
              ) : null}
            </ol>
          </nav>

          <div id="article-body" className="mx-auto mt-8 grid max-w-[1040px] gap-8 lg:grid-cols-[minmax(0,760px)_220px]">
          <div className="space-y-6">
            {articleSections.map((section, index) => (
              <section
                key={articleSectionIds[index]}
                id={articleSectionIds[index]}
                className="scroll-mt-28 rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-[0_14px_34px_rgba(0,0,0,.2)] sm:p-7"
              >
                <h2 className="text-2xl font-extrabold text-white">{section.heading}</h2>
                <p className="mt-4 text-[16px] leading-8 text-slate-300">{section.body}</p>
                {section.contextualLink ? (
                  <p className="mt-4 text-[16px] leading-8 text-slate-300">
                    {section.contextualLink.prefix} <Link href={section.contextualLink.href} className="font-semibold text-[#FF7A00] underline decoration-[#FF9F00]/50 underline-offset-4 transition hover:text-[#D96500]">{section.contextualLink.label}</Link>{section.contextualLink.suffix ?? ""}
                  </p>
                ) : null}
                {(index === 0 || (isUpiGuide && index === 3)) ? <ArticleFlowDiagram category={article.category} title={article.title} /> : null}
                {isUpiGuide && index === 2 ? <ArticleSafetyCallout /> : null}
                {section.tips?.length ? <h3 className="mt-6 text-base font-extrabold text-white">Practical actions</h3> : null}
                <ul className="mt-4 space-y-2">
                  {(section.tips ?? []).map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm leading-6 text-slate-300">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF9F00]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>{showToc ? <BlogArticleEnhancements toc={tocSections.map((section, index) => ({ id: articleSectionIds[index], label: cleanTocLabel(section.heading) }))} articleUrl={articleUrl} showProgress={false} mobileToc={false} showShare={false} /> : null}</div>

          {articleComparison ? (
            <section
              id="followers-vs-engagement-comparison"
              className="mt-8 rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-[0_14px_34px_rgba(0,0,0,.2)]"
            >
              <h2 className="text-2xl font-extrabold text-white">{articleComparison.heading}</h2>
              <p className="mt-3 text-[15px] leading-7 text-slate-300">{articleComparison.intro}</p>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-[#FFF3E0]">
                <table className="min-w-[720px] divide-y divide-white/10 bg-[#101520] text-left text-sm text-slate-300">
                  <thead className="bg-white/[.05] text-xs uppercase tracking-[0.08em] text-white">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-extrabold">Factor</th>
                      <th scope="col" className="px-4 py-3 font-extrabold">
                        {articleComparison.leftLabel ?? "Followers"}
                      </th>
                      <th scope="col" className="px-4 py-3 font-extrabold">
                        {articleComparison.rightLabel ?? "Engagement"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {articleComparison.rows.map((row) => (
                      <tr key={row.factor}>
                        <th scope="row" className="px-4 py-4 align-top font-extrabold text-white">{row.factor}</th>
                        <td className="px-4 py-4 align-top leading-6">{row.followers}</td>
                        <td className="px-4 py-4 align-top leading-6">{row.engagement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {articleFaqs.length ? (
            <section
              id="frequently-asked-questions"
              className="mt-8 rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-[0_14px_34px_rgba(0,0,0,.2)]"
            >
              <h2 className="text-2xl font-extrabold text-white">Frequently asked questions</h2>
              <div className="mt-5 space-y-4">
                {articleFaqs.map((faq) => (
                  <details key={faq.question} className="group rounded-2xl border border-white/10 bg-white/[.03] p-5">
                    <summary className="cursor-pointer list-none text-base font-bold text-white">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {articleAuthor ? <section className="mt-8 rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-[0_14px_34px_rgba(0,0,0,.2)]">
            <h2 className="text-xl font-extrabold text-white">About the author</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {articleAuthor} creates practical SocialRUSH guides about social media growth, platform strategy,
              public-link ordering, campaign planning, and online-branding decisions for creators, businesses, and
              personal brands.
            </p>
          </section> : null}

          {articleRelatedLinks.length ? (
            <nav aria-label="Related SocialRUSH services" className="mt-8 rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-[0_14px_34px_rgba(0,0,0,.2)]">
              <h2 className="text-xl font-extrabold text-white">Related resources and next steps</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Continue with the guide, platform option, or pricing information most relevant to this strategy.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {articleRelatedLinks.map((item) => (
                  <TrackedLink key={item.href} href={item.href} event={item.href.startsWith("/tools") ? "blog_tool_cta_clicked" : "blog_service_cta_clicked"} metadata={{ article_slug: article.slug, destination: item.href }} className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-orange-400/60">
                    {item.label}
                  </TrackedLink>
                ))}
              </div>
            </nav>
          ) : null}

          <section className="mt-8 rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-[0_14px_34px_rgba(0,0,0,.2)]">
            <h2 className="text-2xl font-extrabold text-white">Related blog articles</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="rounded-2xl border border-white/10 bg-white/[.03] p-5 transition hover:-translate-y-1 hover:border-orange-400/60 hover:shadow-[0_12px_26px_rgba(0,0,0,.2)]"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-orange-200">{related.category}</span>
                  <h3 className="mt-2 text-base font-extrabold leading-6 text-white">{related.title}</h3>
                  <span className="mt-3 inline-flex text-sm font-bold text-[#FF7A00]">Read article →</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-[30px] border border-white/85 bg-gradient-to-r from-[#0B0B0F] via-[#0B0B0F] to-[#FF9F00] px-6 py-8 text-white shadow-[0_24px_52px_rgba(255, 159, 0, .38)] sm:px-8">
            <h2 className="text-3xl font-black leading-tight">Ready to launch your next growth campaign?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-orange-100">
              Turn these strategies into action with campaign support, transparent progress tracking, and expert guidance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login?next=/dashboard/new-order"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#0B0B0F] transition hover:-translate-y-0.5"
              >
                Start Order
              </Link>
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                View Packages
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Chat on WhatsApp
              </a>
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </article>
    </BlogShell>
  );
}
