import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import CurrencyAmount from "@/components/currency/CurrencyAmount";
import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import { getCurrencyDisclaimer } from "@/lib/currency";
import { getGrowthService, growthServices } from "@/lib/growth-services";
import { activeSmmServices, platformMeta } from "@/lib/smm-service-catalog";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import FacebookViewsLanding from "@/components/marketing/FacebookViewsLanding";
import CrossSellRecommendations from "@/components/marketing/CrossSellRecommendations";

const siteUrl = SEO_SITE_URL;

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function routeTitle(slug: string) {
  switch (slug) {
    case "instagram-followers": return "Instagram Followers India";
    case "instagram-likes": return "Instagram Likes India";
    case "instagram-views": return "Instagram Views India";
    case "youtube-subscribers": return "YouTube Subscribers Service India";
    case "youtube-likes": return "YouTube Likes India";
    case "youtube-views": return "YouTube Views India";
    case "linkedin-followers": return "LinkedIn Followers India";
    case "telegram-members": return "Telegram Members India";
    case "facebook-followers": return "Facebook Followers India";
    case "smm-panel-india": return "SMM Panel India";
    default: return slug.replace(/-/g, " ");
  }
}

function getFaqs(slug: string, title: string, price: string, delivery: string) {
  return [
    { question: `How do I buy ${title}?`, answer: `Open Packages or New Order, choose ${title}, add your public link, and confirm the checkout flow.` },
    { question: "Is this page suitable for India?", answer: `Yes. This page targets buyers searching for ${routeTitle(slug).toLowerCase()} and related SMM panel services in India.` },
    { question: "Can I track the order?", answer: "Yes. You can track status from the dashboard after checkout." },
    { question: "What is the starting price?", answer: `Starting price is ${price} with delivery around ${delivery}.` },
  ];
}

