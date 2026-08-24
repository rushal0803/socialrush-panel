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
  getCanonicalIndiaServicePath,
  getIndiaServiceFaqs,
  getIndiaServicePage,
  indiaServiceSlugs,
  type IndiaServiceSlug,
} from "@/lib/seo/india-service-pages";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { getLiveServiceFacts } from "@/lib/seo/live-service";
import TelegramFollowersLanding from "@/components/marketing/TelegramFollowersLanding";

const trustCards: Array<{ title: string; icon: LucideIcon }> = [
  { title: "No Password Required", icon: LockKeyhole },
  { title: "Real-time Order Tracking", icon: Clock3 },
  { title: "Refill Support If Eligible", icon: RefreshCw },
  { title: "Secure Checkout", icon: ShieldCheck },
  { title: "WhatsApp Support", icon: Headphones },
  { title: "Transparent Pricing", icon: BadgeIndianRupee },
];

const relatedBlogMap: Record<string, string[]> = {
  instagram: [
    "how-to-increase-instagram-followers-safely-in-india",
    "how-to-grow-instagram-followers-in-india",
    "instagram-followers-price-in-india",
    "is-it-safe-to-buy-instagram-followers",
    "instagram-followers-vs-engagement",
  ],
  youtube: [
    "how-to-promote-new-youtube-channel-in-india",
    "how-to-get-more-youtube-views-on-new-videos",
    "how-to-increase-youtube-subscribers-in-india",
    "youtube-views-price-in-india",
    "youtube-views-get-more-reach",
  ],
  linkedin: [
    "linkedin-profile-growth-tips-for-business-owners",
    "linkedin-followers-for-business-growth",
    "best-way-to-grow-linkedin-followers-for-business",
    "linkedin-growth-tips-personal-brands",
  ],
  facebook: [
    "facebook-page-growth-tips-for-local-businesses",
    "best-social-media-growth-services-for-indian-creators",
    "social-media-growth-strategy-indian-creators",
    "choose-the-right-social-media-service",
  ],
  telegram: [
    "how-social-media-growth-campaigns-work",
    "best-social-media-growth-services-for-indian-creators",
    "social-media-growth-strategy-indian-creators",
    "social-media-campaign-mistakes-to-avoid",
  ],
  tiktok: [
    "how-social-media-growth-campaigns-work",
    "best-social-media-growth-services-for-indian-creators",
    "social-media-growth-strategy-indian-creators",
    "choose-the-right-social-media-service",
  ],
  twitter: [
    "why-public-link-ordering-is-safer",
    "best-social-media-growth-services-for-indian-creators",
    "social-media-growth-strategy-indian-creators",
    "linkedin-growth-tips-personal-brands",
  ],
};

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

const keywordResourceMap: Record<string, Array<{ label: string; href: string; text: string }>> = {
  twitter: [
    { label: "Twitter/X follower packages", href: "/packages?platform=twitter&service=followers", text: "Compare current follower quantities and live INR pricing before starting an order." },
    { label: "Twitter follower pricing", href: "/pricing", text: "See how SocialRUSH presents current service pricing and package availability." },
    { label: "Twitter/X services", href: "/services?platform=twitter", text: "Browse the available Twitter/X service options and their public-link requirements." },
    { label: "Safe public-link ordering", href: "/blog/why-public-link-ordering-is-safer", text: "Learn why a public profile link is safer than sharing account credentials." },
  ],
  instagram: [
    {
      label: "Buy Instagram followers India",
      href: "/buy-instagram-followers-india",
      text: "Compare follower packages, delivery notes, no-password ordering and refill information.",
    },
    {
      label: "Instagram followers price in India",
      href: "/blog/instagram-followers-price-in-india",
      text: "Understand what affects Instagram follower pricing before choosing a campaign size.",
    },
    {
      label: "Instagram likes India",
      href: "/instagram-likes",
      text: "Review Instagram likes for public posts and reels with transparent pricing.",
    },
    {
      label: "Instagram views India",
      href: "/instagram-views",
      text: "Explore Instagram video and reel view support with fast public-link ordering.",
    },
    {
      label: "Instagram saves India",
      href: "/buy-instagram-saves-india",
      text: "Review Instagram save activity for eligible public posts and Reels.",
    },
  ],
  youtube: [
    {
      label: "Buy YouTube subscribers India",
      href: "/youtube-subscribers",
      text: "Review subscriber pricing, public channel link requirements and delivery expectations.",
    },
    {
      label: "YouTube views price India",
      href: "/blog/youtube-views-price-in-india",
      text: "Learn how view package pricing can vary by quantity, service quality and availability.",
    },
    {
      label: "YouTube likes India",
      href: "/youtube-likes",
      text: "Compare like campaigns for public YouTube videos with dashboard tracking.",
    },
    {
      label: "YouTube views India",
      href: "/youtube-views",
      text: "Explore YouTube view campaigns for public videos and channel growth planning.",
    },
  ],
  linkedin: [
    {
      label: "LinkedIn followers India",
      href: "/linkedin-followers",
      text: "Compare LinkedIn follower campaigns for profiles and company pages.",
    },
    {
      label: "LinkedIn profile growth India",
      href: "/blog/linkedin-profile-growth-tips-for-business-owners",
      text: "Read practical profile growth tips for founders, consultants and business owners.",
    },
    {
      label: "LinkedIn followers for business growth",
      href: "/blog/linkedin-followers-for-business-growth",
      text: "Understand how visible professional audiences can support business credibility.",
    },
  ],
  facebook: [
    {
      label: "Facebook followers India",
      href: "/buy-facebook-followers-india",
      text: "Review Facebook follower campaign options for public pages and profiles.",
    },
    {
      label: "Facebook page growth India",
      href: "/blog/facebook-page-growth-tips-for-local-businesses",
      text: "Learn how local businesses can improve page visibility and trust signals.",
    },
    {
      label: "Facebook likes India",
      href: "/facebook-likes",
      text: "Explore Facebook likes for eligible public posts with clear order guidance.",
    },
  ],
};

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

