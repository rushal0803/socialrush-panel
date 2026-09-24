import Link from "next/link";
import PublicShell from "@/components/marketing/PublicShell";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

const related = [
  ["tiktok-likes", "TikTok Likes"],
  ["tiktok-views", "TikTok Views"],
  ["tiktok-custom-comments", "TikTok Comments"],
  ["tiktok-saves", "TikTok Saves"],
] as const;

const copy = {
  "tiktok-likes": {
    h1: "Buy TikTok Likes",
    intro: "Add likes to an eligible public TikTok video with a straightforward ordering flow. Review the live service details before checkout and use the exact public video URL for your order.",
    requirement: "Use the public URL of the TikTok video that should receive likes.",
    use: "Creators, brands and marketing teams that want to support visible engagement on a specific TikTok post.",
  },
  "tiktok-views": {
    h1: "Buy TikTok Views",
    intro: "Order TikTok views for an eligible public video and track the order from your SocialRUSH dashboard. Live service details are shown before you place the order.",
    requirement: "Use the public URL of the TikTok video that should receive views.",
    use: "Creators and campaigns that want additional visibility on a specific public TikTok video.",
  },
  "tiktok-custom-comments": {
    h1: "Buy TikTok Custom Comments",
    intro: "Order customer-provided comments for an eligible public TikTok video. Use the correct public video URL and provide the requested comment text during ordering.",
    requirement: "Use an eligible public TikTok video URL and provide the comment text requested by the order form.",
    use: "Campaigns that need specific, customer-written comment text on an eligible TikTok post.",
  },
  "tiktok-saves": {
    h1: "Buy TikTok Saves",
    intro: "Order saves for an eligible public TikTok video through SocialRUSH. Check the current service details first, then submit the exact public video URL at checkout.",
    requirement: "Use the public URL of the TikTok video that should receive saves.",
    use: "Creators and marketers supporting engagement signals on a specific eligible TikTok post.",
  },
} as const;

export type TikTokCommercialSlug = keyof typeof copy;

function safeJson(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function TikTokCommercialLanding({ slug }: { slug: TikTokCommercialSlug }) {
  const catalog = activeSmmServices.find((service) => service.code === slug);
  if (!catalog) return null;

  const live = await getLiveServiceFacts(catalog.platform, catalog.name, catalog.code);
  const details = copy[slug];
  const canonical = `${SEO_SITE_URL}/services/${slug}`;
  const service = live?.available
    ? {
        rate: live.rate,
        min: live.min,
        max: live.max,
        deliveryTime: live.deliveryTime,
        refillPolicy: live.refillPolicy,
        qualityType: live.qualityType,
        importantInstruction: live.importantInstruction,
      }
    : null;

  const faqs = [
    ["What link should I submit?", details.requirement],
    ["Do I need to share my TikTok password?", "No. SocialRUSH uses the eligible public TikTok URL required for the service; do not share your TikTok password."],
    ["Where can I check my order?", "After checkout, use your SocialRUSH dashboard to review the order status."],
    ["How do I check the current price and delivery details?", "Review the live service information shown in the ordering flow before confirming your order. Service details can change, so the live catalog is the source of truth."],
  ] as const;

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: details.h1,
      description: details.intro,
      url: canonical,
      provider: { "@type": "Organization", name: "SocialRUSH", url: SEO_SITE_URL },
      areaServed: "Worldwide",
      serviceType: catalog.name,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SEO_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Services", item: `${SEO_SITE_URL}/services` },
        { "@type": "ListItem", position: 3, name: details.h1, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([name, text]) => ({
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      })),
    },
  ];

  return (
    <PublicShell>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(schema) }} />
      ))}
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/services">Services</Link> <span aria-hidden="true">/</span> <span>{details.h1}</span>
        </nav>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">TikTok growth service</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{details.h1}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{details.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard/new-order" className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">Start an order</Link>
            <Link href="/services" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-900">View all services</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-950">What you need</h2>
            <p className="mt-3 leading-7 text-slate-600">{details.requirement}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-950">Who it is for</h2>
            <p className="mt-3 leading-7 text-slate-600">{details.use}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-950">Live service details</h2>
            {service ? (
              <ul className="mt-3 space-y-2 text-slate-600">
                <li>Minimum: {service.min.toLocaleString("en-IN")}</li>
                <li>Maximum: {service.max.toLocaleString("en-IN")}</li>
                <li>Delivery: {service.deliveryTime}</li>
                <li>Refill: {service.refillPolicy}</li>
              </ul>
            ) : (
              <p className="mt-3 leading-7 text-slate-600">Check the live ordering flow for current availability, pricing, limits and delivery details.</p>
            )}
          </article>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">How ordering works</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            <li><strong>1. Choose the service.</strong><p className="mt-1 text-slate-600">Open New Order and select the matching TikTok service.</p></li>
            <li><strong>2. Add the correct public link.</strong><p className="mt-1 text-slate-600">Double-check the TikTok URL before confirming the order.</p></li>
            <li><strong>3. Track from your dashboard.</strong><p className="mt-1 text-slate-600">Use the order dashboard for status and support.</p></li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-950">Related TikTok services</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {related.filter(([code]) => code !== slug).map(([code, label]) => (
              <Link key={code} href={`/services/${code}`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">{label}</Link>
            ))}
            <Link href="/tiktok-followers" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">TikTok Followers</Link>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">Frequently asked questions</h2>
          <div className="mt-5 space-y-5">
            {faqs.map(([question, answer]) => (
              <article key={question}>
                <h3 className="font-bold text-slate-950">{question}</h3>
                <p className="mt-1 leading-7 text-slate-600">{answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
