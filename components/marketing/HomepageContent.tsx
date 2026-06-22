"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingIcon, { type MarketingIconName } from "@/components/marketing/MarketingIcon";
import PortalCTA from "@/components/marketing/PortalCTA";

const platformCards = [
  {
    platform: "Instagram",
    services: ["Followers", "Likes", "Views"],
    benefit: "Build stronger social proof and profile visibility for creators and brands.",
  },
  {
    platform: "YouTube",
    services: ["Subscribers", "Likes", "Views"],
    benefit: "Support channel growth with structured engagement-ready package options.",
  },
  {
    platform: "LinkedIn",
    services: ["Followers", "Likes"],
    benefit: "Improve professional authority and increase content credibility.",
  },
  {
    platform: "Facebook",
    services: ["Followers", "Likes"],
    benefit: "Expand page audience and improve post-level brand engagement.",
  },
  {
    platform: "Telegram",
    services: ["Members"],
    benefit: "Grow communities with clean member acquisition campaign workflows.",
  },
  {
    platform: "TikTok",
    services: ["Followers"],
    benefit: "Strengthen profile momentum with scalable audience growth options.",
  },
  {
    platform: "X / Twitter",
    services: ["Followers"],
    benefit: "Build reach and authority for fast-moving social conversations.",
  },
] as const;

const trustBadges = [
  "Instant Order Flow",
  "Secure Checkout",
  "Wallet Support",
  "Order Tracking",
  "Real-Time Status",
  "WhatsApp Support",
  "Multi-Platform Services",
];

const howItWorks = [
  ["users", "Create Account", "Sign up in under a minute to access order tools and campaign tracking."],
  ["search", "Choose Platform & Package", "Select your platform, service type, and quantity from transparent cards."],
  ["link", "Submit Link / Details", "Enter your public profile, post, or video URL for campaign processing."],
  ["wallet", "Complete Payment or Add Funds", "Use secure checkout or top up balance from the add-funds wallet flow."],
  ["dashboard", "Track in Dashboard", "Monitor order status, history, and support updates from one clean dashboard."],
] as const;

const whyChoose = [
  ["shield", "Secure order process", "Structured checkout and payment flow built for safer service ordering."],
  ["trend", "Dashboard tracking", "Track every campaign with status visibility and history records."],
  ["message", "WhatsApp support", "Talk to support before ordering when you need package guidance."],
  ["card", "Clear package structure", "Big package tiers are clearly organized for faster confident decisions."],
  ["users", "Multi-platform support", "Instagram, YouTube, LinkedIn, Facebook, Telegram, TikTok, and X."],
  ["rocket", "Fast order setup", "Streamlined form and checkout flow to launch campaigns quickly."],
] as const;

const testimonials = [
  {
    initials: "RK",
    role: "Creator",
    city: "Delhi",
    service: "Instagram Followers",
    quote: "The dashboard is simple and clear. I can place orders quickly and check delivery status without confusion.",
  },
  {
    initials: "MS",
    role: "Brand Owner",
    city: "Mumbai",
    service: "Facebook Followers",
    quote: "Package pricing is transparent and support replies fast. The ordering flow feels professional and reliable.",
  },
  {
    initials: "AN",
    role: "Agency Manager",
    city: "Bengaluru",
    service: "YouTube Subscribers",
    quote: "Useful for handling multiple client campaigns. The platform gives us a cleaner process than manual ordering.",
  },
  {
    initials: "PG",
    role: "Small Business",
    city: "Gurgaon",
    service: "LinkedIn Followers",
    quote: "I liked how the package options were explained. It made choosing the right campaign much easier.",
  },
] as const;

const faqs = [
  ["What is SocialRUSH?", "SocialRUSH is a premium social media growth services platform for followers, likes, views, subscribers, and members across major social platforms."],
  ["Which platforms do you support?", "We support Instagram, YouTube, LinkedIn, Facebook, Telegram, TikTok, and X/Twitter with platform-specific service options."],
  ["Do I need to create an account before ordering?", "Yes. Customers must create an account or log in before ordering so they can track orders, manage campaigns, view order history, and use wallet/checkout features securely."],
  ["Why does Start Order go to login first?", "Start Order routes unauthenticated users to login first for account security and complete order tracking continuity."],
  ["How do I place an order?", "Choose your platform and package, submit your public link/details, then confirm order through wallet or checkout flow."],
  ["Can I contact WhatsApp support before payment?", "Yes. WhatsApp support is available before ordering to help you choose the right package."],
  ["How do I see package pricing?", "Go to the Packages page. Logged-in customers can view exact prices there with currency options."],
  ["Will I get order tracking in dashboard?", "Yes. After placing an order, you can monitor real-time campaign progress in your dashboard."],
  ["What happens if my wallet balance is low?", "You can continue by adding funds to your wallet from the existing add-funds flow."],
  ["How do I add funds before completing my order?", "Use the Add Funds option from your dashboard wallet section and then continue checkout."],
] as const;