export default async function IndiaServiceLandingPage({
  slug,
  canonicalPath = getCanonicalIndiaServicePath(slug),
}: {
  slug: IndiaServiceSlug;
  canonicalPath?: string;
}) {
  const page = getIndiaServicePage(slug);
  if (slug === "buy-telegram-members-india") {
    const liveTelegram = await getLiveServiceFacts("telegram", "Telegram Premium Members");
    return <TelegramFollowersLanding live={liveTelegram} />;
  }
  const isTwitterFollowers = slug === "buy-twitter-followers-india";
  const live = await getLiveServiceFacts(page.platformKey, page.serviceName);
  const available = Boolean(live?.available);
  const currentPrice = live?.rate;
  const minQuantity = live?.min;
  const maxQuantity = live?.max;
  const delivery = live?.deliveryTime || "Current estimate unavailable";
  const refill = live?.refillPolicy || "Current terms unavailable";
  const faqs = getIndiaServiceFaqs(slug).map((faq) => {
    if (faq.question.startsWith("What is the price")) return { ...faq, answer: currentPrice ? `The current starting rate is ₹${currentPrice.toLocaleString("en-IN")} per 1,000 ${page.unitName}. The exact total is shown before confirmation.` : "Live pricing is temporarily unavailable. Check the Services page before ordering." };
    if (faq.question === "How long does delivery take?") return { ...faq, answer: `The current estimate is ${delivery}. Actual timing can vary with quantity, destination availability, and platform conditions.` };
    if (faq.question === "Is refill support available?") return { ...faq, answer: `${refill}. Confirm the current coverage before ordering.` };
    return faq;
  });
  const pageUrl = new URL(canonicalPath, `${SEO_SITE_URL}/`).toString();
  const blogKey = page.platformKey === "x" ? "twitter" : page.platformKey;
  const relatedBlogs = (relatedBlogMap[blogKey] ?? relatedBlogMap.instagram)
    .map((articleSlug) => blogArticles.find((article) => article.slug === articleSlug))
    .filter((article): article is (typeof blogArticles)[number] => Boolean(article));
  const keywordResources =
    keywordResourceMap[blogKey] ??
    keywordResourceMap[page.platformKey] ??
    [
      {
        label: "Social media growth packages India",
        href: "/packages",
        text: "Compare SocialRUSH packages with transparent pricing, public-link ordering and dashboard tracking.",
      },
      {
        label: "Social media growth services India",
        href: "/services",
        text: "Browse SocialRUSH services across Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and Twitter/X.",
      },
      {
        label: "How social media growth campaigns work",
        href: "/blog/how-social-media-growth-campaigns-work",
        text: "Learn the basics of public-link ordering, delivery, tracking and support.",
      },
    ];
  const allServiceLinks = indiaServiceSlugs
    .filter((serviceSlug) => serviceSlug !== slug)
    .map((serviceSlug) => {
      const servicePage = getIndiaServicePage(serviceSlug);
      return {
        href: getCanonicalIndiaServicePath(serviceSlug),
        label: servicePage.serviceName,
        platform: servicePage.platform,
      };
    })
    .sort((left, right) => Number(right.platform === page.platform) - Number(left.platform === page.platform))
    .slice(0, 5);
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
      currentPrice ? `Review the current ₹${currentPrice.toLocaleString("en-IN")} per 1K rate and exact campaign total before confirming.` : "Review the current rate and exact campaign total before confirming.",
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
      "Create your account",
      "Sign up or log in to access your SocialRUSH dashboard and order history.",
    ],
    [
      "Choose your platform",
      `Select ${page.platform} from the available social media platforms.`,
    ],
    [
      "Choose your service",
      `Choose ${page.serviceName} and review the current price, delivery estimate, and refill information.`,
    ],
    [
      "Submit your public link",
      `Enter the correct ${page.destination}. Your password is never required.`,
    ],
    [
      "Add funds or pay securely",
      "Use the available secure funding flow and review the final campaign total.",
    ],
    [
      "Track your order",
      "Follow delivery status and retain an organized order record in your dashboard.",
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
      ...(currentPrice ? { price: currentPrice } : {}),
      unitText: `1000 ${page.unitName}`,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
        <div className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.14fr_.86fr]">
          <div>
            {isTwitterFollowers ? (
              <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-[#4B5563]">
                <Link href="/" className="hover:text-[#FF7A00]">Home</Link><span aria-hidden="true">/</span><Link href="/services?platform=twitter" className="hover:text-[#FF7A00]">Twitter/X Services</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-[#111827]">Twitter/X Followers</span>
              </nav>
            ) : null}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#111827] shadow-sm">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-amber-500 text-white">
                <PlatformIcon platform={page.platform} className="h-4 w-4" />
              </span>
              {page.platform} growth service India
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-[#0B0B0F] sm:text-5xl lg:text-6xl">
              Buy {page.serviceName} in India
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#111827] sm:text-lg">
              {page.intro}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#111827]">
              {page.overview}
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Link
                href={packagesHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_-14px_rgba(255, 196, 0, .65)] transition hover:-translate-y-0.5"
              >
                {slug === "buy-instagram-comments-india" ? "Buy Instagram Comments" : "View Packages"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={available ? orderHref : "#service-status"}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white/90 px-6 py-3 text-sm font-black text-[#FF9F00]"
              >
                {available ? "Start Order" : "Temporarily unavailable"}
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

          <aside className="rounded-[2rem] border border-white/90 bg-white/80 p-6 shadow-[0_30px_70px_-35px_rgba(255, 159, 0, .5)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-amber-500 text-white shadow-lg">
                <PlatformIcon platform={page.platform} className="h-7 w-7" />
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                {available ? "Available now" : "Temporarily unavailable"}
              </span>
            </div>
            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.15em] text-[#111827]">
              {page.serviceName}
            </p>
            <p className="mt-2 text-4xl font-black text-[#0B0B0F]">
              {currentPrice ? `₹${currentPrice.toLocaleString("en-IN")}` : "Live price unavailable"}{" "}
              <span className="text-sm text-[#111827]">per 1K</span>
            </p>
            <p className="mt-3 text-xs leading-6 text-[#111827]">
              Final price may depend on selected quantity and package availability.
            </p>
            <dl className="mt-6 grid gap-3 border-t border-[#FFF8F1] pt-5 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-[#111827]">Required</dt>
                <dd className="max-w-[65%] text-right font-black text-[#0B0B0F]">
                  {page.destination}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#111827]">Minimum</dt>
                <dd className="text-right font-black text-[#0B0B0F]">{minQuantity ? minQuantity.toLocaleString("en-IN") : "Shown before checkout"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#111827]">Maximum</dt>
                <dd className="text-right font-black text-[#0B0B0F]">{maxQuantity ? maxQuantity.toLocaleString("en-IN") : "Shown before checkout"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#111827]">Delivery</dt>
                <dd className="text-right font-black text-[#0B0B0F]">
                  {delivery}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#111827]">Refill/support</dt>
                <dd className="max-w-[65%] text-right font-black text-[#0B0B0F]">
                  {refill}
                </dd>
              </div>
            </dl>
            <Link
              id="service-status"
              href={available ? orderHref : "/services"}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white"
            >
              {available ? (slug === "buy-instagram-comments-india" ? "Buy Instagram Comments" : `Start ${page.serviceName} Order`) : "View available alternatives"}
            </Link>
          </aside>
        </div>
      </section>

      {isTwitterFollowers ? (
        <section aria-labelledby="twitter-price-heading" className="bg-white/65 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/90 bg-white/80 p-6 shadow-[0_22px_52px_-36px_rgba(255,159,0,.5)] sm:p-8"><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">India pricing</p><h2 id="twitter-price-heading" className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">Twitter/X Followers Price in India</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-[#111827]">Twitter/X follower pricing varies by the quantity and currently available package. The live selector shows the current INR rate and your exact total before payment, so you can choose the package that fits your campaign.</p><div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row"><Link href={packagesHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0B0B0F] px-5 py-2.5 text-sm font-black text-white">View live Twitter/X packages</Link><Link href="/pricing" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white px-5 py-2.5 text-sm font-black text-[#FF9F00]">Explore pricing</Link></div></div>
        </section>
      ) : null}

      <section className="bg-white/65 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {trustCards.map(({ title, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#FFF8F1] bg-white p-4 text-center shadow-[0_16px_34px_-28px_rgba(255, 159, 0, .45)]"
            >
              <Icon className="mx-auto h-5 w-5 text-[#FF9F00]" />
              <h3 className="mt-3 text-xs font-black leading-5 text-[#0B0B0F]">
                {title}
              </h3>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
            Why SocialRUSH
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#0B0B0F] sm:text-4xl">
            A professional {page.platform} growth service for Indian customers
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#111827] sm:text-base">
            {page.value} SocialRUSH provides clear campaign details without
            unrealistic promises or requests for private account access.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reasons.map(([title, text], index) => {
              const Icon = reasonIcons[index];
              return (
                <article
                  key={title}
                  className="rounded-3xl border border-white/90 bg-white/80 p-6 shadow-[0_22px_52px_-36px_rgba(255, 159, 0, .5)] backdrop-blur-xl"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FFF8F1] to-[#FFF8F1] text-[#FF9F00]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-black text-[#0B0B0F]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#111827]">{text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-[#0B0B0F]">
            Who is this {page.serviceName} service for?
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {page.audiences.map((audience) => (
              <article
                key={audience}
                className="rounded-2xl border border-[#FFF8F1] bg-white p-5 text-center shadow-sm"
              >
                <Users className="mx-auto h-5 w-5 text-orange-600" />
                <h3 className="mt-3 text-sm font-black text-[#0B0B0F]">
                  {audience}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
            Service directory
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">
            Compare SocialRUSH service pages
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#111827]">
            Explore related Instagram, YouTube, Facebook, LinkedIn, Telegram,
            TikTok and Twitter/X growth pages before choosing a package.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {allServiceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/90 bg-white/85 p-4 shadow-[0_16px_36px_-30px_rgba(255,159,0,.5)] transition hover:-translate-y-1 hover:border-[#FFF3E0]"
              >
                <PlatformIcon platform={item.platform} className="h-5 w-5 text-orange-600" />
                <h3 className="mt-3 text-sm font-black text-[#0B0B0F]">
                  {item.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#111827]">
                  View pricing, FAQs, delivery notes and ordering guidance.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">
            How to place an order in six clear steps
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map(([title, text], index) => (
              <article
                key={title}
                className="rounded-3xl border border-white/90 bg-white/80 p-5 shadow-[0_20px_48px_-34px_rgba(255, 159, 0, .5)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-amber-500 text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-base font-black text-[#0B0B0F]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#111827]">{text}</p>
              </article>
            ))}
          </div>
          <div className="safety-note mt-6 rounded-2xl border border-emerald-400/45 bg-[#0B1F18] p-4 text-center shadow-[0_16px_38px_rgba(0,0,0,.22)]">
            <p className="text-sm font-black text-white">No password required.</p>
            <p className="mt-1 text-sm leading-6 text-[#D1D5DB]">
              Only your public profile, post, video, channel, or page link is needed.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-emerald-400/35 bg-[#111111] p-6 shadow-[0_24px_56px_-38px_rgba(0,0,0,.65)] sm:p-8">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            <h2 className="mt-5 text-2xl font-black text-white">
              Is it safe to buy {page.serviceName} from SocialRUSH?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#D1D5DB]">
              {page.safety}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">
              No campaign can guarantee virality, revenue, rankings, or permanent
              platform outcomes. Combine visible growth with useful content and
              responsible account management.
            </p>
          </article>
          <article className="rounded-[2rem] border border-orange-400/35 bg-[#111111] p-6 shadow-[0_24px_56px_-38px_rgba(0,0,0,.65)] sm:p-8">
            <RefreshCw className="h-8 w-8 text-orange-600" />
            <h2 className="mt-5 text-2xl font-black text-white">
              Delivery and refill support
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#D1D5DB]">
              {page.deliveryCopy}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">
              Current refill or support coverage is shown before checkout. Contact
              support with your order ID if an eligible campaign needs review.
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-[#0B0B0F]">
            SocialRUSH vs random providers
          </h2>
          <div className="mt-8 overflow-x-auto rounded-3xl border border-[#FFF8F1] bg-white shadow-[0_24px_56px_-38px_rgba(255, 159, 0, .5)]">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[#FFF8F1] text-[#0B0B0F]">
                <tr>
                  {["Comparison", "SocialRUSH", "Random providers"].map((head) => (
                    <th key={head} className="px-5 py-4 font-black">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF8F1] text-[#111827]">
                {comparisonRows.map(([label, socialRush, other]) => (
                  <tr key={label}>
                    <th className="px-5 py-4 font-bold text-[#0B0B0F]">{label}</th>
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
          <h2 className="text-3xl font-black tracking-tight text-[#0B0B0F]">
            Related {page.platform} growth guides
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#111827]">
            Learn how to evaluate pricing, prepare your public destination, and combine a campaign with responsible organic growth.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {relatedBlogs.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-[0_18px_42px_-30px_rgba(255, 159, 0, .45)] transition hover:-translate-y-1 hover:border-[#FFF3E0]"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-600">{article.category}</span>
                <h3 className="mt-3 text-base font-black leading-6 text-[#0B0B0F]">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#111827]">{article.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-orange-400/25 bg-[#111111] p-6 shadow-[0_24px_56px_-36px_rgba(255,122,0,.55)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF9F00]">
            Helpful related searches
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white">
            Compare {page.platform} growth options before ordering
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#D1D5DB]">
            These SocialRUSH resources help Indian customers compare prices, delivery expectations, public-link requirements and related platform services without relying on exaggerated claims.
          </p>
          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {keywordResources.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-orange-400/20 bg-[#151515] p-5 transition hover:-translate-y-1 hover:border-orange-400/50 hover:bg-orange-500/10 active:scale-[.98]"
              >
                <h3 className="text-base font-black text-white transition group-hover:text-[#FF9F00]">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">{item.text}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/packages"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-2.5 text-sm font-black text-white"
            >
              View Packages
            </Link>
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 px-5 py-2.5 text-sm font-black text-orange-100"
            >
              Read Growth Guides
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-[#0B0B0F]">
            Explore related growth services
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {page.related.map((relatedSlug) => {
              const related = getIndiaServicePage(relatedSlug);
              return (
                <Link
                  key={related.slug}
                  href={getCanonicalIndiaServicePath(relatedSlug)}
                  className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-[0_18px_42px_-30px_rgba(255, 159, 0, .45)] transition hover:-translate-y-1 hover:border-[#FFF3E0]"
                >
                  <PlatformIcon
                    platform={related.platform}
                    className="h-6 w-6 text-orange-600"
                  />
                  <h3 className="mt-4 text-base font-black text-[#0B0B0F]">
                    {related.serviceName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#111827]">
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
                className="rounded-xl border border-[#FFF3E0] bg-white px-4 py-3 text-sm font-bold text-[#FF9F00]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-black tracking-tight text-[#0B0B0F]">
            {page.serviceName} FAQs
          </h2>
          <div className="mt-9 grid gap-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_18px_42px_-32px_rgba(255, 159, 0, .5)] sm:p-6"
              >
                <h3 className="text-base font-black text-[#0B0B0F]">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#111827]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/90 bg-[linear-gradient(135deg,#FFF8F1_0%,#FFF8F1_48%,#FFF8F1_100%)] p-7 text-center shadow-[0_30px_70px_-38px_rgba(255, 159, 0, .5)] sm:p-12">
          <BarChart3 className="mx-auto h-9 w-9 text-amber-600" />
          <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0B0B0F]">
            Ready to grow your {page.platform} presence?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#111827]">
            Compare current packages, review delivery and support terms, and start
            with the campaign size that fits your goals.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
            <Link
              href={packagesHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-black text-white"
            >
              View {page.platform} Packages
            </Link>
            <Link
              href={orderHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white px-6 py-3 text-sm font-black text-[#FF9F00]"
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
