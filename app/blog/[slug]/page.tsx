import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { articleSlugs, blogArticles, blogRedirects, getArticleBySlug, getBlogPlatform } from "@/components/marketing/blog/blogData";
import BlogArticleEnhancements from "@/components/marketing/blog/BlogArticleEnhancements";
import { formatArticleDate, getArticleWords, getReadingTime, isValidDate, sortArticles } from "@/lib/blog";
import SafeImage from "@/components/SafeImage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import TrackedLink from "@/components/analytics/TrackedLink";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const whatsappUrl =
  "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20social%20media%20growth%20service";
export const dynamicParams = false;

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
      title: article.openGraphTitle || metadata.openGraph?.title,
      description: article.openGraphDescription || metadata.openGraph?.description,
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
  const relatedArticles = sortArticles(blogArticles
    .filter((candidate) => candidate.slug !== article.slug)
    .sort((left, right) => {
      const platformDifference = Number(getBlogPlatform(right) === articlePlatform) - Number(getBlogPlatform(left) === articlePlatform);
      if (platformDifference) return platformDifference;
      return Number(right.category === article.category) - Number(left.category === article.category);
    }))
    .slice(0, 3);
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
    ...(articleAuthor ? { author: { "@type": "Person", name: articleAuthor } } : {}),
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
      <article className="blog-article-page relative px-5 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-6%] top-0 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl" />
          <div className="absolute bottom-10 right-[-8%] h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#111827]">
            <Link href="/" className="transition hover:text-[#FF7A00]">Home</Link>
            <span aria-hidden="true" className="text-[#FF9F00]">/</span>
            <Link href="/blog" className="transition hover:text-[#FF7A00]">Blog</Link>
            <span aria-hidden="true" className="text-[#FF9F00]">/</span>
            <span className="text-[#0B0B0F]">{breadcrumbTitle}</span>
          </nav>
          <Link href="/blog#articles" className="inline-flex rounded-xl border border-[#FFF3E0] bg-white/85 px-4 py-2 text-sm font-semibold text-[#0B0B0F] shadow-[0_8px_22px_rgba(255, 159, 0, .12)] transition hover:-translate-y-0.5">
            Back to Blog
          </Link>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-white/85 bg-white/86 p-4 shadow-[0_20px_48px_rgba(255, 159, 0, .17)] backdrop-blur sm:p-6">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-gradient-to-br from-[#050505] via-[#15110a] to-[#2B1600]">
              <SafeImage
                src={articleImage}
                fallbackSrc={articleImage.replace(/\.(png|jpg|jpeg)$/i, ".webp")}
                alt={article.imageAlt ?? article.title}
                fill
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-contain"
                priority
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#FF9F00]">
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">{article.category}</span>
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">{getReadingTime(article)}</span>
              {articleAuthor ? <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">By {articleAuthor}</span> : null}
              {formatArticleDate(article.publishedAt) ? <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">Published {formatArticleDate(article.publishedAt)}</span> : null}
              {formatArticleDate(article.updatedAt) ? <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">Updated {formatArticleDate(article.updatedAt)}</span> : null}
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-[#0B0B0F] sm:text-4xl">{article.title}</h1>
            <p className="mt-4 text-base leading-8 text-[#111827]">{article.intro}</p>
            <BlogArticleEnhancements toc={tocSections.map((section, index) => ({ id: articleSectionIds[index], label: cleanTocLabel(section.heading) }))} articleUrl={articleUrl} showProgress={articleWordCount > 150} desktopToc={false} />
          </div>

          {article.keyTakeaway ? (
            <aside className="mt-8 rounded-3xl border border-[#FFC400]/45 bg-gradient-to-br from-[#0B0B0F] via-[#151515] to-[#2a1600] p-6 text-white shadow-[0_18px_42px_rgba(255, 122, 0, .24)]">
              <h2 className="text-xl font-extrabold">Key takeaway</h2>
              <p className="mt-3 text-sm leading-7 text-orange-100">{article.keyTakeaway}</p>
            </aside>
          ) : null}

          <nav aria-label="Table of contents" className="mt-8 hidden rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur">
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

          <div id="article-body" className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,760px)_220px]">
          <div className="space-y-8">
            {articleSections.map((section, index) => (
              <section
                key={articleSectionIds[index]}
                id={articleSectionIds[index]}
                className="rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur"
              >
                <h2 className="text-2xl font-extrabold text-[#0B0B0F]">{section.heading}</h2>
                <p className="mt-3 text-[15px] leading-7 text-[#111827]">{section.body}</p>
                <h3 className="mt-5 text-base font-extrabold text-[#0B0B0F]">Practical actions</h3>
                <ul className="mt-4 space-y-2">
                  {(section.tips ?? []).map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm leading-6 text-[#FF9F00]">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF9F00]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div><BlogArticleEnhancements toc={tocSections.map((section, index) => ({ id: articleSectionIds[index], label: cleanTocLabel(section.heading) }))} articleUrl={articleUrl} showProgress={false} mobileToc={false} showShare={false} /></div>

          {articleComparison ? (
            <section
              id="followers-vs-engagement-comparison"
              className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur"
            >
              <h2 className="text-2xl font-extrabold text-[#0B0B0F]">{articleComparison.heading}</h2>
              <p className="mt-3 text-[15px] leading-7 text-[#111827]">{articleComparison.intro}</p>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-[#FFF3E0]">
                <table className="min-w-[720px] divide-y divide-[#FFF3E0] bg-white text-left text-sm">
                  <thead className="bg-[#FFF8F1] text-xs uppercase tracking-[0.08em] text-[#0B0B0F]">
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
                  <tbody className="divide-y divide-[#FFF3E0] text-[#111827]">
                    {articleComparison.rows.map((row) => (
                      <tr key={row.factor}>
                        <th scope="row" className="px-4 py-4 align-top font-extrabold text-[#0B0B0F]">{row.factor}</th>
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
              className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur"
            >
              <h2 className="text-2xl font-extrabold text-[#0B0B0F]">Frequently asked questions</h2>
              <div className="mt-5 space-y-4">
                {articleFaqs.map((faq) => (
                  <details key={faq.question} className="group rounded-2xl border border-[#FFF3E0] bg-[#FFF8F1] p-5">
                    <summary className="cursor-pointer list-none text-base font-bold text-[#0B0B0F]">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-[#111827]">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {articleAuthor ? <section className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur">
            <h2 className="text-xl font-extrabold text-[#0B0B0F]">About the author</h2>
            <p className="mt-3 text-sm leading-7 text-[#111827]">
              {articleAuthor} creates practical SocialRUSH guides about social media growth, platform strategy,
              public-link ordering, campaign planning, and online-branding decisions for creators, businesses, and
              personal brands.
            </p>
          </section> : null}

          {articleRelatedLinks.length ? (
            <nav aria-label="Related SocialRUSH services" className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur">
              <h2 className="text-xl font-extrabold text-[#0B0B0F]">Related resources and next steps</h2>
              <p className="mt-2 text-sm leading-7 text-[#111827]">
                Continue with the guide, platform option, or pricing information most relevant to this strategy.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {articleRelatedLinks.map((item) => (
                  <TrackedLink key={item.href} href={item.href} event={item.href.startsWith("/tools") ? "blog_tool_cta_clicked" : "blog_service_cta_clicked"} metadata={{ article_slug: article.slug, destination: item.href }} className="inline-flex min-h-11 items-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 py-2.5 text-sm font-bold text-[#0B0B0F] transition hover:-translate-y-0.5 hover:border-[#FF9F00]">
                    {item.label}
                  </TrackedLink>
                ))}
              </div>
            </nav>
          ) : null}

          <section className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur">
            <h2 className="text-2xl font-extrabold text-[#0B0B0F]">Related blog articles</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="rounded-2xl border border-[#FFF3E0] bg-[#FFF8F1] p-5 transition hover:-translate-y-1 hover:border-[#FF9F00] hover:shadow-[0_12px_26px_rgba(255, 159, 0, .12)]"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#111827]">{related.category}</span>
                  <h3 className="mt-2 text-base font-extrabold leading-6 text-[#0B0B0F]">{related.title}</h3>
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
