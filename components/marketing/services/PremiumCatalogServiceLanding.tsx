import Link from "next/link";
import PlatformIcon from "@/components/PlatformIcon";
import CurrencyAmount from "@/components/currency/CurrencyAmount";
import PublicShell from "@/components/marketing/PublicShell";
import InteractiveHomepageShell from "@/components/marketing/InteractiveHomepageShell";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import { activeSmmServices, platformMeta } from "@/lib/smm-service-catalog";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

function safeJson(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const twitterServiceCopy: Record<string, { headline: string; faqName: string; intro: string; target: string; terminology?: string }> = {
  "twitter-likes": { headline: "Buy Twitter (X) Likes", faqName: "Twitter (X) likes", intro: "Add likes to an eligible public X post using its direct post link. Review the current rate, quantity range, delivery estimate and refill terms before ordering.", target: "public X post", terminology: "X is the platform formerly known as Twitter, so this page uses both names where they help describe the same likes service." },
  "twitter-views": { headline: "Buy Twitter (X) Views", faqName: "Twitter (X) views", intro: "Order views for an eligible public X post. Check the current rate, quantity limits, delivery estimate and service requirements before checkout.", target: "public X post", terminology: "People still commonly search for Twitter views even though Twitter is now called X; both terms refer to the same platform here." },
  "twitter-retweets": { headline: "Buy Twitter Retweets / X Reposts", faqName: "Twitter retweets / X reposts", intro: "Order repost activity for an eligible public X post. Retweets are now called reposts on X; review the current rate, quantity limits and service conditions before checkout.", target: "public X post", terminology: "Twitter called this action a retweet. X now calls it a repost, so both terms are used naturally on this page." },
  "twitter-crypto-followers": { headline: "Twitter (X) Crypto Followers", faqName: "Twitter (X) crypto followers", intro: "A specialist follower option for eligible public X profiles in the crypto niche. Review current availability, quantity limits and service conditions before ordering.", target: "public X profile" },
  "twitter-crypto-likes": { headline: "Twitter (X) Crypto Likes", faqName: "Twitter (X) crypto likes", intro: "A specialist likes option for eligible public X posts in the crypto niche. Review the current rate, limits and delivery details before ordering.", target: "public X post" },
  "twitter-crypto-retweets": { headline: "Twitter Crypto Retweets / X Crypto Reposts", faqName: "Twitter crypto retweets / X crypto reposts", intro: "A specialist repost option for eligible public X posts in the crypto niche. Twitter retweets are now called reposts on X; check current service details before ordering.", target: "public X post" },
  "twitter-crypto-custom-comments": { headline: "Twitter (X) Crypto Custom Comments", faqName: "Twitter (X) crypto custom comments", intro: "Add customer-supplied custom comment text to an eligible public X post using the required post link. Review formatting, quantity and current service requirements before checkout.", target: "public X post" },
};

export default async function PremiumCatalogServiceLanding({ serviceCode }: { serviceCode: string }) {
  const catalog = activeSmmServices.find((service) => service.code === serviceCode);
  if (!catalog) return null;
  const live = catalog.requiresLiveCatalogFacts ? await getLiveServiceFacts(catalog.platform, catalog.name, catalog.code) : null;
  const service = live?.available ? { ...catalog, pricePer1000: live.rate, minQuantity: live.min, maxQuantity: live.max, deliveryTime: live.deliveryTime, refillPolicy: live.refillPolicy, qualityType: live.qualityType, importantInstruction: live.importantInstruction } : catalog;
  const platform = platformMeta[service.platform];
  const orderHref = `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`;
  const canonical = `${SEO_SITE_URL}/services/${service.code}`;
  const authorityPlatform = service.platform === "x" ? "twitter" : service.platform;
  const supportsAuthorityCluster = ["instagram", "youtube", "facebook", "linkedin", "tiktok", "twitter", "telegram"].includes(authorityPlatform);
  const intentCopy = twitterServiceCopy[service.code];
  const headline = intentCopy?.headline ?? service.name;
  const faqName = intentCopy?.faqName ?? service.name;
  const target = intentCopy?.target ?? `public ${platform.label} destination`;
  const hasSpecificDeliveryEstimate = Boolean(service.deliveryTime && !/estimate shown before checkout/i.test(service.deliveryTime));
  const deliveryAnswer = hasSpecificDeliveryEstimate ? `The current service estimate is ${service.deliveryTime}. Timing can vary with quantity, destination availability and current service conditions.` : "The current delivery estimate is shown in the service details before checkout. Timing can vary with quantity, destination availability and current service conditions.";

  const faq: ReadonlyArray<readonly [string, string]> = [
    [`How do I order ${faqName}?`, `Choose your quantity, enter the correct ${target} link, review the exact total and current service details, then continue to checkout. You can track the order from the SocialRUSH dashboard.`],
    [`Which link should I submit for ${faqName}?`, `Use the direct link for the eligible ${target}. Check the URL carefully before payment and keep the destination public and available while the order is processing.`],
    ["Do I need to share my password?", "No. SocialRUSH only requires the eligible public link needed for this service. Never share your password, OTP, recovery code or UPI PIN."],
    [`How much do ${faqName} cost?`, "The service card shows the current rate and quantity limits. Your order total is calculated from the quantity you select before checkout."],
    ["How long does delivery take?", deliveryAnswer],
    ["What is the refill policy?", `The current service policy is ${service.refillPolicy}. Review the order details before checkout because service conditions can change.`],
    ...(intentCopy?.terminology ? [["Why does this page mention both Twitter and X?", intentCopy.terminology] as const] : []),
    [`Do ${faqName} guarantee reach, followers, sales or ranking?`, "No. SocialRUSH does not guarantee organic reach, follower growth, sales, leads, search visibility or other platform outcomes from an engagement order."],
  ];

  const serviceSchema = { "@context": "https://schema.org", "@type": "Service", name: headline, description: intentCopy?.intro ?? service.description, provider: { "@type": "Organization", name: "SocialRUSH", url: SEO_SITE_URL }, serviceType: headline, url: canonical };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SEO_SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "Services", item: `${SEO_SITE_URL}/services` }, { "@type": "ListItem", position: 3, name: headline, item: canonical }] };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };

  return (
    <PublicShell tone="default">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      <InteractiveHomepageShell><div className="service-money-page bg-[#07090d] px-4 pb-20 pt-8 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
        <nav className="mb-5 text-xs font-semibold text-zinc-400" aria-label="Breadcrumb"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/services" className="hover:text-white">Services</Link><span className="mx-2">/</span><span className="text-orange-300">{headline}</span></nav>
        <section className="overflow-hidden rounded-[32px] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,.18),transparent_34%),linear-gradient(145deg,#10141c,#090b10)] p-6 shadow-2xl sm:p-10 lg:p-12"><div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center"><div><div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.14em] text-orange-200"><PlatformIcon platform={platform.label} className="h-4 w-4" />{platform.label} service</div><h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{headline}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">{intentCopy?.intro ?? `${service.description} Review the current rate, quantity limits and service requirements before placing your order.`}</p>{intentCopy?.terminology ? <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{intentCopy.terminology}</p> : null}<div className="mt-7 flex flex-wrap gap-3"><Link href={orderHref} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-black text-black shadow-[0_18px_45px_-20px_rgba(255,132,0,.9)] transition hover:brightness-105">Start Order</Link><Link href={`/services/${service.platform === "x" ? "twitter-x" : service.platform}`} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[.04] px-6 py-3 text-sm font-bold text-white hover:bg-white/[.08]">View {platform.label} Services</Link></div></div>
        <aside className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur sm:p-6"><p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">Service snapshot</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-zinc-500">Rate</p><p className="mt-2 text-lg font-black"><CurrencyAmount amountINR={service.pricePer1000} suffix=" / 1K" /></p></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-zinc-500">Delivery</p><p className="mt-2 text-sm font-black">{service.deliveryTime}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-zinc-500">Minimum</p><p className="mt-2 text-sm font-black">{service.minQuantity.toLocaleString("en-IN")}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-zinc-500">Refill</p><p className="mt-2 text-sm font-black">{service.refillPolicy}</p></div></div></aside></div></section>
        <section className="mt-8 grid gap-4 md:grid-cols-3">{[["Public-link ordering", `Submit only the correct eligible ${target} link. Passwords and OTPs are never required.`],["Clear order details", `Check quantity, rate, delivery estimate and ${service.refillPolicy.toLowerCase()} before checkout.`],["Dashboard tracking", "Track your order status from your SocialRUSH account after the order is created."]].map(([title, copy]) => <article key={title} className="rounded-3xl border border-white/10 bg-[#0d1118] p-6"><h2 className="text-lg font-black">{title}</h2><p className="mt-3 text-sm leading-7 text-zinc-400">{copy}</p></article>)}</section>
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]"><article className="rounded-3xl border border-white/10 bg-[#0d1118] p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">Before you order</p><h2 className="mt-3 text-2xl font-black">Use the correct {target}</h2><p className="mt-4 text-sm leading-7 text-zinc-300">{service.importantInstruction}</p><div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/[.07] p-4 text-sm leading-7 text-orange-100">Keep the destination available while the order is processing. Do not change the username, handle, privacy setting or target URL unless support asks you to.</div></article><article className="rounded-3xl border border-white/10 bg-[#0d1118] p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">Suitable for</p><h2 className="mt-3 text-2xl font-black">Simple campaign use cases</h2><div className="mt-5 flex flex-wrap gap-2">{["Creators", "Brands", "Agencies", "Marketing teams"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-sm font-bold text-zinc-200">{item}</span>)}</div></article></section>
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d1118] p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">FAQ</p><h2 className="mt-3 text-2xl font-black">Questions about {faqName}</h2><div className="mt-6 grid gap-3">{faq.map(([question, answer]) => <details key={question} className="rounded-2xl border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer list-none text-sm font-black text-white">{question}</summary><p className="mt-3 text-sm leading-7 text-zinc-400">{answer}</p></details>)}</div></section>
        <section className="mt-8 rounded-3xl border border-orange-400/20 bg-gradient-to-r from-orange-500/10 to-amber-400/5 p-6 text-center sm:p-8"><h2 className="text-2xl font-black">Ready to get started?</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-300">Review the current rate, quantity, delivery estimate and service requirements, then continue securely through the SocialRUSH checkout.</p><Link href={orderHref} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-7 py-3 text-sm font-black text-black">Continue to Order</Link></section>
      </div></div></InteractiveHomepageShell>
      {supportsAuthorityCluster ? <MoneyPageAuthorityLinks platform={authorityPlatform as "instagram" | "youtube" | "facebook" | "linkedin" | "tiktok" | "twitter" | "telegram"} /> : null}
    </PublicShell>
  );
}
