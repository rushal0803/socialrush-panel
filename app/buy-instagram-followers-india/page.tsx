import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  Clock3,
  Headphones,
  Link2,
  LockKeyhole,
  Palette,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { blogArticles } from "@/components/marketing/blog/blogData";

const pagePath = "/buy-instagram-followers-india";
const pageUrl = `${SEO_SITE_URL}${pagePath}`;
const packagesHref = "/packages?platform=instagram&service=followers";
const orderHref =
  "/dashboard/new-order?platform=instagram&service=instagram-followers";
const whatsappHref =
  "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20an%20Instagram%20followers%20package";

export const metadata: Metadata = {
  title: { absolute: "Buy Instagram Followers India | SocialRUSH" },
  description:
    "Buy Instagram followers in India with SocialRUSH. Get fast delivery, no password required, transparent pricing, refill support, and safe Instagram growth services.",
  keywords: [
    "Buy Instagram Followers India",
    "Buy Instagram followers",
    "Instagram followers India",
    "Real Instagram followers India",
    "Instagram growth service India",
    "No password Instagram followers",
    "Instagram followers with refill support",
    "Social media growth service India",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SocialRUSH",
    title: "Buy Instagram Followers India | SocialRUSH",
    description:
      "Grow your Instagram presence with SocialRUSH. Fast delivery, no password required, refill support, and transparent Instagram follower packages in India.",
    url: pageUrl,
    images: [
      {
        url: `${SEO_SITE_URL}/images/hero-3d.png`,
        width: 1448,
        height: 1086,
        alt: "SocialRUSH Instagram followers service in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Instagram Followers India | SocialRUSH",
    description:
      "Compare transparent Instagram follower packages in India with no-password ordering, delivery tracking, and refill support where eligible.",
    images: [`${SEO_SITE_URL}/images/hero-3d.png`],
  },
};

const trustCards: Array<{ title: string; icon: LucideIcon }> = [
  { title: "No Password Required", icon: LockKeyhole },
  { title: "Real-time Order Tracking", icon: Clock3 },
  { title: "Refill Support If Eligible", icon: RefreshCw },
  { title: "Secure Checkout", icon: ShieldCheck },
  { title: "WhatsApp Support", icon: Headphones },
  { title: "Transparent Pricing", icon: BadgeIndianRupee },
];

const relatedBlogs = [
  "how-to-grow-instagram-followers-in-india",
  "instagram-followers-price-in-india",
  "is-it-safe-to-buy-instagram-followers",
]
  .map((slug) => blogArticles.find((article) => article.slug === slug))
  .filter((article): article is (typeof blogArticles)[number] => Boolean(article));

const reasons: Array<{ title: string; text: string; icon: LucideIcon }> = [
  {
    title: "Professional growth service",
    text: "Use a structured ordering experience designed for public Instagram profile campaigns.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Clear pricing before checkout",
    text: "Review the current rate, quantity, and exact campaign total before confirming.",
    icon: BadgeIndianRupee,
  },
  {
    title: "Easy order process",
    text: "Choose a package, submit the correct public profile link, and track progress from your account.",
    icon: Link2,
  },
  {
    title: "Connected wallet system",
    text: "Add funds securely and keep wallet activity, transactions, and campaign charges organized.",
    icon: WalletCards,
  },
  {
    title: "Multi-platform support",
    text: "Access Instagram, YouTube, LinkedIn, Facebook, Twitter/X, and other available services.",
    icon: Sparkles,
  },
  {
    title: "Built for Indian customers",
    text: "Pricing in INR and practical support make ordering clearer for Indian creators and businesses.",
    icon: Users,
  },
];

const audiences: Array<{ title: string; icon: LucideIcon }> = [
  { title: "Influencers", icon: UserRound },
  { title: "Small businesses", icon: Store },
  { title: "Startups", icon: Rocket },
  { title: "Artists", icon: Palette },
  { title: "Coaches", icon: UserRound },
  { title: "Local brands", icon: Building2 },
  { title: "Agencies", icon: BriefcaseBusiness },
  { title: "Content creators", icon: Sparkles },
];

const steps = [
  [
    "Create your account",
    "Sign up or log in to access your SocialRUSH dashboard and order history.",
  ],
  [
    "Choose your platform",
    "Select Instagram from the available social media platforms.",
  ],
  [
    "Choose your service",
    "Choose Instagram Followers and review current pricing, delivery, and refill information.",
  ],
  [
    "Submit your public link",
    "Enter the correct public Instagram profile URL. Your password is never required.",
  ],
  [
    "Add funds or pay securely",
    "Use the available secure funding flow and review the final total.",
  ],
  [
    "Track your order",
    "Follow campaign status and retain an organized dashboard record.",
  ],
] as const;

const comparisonRows = [
  ["Transparent pricing", "Shown before confirmation", "May be unclear"],
  ["No password required", "Public profile link only", "May request risky access"],
  ["Support available", "Account and WhatsApp help", "Often limited"],
  ["Multiple platforms", "One organized catalog", "Availability varies"],
  ["Easy website ordering", "Guided checkout flow", "Often manual"],
  ["Refill support", "Shown for eligible services", "Frequently unclear"],
  ["Secure payment options", "Protected funding workflow", "May be unverified"],
  ["Professional experience", "Dashboard and order tracking", "Inconsistent"],
] as const;

const faqs = [
  {
    question: "Can I buy Instagram followers in India?",
    answer:
      "Yes. SocialRUSH provides Instagram follower packages priced in INR for Indian creators, influencers, agencies, brands, and businesses. Review current package details before ordering.",
  },
  {
    question: "Do I need to share my Instagram password?",
    answer:
      "No. SocialRUSH only requires the public Instagram profile link connected to the campaign. Never share your Instagram password with an ordering service.",
  },
  {
    question: "What is the price for Instagram followers?",
    answer:
      "The current service rate is ₹599 per 1,000 Instagram followers. Your final total depends on selected quantity and current package availability.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery starts after confirmation. Timing depends on package size, quantity, profile availability, and current delivery conditions.",
  },
  {
    question: "Is refill support available?",
    answer:
      "Refill support is available on eligible Instagram follower services. Applicable coverage and requirements are shown with the selected service.",
  },
  {
    question: "Can businesses use this service?",
    answer:
      "Yes. Businesses can use follower campaigns to support profile presentation while continuing their normal content and customer-acquisition work.",
  },
  {
    question: "Can influencers use this service?",
    answer:
      "Yes. Influencers and creators can choose a campaign size that fits their profile goals, publishing schedule, and available budget.",
  },
  {
    question: "What happens if followers drop?",
    answer:
      "If an eligible order experiences a drop during its refill period, contact support with the order ID so the team can review eligibility.",
  },
  {
    question: "Can I order Instagram likes and views also?",
    answer:
      "Yes. SocialRUSH also offers Instagram likes and views for eligible public posts, reels, and videos.",
  },
  {
    question: "How do I contact SocialRUSH support?",
    answer:
      "Use the contact page, open account support, or message SocialRUSH through the WhatsApp help link before or after ordering.",
  },
] as const;

function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function BuyInstagramFollowersIndiaPage() {
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
        name: "Buy Instagram Followers India",
        item: pageUrl,
      },
    ],
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Instagram Followers India",
    serviceType: "Instagram growth service",
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
      price: "599",
      unitText: "1000 followers",
      availability: "https://schema.org/InStock",
      url: `${SEO_SITE_URL}/packages?platform=instagram&service=followers`,
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
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 text-white">
                <PlatformIcon platform="Instagram" className="h-4 w-4" />
              </span>
              Instagram growth service India
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-[#14316a] sm:text-5xl lg:text-6xl">
              Buy Instagram Followers India
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#526d9f] sm:text-lg">
              SocialRUSH helps creators, influencers, businesses, agencies, and
              brands strengthen visible Instagram social proof through a clear,
              trackable follower campaign.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6079a7]">
              Choose a package, submit your public profile link, review transparent
              pricing, and follow delivery from your dashboard. No Instagram
              password is required, and eligible services include refill support.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Link href={packagesHref} className="primary-gradient-button">
                View Packages <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={orderHref} className="secondary-button">
                Order Now
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/90 px-6 py-3 text-sm font-black text-emerald-700"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/90 bg-white/80 p-6 shadow-[0_30px_70px_-35px_rgba(35,60,120,.5)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 text-white shadow-lg">
                <PlatformIcon platform="Instagram" className="h-7 w-7" />
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                Available in India
              </span>
            </div>
            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.15em] text-[#7890bb]">
              Instagram Followers
            </p>
            <p className="mt-2 text-4xl font-black text-[#17366f]">
              ₹599 <span className="text-sm text-[#6079a7]">per 1K</span>
            </p>
            <p className="mt-3 text-xs leading-6 text-[#6079a7]">
              Final price may depend on selected quantity and package availability.
            </p>
            <div className="mt-6 grid gap-3 border-t border-[#dce7ff] pt-5 text-xs text-[#526d9f]">
              {[
                "Public Instagram profile link only",
                "Fast, carefully managed delivery",
                "Refill terms shown before ordering",
                "Dashboard order tracking",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </p>
              ))}
            </div>
            <Link href={orderHref} className="primary-gradient-button mt-7 w-full">
              Buy Instagram Followers Now
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {trustCards.map(({ title, icon: Icon }) => (
            <article key={title} className="soft-card p-4 text-center">
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
          <p className="eyebrow">Why SocialRUSH</p>
          <h2 className="section-title max-w-3xl">
            A professional Instagram growth service for Indian customers
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6079a7] sm:text-base">
            SocialRUSH focuses on clear information and reliable campaign
            management—not unrealistic promises. Your profile stays under your
            control, and only a public link is needed.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reasons.map(({ title, text, icon: Icon }) => (
              <article key={title} className="glass-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#f6eaff] to-[#e7f7ff] text-[#6873d4]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-black text-[#17366f]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#6079a7]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="section-title">
            Who is this Instagram followers service for?
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {audiences.map(({ title, icon: Icon }) => (
              <article key={title} className="soft-card p-4 text-center">
                <Icon className="mx-auto h-5 w-5 text-pink-600" />
                <h3 className="mt-3 text-xs font-black leading-5 text-[#17366f]">
                  {title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title">How to place an order in six clear steps</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map(([title, text], index) => (
              <article key={title} className="glass-card p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-base font-black text-[#17366f]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6079a7]">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-center text-sm font-bold text-emerald-800">
            No password required. Only your public profile, post, video, channel, or page link is needed.
          </p>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
          <article className="content-card border-emerald-100">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            <h2 className="mt-5 text-2xl font-black text-[#14316a]">
              Is it safe to buy Instagram followers from SocialRUSH?
            </h2>
            <p className="body-copy">
              SocialRUSH never asks for your Instagram password. You submit only
              the public profile link required for delivery. Campaigns use gradual,
              carefully managed delivery language and visible order tracking.
            </p>
            <p className="body-copy">
              No service can promise viral reach, revenue, or permanent platform
              outcomes. Keep your profile public during delivery and continue
              publishing useful content for the audience you want to retain.
            </p>
          </article>
          <article className="content-card border-blue-100">
            <RefreshCw className="h-8 w-8 text-blue-600" />
            <h2 className="mt-5 text-2xl font-black text-[#14316a]">
              Delivery and refill support
            </h2>
            <p className="body-copy">
              Delivery begins after order confirmation. Timing depends on package
              size, quantity, current service conditions, and whether the profile
              remains public and unchanged.
            </p>
            <p className="body-copy">
              Eligible packages include refill support for the period shown before
              ordering. Contact support with your order ID if a covered drop occurs.
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="section-title">SocialRUSH vs random providers</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6079a7]">
            Compare the information and ordering experience available before
            choosing an Instagram growth provider.
          </p>
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
          <h2 className="section-title">Related Instagram growth guides</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6079a7]">
            Compare pricing, account-safety considerations, and practical organic steps before choosing an Instagram campaign.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {relatedBlogs.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`} className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-[0_18px_42px_-30px_rgba(28,54,108,.45)] transition hover:-translate-y-1 hover:border-[#cbdcff]">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-600">{article.category}</span>
                <h3 className="mt-3 text-base font-black leading-6 text-[#17366f]">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6079a7]">{article.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="section-title">Explore related SocialRUSH resources</h2>
          <div className="mt-7 flex flex-wrap gap-3">
            {[
              ["Instagram packages", "/packages"],
              ["All growth services", "/services"],
              ["Contact support", "/contact"],
              ["Social media growth blog", "/blog"],
              ["YouTube subscribers", "/buy-youtube-subscribers-india"],
              ["Instagram likes", "/buy-instagram-likes-india"],
              ["Instagram views", "/buy-instagram-views-india"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="resource-link">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="section-title text-center">Instagram followers FAQs</h2>
          <div className="mt-9 grid gap-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="glass-card p-5 sm:p-6">
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
            Ready to grow your Instagram presence?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6079a7]">
            Compare current packages, review delivery and refill terms, and start
            with the campaign size that fits your goals.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
            <Link href={packagesHref} className="primary-gradient-button">
              View Instagram Packages
            </Link>
            <Link href={orderHref} className="secondary-button">
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

      <style>{`
        .primary-gradient-button {
          display: inline-flex; min-height: 3rem; align-items: center; justify-content: center;
          gap: .5rem; border-radius: .75rem; padding: .75rem 1.5rem;
          background: linear-gradient(90deg,#ff67b2,#8b8dff,#46c3ff);
          color: white; font-size: .875rem; font-weight: 900;
          box-shadow: 0 14px 30px -14px rgba(117,109,255,.65);
        }
        .secondary-button, .resource-link {
          display: inline-flex; min-height: 3rem; align-items: center; justify-content: center;
          border: 1px solid #d4e1ff; border-radius: .75rem; background: rgba(255,255,255,.9);
          padding: .75rem 1.5rem; color: #35548d; font-size: .875rem; font-weight: 900;
        }
        .soft-card { border: 1px solid #dce7ff; border-radius: 1rem; background: white; box-shadow: 0 16px 34px -28px rgba(28,54,108,.45); }
        .glass-card { border: 1px solid rgba(255,255,255,.9); border-radius: 1.5rem; background: rgba(255,255,255,.8); box-shadow: 0 22px 52px -36px rgba(35,60,120,.5); backdrop-filter: blur(20px); }
        .content-card { border-width: 1px; border-radius: 2rem; background: white; padding: 2rem; box-shadow: 0 24px 56px -38px rgba(35,60,120,.5); }
        .eyebrow { font-size: .75rem; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; color: #2563eb; }
        .section-title { margin-top: .75rem; font-size: 1.875rem; line-height: 1.15; font-weight: 900; letter-spacing: -.025em; color: #14316a; }
        .body-copy { margin-top: 1rem; font-size: .875rem; line-height: 1.75rem; color: #6079a7; }
        @media (min-width: 640px) { .section-title { font-size: 2.25rem; } }
      `}</style>
    </PublicShell>
  );
}
