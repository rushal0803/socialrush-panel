import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Heart, Layers3, ShieldCheck, Users } from "lucide-react";

import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Facebook Growth India | Followers, Likes, Views & Groups",
  description:
    "Explore Facebook growth services in India for followers, likes, video views and group members. Compare goals, requirements and the right SocialRUSH service for your campaign.",
  path: "/facebook-growth-india",
});

const services = [
  {
    title: "Facebook Followers",
    label: "Audience growth",
    description:
      "Build visible audience size for an eligible public Facebook presence. Review current pricing, requirements and service details before ordering.",
    href: "/buy-facebook-followers-india",
    icon: Users,
  },
  {
    title: "Facebook Likes",
    label: "Post engagement",
    description:
      "Choose Facebook likes when the objective is visible engagement on eligible public Facebook content rather than follower growth.",
    href: "/facebook-likes",
    icon: Heart,
  },
  {
    title: "Facebook Views",
    label: "Video visibility",
    description:
      "Use the dedicated Facebook views page for eligible video content, with service-specific ordering information and expectations.",
    href: "/facebook-views",
    icon: Eye,
  },
  {
    title: "Facebook Group Members",
    label: "Community growth",
    description:
      "Use the group-members service when community size is the actual objective. Check current availability and service details before payment.",
    href: "/buy-facebook-group-members-india",
    icon: Layers3,
  },
] as const;

const faq = [
  {
    question: "Which Facebook growth service should I choose?",
    answer:
      "Choose by objective: followers for visible audience size, likes for post engagement, views for eligible video visibility, and group members for community growth. Each service has its own destination page and requirements.",
  },
  {
    question: "Do Facebook followers, likes or views guarantee reach or sales?",
    answer:
      "No. Reach, recommendations, leads and sales depend on Facebook's systems, your content, audience fit and other factors outside SocialRUSH. These services should support, not replace, a broader content and marketing strategy.",
  },
  {
    question: "Do I need to provide my Facebook password?",
    answer:
      "No. Use the relevant public Facebook page, post, video or group link required by the selected service. Never provide your password, OTP or private login credentials.",
  },
  {
    question: "Are Facebook reviews or ratings available here?",
    answer:
      "This Facebook growth hub does not advertise reviews or ratings. Only services represented by active SocialRUSH service pages are linked here.",
  },
];

function safeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function FacebookGrowthIndiaPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SEO_SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Facebook Growth India",
        item: `${SEO_SITE_URL}/facebook-growth-india`,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Facebook Growth India",
    url: `${SEO_SITE_URL}/facebook-growth-india`,
    description:
      "Facebook growth hub for SocialRUSH services in India, including followers, likes, views and group members.",
    isPartOf: { "@type": "WebSite", name: "SocialRUSH", url: SEO_SITE_URL },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <PublicShell>
      <main className="overflow-hidden bg-[#050505] text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }} />

        <nav aria-label="Breadcrumb" className="border-b border-white/10 px-5 py-3 text-xs text-slate-400 sm:px-6 lg:px-8">
          <ol className="mx-auto flex max-w-7xl items-center gap-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-200">Facebook Growth India</li>
          </ol>
        </nav>

        <section className="relative px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,122,0,.18),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(37,99,235,.15),transparent_25%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-orange-200">
                <PlatformIcon platform="Facebook" className="h-4 w-4" /> Facebook Growth India
              </span>
              <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-.05em] sm:text-6xl">
                Facebook growth services in India, organized by real campaign intent.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                Compare SocialRUSH Facebook followers, likes, video views and group-member services without mixing different goals onto one page. Choose the service that matches the metric you actually need, then review its live requirements and order details.
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                <Link href="/buy-facebook-followers-india" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-black text-black">
                  Explore Facebook Followers <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/services?platform=facebook" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-bold">
                  Browse Facebook Services
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-slate-300">
                {["Public-link ordering", "Service-specific requirements", "Dashboard tracking"].map((item) => (
                  <span key={item} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-orange-300" />{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0d0f13] px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Choose by objective</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">One Facebook platform, four distinct service intents</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Keeping these intents separate helps customers compare the right metric and gives search engines one clear destination for each legitimate service.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Link key={service.href} href={service.href} className="group rounded-2xl border border-white/10 bg-white/[.035] p-6 transition hover:border-orange-400/40 hover:bg-white/[.055]">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300"><Icon className="h-5 w-5" /></span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[.13em] text-slate-500">{service.label}</p>
                        <h3 className="mt-1 text-xl font-black group-hover:text-orange-200">{service.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-400">{service.description}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-300">View service <ArrowRight className="h-3.5 w-3.5" /></span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Facebook-specific planning</p>
              <h2 className="mt-3 text-3xl font-black">Match the service to the Facebook surface</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">A Page follower, a post like, a video view and a group member describe different Facebook surfaces and user goals. Submit the public link required by the chosen service and verify the destination before checkout.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-6">
              <h2 className="text-xl font-black">What these services do not guarantee</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">Purchased growth signals do not guarantee organic reach, recommendations, comments, leads, sales or long-term audience quality. Facebook's distribution systems and real audience response remain outside SocialRUSH's control.</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">Use service-specific growth alongside useful content, clear Page positioning and ongoing measurement.</p>
            </div>
          </div>
        </section>

        <MoneyPageAuthorityLinks platform="facebook" />

        <section className="px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-xs font-black uppercase tracking-[.16em] text-orange-300">Facebook growth FAQs</p>
            <h2 className="mt-3 text-center text-3xl font-black">Questions before choosing a Facebook service</h2>
            <div className="mt-8 space-y-3">
              {faq.map((item, index) => (
                <details key={item.question} open={index === 0} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                  <summary className="cursor-pointer text-sm font-black">{item.question}</summary>
                  <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-7 text-slate-300">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
