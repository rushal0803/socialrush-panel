"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { agencyServices } from "@/lib/marketing/content";

const categoryCards = [
  {
    title: "Instagram Growth",
    description: "Follower, like, and view services for creators and brands.",
    short: "IG",
    gradient: "from-[#ff7dbf] via-[#9a96ff] to-[#58cbff]",
  },
  {
    title: "YouTube Growth",
    description: "Subscriber, video like, and view growth for channels.",
    short: "YT",
    gradient: "from-[#ff8aa9] via-[#f96d83] to-[#ff5f68]",
  },
  {
    title: "Facebook Growth",
    description: "Public page growth and engagement support for campaigns.",
    short: "FB",
    gradient: "from-[#7ca6ff] via-[#5890ff] to-[#3967ea]",
  },
  {
    title: "LinkedIn Growth",
    description: "Professional audience growth and post engagement support.",
    short: "IN",
    gradient: "from-[#86d5ff] via-[#66a9ff] to-[#4a7ef0]",
  },
  {
    title: "TikTok Growth",
    description: "Audience and visibility services for short-form creators.",
    short: "TT",
    gradient: "from-[#fc92c3] via-[#bb7cff] to-[#51c6ff]",
  },
  {
    title: "X / Twitter Growth",
    description: "Follower growth services for personal and brand profiles.",
    short: "X",
    gradient: "from-[#8fa1cb] via-[#7485b7] to-[#536188]",
  },
] as const;

const benefits = [
  { title: "Trusted Delivery", icon: "shield" as const },
  { title: "Secure Checkout", icon: "lock" as const },
  { title: "Real-Time Tracking", icon: "trend" as const },
  { title: "Premium Support", icon: "message" as const },
  { title: "Refill Eligible Services", icon: "refresh" as const },
] as const;

const orderSteps = [
  "Choose a Service",
  "Select Package or Quantity",
  "Add Order Details",
  "Review Order Summary",
  "Checkout Securely",
  "Track Progress in Dashboard",
] as const;

const whyChoose = [
  {
    title: "Clean order flow",
    description: "Service selection, quantity setup, and order review are structured and easy to follow.",
    icon: "dashboard" as const,
  },
  {
    title: "Reliable service quality",
    description: "Every service is designed for practical growth outcomes and transparent expectations.",
    icon: "check" as const,
  },
  {
    title: "Secure payments",
    description: "Checkout flow is protected and aligned to dashboard-based campaign management.",
    icon: "lock" as const,
  },
  {
    title: "Human support",
    description: "Get help from the support team for campaign planning, order issues, and service selection.",
    icon: "users" as const,
  },
  {
    title: "Multi-platform growth",
    description: "Run campaigns across Instagram, YouTube, Facebook, LinkedIn, TikTok, and X.",
    icon: "rocket" as const,
  },
  {
    title: "Dashboard-based tracking",
    description: "Track status updates and campaign progress in one organized workspace.",
    icon: "eye" as const,
  },
] as const;

