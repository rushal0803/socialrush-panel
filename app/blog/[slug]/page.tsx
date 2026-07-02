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

function toSectionId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function countArticleWords(parts: string[]) {
  return parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
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
    title: article.title,
    description: article.description,
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
  const articleWordCount = countArticleWords([
    article.intro,
    ...article.sections.flatMap((section) => [section.heading, section.body, ...section.tips]),
    ...(article.faqs?.flatMap((faq) => [faq.question, faq.answer]) ?? []),
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
    image: [new URL(article.image, SEO_SITE_URL).toString()],
    datePublished: article.publishedAt ?? "2026-05-20",
    dateModified: article.updatedAt ?? "2026-07-01",
    articleSection: article.category,
    wordCount: articleWordCount,
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "SocialRUSH" },
    publisher: {
      "@type": "Organization",
      name: "SocialRUSH",
      logo: {
        "@type": "ImageObject",
        url: new URL("/brand/socialrush-logo.png", SEO_SITE_URL).toString(),
      },
    },
  };
  const faqSchema = article.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs.map((faq) => ({
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
          <div className="absolute left-[-6%] top-0 h-64 w-64 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute bottom-10 right-[-8%] h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl">
          <Link href="/blog#articles" className="inline-flex rounded-xl border border-[#d7e3ff] bg-white/85 px-4 py-2 text-sm font-semibold text-[#284679] shadow-[0_8px_22px_rgba(86,114,175,.12)] transition hover:-translate-y-0.5">
            Back to Blog
          </Link>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-white/85 bg-white/86 p-4 shadow-[0_20px_48px_rgba(86,114,175,.17)] backdrop-blur sm:p-6">
            <div className="relative h-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6f0ff] via-[#ebf4ff] to-[#e3f9ff] sm:h-[310px]">
              <SafeImage
                src={article.image}
                fallbackSrc={article.image.replace(/\.png$/i, ".webp")}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-cover"
                priority
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#3f5c90]">
              <span className="rounded-full border border-[#d7e3ff] bg-[#f4f8ff] px-3 py-1.5">{article.category}</span>
              <span className="rounded-full border border-[#d7e3ff] bg-[#f4f8ff] px-3 py-1.5">{article.readingTime}</span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-[#10234f] sm:text-4xl">{article.title}</h1>
            <p className="mt-4 text-base leading-8 text-[#4f6795]">{article.intro}</p>
          </div>

          <nav
            aria-label="Table of contents"
            className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(86,114,175,.14)] backdrop-blur"
          >
            <h2 className="text-xl font-extrabold text-[#122a5c]">Table of contents</h2>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {article.sections.map((section, index) => (
                <li key={section.heading}>
                  <a
                    href={`#${toSectionId(section.heading)}`}
                    className="inline-flex text-sm font-semibold leading-6 text-[#3f5a8f] transition hover:text-[#765ddd]"
                  >
                    {index + 1}. {section.heading}
                  </a>
                </li>
              ))}
              {article.faqs?.length ? (
                <li>
                  <a href="#frequently-asked-questions" className="inline-flex text-sm font-semibold leading-6 text-[#3f5a8f] transition hover:text-[#765ddd]">
                    {article.sections.length + 1}. Frequently asked questions
                  </a>
                </li>
              ) : null}
            </ol>
          </nav>

          <div className="mt-8 space-y-6">
            {article.sections.map((section) => (
              <section
                key={section.heading}
                id={toSectionId(section.heading)}
                className="rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(86,114,175,.14)] backdrop-blur"
              >
                <h2 className="text-2xl font-extrabold text-[#122a5c]">{section.heading}</h2>
                <p className="mt-3 text-[15px] leading-7 text-[#4f6795]">{section.body}</p>
                <h3 className="mt-5 text-base font-extrabold text-[#234176]">Practical actions</h3>
                <ul className="mt-4 space-y-2">
                  {section.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm leading-6 text-[#3f5a8f]">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-[#ff67b2] to-[#4dc4ff]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {article.faqs?.length ? (
            <section
              id="frequently-asked-questions"
              className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(86,114,175,.14)] backdrop-blur"
            >
              <h2 className="text-2xl font-extrabold text-[#122a5c]">Frequently asked questions</h2>
              <div className="mt-5 space-y-4">
                {article.faqs.map((faq) => (
                  <details key={faq.question} className="group rounded-2xl border border-[#d9e5fb] bg-[#f8fbff] p-5">
                    <summary className="cursor-pointer list-none text-base font-bold text-[#1e3b75]">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-[#4f6795]">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {article.relatedLinks?.length ? (
            <nav aria-label="Related SocialRUSH services" className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(86,114,175,.14)] backdrop-blur">
              <h2 className="text-xl font-extrabold text-[#122a5c]">Related services and next steps</h2>
              <p className="mt-2 text-sm leading-7 text-[#4f6795]">
                Continue with the service or pricing information most relevant to this strategy.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {article.relatedLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center rounded-xl border border-[#d7e3ff] bg-[#f4f8ff] px-4 py-2.5 text-sm font-bold text-[#284679] transition hover:-translate-y-0.5 hover:border-[#aec5f6]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          ) : null}

          <section className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(86,114,175,.14)] backdrop-blur">
            <h2 className="text-2xl font-extrabold text-[#122a5c]">Related blog articles</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="rounded-2xl border border-[#d9e5fb] bg-[#f8fbff] p-5 transition hover:-translate-y-1 hover:border-[#b8c8f5] hover:shadow-[0_12px_26px_rgba(86,114,175,.12)]"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#5b70aa]">{related.category}</span>
                  <h3 className="mt-2 text-base font-extrabold leading-6 text-[#173469]">{related.title}</h3>
                  <span className="mt-3 inline-flex text-sm font-bold text-[#765ddd]">Read article →</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-[30px] border border-white/85 bg-gradient-to-r from-[#182f67] via-[#223f7f] to-[#2f5d9d] px-6 py-8 text-white shadow-[0_24px_52px_rgba(39,65,123,.38)] sm:px-8">
            <h2 className="text-3xl font-black leading-tight">Ready to launch your next growth campaign?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
              Turn these strategies into action with campaign support, transparent progress tracking, and expert guidance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login?next=/dashboard/new-order"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#1d3771] transition hover:-translate-y-0.5"
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
