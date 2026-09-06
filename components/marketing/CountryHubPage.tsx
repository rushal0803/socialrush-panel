import Link from "next/link";
import PublicShell from "@/components/marketing/PublicShell";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import MarketCurrencyInitializer from "./MarketCurrencyInitializer";
import type { InternationalMarket } from "@/lib/seo/international";
import { publishedCountryServicePages } from "@/lib/seo/international";

const platforms = ["Instagram", "YouTube", "Facebook", "LinkedIn", "TikTok", "Telegram", "X / Twitter"];

export default function CountryHubPage({ market }: { market: InternationalMarket }) {
  const path = `/${market.slug}`;
  const services = publishedCountryServicePages.filter((page) => page.market.slug === market.slug);
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: market.faq.question, acceptedAnswer: { "@type": "Answer", text: market.faq.answer } }] };
  return <PublicShell>
    <MarketCurrencyInitializer currency={market.currency} />
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: market.name, path }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <main>
      <section className="border-b border-white/10 bg-[#0b0d13] px-5 py-16 sm:px-6 lg:px-8 lg:py-24"><div className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">SocialRUSH in {market.name}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">Social media growth services for {market.name}.</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">A focused place for {market.audience} to explore supported social media services. Start with your campaign goal, compare clear service information and place an order using a public profile or content link.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/services" className="inline-flex min-h-12 items-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Explore services</Link><Link href="/pricing" className="inline-flex min-h-12 items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-black text-white">Review pricing</Link></div>
      </div></section>
      <section className="px-5 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-black">Plan a campaign with the right context.</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">For visitors in {market.name}, the emphasis is on {market.emphasis}. SocialRUSH does not promise reach, revenue, rankings or business outcomes; it makes the available service details and order process easier to review.</p><div className="mt-8 grid gap-4 md:grid-cols-3">{[["Discover", "Browse by platform and compare available options."], ["Review", "Check public-link requirements, delivery information and refill details where shown."], ["Order", "Select a suitable service and track the order through your account."]].map(([title, text]) => <article key={title} className="rounded-2xl border border-white/10 bg-[#101219] p-5"><h3 className="font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></article>)}</div></div></section>
      <section className="border-y border-white/10 bg-[#0b0d13] px-5 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-black">Supported platforms</h2><p className="mt-3 text-sm leading-7 text-slate-300">Explore current service availability by platform. Service pages remain the source of truth for specific options.</p><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{platforms.map((platform) => <Link key={platform} href="/services" className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-center text-sm font-bold text-white transition hover:border-orange-400/40 hover:text-orange-200">{platform}</Link>)}</div></div></section>
      {services.length ? <section className="px-5 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-black">Popular services in {market.name}</h2><p className="mt-3 text-sm leading-7 text-slate-300">These country-specific pages use the current catalog and the established ordering flow.</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <Link key={service.serviceSlug} href={`/${market.slug}/${service.serviceSlug}`} className="rounded-2xl border border-white/10 bg-[#101219] p-5 font-black transition hover:border-orange-400/40">{service.h1}</Link>)}</div></div></section> : null}
      <section className="px-5 py-16 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2"><article className="rounded-2xl border border-orange-400/25 bg-orange-500/[.07] p-6"><h2 className="text-2xl font-black">Currency display for planning</h2><p className="mt-3 text-sm leading-7 text-slate-300">{market.paymentNote} Display currency is a convenience only and does not create a separate SEO URL, payment method or local checkout.</p></article><article className="rounded-2xl border border-white/10 bg-[#101219] p-6"><h2 className="text-2xl font-black">Order with confidence</h2><p className="mt-3 text-sm leading-7 text-slate-300">Use public profile, post, page, channel or video links. SocialRUSH does not ask for social-account passwords, OTPs or recovery codes.</p><Link href="/trust" className="mt-5 inline-flex text-sm font-bold text-orange-300">Read customer safety guidance</Link></article></div></section>
      <section className="border-t border-white/10 bg-[#0b0d13] px-5 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><h2 className="text-3xl font-black">Questions for visitors in {market.name}</h2><article className="mt-6 rounded-2xl border border-white/10 bg-[#101219] p-6"><h3 className="text-lg font-black">{market.faq.question}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{market.faq.answer}</p></article></div></section>
    </main>
  </PublicShell>;
}
