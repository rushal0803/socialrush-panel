"use client";

import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { blogArticles } from "@/components/marketing/blog/blogData";

const categories = [
  "Instagram Growth",
  "YouTube Growth",
  "LinkedIn Marketing",
  "Social Media Tips",
  "Brand Visibility",
  "Campaign Strategy",
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export default function BlogPageContent() {
  const [heroImageError, setHeroImageError] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const cardsWithFallback = useMemo(
    () => blogArticles.map((card) => ({ ...card, hasImage: Boolean(card.image) && !imageErrors[card.slug] })),
    [imageErrors],
  );

  return (
    <BlogShell>
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_#f8eaff_0%,_#ecf6ff_42%,_#f8fcff_100%)] text-[#122347]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-[-6%] h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute right-[-8%] top-24 h-80 w-80 rounded-full bg-cyan-200/45 blur-3xl" />
          <div className="absolute bottom-20 left-[30%] h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
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
              <p className="inline-flex rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#2f4a86] shadow-[0_8px_25px_rgba(59,87,157,.12)] backdrop-blur">
                SocialRUSH Resource Hub
              </p>
              <h1 className="mt-5 max-w-xl text-4xl font-black leading-tight text-[#0f1f46] sm:text-5xl">
                Social Growth Insights, Tips &amp; Strategies
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#445a87] sm:text-lg">
                Learn how creators, brands, and agencies can grow smarter with practical social media guides,
                platform tips, and campaign strategies.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#articles"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,109,255,.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(117,109,255,.45)]"
                >
                  Explore Articles
                </a>
                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d7e5ff] bg-white/85 px-6 py-3 text-sm font-bold text-[#1b3170] shadow-[0_10px_26px_rgba(73,111,182,.12)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[#aec8ff]"
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
              <div className="relative mx-auto max-w-xl rounded-[30px] border border-white/70 bg-white/70 p-5 shadow-[0_28px_60px_rgba(83,111,173,.22)] backdrop-blur">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white to-[#f2f7ff] p-3"
                >
                  {!heroImageError ? (
                    <SafeImage
                      src="/images/blog/blog-hero.png"
                      fallbackSrc="/images/blog/blog-hero.webp"
                      alt="SocialRUSH blog hero"
                      width={900}
                      height={507}
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      className="h-auto w-full rounded-2xl object-cover"
                      priority
                      onError={() => setHeroImageError(true)}
                    />
                  ) : (
                    <div className="grid h-[320px] place-items-center rounded-2xl bg-[radial-gradient(circle_at_30%_20%,_#ffd8ed_0%,_#e8edff_46%,_#ddf8ff_100%)]">
                      <span className="rounded-2xl border border-white/80 bg-white/90 px-4 py-2 text-sm font-extrabold tracking-[0.08em] text-[#2a4884] shadow-[0_10px_24px_rgba(85,112,171,.2)]">
                        BLOG
                      </span>
                    </div>
                  )}
                </motion.div>
                <div className="absolute -left-6 top-6 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-xs font-semibold text-[#29427c] shadow-[0_16px_28px_rgba(85,116,177,.18)]">
                  Weekly Growth Guides
                </div>
                <div className="absolute -bottom-6 right-5 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-xs font-semibold text-[#29427c] shadow-[0_16px_28px_rgba(85,116,177,.18)]">
                  Creator + Brand Playbooks
                </div>
              </div>
            </motion.div>
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
          <div className="mx-auto w-full max-w-7xl rounded-[30px] border border-white/75 bg-white/80 p-7 shadow-[0_25px_55px_rgba(80,111,173,.18)] backdrop-blur sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4a67a7]">Featured Article</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-[#0f1f46]">
              How to Grow Your Social Media Presence Faster in 2026
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#4c6391]">
              Learn practical steps to improve visibility, engagement, and trust using a clean social growth
              strategy.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#3f5688]">
              <span className="rounded-full border border-[#d4e0fb] bg-[#f5f9ff] px-3 py-1.5">Social Growth</span>
              <span className="rounded-full border border-[#d4e0fb] bg-[#f5f9ff] px-3 py-1.5">5 min read</span>
            </div>
            <button
              type="button"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_25px_rgba(117,109,255,.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(117,109,255,.42)]"
            >
              Read Article
            </button>
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
            <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-[#4a67a7]">Categories</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-white/90 bg-white/85 px-4 py-2 text-sm font-semibold text-[#1f3875] shadow-[0_10px_22px_rgba(88,114,173,.14)] backdrop-blur"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        <section id="articles" className="relative px-5 pb-8 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
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
                  className="rounded-3xl border border-white/85 bg-white/90 p-4 shadow-[0_16px_36px_rgba(81,108,169,.18)] backdrop-blur transition-shadow duration-300 hover:shadow-[0_24px_46px_rgba(80,109,170,.24)]"
                >
                  <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6f2ff] via-[#edf6ff] to-[#e8fbff]">
                    {post.hasImage ? (
                      <SafeImage
                        src={post.image as string}
                        fallbackSrc={(post.image as string).replace(/\.png$/i, ".webp")}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                        onError={() =>
                          setImageErrors((current) => ({
                            ...current,
                            [post.slug]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_25%_15%,_#ffd5ea_0%,_#e7efff_48%,_#dcf7ff_100%)] px-6 text-center text-sm font-semibold text-[#2a4884]">
                        <span>Article illustration</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.11em] text-[#4d6bad]">{post.category}</p>
                  <h3 className="mt-2 text-xl font-extrabold leading-7 text-[#10234f]">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4f6694]">{post.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-[#d8e3fb] bg-[#f7faff] px-3 py-1.5 text-xs font-semibold text-[#405887]">
                      {post.readingTime}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d5e3ff] bg-white px-4 py-2 text-xs font-bold text-[#203d7a] transition duration-300 hover:-translate-y-0.5 hover:border-[#acc5ff]"
                    >
                      Read More
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
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
          <div className="mx-auto w-full max-w-5xl rounded-[30px] border border-white/85 bg-white/85 p-7 text-center shadow-[0_24px_52px_rgba(85,113,173,.18)] backdrop-blur sm:p-10">
            <h2 className="text-3xl font-extrabold text-[#10234f]">Want smarter growth tips?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#4f6795]">
              Get simple social media growth ideas and service updates from SocialRUSH.
            </p>
            <form
              action="mailto:hello@socialrush.com"
              method="post"
              className="mx-auto mt-7 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="min-h-12 w-full rounded-2xl border border-[#d0e0ff] bg-white/95 px-4 text-sm text-[#1c346d] outline-none transition placeholder:text-[#8ca1cc] focus:border-[#8ca6ff]"
              />
              <button
                type="submit"
                className="min-h-12 rounded-2xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 text-sm font-bold text-white shadow-[0_12px_25px_rgba(117,109,255,.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(117,109,255,.42)]"
              >
                Subscribe
              </button>
            </form>
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
          <div className="mx-auto w-full max-w-6xl rounded-[34px] border border-white/80 bg-gradient-to-r from-[#182f67] via-[#223f7f] to-[#2f5d9d] px-7 py-9 text-white shadow-[0_30px_58px_rgba(39,65,123,.38)] sm:px-10 sm:py-11">
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">Ready to start your growth campaign?</h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login?next=/dashboard/new-order"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#1c356e] shadow-[0_12px_26px_rgba(17,29,61,.35)] transition duration-300 hover:-translate-y-0.5"
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