const serviceFaqs = [
  {
    question: "What services do you offer?",
    answer:
      "SocialRUSH offers premium growth services across Instagram, YouTube, Facebook, LinkedIn, TikTok, and X/Twitter.",
  },
  {
    question: "Are these services safe to use?",
    answer:
      "Services are built around public destination ordering and secure checkout flow. Never share private passwords or account credentials.",
  },
  {
    question: "Can I track my order progress?",
    answer:
      "Yes. Orders are tracked in your dashboard with clear status updates and campaign visibility.",
  },
  {
    question: "Is there a minimum order quantity?",
    answer: "Yes. Minimum order quantity is 100.",
  },
  {
    question: "Do prices vary by package?",
    answer:
      "Yes. Package rates vary by platform and service type. You can review options in packages and during checkout flow.",
  },
  {
    question: "Do I need an account before ordering?",
    answer:
      "Yes. If you are not logged in, Start Order redirects to login and then continues to new-order flow.",
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

function serviceCardIcon(name: string) {
  if (name.includes("Views")) return "eye" as const;
  if (name.includes("Likes")) return "heart" as const;
  return "users" as const;
}

export default function ServicesPageContent() {
  const router = useRouter();
  const [heroImageError, setHeroImageError] = useState(false);
  const [processImageError, setProcessImageError] = useState(false);
  const [selectedService, setSelectedService] = useState(agencyServices[0]?.slug ?? "");
  const [quantity, setQuantity] = useState("1000");
  const [openFaq, setOpenFaq] = useState<string | null>(serviceFaqs[0]?.question ?? null);
  const [plannerTouched, setPlannerTouched] = useState(false);

  const parsedQuantity = Number(quantity);
  const hasQuantityError = !Number.isFinite(parsedQuantity) || parsedQuantity < 100;

  const selectedServiceDetails = useMemo(
    () => agencyServices.find((service) => service.slug === selectedService) ?? agencyServices[0],
    [selectedService],
  );

  const popularServices = useMemo(
    () => [
      agencyServices.find((service) => service.slug === "instagram-followers"),
      agencyServices.find((service) => service.slug === "instagram-likes"),
      agencyServices.find((service) => service.slug === "youtube-views"),
      agencyServices.find((service) => service.slug === "linkedin-likes"),
    ].filter(Boolean),
    [],
  );

  const catalogServices = useMemo(
    () =>
      [
        "instagram-followers",
        "youtube-views",
        "facebook-followers",
        "linkedin-followers",
        "tiktok-followers",
        "twitter-followers",
      ]
        .map((slug) => agencyServices.find((service) => service.slug === slug))
        .filter(Boolean),
    [],
  );

  const handleStartOrder = () => {
    setPlannerTouched(true);
    if (hasQuantityError) return;
    const nextPath = "/dashboard/new-order";
    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  return (
    <BlogShell>
      <div className="relative overflow-x-clip pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-14 top-14 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute right-[-8%] top-40 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute left-[35%] top-[38%] h-64 w-64 rounded-full bg-violet-200/35 blur-3xl" />
        </div>

        <section className="relative px-5 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-12">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-9 lg:grid-cols-[1.05fr_.95fr]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65 }}
            >
              <p className="inline-flex rounded-full border border-white/85 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#355294] shadow-[0_8px_24px_rgba(82,111,174,.12)] backdrop-blur">
                PREMIUM SOCIAL GROWTH SERVICES
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight text-[#112551] sm:text-5xl">
                Choose the Right Service to Grow Your Brand Faster
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a6290] sm:text-lg">
                Explore high-quality growth services for creators, brands, agencies, and businesses. SocialRUSH
                helps you boost visibility, engagement, and audience growth with a clean order flow, secure
                checkout, and real-time tracking.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login?next=/dashboard/new-order"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,109,255,.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(117,109,255,.45)]"
                >
                  Start Order
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d5e3ff] bg-white/90 px-6 py-3 text-sm font-bold text-[#1f3b75] shadow-[0_10px_24px_rgba(81,111,171,.12)] transition duration-300 hover:-translate-y-0.5"
                >
                  View Packages
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d5e3ff] bg-white/90 px-6 py-3 text-sm font-bold text-[#1f3b75] shadow-[0_10px_24px_rgba(81,111,171,.12)] transition duration-300 hover:-translate-y-0.5"
                >
                  Contact Support
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {["Secure checkout", "Real-time tracking", "Premium support", "Fast delivery"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/85 bg-white/88 px-3 py-1.5 text-xs font-semibold text-[#2f4a86] shadow-[0_8px_20px_rgba(87,114,173,.12)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              <div className="relative mx-auto w-full max-w-xl rounded-[30px] border border-white/75 bg-white/78 p-4 shadow-[0_28px_58px_rgba(83,111,173,.2)] backdrop-blur">
                <motion.div
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white to-[#edf5ff] p-3"
                >
                  {!heroImageError ? (
                    <Image
                      src="/images/services/services-hero.png"
                      alt="SocialRUSH services hero"
                      width={920}
                      height={760}
                      className="h-auto w-full rounded-2xl object-cover"
                      priority
                      onError={() => setHeroImageError(true)}
                    />
                  ) : (
                    <div className="grid h-[330px] place-items-center rounded-2xl bg-[radial-gradient(circle_at_25%_15%,_#ffd5ea_0%,_#e7efff_48%,_#dcf7ff_100%)]">
                      <div className="rounded-2xl border border-white/80 bg-white/90 px-5 py-3 text-sm font-extrabold text-[#2a4884] shadow-[0_10px_24px_rgba(85,112,171,.2)]">
                        Premium Services Visual
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto grid w-full max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {benefits.map((item, index) => (
              <motion.article
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -7 }}
                className="rounded-2xl border border-white/85 bg-white/90 p-4 shadow-[0_14px_30px_rgba(86,114,175,.14)] backdrop-blur"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ffe4f1] via-[#ebefff] to-[#e1f7ff] text-[#2f4f90]">
                  <MarketingIcon name={item.icon} className="h-4.5 w-4.5" />
                </span>
                <h2 className="mt-3 text-sm font-extrabold text-[#163161]">{item.title}</h2>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Service Categories</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">Supported Growth Categories</h2>
            </motion.div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categoryCards.map((category, index) => (
                <motion.article
                  key={category.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-white/85 bg-white/90 p-5 shadow-[0_14px_32px_rgba(86,114,175,.14)]"
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white shadow-[0_10px_22px_rgba(80,105,167,.28)] ${category.gradient}`}
                  >
                    {category.short}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-[#122a5c]">{category.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4f6795]">{category.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-[30px] border border-white/85 bg-white/90 p-6 shadow-[0_20px_46px_rgba(86,114,175,.16)] sm:p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Order Flow UX</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">Plan your order in seconds</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4f6795]">
                Select your service, set quantity or package intent, review the summary, and continue to secure
                checkout. If you are not logged in, you will be redirected to login first.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <label className="text-xs font-bold text-[#334f85]">
                  Select Service
                  <select
                    value={selectedService}
                    onChange={(event) => setSelectedService(event.target.value)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                  >
                    {agencyServices.map((service) => (
                      <option key={service.slug} value={service.slug}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-bold text-[#334f85]">
                  Quantity (Custom)
                  <input
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                    placeholder="Minimum 100"
                  />
                  {plannerTouched && hasQuantityError && (
                    <span className="mt-2 block text-xs font-semibold text-[#c2416a]">Minimum order quantity is 100.</span>
                  )}
                </label>

                <div className="rounded-2xl border border-[#dae6ff] bg-[#f7faff] p-4 text-sm text-[#315086]">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5a73a9]">Order summary</p>
                  <p className="mt-2 font-bold">{selectedServiceDetails?.name}</p>
                  <p className="mt-1">Quantity: {quantity || "0"}</p>
                  <p className="mt-1 text-xs">Checkout continues in dashboard after login.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleStartOrder}
                  className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,109,255,.35)] transition duration-300 ${hasQuantityError ? "cursor-not-allowed bg-gradient-to-r from-[#f39cc9] via-[#b4b5f8] to-[#93dfff]" : "bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(117,109,255,.42)]"}`}
                >
                  Start Order
                </button>
                <Link
                  href="/packages"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d5e3ff] bg-white px-6 py-3 text-sm font-bold text-[#1f3b75]"
                >
                  View Packages
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Main Service Catalog</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">Premium service options</h2>
            </motion.div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {catalogServices.map((service, index) => (
                <motion.article
                  key={service?.slug}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  whileHover={{ y: -7 }}
                  className="rounded-3xl border border-white/85 bg-white/90 p-5 shadow-[0_16px_36px_rgba(81,108,169,.18)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#ffe4f1] via-[#ebefff] to-[#e1f7ff] text-[#2f4f90]">
                      <MarketingIcon name={serviceCardIcon(service?.name || "")} className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-[#d6e2ff] bg-[#f6f9ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5670aa]">
                      {service?.platform}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold text-[#122a5c]">{service?.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4f6795]">{service?.summary}</p>

                  <div className="mt-4 space-y-2 text-sm text-[#486291]">
                    {service?.deliverables.slice(0, 4).map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-[#ff67b2] to-[#4dc4ff]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#d9e5ff] bg-[#f7faff] px-4 py-3 text-sm font-semibold text-[#355186]">
                    {String(service?.price || "Packages available").includes("₹") ? `Starting from ${service?.price}` : "Packages available"}
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <Link
                      href="/login?next=/dashboard/new-order"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2 text-xs font-bold text-white"
                    >
                      Start Order
                    </Link>
                    <Link
                      href="/packages"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d5e3ff] bg-white px-4 py-2 text-xs font-bold text-[#1f3b75]"
                    >
                      View Packages
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/85 bg-white/90 p-6 shadow-[0_20px_46px_rgba(86,114,175,.16)] sm:p-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">How Ordering Works</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">How Ordering Works</h2>
            </motion.div>

            <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_.95fr] lg:items-center">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="grid gap-3 sm:grid-cols-2"
              >
                {orderSteps.map((step, index) => (
                  <div key={step} className="relative rounded-2xl border border-[#dce7ff] bg-[#f7faff] p-4 shadow-[0_10px_24px_rgba(86,114,175,.1)]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6078ab]">Step {index + 1}</p>
                    <p className="mt-2 text-sm font-bold text-[#1f3a74]">{step}</p>
                    {index < orderSteps.length - 1 && (
                      <span className="pointer-events-none absolute -right-2 top-1/2 hidden h-[2px] w-4 -translate-y-1/2 bg-gradient-to-r from-[#8d91ff] to-[#57c8ff] sm:block" />
                    )}
                  </div>
                ))}
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.14 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="overflow-hidden rounded-3xl border border-white/75 bg-gradient-to-br from-white to-[#edf5ff] p-3 shadow-[0_18px_40px_rgba(86,114,175,.16)]"
                >
                  {!processImageError ? (
                    <Image
                      src="/images/services/services-process.png"
                      alt="How ordering works"
                      width={900}
                      height={700}
                      className="h-auto w-full rounded-2xl object-cover"
                      onError={() => setProcessImageError(true)}
                    />
                  ) : (
                    <div className="grid h-[300px] place-items-center rounded-2xl bg-[radial-gradient(circle_at_25%_15%,_#ffd5ea_0%,_#e7efff_48%,_#dcf7ff_100%)]">
                      <div className="rounded-2xl border border-white/80 bg-white/90 px-5 py-3 text-sm font-extrabold text-[#2a4884] shadow-[0_10px_24px_rgba(85,112,171,.2)]">
                        Service Process Visual
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Popular Services</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">Top picks for growth campaigns</h2>
            </motion.div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {popularServices.map((service, index) => (
                <motion.article
                  key={service?.slug}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  whileHover={{ y: -7 }}
                  className="rounded-3xl border border-white/85 bg-white/90 p-5 shadow-[0_15px_34px_rgba(81,108,169,.16)]"
                >
                  <span className="rounded-full border border-[#d6e2ff] bg-[#f6f9ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5670aa]">
                    {index === 0 ? "Popular" : index === 1 ? "Best for creators" : "Fast delivery"}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-[#122a5c]">{service?.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4f6795]">{service?.summary}</p>
                  <Link
                    href="/login?next=/dashboard/new-order"
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2 text-xs font-bold text-white"
                  >
                    Start Order
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Why Choose SocialRUSH</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">Built for premium campaign execution</h2>
            </motion.div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {whyChoose.map((item, index) => (
                <motion.article
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-white/85 bg-white/90 p-5 shadow-[0_14px_32px_rgba(86,114,175,.14)]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#ffe4f1] via-[#ebefff] to-[#e1f7ff] text-[#2f4f90]">
                    <MarketingIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-[#122a5c]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4f6795]">{item.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/85 bg-white/90 p-6 shadow-[0_20px_46px_rgba(86,114,175,.16)] sm:p-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">FAQ</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">Services FAQ</h2>
            </motion.div>

            <div className="mt-6 space-y-3">
              {serviceFaqs.map((faq, index) => {
                const isOpen = openFaq === faq.question;
                return (
                  <motion.div
                    key={faq.question}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="rounded-2xl border border-white/90 bg-white/92 shadow-[0_10px_24px_rgba(86,114,175,.12)]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : faq.question)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-bold text-[#1b356c] sm:text-base">{faq.question}</span>
                      <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#d8e4ff] bg-[#f6f9ff] text-[#29508f]">
                        {isOpen ? "-" : "+"}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <p className="border-t border-[#edf2ff] px-5 py-4 text-sm leading-7 text-[#4f6795]">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative px-5 pb-28 pt-8 sm:px-6 lg:px-8 lg:pb-32 lg:pt-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-6xl rounded-[34px] border border-white/85 bg-gradient-to-r from-[#182f67] via-[#223f7f] to-[#2f5d9d] px-7 py-9 text-white shadow-[0_30px_58px_rgba(39,65,123,.38)] sm:px-10 sm:py-11"
          >
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">Ready to choose the right growth service?</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
              Browse premium growth options, place your order securely, and track every step from your dashboard.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login?next=/dashboard/new-order"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#1c356e] shadow-[0_12px_26px_rgba(17,29,61,.35)] transition duration-300 hover:-translate-y-0.5"
              >
                Start Order
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </BlogShell>
  );
}