const container: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const listContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function HomepageContent() {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20want%20help%20choosing%20a%20service";

  const buildOrderPath = (platform: string, service: string, quantity: string) => {
    const params = new URLSearchParams({
      platform,
      service,
      quantity,
    });
    return `/dashboard/new-order?${params.toString()}`;
  };

  return (
    <main className="overflow-hidden bg-[radial-gradient(circle_at_12%_4%,rgba(59,130,246,.14),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(16,185,129,.12),transparent_30%),linear-gradient(180deg,#f4f8ff_0%,#ffffff_22%,#ffffff_100%)] text-slate-900">
      <MarketingHeader />

      <section className="relative px-5 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="hero-grid absolute inset-0 -z-20 opacity-50" />
        <div className="absolute -left-28 top-2 -z-10 h-80 w-80 rounded-full bg-blue-200/45 blur-3xl" />
        <div className="absolute -right-20 top-12 -z-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <motion.div initial="hidden" animate="show" variants={container}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-blue-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Trusted growth services for modern brands
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-.04em] text-[#0b1635] sm:text-5xl lg:text-[62px]">
              Grow Your Social Media Presence Faster with Trusted Engagement Services
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Buy followers, likes, views, subscribers, and members across Instagram, YouTube, LinkedIn, Facebook, Telegram, TikTok, and X with a clean ordering experience, premium support, and delivery tracking.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PortalCTA className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700">
                Start Order <MarketingIcon name="arrow" className="h-4 w-4" />
              </PortalCTA>
              <Link href="/packages" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100">
                View Packages
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100">
                Contact on WhatsApp <MarketingIcon name="message" className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {["Instagram", "YouTube", "LinkedIn", "Facebook", "Telegram", "TikTok", "X"].map((platform) => (
                <span key={platform} className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm backdrop-blur">
                  {platform}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={container} className="relative">
            <div className="absolute -inset-6 rounded-[34px] bg-gradient-to-br from-blue-200/45 via-cyan-100/35 to-emerald-100/35 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/70 p-4 shadow-[0_45px_110px_-45px_rgba(23,48,97,.45)] backdrop-blur-xl sm:p-5">
              <div className="rounded-2xl bg-[#081935] p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-300">SocialRUSH Order Desk</p>
                    <h2 className="mt-2 text-sm font-bold">Live Campaign Builder</h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-bold text-emerald-300">Support online</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[["Instagram", "Selected"], ["YouTube", "Selected"], ["LinkedIn", "Selected"]].map(([name, status]) => (
                    <div key={name} className="rounded-xl border border-white/10 bg-white/[.05] p-3">
                      <p className="text-[9px] font-bold text-blue-300">{name}</p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-200">{status}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[["Package", "High-volume selected"], ["Price", "Visible after login"], ["Wallet", "Secure balance"]].map(([name, status]) => (
                    <div key={name} className="rounded-xl border border-white/10 bg-white/[.05] p-3">
                      <p className="text-[9px] text-slate-400">{name}</p>
                      <p className="mt-1 text-[10px] font-bold text-emerald-300">{status}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[.05] p-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-300">Delivery progress</span>
                    <span className="font-bold text-emerald-300">72%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className="campaign-progress h-2 w-[72%] rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[["Secure Checkout", "Enabled"], ["Order Status", "Active"], ["Tracking", "Real-time"], ["Completed", "128"]].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white/[.06] p-3">
                      <p className="text-[9px] text-slate-400">{label}</p>
                      <p className="mt-1 text-[10px] font-bold text-slate-200">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-5 -left-5 hidden rounded-2xl border border-blue-100 bg-white/85 px-3 py-2 text-[11px] font-bold text-blue-700 shadow-lg backdrop-blur sm:block">
              Secure checkout indicator
            </div>
            <div className="pointer-events-none absolute -right-5 -top-5 hidden rounded-2xl border border-emerald-100 bg-white/85 px-3 py-2 text-[11px] font-bold text-emerald-700 shadow-lg backdrop-blur sm:block">
              Delivery tracking live
            </div>
          </motion.div>
        </div>
      </section>

      <section aria-label="Trust badges" className="border-y border-slate-100 bg-white px-5 py-5 sm:px-6 lg:px-8">
        <motion.div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 sm:gap-3" variants={listContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          {trustBadges.map((badge) => (
            <motion.span key={badge} variants={item} className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] text-blue-700">
              {badge}
            </motion.span>
          ))}
        </motion.div>
      </section>

      <section id="services" className="px-5 py-18 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Platform services</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0b1635] sm:text-4xl">Multi-platform services in a clean, premium order layout</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Explore services by platform and move directly to package selection or secure ordering.</p>
          </div>

          <motion.div className="mt-10 grid gap-4 md:grid-cols-6" variants={listContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {platformCards.map((card, index) => (
              <motion.article key={card.platform} variants={item} className={`group rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_20px_45px_-28px_rgba(9,35,89,.25)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-blue-200 hover:shadow-xl ${index % 4 === 0 ? "md:col-span-3" : "md:col-span-2"}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">{card.platform}</span>
                  <MarketingIcon name="sparkles" className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#0b1635]">{card.platform} Services</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.services.map((service) => (
                    <span key={service} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {service}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-600">{card.benefit}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/packages" className="inline-flex min-h-10 items-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
                    View Packages
                  </Link>
                  <PortalCTA targetPath={buildOrderPath(card.platform, card.services[0].toLowerCase(), "5000")} className="inline-flex min-h-10 items-center rounded-xl bg-[#0b1635] px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700">
                    Start Order
                  </PortalCTA>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_100%)] px-5 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="mx-auto max-w-7xl rounded-3xl border border-blue-100 bg-white/80 p-6 shadow-[0_35px_90px_-55px_rgba(29,78,216,.45)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Big packages only</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#0b1635] sm:text-3xl">Explore high-volume campaigns on the Packages page</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">We only display serious growth tiers on the package catalog. Log in to view exact prices and continue checkout.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/packages" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700">
                Browse Big Packages
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100">
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">How it works</p>
            <h2 className="mt-4 text-3xl font-bold text-[#0b1635] sm:text-4xl">Simple workflow from service choice to delivery tracking</h2>
          </div>

          <motion.div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" variants={listContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
            {howItWorks.map(([icon, title, text], index) => (
              <motion.article key={title} variants={item} className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <span className="absolute right-4 top-4 text-2xl font-black text-blue-100">0{index + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <MarketingIcon name={icon as MarketingIconName} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-sm font-bold text-[#0b1635]">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#081935] px-5 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-300">Why choose SocialRUSH</p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Built for serious service buyers who need trust, clarity, and speed</h2>
          </div>

          <motion.div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={listContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
            {whyChoose.map(([icon, title, text]) => (
              <motion.article key={title} variants={item} className="rounded-2xl border border-white/10 bg-white/[.06] p-5 backdrop-blur">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
                  <MarketingIcon name={icon as MarketingIconName} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-sm font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-300">{text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f5f8ff] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Customer feedback</p>
            <h2 className="mt-4 text-3xl font-bold text-[#0b1635] sm:text-4xl">Trusted by creators, brands, and agencies</h2>
          </div>

          <motion.div className="mt-10 grid gap-4 md:grid-cols-3" variants={listContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
            {testimonials.slice(0, 3).map((testimonial) => (
              <motion.figure key={`${testimonial.role}-${testimonial.city}`} variants={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{testimonial.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-[#0b1635]">{testimonial.role}</p>
                    <p className="text-[11px] text-slate-500">{testimonial.city}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm tracking-widest text-amber-500">★★★★★</p>
                <blockquote className="mt-3 text-sm leading-7 text-slate-600">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-blue-700">Service used: {testimonial.service}</figcaption>
              </motion.figure>
            ))}

            <motion.aside variants={item} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm md:col-span-3">
              <h3 className="text-lg font-bold text-[#0b1635]">Why customers trust SocialRUSH workflow</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  "Secure ordering workflow",
                  "Support available",
                  "Multi-platform services",
                  "Order tracking",
                  "Clear package selection",
                ].map((point) => (
                  <div key={point} className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-[11px] font-bold text-blue-700">
                    {point}
                  </div>
                ))}
              </div>
            </motion.aside>
          </motion.div>
        </div>
      </section>

      <section id="faq" className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">FAQ</p>
            <h2 className="mt-4 text-3xl font-bold text-[#0b1635] sm:text-4xl">Common questions before ordering</h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map(([question, answer], index) => (
              <details key={question} open={index === 0} className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:border-blue-200 open:shadow-lg">
                <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-4 sm:px-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-[10px] font-bold text-blue-600">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="flex-1 text-sm font-bold text-[#0b1635]">{question}</h3>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-50 text-blue-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-slate-100 px-4 py-5 text-sm leading-7 text-slate-600 sm:px-5 sm:pl-[5.25rem]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-5 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0a1f46] via-blue-700 to-cyan-600 px-6 py-12 text-center text-white shadow-2xl shadow-blue-900/20 sm:px-12 sm:py-16">
          <div className="absolute -left-20 -top-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to start your next social growth campaign?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100">Choose the right service, place a secure order, and stay updated with a clean and professional workflow.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-lg shadow-blue-950/10">
                Sign Up
              </Link>
              <PortalCTA className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20">
                Start Order <MarketingIcon name="arrow" className="h-4 w-4" />
              </PortalCTA>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20">
                WhatsApp Support <MarketingIcon name="message" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}