export async function generateStaticParams() {
  return [
    ...growthServices.map((service) => ({ slug: service.slug })),
    ...activeSmmServices.map((service) => ({ slug: service.code })),
    { slug: "smm-panel-india" },
  ];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (params.slug === "facebook-views") {
    return {
      metadataBase: new URL(siteUrl),
      title: { absolute: "Buy Facebook Views India | SocialRUSH" },
      description: "Buy Facebook views in India with SocialRUSH. Public video-link ordering, transparent live pricing, dashboard tracking and WhatsApp support. No password required.",
      alternates: { canonical: "/facebook-views" },
      robots: { index: false, follow: true },
    };
  }
  const seo = getSeoData(params.slug);
  if (!seo) return {};

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: `/services/${params.slug}` },
    openGraph: {
      type: "article",
      siteName: "SocialRUSH",
      title: seo.title,
      description: seo.description,
      url: `/services/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

function getSeoData(slug: string) {
  const growthService = getGrowthService(slug);
  if (growthService) {
    return {
      title: `${growthService.name} | SocialRUSH`,
      description: `${growthService.description} Explore benefits, FAQs, and direct links to packages and pricing.`,
      headline: growthService.name,
      intro: growthService.longDescription,
      price: "View packages for live pricing",
      delivery: growthService.delivery,
      audience: growthService.idealFor,
      benefits: growthService.benefits,
      faqs: growthService.faqs,
      platform: growthService.platform,
    };
  }

  const smmService = activeSmmServices.find((service) => service.code === slug);
  if (smmService) {
    const platform = platformMeta[smmService.platform];
    const title = `${routeTitle(slug)} | SocialRUSH`;
    const price = formatInr(smmService.pricePer1000);
    return {
      title,
      description: `Buy ${smmService.name.toLowerCase()} from SocialRUSH with transparent pricing, dashboard tracking, and support for India-focused growth campaigns.`,
      headline: smmService.name,
      intro: `${smmService.description} SocialRUSH gives you a clean ordering flow, live tracking, and support for campaign management across India and global audiences.`,
      price,
      pricePer1000INR: smmService.pricePer1000,
      delivery: smmService.deliveryTime,
      audience: ["Creators", "Agencies", "Brands", "Marketing teams"],
      benefits: ["Transparent starting price", `Delivery: ${smmService.deliveryTime}`, `Refill: ${smmService.refillPolicy}`, `Quality: ${smmService.qualityType}`],
      faqs: getFaqs(slug, smmService.name, price, smmService.deliveryTime),
      platform: platform.label,
    };
  }

  if (slug === "smm-panel-india") {
    return {
      title: "SMM Panel India | SocialRUSH",
      description: "SocialRUSH is a production-ready SMM panel India platform for Instagram followers, YouTube subscribers, LinkedIn followers, Telegram members, and more.",
      headline: "SMM Panel India",
      intro: "SocialRUSH gives Indian buyers a modern SMM panel with secure checkout, transparent starting rates, and clean dashboard tracking for social growth services.",
      price: "Live pricing in dashboard",
      delivery: "Platform dependent",
      audience: ["Agencies", "Creators", "Resellers", "Brands"],
      benefits: ["Instagram followers India", "YouTube subscribers India", "LinkedIn followers India", "Telegram members India"],
      faqs: getFaqs(slug, "SMM Panel India", "Live pricing", "platform dependent"),
      platform: "India-wide SMM panel",
    };
  }

  return null;
}

export default function ServiceSeoPage({ params }: { params: { slug: string } }) {
  // Keep all commercial authority on the dedicated, sitemap-listed Instagram
  // follower landing page instead of maintaining a competing service detail.
  if (params.slug === "instagram-followers") {
    permanentRedirect("/buy-instagram-followers-india");
  }
  if (params.slug === "facebook-views") return <FacebookViewsLanding />;
  const seo = getSeoData(params.slug);
  if (!seo) notFound();
  const hasBasePrice = "pricePer1000INR" in seo && typeof seo.pricePer1000INR === "number";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: seo.title,
    description: seo.description,
    provider: { "@type": "Organization", name: "SocialRUSH", url: siteUrl },
    areaServed: "IN",
    serviceType: seo.headline,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
      { "@type": "ListItem", position: 3, name: seo.headline, item: `${siteUrl}/services/${params.slug}` },
    ],
  };

  return (
    <PublicShell tone="light3d">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="service-detail-page px-5 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-[32px] border border-white/80 bg-white/78 p-6 shadow-[0_24px_54px_-34px_rgba(15,23,42,.42)] backdrop-blur-xl sm:p-10">
            <p className="inline-flex rounded-full border border-[#FFF8F1] bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9F00]">
              {routeTitle(params.slug)}
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0B0B0F] sm:text-5xl">{seo.headline}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#111827] sm:text-base">{seo.intro}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#FFF8F1] bg-white px-3 py-1.5 text-xs font-bold text-[#FF9F00]">
                {hasBasePrice ? <CurrencyAmount amountINR={seo.pricePer1000INR} suffix=" / 1000" /> : seo.price}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FFF8F1] bg-white px-3 py-1.5 text-xs font-bold text-[#FF9F00]"><PlatformIcon platform={seo.platform} className="h-4 w-4" />{seo.platform}</span>
              <span className="rounded-full border border-[#FFF8F1] bg-white px-3 py-1.5 text-xs font-bold text-[#FF9F00]">{seo.delivery}</span>
            </div>
            {hasBasePrice ? <p className="mt-3 text-xs font-semibold text-[#111827]">{getCurrencyDisclaimer()}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/packages" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white">View Packages</Link>
              <Link href="/pricing" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white px-5 py-3 text-sm font-bold text-[#0B0B0F]">Pricing</Link>
              <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-5 py-3 text-sm font-bold text-[#FF9F00]">Contact Support</Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {seo.benefits.map((item) => (
              <article key={item} className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_16px_34px_-26px_rgba(15,23,42,.35)]">
                <p className="text-sm font-bold text-[#0B0B0F]">{item}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <article className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_42px_-30px_rgba(15,23,42,.38)] sm:p-8">
              <h2 className="text-2xl font-black text-[#0B0B0F]">Why this page matters</h2>
              <p className="mt-4 text-sm leading-7 text-[#111827]">This landing page is built to rank for buyer intent terms, explain the service quickly, and link people into the right conversion path without extra friction.</p>
              <div className="mt-6 space-y-3 text-sm leading-7 text-[#111827]">
                <p>Ideal for: {seo.audience.join(", ")}</p>
                <p>Internal links: Home, Services, Packages, Pricing, Blog, FAQ, and Contact.</p>
              </div>
            </article>
            <aside className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_42px_-30px_rgba(15,23,42,.38)] sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#111827]">Service snapshot</p>
              <div className="mt-4 space-y-3 text-sm text-[#111827]">
                <p><span className="font-bold text-[#0B0B0F]">Price:</span> {hasBasePrice ? <CurrencyAmount amountINR={seo.pricePer1000INR} suffix=" / 1000" /> : seo.price}</p>
                <p><span className="font-bold text-[#0B0B0F]">Delivery:</span> {seo.delivery}</p>
                <p className="flex items-center gap-2"><PlatformIcon platform={seo.platform} className="h-4 w-4 text-[#111827]" /><span><span className="font-bold text-[#0B0B0F]">Platform:</span> {seo.platform}</span></p>
              </div>
            </aside>
          </section>

          <section className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_42px_-30px_rgba(15,23,42,.38)] sm:p-8">
            <h2 className="text-2xl font-black text-[#0B0B0F]">Frequently Asked Questions</h2>
            <div className="mt-5 grid gap-3">
              {seo.faqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-[#FFF8F1] bg-[#FFF8F1] p-4">
                  <summary className="cursor-pointer list-none text-sm font-bold text-[#0B0B0F]">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-[#111827]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#FFF8F1] bg-[#FFF8F1] p-6 sm:p-8">
            <h2 className="text-2xl font-black text-[#0B0B0F]">Explore more</h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-[#0B0B0F]">
              {[["Home", "/"], ["Services", "/services"], ["Packages", "/packages"], ["Pricing", "/pricing"], ["Blog", "/blog"], ["FAQ", "/faq"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={href} href={href} className="rounded-xl border border-[#FFF3E0] bg-white px-4 py-2 transition hover:bg-[#FFF8F1]">
                  {label}
                </Link>
              ))}
            </div>
          </section>
          {activeSmmServices.some((service) => service.code === params.slug) ? <CrossSellRecommendations serviceCode={params.slug} /> : null}
        </div>
      </main>
    </PublicShell>
  );
}
