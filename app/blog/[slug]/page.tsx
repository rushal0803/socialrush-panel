import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { articleSlugs, blogArticles, getArticleBySlug } from "@/components/marketing/blog/blogData";
import SafeImage from "@/components/SafeImage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const whatsappUrl =
  "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20social%20media%20growth%20service";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

function toSectionId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function countArticleWords(parts: string[]) {
  return parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

function getArticleImage(image?: string | null) {
  return image || "/og-image.png";
}

function getArticleSections(article: ReturnType<typeof getArticleBySlug>) {
  return article?.sections?.length ? article.sections : [];
}

export function generateStaticParams() {
  return articleSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: "Blog Article Not Found",
      description: "The requested SocialRUSH blog article could not be found.",
    };
  }

  return createPageMetadata({
    title: article.title || "SocialRUSH Blog",
    description: article.description || article.intro || "Read practical SocialRUSH social media growth guidance for creators, brands and businesses.",
    path: `/blog/${article.slug}`,
    keywords: [article.title, article.category, "social media growth India"],
  });
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const articleUrl = new URL(`/blog/${article.slug}`, SEO_SITE_URL).toString();
  const articleImage = getArticleImage(article.image);
  const articleAuthor = article.author ?? "SocialRUSH Editorial Team";
  const articleSections = getArticleSections(article);
  const articleFaqs = article.faqs ?? [];
  const articleRelatedLinks = article.relatedLinks ?? [];
  const articleWordCount = countArticleWords([
    article.intro ?? "",
    ...articleSections.flatMap((section) => [section.heading, section.body, ...(section.tips ?? [])]),
    ...articleFaqs.flatMap((faq) => [faq.question, faq.answer]),
  ]);
  const relatedArticles = blogArticles
    .filter((candidate) => candidate.slug !== article.slug)
    .sort((left, right) => Number(right.category === article.category) - Number(left.category === article.category))
    .slice(0, 3);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    url: articleUrl,
    image: [new URL(articleImage, SEO_SITE_URL).toString()],
    datePublished: article.publishedAt ?? "2026-05-20",
    dateModified: article.updatedAt ?? "2026-07-01",
    articleSection: article.category,
    wordCount: articleWordCount,
    inLanguage: "en-IN",
    author: { "@type": "Person", name: articleAuthor },
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
          { name: article.title, path: `/blog/${article.slug}` },
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
      <article className="relative px-5 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-6%] top-0 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl" />
          <div className="absolute bottom-10 right-[-8%] h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl">
          <Link href="/blog#articles" className="inline-flex rounded-xl border border-[#FFF3E0] bg-white/85 px-4 py-2 text-sm font-semibold text-[#0B0B0F] shadow-[0_8px_22px_rgba(255, 159, 0, .12)] transition hover:-translate-y-0.5">
            Back to Blog
          </Link>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-white/85 bg-white/86 p-4 shadow-[0_20px_48px_rgba(255, 159, 0, .17)] backdrop-blur sm:p-6">
            <div className="relative h-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF8F1] via-[#FFF8F1] to-[#FFF8F1] sm:h-[310px]">
              <SafeImage
                src={articleImage}
                fallbackSrc={articleImage.replace(/\.png$/i, ".webp")}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-cover"
                priority
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#FF9F00]">
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">{article.category}</span>
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">{article.readingTime}</span>
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">By {articleAuthor}</span>
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">
                Published {article.publishedAt ?? "2026-05-20"}
              </span>
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">
                Updated {article.updatedAt ?? "2026-07-01"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-[#0B0B0F] sm:text-4xl">{article.title}</h1>
            <p className="mt-4 text-base leading-8 text-[#111827]">{article.intro}</p>
          </div>

          <nav
            aria-label="Table of contents"
            className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur"
          >
            <h2 className="text-xl font-extrabold text-[#0B0B0F]">Table of contents</h2>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {articleSections.map((section, index) => (
                <li key={section.heading}>
                  <a
                    href={`#${toSectionId(section.heading)}`}
                    className="inline-flex text-sm font-semibold leading-6 text-[#FF9F00] transition hover:text-[#FF7A00]"
                  >
                    {index + 1}. {section.heading}
                  </a>
                </li>
              ))}
              {article.faqs?.length ? (
                <li>
                  <a href="#frequently-asked-questions" className="inline-flex text-sm font-semibold leading-6 text-[#FF9F00] transition hover:text-[#FF7A00]">
                    {articleSections.length + 1}. Frequently asked questions
                  </a>
                </li>
              ) : null}
            </ol>
          </nav>

          <div className="mt-8 space-y-6">
            {articleSections.map((section) => (
              <section
                key={section.heading}
                id={toSectionId(section.heading)}
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
          </div>

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

          {articleRelatedLinks.length ? (
            <nav aria-label="Related SocialRUSH services" className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(255, 159, 0, .14)] backdrop-blur">
              <h2 className="text-xl font-extrabold text-[#0B0B0F]">Related services and next steps</h2>
              <p className="mt-2 text-sm leading-7 text-[#111827]">
                Continue with the service or pricing information most relevant to this strategy.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {articleRelatedLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 py-2.5 text-sm font-bold text-[#0B0B0F] transition hover:-translate-y-0.5 hover:border-[#FF9F00]">
                    {item.label}
                  </Link>
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
