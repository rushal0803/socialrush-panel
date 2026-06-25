"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import { bigPackages } from "@/lib/big-packages";
import { currencies, convertCurrency, formatPrice, type Currency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

const allowedPlatforms = ["Instagram", "YouTube", "Facebook", "LinkedIn", "TikTok", "X"] as const;

type AllowedPlatform = (typeof allowedPlatforms)[number];

const platformLabel: Record<AllowedPlatform, string> = {
  Instagram: "Instagram",
  YouTube: "YouTube",
  Facebook: "Facebook",
  LinkedIn: "LinkedIn",
  TikTok: "TikTok",
  X: "X / Twitter",
};

const platformGradient: Record<AllowedPlatform, string> = {
  Instagram: "from-[#ff7dbf] via-[#9a96ff] to-[#58cbff]",
  YouTube: "from-[#ff8aa9] via-[#f96d83] to-[#ff5f68]",
  Facebook: "from-[#7ca6ff] via-[#5890ff] to-[#3967ea]",
  LinkedIn: "from-[#86d5ff] via-[#66a9ff] to-[#4a7ef0]",
  TikTok: "from-[#fc92c3] via-[#bb7cff] to-[#51c6ff]",
  X: "from-[#8fa1cb] via-[#7485b7] to-[#536188]",
};

const platformDescription: Record<AllowedPlatform, string> = {
  Instagram: "Premium audience and engagement packages for creator-first growth.",
  YouTube: "Structured packages for views, likes, and subscriber momentum.",
  Facebook: "Reliable package delivery for page growth and campaign visibility.",
  LinkedIn: "Professional growth packages for authority and post traction.",
  TikTok: "Short-form growth packs built for reach and profile acceleration.",
  X: "Follower growth packages for personal and brand presence on X.",
};

const benefits = [
  { title: "Better value for higher volume", icon: "trend" as const },
  { title: "Easy order management", icon: "dashboard" as const },
  { title: "Real-time campaign tracking", icon: "eye" as const },
  { title: "Secure checkout", icon: "lock" as const },
  { title: "Support available", icon: "message" as const },
  { title: "Multi-platform growth", icon: "rocket" as const },
] as const;

const faqItems = [
  {
    question: "Which package should I choose?",
    answer:
      "Start with your current profile stage and campaign goal. Creator Starter works for new momentum, while higher tiers fit larger visibility targets.",
  },
  {
    question: "Can I order a custom quantity?",
    answer:
      "Yes. Custom quantity is supported in the package planner. Minimum order quantity is 100.",
  },
  {
    question: "Do packages have refill support?",
    answer:
      "Eligible packages include refill/support guidance based on platform and delivery type.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery varies by platform and quantity. Estimated windows are shown on each package card and in summary.",
  },
  {
    question: "Can I track my package order?",
    answer: "Yes. Orders are tracked inside your dashboard with status visibility and support access.",
  },
  {
    question: "Do prices change by platform?",
    answer:
      "Yes. Package values vary by platform and service structure. Currency display follows your selected currency preference.",
  },
  {
    question: "Do I need an account before ordering?",
    answer:
      "Yes. Start Order routes through login when needed and then continues to the secure new-order flow.",
  },
] as const;

const flowSteps = [
  "Select package or custom quantity",
  "Review package highlights",
  "Add campaign details in order flow",
  "Checkout securely and track in dashboard",
] as const;

const comparisonRows = [
  ["Best for", "New creators", "Growing brands", "Agencies and teams"],
  ["Delivery speed", "Standard priority", "Priority queue", "Accelerated queue"],
  ["Tracking", "Dashboard status", "Detailed milestones", "Advanced reporting"],
  ["Support", "Email + ticket", "Priority support", "Priority + strategy support"],
  ["Refill availability", "Eligible packages", "Eligible packages", "Eligible packages"],
  ["Recommended use", "Initial social proof", "Consistent growth campaigns", "High-volume scaling"],
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export default function PackagesPageContent() {
  const router = useRouter();
  const { currency: selectedCurrency, setCurrency } = usePreferredCurrency("INR");

  const [selectedPlatform, setSelectedPlatform] = useState<AllowedPlatform>("Instagram");
  const [heroImageError, setHeroImageError] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(faqItems[0]?.question ?? null);
  const [quantity, setQuantity] = useState("1000");
  const [plannerTouched, setPlannerTouched] = useState(false);

  const platformPackages = useMemo(
    () =>
      bigPackages
        .filter((pkg) => pkg.platform === selectedPlatform)
        .filter((pkg) => pkg.quantity >= 100)
        .slice(0, 6),
    [selectedPlatform],
  );

  const parsedQuantity = Number(quantity);
  const hasQuantityError = !Number.isFinite(parsedQuantity) || parsedQuantity < 100;

  const popularCards = [
    {
      title: "Creator Starter",
      label: "Best for creators",
      value: "Starting from â‚¹599",
      bullets: ["Entry-level growth momentum", "Easy onboarding", "Fast setup"],
    },
    {
      title: "Brand Growth",
      label: "Popular",
      value: "Starting from â‚¹2,999",
      bullets: ["Balanced delivery speed", "Better volume value", "Priority support"],
    },
    {
      title: "Agency Scale",
      label: "Fast delivery",
      value: "Packages available",
      bullets: ["High-volume support", "Campaign-ready flows", "Advanced tracking"],
    },
  ] as const;

  const handleStartOrder = () => {
    setPlannerTouched(true);
    if (hasQuantityError) return;
    router.push("/login?next=/dashboard/new-order");
  };

  const handlePackageStartOrder = (packageId: string) => {
    const next = `/packages/summary?packageId=${packageId}&currency=${selectedCurrency}`;
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  return (
    <BlogShell>
      <div className="relative overflow-x-clip pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-14 top-16 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute right-[-8%] top-44 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute left-[34%] top-[39%] h-64 w-64 rounded-full bg-violet-200/35 blur-3xl" />
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
                PREMIUM GROWTH PACKAGES
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight text-[#112551] sm:text-5xl">
                Choose a Growth Package Built for Your Goals
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a6290] sm:text-lg">
                Explore flexible social media growth packages for creators, brands, and agencies. Compare options,
                choose the right package, and start your campaign with secure checkout and real-time tracking.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d5e3ff] bg-white/90 px-6 py-3 text-sm font-bold text-[#1f3b75] shadow-[0_10px_24px_rgba(81,111,171,.12)] transition duration-300 hover:-translate-y-0.5"
                >
                  View Services
                </Link>
                <Link
                  href="/login?next=/dashboard/new-order"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,109,255,.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(117,109,255,.45)]"
                >
                  Start Order
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d5e3ff] bg-white/90 px-6 py-3 text-sm font-bold text-[#1f3b75] shadow-[0_10px_24px_rgba(81,111,171,.12)] transition duration-300 hover:-translate-y-0.5"
                >
                  Contact Support
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {["Secure checkout", "Real-time tracking", "Flexible quantities", "Premium support"].map((chip) => (
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
                      src="/images/packages/packages-hero.png"
                      alt="SocialRUSH packages hero"
                      width={920}
                      height={760}
                      className="h-auto w-full rounded-2xl object-cover"
                      priority
                      onError={() => setHeroImageError(true)}
                    />
                  ) : (
                    <div className="grid h-[330px] gap-3 rounded-2xl bg-[radial-gradient(circle_at_25%_15%,_#ffd5ea_0%,_#e7efff_48%,_#dcf7ff_100%)] p-5">
                      <div className="rounded-xl border border-white/80 bg-white/90 p-3 text-xs font-bold text-[#2a4884]">Creator package analytics</div>
                      <div className="rounded-xl border border-white/80 bg-white/90 p-3 text-xs font-bold text-[#2a4884]">Brand package performance</div>
                      <div className="rounded-xl border border-white/80 bg-white/90 p-3 text-xs font-bold text-[#2a4884]">Agency scale dashboard</div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-5 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 overflow-x-auto rounded-2xl border border-white/85 bg-white/88 p-3 shadow-[0_10px_24px_rgba(86,114,175,.1)]">
            <div className="flex gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setCurrency(curr.code as Currency)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition ${selectedCurrency === curr.code ? "bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white" : "border border-[#d5e3ff] bg-white text-[#274274]"}`}
                >
                  {curr.symbol} {curr.code}
                </button>
              ))}
            </div>
            <span className="shrink-0 text-xs font-semibold text-[#5d74a7]">Currency synced with your selection</span>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allowedPlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-bold transition ${selectedPlatform === platform ? "bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white shadow-[0_10px_24px_rgba(117,109,255,.3)]" : "border border-[#d5e3ff] bg-white/90 text-[#264276]"}`}
                >
                  {platformLabel[platform]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {platformPackages.map((pkg, index) => {
                const converted = convertCurrency(pkg.basePriceINR, selectedCurrency);
                const prettyPrice = formatPrice(converted, selectedCurrency);
                const showStarting = pkg.basePriceINR > 0;
                return (
                  <motion.article
                    key={pkg.packageId}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.06 }}
                    whileHover={{ y: -8 }}
                    className="rounded-3xl border border-white/85 bg-white/92 p-5 shadow-[0_16px_36px_rgba(81,108,169,.18)]"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white shadow-[0_10px_22px_rgba(80,105,167,.28)] ${platformGradient[selectedPlatform]}`}
                      >
                        {platformLabel[selectedPlatform].slice(0, 2).toUpperCase()}
                      </span>
                      <span className="rounded-full border border-[#d6e2ff] bg-[#f6f9ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5670aa]">
                        {index === 0 ? "Best for creators" : "Packages available"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-extrabold text-[#122a5c]">{pkg.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#4f6795]">{platformDescription[selectedPlatform]}</p>

                    <div className="mt-4 rounded-2xl border border-[#d9e5ff] bg-[#f7faff] px-4 py-3 text-sm font-semibold text-[#355186]">
                      {showStarting ? `Starting from ${prettyPrice}` : "Packages available"}
                      <p className="mt-1 text-xs font-medium text-[#6078ab]">Delivery estimate: {pkg.deliveryTime}</p>
                      <p className="mt-1 text-xs font-medium text-[#6078ab]">Refill/support: Eligible where applicable</p>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-[#486291]">
                      {[pkg.description, pkg.bestFor, `${pkg.quantityLabel} quantity package`, "Real-time status tracking"].map((line) => (
                        <div key={line} className="flex items-start gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-[#ff67b2] to-[#4dc4ff]" />
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handlePackageStartOrder(pkg.packageId)}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2 text-xs font-bold text-white"
                      >
                        Start Order
                      </button>
                      <Link
                        href="/services"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d5e3ff] bg-white px-4 py-2 text-xs font-bold text-[#1f3b75]"
                      >
                        View Services
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/85 bg-white/90 p-6 shadow-[0_20px_46px_rgba(86,114,175,.16)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Popular Growth Packages</p>
            <h2 className="mt-3 text-3xl font-black text-[#10234f]">Popular Growth Packages</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {popularCards.map((item, index) => (
                <motion.article
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  whileHover={{ y: -8 }}
                  className="rounded-3xl border border-[#d7e3ff] bg-gradient-to-br from-white to-[#f6f9ff] p-5 shadow-[0_16px_34px_rgba(81,108,169,.16)]"
                >
                  <span className="rounded-full border border-[#d6e2ff] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5670aa]">
                    {item.label}
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold text-[#122a5c]">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-[#355186]">{item.value}</p>
                  <div className="mt-4 space-y-2 text-sm text-[#486291]">
                    {item.bullets.map((line) => (
                      <div key={line} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-[#ff67b2] to-[#4dc4ff]" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleStartOrder}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-2 text-xs font-bold text-white"
                  >
                    Start Order
                  </button>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl rounded-[30px] border border-white/85 bg-white/90 p-6 shadow-[0_18px_42px_rgba(86,114,175,.16)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Package Planner</p>
            <h2 className="mt-3 text-3xl font-black text-[#10234f]">Set your quantity and continue securely</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4f6795]">
              Custom quantity is supported. Minimum quantity is 100. Start Order takes you through secure login and
              protected new-order flow.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="text-xs font-bold text-[#334f85]">
                Custom Quantity
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
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleStartOrder}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2 text-sm font-bold text-white transition ${hasQuantityError ? "cursor-not-allowed bg-gradient-to-r from-[#f39cc9] via-[#b4b5f8] to-[#93dfff]" : "bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff]"}`}
                >
                  Start Order
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {flowSteps.map((step) => (
                <div key={step} className="rounded-2xl border border-[#dce7ff] bg-[#f7faff] p-4 text-sm font-semibold text-[#345085]">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/85 bg-white/90 p-6 shadow-[0_20px_46px_rgba(86,114,175,.16)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Compare Package Benefits</p>
            <h2 className="mt-3 text-3xl font-black text-[#10234f]">Compare Package Benefits</h2>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-[#dce7ff]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f7faff]">
                  <tr>
                    <th className="px-4 py-3 font-extrabold text-[#18356d]">Benefit</th>
                    <th className="px-4 py-3 font-extrabold text-[#18356d]">Creator Starter</th>
                    <th className="px-4 py-3 font-extrabold text-[#18356d]">Brand Growth</th>
                    <th className="px-4 py-3 font-extrabold text-[#18356d]">Agency Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row[0]} className="border-t border-[#e7eeff]">
                      <td className="px-4 py-3 font-semibold text-[#2b4a80]">{row[0]}</td>
                      <td className="px-4 py-3 text-[#4f6795]">{row[1]}</td>
                      <td className="px-4 py-3 text-[#4f6795]">{row[2]}</td>
                      <td className="px-4 py-3 text-[#4f6795]">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Why Choose Packages</p>
            <h2 className="mt-3 text-3xl font-black text-[#10234f]">Why creators and brands choose package flow</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {benefits.map((item, index) => (
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
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/85 bg-white/90 p-6 shadow-[0_20px_46px_rgba(86,114,175,.16)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">FAQ</p>
            <h2 className="mt-3 text-3xl font-black text-[#10234f]">Packages FAQ</h2>

            <div className="mt-6 space-y-3">
              {faqItems.map((faq, index) => {
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
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">Ready to choose your growth package?</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
              Pick the right package, place your order securely, and track every step from your SocialRUSH
              dashboard.
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
