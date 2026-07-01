import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  Headphones,
  Link2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import {
  getIndiaServiceFaqs,
  getIndiaServicePage,
  type IndiaServiceSlug,
} from "@/lib/seo/india-service-pages";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

const trustCards: Array<{ title: string; icon: LucideIcon }> = [
  { title: "No Password Required", icon: LockKeyhole },
  { title: "Clear Delivery", icon: Clock3 },
  { title: "Refill Information", icon: RefreshCw },
  { title: "Secure Checkout", icon: ShieldCheck },
  { title: "Indian Support", icon: Headphones },
  { title: "Transparent Pricing", icon: BadgeIndianRupee },
];

const comparisonRows = [
  ["Transparent pricing", "Shown before confirmation", "May be unclear"],
  ["No password required", "Public destination only", "May request risky access"],
  ["Support available", "Account and WhatsApp help", "Often limited"],
  ["Multiple platforms", "One organized catalog", "Availability varies"],
  ["Easy website ordering", "Guided checkout flow", "Often manual"],
  ["Refill information", "Shown for eligible services", "Frequently unclear"],
  ["Secure payment options", "Protected funding workflow", "May be unverified"],
  ["Professional experience", "Dashboard and order tracking", "Inconsistent"],
] as const;

const reasonIcons = [
  BriefcaseBusiness,
  BadgeIndianRupee,
  Link2,
  WalletCards,
  Sparkles,
  Users,
] as const;

