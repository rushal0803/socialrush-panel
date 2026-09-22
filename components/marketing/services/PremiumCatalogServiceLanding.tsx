import Link from "next/link";
import PlatformIcon from "@/components/PlatformIcon";
import CurrencyAmount from "@/components/currency/CurrencyAmount";
import PublicShell from "@/components/marketing/PublicShell";
import InteractiveHomepageShell from "@/components/marketing/InteractiveHomepageShell";
import { activeSmmServices, platformMeta } from "@/lib/smm-service-catalog";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

function safeJson(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function PremiumCatalogServiceLanding({ serviceCode }: { serviceCode: string }) {
  const catalog = activeSmmServices.find((service) => service.code === serviceCode);
  if (!catalog) return null;

  const live = catalog.requiresLiveCatalogFacts
    ? await getLiveServiceFacts(catalog.platform, catalog.name, catalog.code)
    : null;

  const service = live?.available
    ? {
        ...catalog,
        pricePer1000: live.rate,
        minQuantity: live.min,
        maxQuantity: live.max,
        deliveryTime: live.deliveryTime,
        refillPolicy: live.refillPolicy,
        qualityType: live.qualityType,
        importantInstruction: live.importantInstruction,
      }
    : catalog;

  const platform = platformMeta[service.platform];
  const orderHref = `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`;
  const canonical = `${SEO_SITE_URL}/services/${service.code}`;

  const faq = [
    [
      `How do I order ${service.name}?`,
      `Choose your quantity, enter the correct public ${platform.label} link, review the total, and continue to checkout. Your order can then be tracked from the SocialRUSH dashboard.`,
    ],
    [
      "Do I need to share my password?",
      `No. SocialRUSH only requires the eligible public ${platform.label} link needed for this service. Never share your password, OTP, recovery code or UPI PIN.`,
    ],
    [
      "How long does delivery take?",
      `The current delivery estimate is ${service.deliveryTime}. Timing can vary with quantity and destination availability.`,
    ],
    [
      "What is the refill policy?",
      `The current service policy is: ${service.refillPolicy}. Review the order details before checkout because service conditions can change.`,
    ],
  ] as const;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: { "@type": "Organization", name: "SocialRUSH", url: SEO_SITE_URL },
    serviceType: service.name,
    url: canonical,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SEO_SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SEO_SITE_URL}/services` },
      { "@type": "ListItem", position: 3, name: service.name, item: canonical },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };

  return (
    <PublicShell tone="default">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />

      <InteractiveHomepageShell><div className="service-money-page bg-[#07090d] px-4 pb-20 pt-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-5 text-xs font-semibold text-zinc-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/services" className="hover:text-white">Services</Link>
            <span className="mx-2">/</span>
            <span className="text-orange-300">{service.name}</span>
          </nav>

          <section className="overflow-hidden rounded-[32px] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,.18),transparent_34%),linear-gradient(145deg,#10141c,#090b10)] p-6 shadow-2xl sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.14em] text-orange-200">
                  <PlatformIcon platform={platform.label} className="h-4 w-4" />
                  {platform.label} service
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {service.name}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                  {service.description} Review the current rate, quantity limits and service requirements before placing your order.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={orderHref} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-black text-black shadow-[0_18px_45px_-20px_rgba(255,132,0,.9)] transition hover:brightness-105">
                    Start {service.name} Order
                  </Link>
                  <Link href={`/services/${service.platform === "x" ? "twitter-x" : service.platform}`} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[.04] px-6 py-3 text-sm font-bold text-white hover:bg-white/[.08]">
                    View {platform.label} Services
                  </Link>
                </div>
              </div>

              <aside className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur sm:p-6">
                <p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">Service snapshot</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                    <p className="text-xs text-zinc-500">Rate</p>
                    <p className="mt-2 text-lg font-black"><CurrencyAmount amountINR={service.pricePer1000} suffix=" / 1K" /></p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                    <p className="text-xs text-zinc-500">Delivery</p>
                    <p className="mt-2 text-sm font-black">{service.deliveryTime}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                    <p className="text-xs text-zinc-500">Minimum</p>
                    <p className="mt-2 text-sm font-black">{service.minQuantity.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                    <p className="text-xs text-zinc-500">Refill</p>
                    <p className="mt-2 text-sm font-black">{service.refillPolicy}</p>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Public-link ordering", "Submit only the correct eligible public link. Passwords and OTPs are never required."],
              ["Clear order details", `Check quantity, rate, delivery estimate and ${service.refillPolicy.toLowerCase()} before checkout.`],
              ["Dashboard tracking", "Track your order status from your SocialRUSH account after the order is created."],
            ].map(([title, copy]) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-[#0d1118] p-6">
                <h2 className="text-lg font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{copy}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <article className="rounded-3xl border border-white/10 bg-[#0d1118] p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">Before you order</p>
              <h2 className="mt-3 text-2xl font-black">Use the correct {platform.label} destination</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-300">{service.importantInstruction}</p>
              <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/[.07] p-4 text-sm leading-7 text-orange-100">
                Keep the destination available while the order is processing. Do not change the username, handle, privacy setting or target URL unless support asks you to.
              </div>
            </article>
            <article className="rounded-3xl border border-white/10 bg-[#0d1118] p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">Suitable for</p>
              <h2 className="mt-3 text-2xl font-black">Simple campaign use cases</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Creators", "Brands", "Agencies", "Marketing teams"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-sm font-bold text-zinc-200">{item}</span>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d1118] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">FAQ</p>
            <h2 className="mt-3 text-2xl font-black">Questions about {service.name}</h2>
            <div className="mt-6 grid gap-3">
              {faq.map(([question, answer]) => (
                <details key={question} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <summary className="cursor-pointer list-none text-sm font-black text-white">{question}</summary>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-orange-400/20 bg-gradient-to-r from-orange-500/10 to-amber-400/5 p-6 text-center sm:p-8">
            <h2 className="text-2xl font-black">Ready to place your {service.name} order?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-300">Review the live order details and continue through the secure SocialRUSH checkout.</p>
            <Link href={orderHref} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-7 py-3 text-sm font-black text-black">Start Order</Link>
          </section>
        </div>
      </div></InteractiveHomepageShell>
    </PublicShell>
  );
}
