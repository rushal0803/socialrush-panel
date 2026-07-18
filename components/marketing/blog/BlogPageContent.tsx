"use client";

import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { blogArticles } from "@/components/marketing/blog/blogData";

const categories = ["All", ...Array.from(new Set(blogArticles.map((article) => article.category)))];
const featuredArticle = blogArticles[0];
const whatsappUrl =
  "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20growing%20my%20social%20media";
const relatedServiceLinks = [
  ["Instagram Followers", "/buy-instagram-followers-india"],
  ["Instagram Likes", "/instagram-likes"],
  ["YouTube Subscribers", "/youtube-subscribers"],
  ["Facebook Followers", "/facebook-followers"],
  ["LinkedIn Followers", "/linkedin-followers"],
  ["Packages", "/packages"],
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const normalizeCategory = (value: string) => value.trim().toLowerCase();
const normalizeSearch = (value: string) => value.trim().toLowerCase();

export default function BlogPageContent() {
  const [heroImageError, setHeroImageError] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const cardsWithFallback = useMemo(
    () => {
      const query = normalizeSearch(searchQuery);
      const selectedCategory = normalizeCategory(activeCategory);

      return blogArticles
        .filter((article) => {
          const matchesCategory =
            selectedCategory === "all" ||
            normalizeCategory(article.category) === selectedCategory;

          const matchesSearch =
            query === "" ||
            article.title.toLowerCase().includes(query) ||
            article.description.toLowerCase().includes(query) ||
            article.category.toLowerCase().includes(query);

          return matchesCategory && matchesSearch;
        })
        .map((article) => ({
          ...article,
          hasImage: Boolean(article.image) && !imageErrors[article.slug],
        }));
    },
    [activeCategory, imageErrors, searchQuery],
  );

  return (
    <BlogShell>
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_#FFF8F1_0%,_#FFF8F1_42%,_#FFF8F1_100%)] text-[#0B0B0F]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-[-6%] h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="absolute right-[-8%] top-24 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl" />
          <div className="absolute bottom-20 left-[30%] h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        </div>

        <section className="relative px-5 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <motion.div
              variants={fadeUp}
              initial={false}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65 }}
            >
              <p className="inline-flex rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B0B0F] shadow-[0_8px_25px_rgba(255, 159, 0, .12)] backdrop-blur">
                SocialRUSH Resource Hub
              </p>
              <h1 className="mt-5 max-w-xl text-4xl font-black leading-tight text-[#0B0B0F] sm:text-5xl">
                Social Growth Insights, Tips &amp; Strategies
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#111827] sm:text-lg">
                Learn how creators, brands, and agencies can grow smarter with practical social media guides,
                platform tips, and campaign strategies.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#articles"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(255, 196, 0, .35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(255, 196, 0, .45)]"
                >
                  Explore Articles
                </a>
                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#FFF3E0] bg-white/85 px-6 py-3 text-sm font-bold text-[#0B0B0F] shadow-[0_10px_26px_rgba(255, 159, 0, .12)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[#FF9F00]"
                >
                  View Services
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial={false}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: 0.12 }}
            >
              <div className="relative mx-auto max-w-xl rounded-[30px] border border-white/70 bg-white/70 p-5 shadow-[0_28px_60px_rgba(255, 159, 0, .22)] backdrop-blur">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white to-[#FFF8F1] p-3"
                >
                  {!heroImageError ? (
                    <SafeImage
                      src="/images/pages/blog-resource-hub-dark.png"
                      alt="Social media creator planning content and reviewing growth analytics"
                      width={900}
                      height={675}
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      className="h-auto w-full rounded-2xl object-contain"
                      priority
                      onError={() => setHeroImageError(true)}
                    />
                  ) : (
                    <div className="grid h-[320px] place-items-center rounded-2xl bg-[radial-gradient(circle_at_30%_20%,_#FFF3E0_0%,_#FFF8F1_46%,_#FFF8F1_100%)]">
                      <span className="rounded-2xl border border-white/80 bg-white/90 px-4 py-2 text-sm font-extrabold tracking-[0.08em] text-[#0B0B0F] shadow-[0_10px_24px_rgba(255, 159, 0, .2)]">
                        BLOG
                      </span>
                    </div>
                  )}
                </motion.div>
                <div className="absolute -left-6 top-6 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-xs font-semibold text-[#0B0B0F] shadow-[0_16px_28px_rgba(255, 159, 0, .18)]">
                  Weekly Growth Guides
                </div>
                <div className="absolute -bottom-6 right-5 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-xs font-semibold text-[#0B0B0F] shadow-[0_16px_28px_rgba(255, 159, 0, .18)]">
                  Creator + Brand Playbooks
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl rounded-[30px] border border-white/85 bg-white/85 p-6 shadow-[0_18px_42px_rgba(255,159,0,.16)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#FF9F00]">
                  Related SocialRUSH services
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-[#0B0B0F]">
                  Explore services mentioned in our growth guides
                </h2>
              </div>
              <Link
                href="/services"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_25px_rgba(255,196,0,.28)]"
              >
                View All Services
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {relatedServiceLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-[#FFF3E0] bg-white px-4 py-2 text-sm font-bold text-[#0B0B0F] transition hover:border-[#FF9F00] hover:text-[#FF7A00]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.6 }}
          className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10"
        >
          <div className="mx-auto w-full max-w-7xl rounded-[30px] border border-white/75 bg-white/80 p-7 shadow-[0_25px_55px_rgba(255, 159, 0, .18)] backdrop-blur sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#FF9F00]">Featured Article</p>
            <Link href={`/blog/${featuredArticle.slug}`} className="block w-fit">
              <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-[#0B0B0F] transition hover:text-[#FF7A00]">
                {featuredArticle.title}
              </h2>
            </Link>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#111827]">
              {featuredArticle.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#FF9F00]">
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">
                {featuredArticle.category}
              </span>
              <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5">
                {featuredArticle.readingTime}
              </span>
            </div>
            <Link
              href={`/blog/${featuredArticle.slug}`}
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_25px_rgba(255, 196, 0, .35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(255, 196, 0, .42)]"
            >
              Read Article
            </Link>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.13em] text-[#FF9F00]">Categories</h2>
                <p className="mt-2 text-sm text-[#111827]">Filter practical guides by the topic you need.</p>
              </div>
              <label className="block w-full max-w-md">
                <span className="sr-only">Search blog articles</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search articles"
                  className="min-h-12 w-full rounded-2xl border border-white/90 bg-white/90 px-4 text-sm text-[#0B0B0F] shadow-[0_10px_22px_rgba(255, 159, 0, .14)] outline-none transition placeholder:text-[#111827] focus:border-[#FF9F00] focus:ring-2 focus:ring-[#FFC400]/20"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-[0_10px_22px_rgba(255, 159, 0, .14)] backdrop-blur transition ${
                    activeCategory === category
                      ? "border-[#FFC400] bg-gradient-to-r from-[#FFC400] to-[#FF9F00] text-white"
                      : "border-white/90 bg-white/85 text-[#0B0B0F] hover:border-[#FF9F00]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        <section id="articles" className="relative px-5 pb-8 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              key={`${activeCategory}-${normalizeSearch(searchQuery) || "all"}`}
              initial={false}
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.12 },
                },
              }}
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {cardsWithFallback.map((post) => (
                <motion.article
                  key={post.slug}
                  variants={fadeUp}
                  transition={{ duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="flex h-full flex-col rounded-3xl border border-white/85 bg-white/90 p-4 shadow-[0_16px_36px_rgba(255, 159, 0, .18)] backdrop-blur transition-shadow duration-300 hover:shadow-[0_24px_46px_rgba(255, 159, 0, .24)]"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    aria-label={`Read ${post.title}`}
                    className="relative block aspect-[3/2] overflow-hidden rounded-2xl bg-gradient-to-br from-[#050505] via-[#15110a] to-[#2B1600]"
                  >
                    {post.hasImage ? (
                      <SafeImage
                        src={post.image as string}
                        fallbackSrc={(post.image as string).replace(/\.(png|jpg|jpeg)$/i, ".webp")}
                        alt={post.imageAlt ?? post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-contain"
                        onError={() =>
                          setImageErrors((current) => ({
                            ...current,
                            [post.slug]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_25%_15%,_rgba(255,159,0,0.32)_0%,_#111111_48%,_#050505_100%)] px-6 text-center text-sm font-semibold text-[#FF9F00]">
                        <span>Article illustration</span>
                      </div>
                    )}
                  </Link>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.11em] text-[#FF9F00]">{post.category}</p>
                  <h3 className="mt-2 text-xl font-extrabold leading-7 text-[#0B0B0F]">
                    <Link href={`/blog/${post.slug}`} className="transition hover:text-[#FF7A00]">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#111827]">{post.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5 text-xs font-semibold text-[#FF9F00]">
                        {post.readingTime}
                      </span>
                      <span className="rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1.5 text-xs font-semibold text-[#111827]">
                        {post.publishedAt ?? "2026-05-20"}
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white px-4 py-2 text-xs font-bold text-[#0B0B0F] transition duration-300 hover:-translate-y-0.5 hover:border-[#FF9F00]"
                    >
                      Read More
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
            {cardsWithFallback.length === 0 ? (
              <div className="rounded-3xl border border-orange-400/30 bg-[#111111] p-8 text-center shadow-[0_18px_42px_-28px_rgba(255, 122, 0, .65)]">
                <h3 className="text-xl font-extrabold text-[#0B0B0F]">No articles found for this category.</h3>
                <p className="mt-2 text-sm text-[#111827]">Try another topic or view all guides.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-2.5 text-sm font-bold text-white shadow-[0_14px_30px_-18px_rgba(255,122,0,.8)] transition hover:-translate-y-0.5 active:scale-[.98]"
                >
                  View All Articles
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative px-5 py-10 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="mx-auto w-full max-w-5xl rounded-[30px] border border-white/85 bg-white/85 p-7 text-center shadow-[0_24px_52px_rgba(255, 159, 0, .18)] backdrop-blur sm:p-10">
            <h2 className="text-3xl font-extrabold text-[#0B0B0F]">Need help growing your social media?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#111827]">
              Compare SocialRUSH packages, start a campaign, or talk with our team on WhatsApp before ordering.
            </p>
            <div className="mx-auto mt-7 flex w-full max-w-3xl flex-col justify-center gap-3 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#25D366] px-6 text-sm font-bold text-white shadow-[0_12px_25px_rgba(37,211,102,.25)] transition hover:-translate-y-0.5"
              >
                Chat on WhatsApp
              </a>
              <Link href="/packages" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#FFF3E0] bg-white px-6 text-sm font-bold text-[#0B0B0F] transition hover:-translate-y-0.5">
                View Packages
              </Link>
              <Link href="/login?next=/dashboard/new-order" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 text-sm font-bold text-white shadow-[0_12px_25px_rgba(255, 196, 0, .35)] transition hover:-translate-y-0.5">
                Start Order
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative px-5 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24 lg:pt-8"
        >
          <div className="mx-auto w-full max-w-6xl rounded-[34px] border border-white/80 bg-gradient-to-r from-[#0B0B0F] via-[#0B0B0F] to-[#FF9F00] px-7 py-9 text-white shadow-[0_30px_58px_rgba(255, 159, 0, .38)] sm:px-10 sm:py-11">
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">Ready to start your growth campaign?</h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login?next=/dashboard/new-order"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#0B0B0F] shadow-[0_12px_26px_rgba(17,29,61,.35)] transition duration-300 hover:-translate-y-0.5"
              >
                Start Order
              </Link>
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              >
                View Packages
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </BlogShell>
  );
}
