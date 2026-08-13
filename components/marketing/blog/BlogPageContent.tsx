"use client";

import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { blogArticles, type BlogArticle } from "@/components/marketing/blog/blogData";
import { formatArticleDate, getReadingTime, getSearchText, sortArticles } from "@/lib/blog";

const articles = sortArticles(blogArticles);
const featuredArticle = articles.find((article) => article.featured) ?? articles[0];

const platforms = [
  { label: "Instagram", categories: ["Instagram Growth", "Instagram Pricing"], Icon: FaInstagram, accent: "from-fuchsia-500/30 via-orange-400/20 to-amber-300/10" },
  { label: "YouTube", categories: ["YouTube Growth"], Icon: FaYoutube, accent: "from-red-500/30 to-orange-400/10" },
  { label: "Facebook", categories: ["Facebook Marketing"], Icon: FaFacebook, accent: "from-blue-500/30 to-sky-400/10" },
  { label: "LinkedIn", categories: ["LinkedIn Business", "LinkedIn Marketing"], Icon: FaLinkedin, accent: "from-[#0A66C2]/35 to-sky-300/10" },
  { label: "Growth strategy", categories: ["Brand Visibility", "Campaign Strategy", "Creator Strategy", "Small Business", "Social Media Strategy", "Social Media Tips"], Icon: Sparkles, accent: "from-amber-400/25 to-orange-600/10" },
  { label: "Pricing & safety", categories: ["Safe Ordering", "Safety"], Icon: ShieldCheck, accent: "from-emerald-400/20 to-cyan-400/10" },
] as const;

const filterOptions = [
  { label: "All guides", categories: [] },
  ...platforms.map(({ label, categories }) => ({ label, categories: [...categories] })),
] as const;

function matchesCategories(article: BlogArticle, categories: readonly string[]) {
  return categories.length === 0 || categories.includes(article.category);
}

function ArticleArtwork({ article, priority = false }: { article: BlogArticle; priority?: boolean }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[#10141f]">
      <SafeImage src={article.image} alt={article.imageAlt ?? article.title} fill priority={priority} sizes="(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#07080D]/70 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#090B12]/80 px-3 py-1 text-[10px] font-black uppercase tracking-[.13em] text-white backdrop-blur">{article.category}</span>
    </div>
  );
}

