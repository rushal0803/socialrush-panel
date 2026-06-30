import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { articleSlugs, getArticleBySlug } from "@/components/marketing/blog/blogData";
import SafeImage from "@/components/SafeImage";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

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
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: articleUrl,
    image: new URL(article.image, SEO_SITE_URL).toString(),
    author: { "@type": "Organization", name: "SocialRUSH" },
    publisher: {
      "@type": "Organization",
      name: "SocialRUSH",
      logo: {
        "@type": "ImageObject",
        url: new URL("/logo.svg", SEO_SITE_URL).toString(),
      },
    },
  };

  return (
    <BlogShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
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

          <div className="mt-8 space-y-6">
            {article.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(86,114,175,.14)] backdrop-blur"
              >
                <h2 className="text-2xl font-extrabold text-[#122a5c]">{section.heading}</h2>
                <p className="mt-3 text-[15px] leading-7 text-[#4f6795]">{section.body}</p>
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

          {article.relatedLinks?.length ? (
            <nav aria-label="Related SocialRUSH services" className="mt-8 rounded-3xl border border-white/85 bg-white/86 p-6 shadow-[0_14px_34px_rgba(86,114,175,.14)] backdrop-blur">
              <h2 className="text-xl font-extrabold text-[#122a5c]">Related guides and services</h2>
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
                href="/services"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                View Services
              </Link>
              <Link
                href="/blog#articles"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Back to Blog
              </Link>
            </div>
          </section>
        </div>
      </article>
    </BlogShell>
  );
}