function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function IndiaServiceLandingPage({
  slug,
}: {
  slug: IndiaServiceSlug;
}) {
  const page = getIndiaServicePage(slug);
  const faqs = getIndiaServiceFaqs(slug);
  const pageUrl = `${SEO_SITE_URL}/${page.slug}`;
  const packagesHref = `/packages?platform=${encodeURIComponent(
    page.platformKey,
  )}&service=${encodeURIComponent(page.packageService)}`;
  const orderHref = `/dashboard/new-order?platform=${encodeURIComponent(
    page.platformKey,
  )}&service=${encodeURIComponent(page.serviceCode)}`;
  const whatsappHref = `https://wa.me/918860330771?text=${encodeURIComponent(
    `Hi SocialRUSH, I need help choosing a ${page.serviceName} package`,
  )}`;
  const reasons = [
    [
      "Professional growth service",
      `Use a structured ordering experience designed for public ${page.platform} campaigns.`,
    ],
    [
      "Clear pricing before checkout",
      `Review the current ₹${page.price.toLocaleString(
        "en-IN",
      )} per 1K rate and exact campaign total before confirming.`,
    ],
    [
      "Easy public-link ordering",
      `Submit the correct ${page.destination}, choose a quantity, and track progress from your account.`,
    ],
    [
      "Connected wallet system",
      "Keep wallet funding, transactions, campaign charges, and order records organized.",
    ],
    [
      "Multi-platform support",
      "Use one catalog for Instagram, YouTube, LinkedIn, Facebook, Twitter/X, Telegram, TikTok, and more.",
    ],
    [
      "Built for Indian customers",
      "INR pricing and practical support make campaign planning clearer for Indian customers.",
    ],
  ] as const;
  const steps = [
    [
      "Choose a package",
      `Compare available ${page.serviceName} quantities, prices, delivery estimates, and support terms.`,
    ],
    [
      `Enter your ${page.platform} link`,
      `Submit the correct ${page.destination}. Your password is never required.`,
    ],
    [
      "Add funds or pay securely",
      "Use the available secure funding flow and review the final campaign total.",
    ],
    [
      "Track your order",
      "Follow delivery status and retain an organized order record in your dashboard.",
    ],
    [
      "Get delivery and support",
      "Delivery begins after confirmation, with support available if the order needs review.",
    ],
  ] as const;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SEO_SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${SEO_SITE_URL}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Buy ${page.serviceName} India`,
        item: pageUrl,
      },
    ],
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${page.serviceName} India`,
    serviceType: `${page.platform} growth service`,
    url: pageUrl,
    areaServed: "IN",
    provider: {
      "@type": "Organization",
      name: "SocialRUSH",
      url: SEO_SITE_URL,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: page.price,
      unitText: `1000 ${page.unitName}`,
      availability: "https://schema.org/InStock",
      url: `${SEO_SITE_URL}${packagesHref}`,
    },
  };

  return (
    <PublicShell tone="light3d">
      {[faqSchema, breadcrumbSchema, serviceSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      ))}

      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24">
        <div className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-pink-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.14fr_.86fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#5270aa] shadow-sm">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 text-white">
                <PlatformIcon platform={page.platform} className="h-4 w-4" />
              </span>
              {page.platform} growth service India
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-[#14316a] sm:text-5xl lg:text-6xl">
              Buy {page.serviceName} India
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#526d9f] sm:text-lg">
              {page.intro}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6079a7]">
              {page.overview}
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Link
                href={packagesHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_-14px_rgba(117,109,255,.65)] transition hover:-translate-y-0.5"
              >
                View Packages <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={orderHref}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#d4e1ff] bg-white/90 px-6 py-3 text-sm font-black text-[#35548d]"
              >
                Order Now
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-black text-emerald-700"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/90 bg-white/80 p-6 shadow-[0_30px_70px_-35px_rgba(35,60,120,.5)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 text-white shadow-lg">
                <PlatformIcon platform={page.platform} className="h-7 w-7" />
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                Available in India
              </span>
            </div>
            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.15em] text-[#7890bb]">
              {page.serviceName}
            </p>
            <p className="mt-2 text-4xl font-black text-[#17366f]">
              ₹{page.price.toLocaleString("en-IN")}{" "}
              <span className="text-sm text-[#6079a7]">per 1K</span>
            </p>
            <p className="mt-3 text-xs leading-6 text-[#6079a7]">
              Final price may depend on selected quantity and package availability.
            </p>
            <dl className="mt-6 grid gap-3 border-t border-[#dce7ff] pt-5 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-[#7890bb]">Required</dt>
                <dd className="max-w-[65%] text-right font-black text-[#294981]">
                  {page.destination}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#7890bb]">Delivery</dt>
                <dd className="text-right font-black text-[#294981]">
                  {page.delivery}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#7890bb]">Refill/support</dt>
                <dd className="max-w-[65%] text-right font-black text-[#294981]">
                  {page.refill}
                </dd>
              </div>
            </dl>
            <Link
              href={orderHref}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white"
            >
              Buy {page.serviceName} Now
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {trustCards.map(({ title, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#dce7ff] bg-white p-4 text-center shadow-[0_16px_34px_-28px_rgba(28,54,108,.45)]"
            >
              <Icon className="mx-auto h-5 w-5 text-[#6873d4]" />
              <h3 className="mt-3 text-xs font-black leading-5 text-[#17366f]">
                {title}
              </h3>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Why SocialRUSH
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#14316a] sm:text-4xl">
            A professional {page.platform} growth service for Indian customers
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6079a7] sm:text-base">
            {page.value} SocialRUSH provides clear campaign details without
            unrealistic promises or requests for private account access.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reasons.map(([title, text], index) => {
              const Icon = reasonIcons[index];
              return (
                <article
                  key={title}
                  className="rounded-3xl border border-white/90 bg-white/80 p-6 shadow-[0_22px_52px_-36px_rgba(35,60,120,.5)] backdrop-blur-xl"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#f6eaff] to-[#e7f7ff] text-[#6873d4]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-black text-[#17366f]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#6079a7]">{text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-[#14316a]">
            Who is this {page.serviceName} service for?
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {page.audiences.map((audience) => (
              <article
                key={audience}
                className="rounded-2xl border border-[#dce7ff] bg-white p-5 text-center shadow-sm"
              >
                <Users className="mx-auto h-5 w-5 text-pink-600" />
                <h3 className="mt-3 text-sm font-black text-[#17366f]">
                  {audience}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#14316a]">
            Order in five clear steps
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {steps.map(([title, text], index) => (
              <article
                key={title}
                className="rounded-3xl border border-white/90 bg-white/80 p-5 shadow-[0_20px_48px_-34px_rgba(35,60,120,.5)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-base font-black text-[#17366f]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6079a7]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_24px_56px_-38px_rgba(35,60,120,.5)] sm:p-8">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            <h2 className="mt-5 text-2xl font-black text-[#14316a]">
              Is it safe to buy {page.serviceName} from SocialRUSH?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6079a7]">
              {page.safety}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#6079a7]">
              No campaign can guarantee virality, revenue, rankings, or permanent
              platform outcomes. Combine visible growth with useful content and
              responsible account management.
            </p>
          </article>
          <article className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_24px_56px_-38px_rgba(35,60,120,.5)] sm:p-8">
            <RefreshCw className="h-8 w-8 text-blue-600" />
            <h2 className="mt-5 text-2xl font-black text-[#14316a]">
              Delivery and refill support
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6079a7]">
              {page.deliveryCopy}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#6079a7]">
              Current refill or support coverage is shown before checkout. Contact
              support with your order ID if an eligible campaign needs review.
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-[#14316a]">
            SocialRUSH vs random providers
          </h2>
          <div className="mt-8 overflow-x-auto rounded-3xl border border-[#dce7ff] bg-white shadow-[0_24px_56px_-38px_rgba(35,60,120,.5)]">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[#f5f8ff] text-[#294981]">
                <tr>
                  {["Comparison", "SocialRUSH", "Random providers"].map((head) => (
                    <th key={head} className="px-5 py-4 font-black">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5edff] text-[#6079a7]">
                {comparisonRows.map(([label, socialRush, other]) => (
                  <tr key={label}>
                    <th className="px-5 py-4 font-bold text-[#294981]">{label}</th>
                    <td className="px-5 py-4">{socialRush}</td>
                    <td className="px-5 py-4">{other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-[#14316a]">
            Explore related growth services
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {page.related.map((relatedSlug) => {
              const related = getIndiaServicePage(relatedSlug);
              return (
                <Link
                  key={related.slug}
                  href={`/${related.slug}`}
                  className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-[0_18px_42px_-30px_rgba(28,54,108,.45)] transition hover:-translate-y-1 hover:border-[#cbdcff]"
                >
                  <PlatformIcon
                    platform={related.platform}
                    className="h-6 w-6 text-pink-600"
                  />
                  <h3 className="mt-4 text-base font-black text-[#17366f]">
                    {related.serviceName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#6079a7]">
                    View pricing, delivery information, safety guidance, and
                    frequently asked questions.
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["All packages", "/packages"],
              ["All services", "/services"],
              ["Contact support", "/contact"],
              ["Growth blog", "/blog"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-[#d4e1ff] bg-white px-4 py-3 text-sm font-bold text-[#35548d]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-black tracking-tight text-[#14316a]">
            {page.serviceName} FAQs
          </h2>
          <div className="mt-9 grid gap-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_18px_42px_-32px_rgba(35,60,120,.5)] sm:p-6"
              >
                <h3 className="text-base font-black text-[#17366f]">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#6079a7]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/90 bg-[linear-gradient(135deg,#fff1f8_0%,#eef7ff_48%,#f4efff_100%)] p-7 text-center shadow-[0_30px_70px_-38px_rgba(35,60,120,.5)] sm:p-12">
          <BarChart3 className="mx-auto h-9 w-9 text-violet-600" />
          <h2 className="mt-5 text-3xl font-black tracking-tight text-[#14316a]">
            Ready to grow your {page.platform} presence?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6079a7]">
            Compare current packages, review delivery and support terms, and start
            with the campaign size that fits your goals.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
            <Link
              href={packagesHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-black text-white"
            >
              View {page.platform} Packages
            </Link>
            <Link
              href={orderHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#d4e1ff] bg-white px-6 py-3 text-sm font-black text-[#35548d]"
            >
              Start Order
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-black text-emerald-700"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