export default function BlogPageContent() {
  const [activeFilter, setActiveFilter] = useState("All guides");
  const [searchQuery, setSearchQuery] = useState("");
  const selected = filterOptions.find((option) => option.label === activeFilter) ?? filterOptions[0];
  const query = searchQuery.trim().toLowerCase();
  const filteredArticles = useMemo(() => articles.filter((article) => article.slug !== featuredArticle.slug && matchesCategories(article, selected.categories) && (!query || getSearchText(article).includes(query))), [query, selected.categories]);
  const clearFilters = () => { setActiveFilter("All guides"); setSearchQuery(""); };

  return <BlogShell>
    <div className="blog-page overflow-hidden bg-[#07080D] text-white">
      <section className="relative isolate border-b border-white/[.07] px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_0%,rgba(255,116,0,.22),transparent_42%),radial-gradient(ellipse_at_88%_18%,rgba(23,50,100,.34),transparent_38%)]" />
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">SocialRUSH Insights</p>
          <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl"><h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">Practical social media growth guides</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Actionable guides on Instagram, YouTube, Facebook, LinkedIn, TikTok, Telegram and X — including growth strategy, pricing, safety and platform tips.</p></div>
            <div className="flex flex-wrap gap-3"><a href="#guides" className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-[#FF6200] to-[#FF9A00] px-5 text-sm font-black shadow-[0_14px_32px_rgba(255,98,0,.22)] transition hover:-translate-y-0.5">Explore Latest Guides <ArrowRight className="ml-2 h-4 w-4" /></a><Link href="/services" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-bold transition hover:border-orange-400/50 hover:bg-white/[.08]">Explore Services</Link></div>
          </div>
          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-300">{["Practical guides", "Platform-specific advice", "Pricing insights", "Growth resources"].map((item) => <li key={item} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{item}</li>)}</ul>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-14"><div className="mx-auto max-w-7xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Featured guide</p><h2 className="mt-2 text-2xl font-black">Start here</h2></div><Link href={`/blog/${featuredArticle.slug}`} className="hidden text-sm font-bold text-orange-300 hover:text-orange-200 sm:inline-flex sm:items-center">Read article <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
        <article className="group grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0E121B] shadow-[0_25px_70px_rgba(0,0,0,.24)] lg:grid-cols-[1.1fr_.9fr]"><Link href={`/blog/${featuredArticle.slug}`} aria-label={`Read ${featuredArticle.title}`}><ArticleArtwork article={featuredArticle} priority /></Link><div className="flex flex-col p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.13em] text-orange-300">{featuredArticle.category}</p><h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl"><Link href={`/blog/${featuredArticle.slug}`} className="transition hover:text-orange-300">{featuredArticle.title}</Link></h2><p className="mt-4 text-sm leading-7 text-slate-300">{featuredArticle.description}</p><div className="mt-auto flex flex-wrap items-center gap-3 pt-7 text-xs text-slate-400"><span>{formatArticleDate(featuredArticle.publishedAt)}</span><span aria-hidden="true">•</span><span>{getReadingTime(featuredArticle)}</span></div><Link href={`/blog/${featuredArticle.slug}`} className="mt-6 inline-flex w-fit min-h-11 items-center rounded-xl border border-orange-400/40 bg-orange-400/10 px-4 text-sm font-black text-orange-100 transition hover:bg-orange-400/20">Read Article <ArrowRight className="ml-2 h-4 w-4" /></Link></div></article></div></section>

      <section className="border-y border-white/[.07] bg-[#0A0D15] px-5 py-9 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Find the right guide</p><h2 className="mt-2 text-2xl font-black">Browse by topic</h2></div><label className="relative block w-full max-w-md"><span className="sr-only">Search guides</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} type="search" placeholder="Search guides..." className="min-h-12 w-full rounded-xl border border-white/10 bg-[#121824] px-11 pr-16 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20" />{searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Clear search"><X className="h-4 w-4" /></button>}</label></div>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Guide topic filters">{filterOptions.map((option) => <button type="button" key={option.label} onClick={() => setActiveFilter(option.label)} aria-pressed={activeFilter === option.label} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${activeFilter === option.label ? "border-orange-400 bg-orange-400 text-[#090B12]" : "border-white/10 bg-white/[.03] text-slate-200 hover:border-white/30"}`}>{option.label}</button>)}</div></div></section>

      <section id="guides" className="px-5 py-11 sm:px-6 lg:px-8 lg:py-14"><div className="mx-auto max-w-7xl"><div className="flex items-baseline justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Latest guides</p><h2 className="mt-2 text-2xl font-black">Useful next reads</h2></div><p aria-live="polite" className="text-sm text-slate-400">{filteredArticles.length} guide{filteredArticles.length === 1 ? "" : "s"}</p></div>
        {filteredArticles.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredArticles.map((article) => <article key={article.slug} className="group flex overflow-hidden rounded-2xl border border-white/[.09] bg-[#0D111A] transition hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-[0_18px_45px_rgba(0,0,0,.24)] sm:flex-col"><Link href={`/blog/${article.slug}`} className="block w-[42%] shrink-0 sm:w-full" aria-label={`Read ${article.title}`}><ArticleArtwork article={article} /></Link><div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5"><p className="text-[10px] font-black uppercase tracking-[.13em] text-orange-300">{article.category}</p><h3 className="mt-2 text-lg font-black leading-6"><Link href={`/blog/${article.slug}`} className="transition hover:text-orange-300">{article.title}</Link></h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{article.description}</p><div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-slate-500"><span>{formatArticleDate(article.publishedAt)}</span><Link href={`/blog/${article.slug}`} className="font-black text-orange-300 hover:text-orange-200">Read Article</Link></div></div></article>)}</div> : <div className="mt-7 rounded-2xl border border-dashed border-white/15 bg-white/[.025] p-9 text-center"><h3 className="text-xl font-black">No guides match your search.</h3><p className="mt-2 text-sm text-slate-400">Try a different topic, or return to the complete guide library.</p><div className="mt-5 flex justify-center gap-3"><button type="button" onClick={() => setSearchQuery("")} className="min-h-10 rounded-xl border border-white/15 px-4 text-sm font-bold hover:bg-white/[.06]">Clear Search</button><button type="button" onClick={clearFilters} className="min-h-10 rounded-xl bg-orange-400 px-4 text-sm font-black text-[#090B12]">View All Guides</button></div></div>}</div></section>

      <section className="border-t border-white/[.07] bg-[#0A0D15] px-5 py-11 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Browse by platform</p><h2 className="mt-2 text-2xl font-black">Explore focused growth resources</h2><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{platforms.slice(0, 4).map(({ label, categories, Icon, accent }) => { const count = articles.filter((article) => matchesCategories(article, categories)).length; return <Link href={`/blog#guides`} onClick={() => setActiveFilter(label)} key={label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#101520] p-5 transition hover:border-orange-400/35 hover:-translate-y-1"><div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-80`} /><div className="relative"><Icon className="h-6 w-6 text-white" /><div className="mt-6 flex items-end justify-between"><div><h3 className="font-black">{label}</h3><p className="mt-1 text-sm text-slate-300">{count} guide{count === 1 ? "" : "s"}</p></div><span className="text-sm font-black text-orange-200">Explore <ArrowRight className="ml-1 inline h-4 w-4" /></span></div></div></Link> })}</div>
        <div className="mt-7 rounded-2xl border border-orange-400/20 bg-gradient-to-r from-[#17120c] to-[#101520] p-6 sm:flex sm:items-center sm:justify-between"><div><h3 className="text-xl font-black">Ready to put these strategies into action?</h3><p className="mt-2 text-sm text-slate-300">Compare clear service options built for your next campaign.</p></div><div className="mt-5 flex flex-wrap gap-3 sm:mt-0"><Link href="/services" className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-[#FF6200] to-[#FF9A00] px-5 text-sm font-black">Explore Services</Link><Link href="/packages" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-bold hover:bg-white/[.06]">View Packages</Link></div></div></div></section>
    </div>
  </BlogShell>;
}
