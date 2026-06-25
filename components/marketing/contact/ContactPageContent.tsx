"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { agencyServices } from "@/lib/marketing/content";

const contactOptions = [
  {
    title: "WhatsApp Support",
    description: "Quick help for orders, pricing, and service selection.",
    icon: "message" as const,
    cta: "Open WhatsApp",
    href: "whatsapp",
  },
  {
    title: "Email Support",
    description: "Send your query and our team will reply as soon as possible.",
    icon: "message" as const,
    cta: "Email Us",
    href: "mailto:support@socialrush.in?subject=SocialRUSH%20Support%20Request",
  },
  {
    title: "Order Help",
    description: "Need help with an active order, payment, or tracking?",
    icon: "shield" as const,
    cta: "Get Order Help",
    href: "/login?next=/dashboard/support",
  },
  {
    title: "Business Enquiry",
    description: "For creators, brands, agencies, and partnership queries.",
    icon: "users" as const,
    cta: "Talk to Team",
    href: "mailto:support@socialrush.in?subject=Business%20Enquiry",
  },
];

const supportInfo = [
  {
    title: "Response time",
    text: "Usually within 24 hours",
    icon: "clock" as const,
  },
  {
    title: "Support hours",
    text: "Available daily",
    icon: "message" as const,
  },
  {
    title: "Best for",
    text: "Service queries, order help, pricing, and custom campaigns",
    icon: "trend" as const,
  },
  {
    title: "Safety note",
    text: "Never share passwords or private account access",
    icon: "lock" as const,
  },
];

const faqs = [
  {
    question: "How can I contact SocialRUSH?",
    answer:
      "You can contact us through WhatsApp support or email. For order-specific issues, include your order details so we can assist faster.",
  },
  {
    question: "Can I ask for custom packages?",
    answer:
      "Yes. Share your platform, campaign objective, and estimated volume, and our team can suggest a custom growth plan.",
  },
  {
    question: "How fast do you reply?",
    answer:
      "Most support requests are answered within 24 hours. Complex campaign planning requests may take slightly longer.",
  },
  {
    question: "Can I get help choosing a service?",
    answer:
      "Absolutely. Tell us your current profile stage and campaign goal, and we will help you choose a practical service mix.",
  },
  {
    question: "Do I need an account before ordering?",
    answer:
      "Yes, an account is required to place and track orders. You can still contact support first if you want guidance before signup.",
  },
  {
    question: "Can I get help with an active order?",
    answer:
      "Yes. Share the order details through support and our team will review status, delivery windows, or next steps.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactPageContent() {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20with%20my%20growth%20campaign";

  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.question ?? null);
  const [heroImageError, setHeroImageError] = useState(false);

  return (
    <BlogShell>
      <div className="relative overflow-x-clip pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-14 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute right-[-9%] top-40 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute left-[34%] top-[35%] h-64 w-64 rounded-full bg-violet-200/35 blur-3xl" />
        </div>

        <section className="relative px-5 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-12">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65 }}
            >
              <p className="inline-flex rounded-full border border-white/80 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#3a5798] shadow-[0_8px_24px_rgba(82,111,174,.12)] backdrop-blur">
                Contact SocialRUSH
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight text-[#112551] sm:text-5xl">
                Let&apos;s Build Your Growth Campaign Together
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a6290] sm:text-lg">
                Have questions about services, pricing, orders, or support? Our team is here to help you choose
                the right growth solution.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,109,255,.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(117,109,255,.45)]"
                >
                  WhatsApp Support
                </a>
                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d6e3ff] bg-white/90 px-6 py-3 text-sm font-bold text-[#1f3b75] shadow-[0_10px_24px_rgba(81,111,171,.12)] transition duration-300 hover:-translate-y-0.5"
                >
                  View Services
                </Link>
                <Link
                  href="/login?next=/dashboard/new-order"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d6e3ff] bg-white/90 px-6 py-3 text-sm font-bold text-[#1f3b75] shadow-[0_10px_24px_rgba(81,111,171,.12)] transition duration-300 hover:-translate-y-0.5"
                >
                  Start Order
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {["Fast response", "Secure support", "Order help", "Custom campaign guidance"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/85 bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#2f4a86] shadow-[0_8px_20px_rgba(87,114,173,.12)]"
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
              transition={{ duration: 0.65, delay: 0.12 }}
            >
              <div className="relative mx-auto w-full max-w-xl rounded-[30px] border border-white/75 bg-white/78 p-4 shadow-[0_28px_58px_rgba(83,111,173,.2)] backdrop-blur">
                <motion.div
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white to-[#edf5ff] p-3"
                >
                  {!heroImageError ? (
                    <Image
                      src="/images/contact/contact-3d.png"
                      alt="SocialRUSH contact support"
                      width={900}
                      height={700}
                      className="h-auto w-full rounded-2xl object-cover"
                      priority
                      onError={() => setHeroImageError(true)}
                    />
                  ) : (
                    <div className="grid h-[320px] place-items-center rounded-2xl bg-[radial-gradient(circle_at_25%_15%,_#ffd5ea_0%,_#e7efff_48%,_#dcf7ff_100%)]">
                      <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm font-extrabold text-[#2a4884] shadow-[0_10px_24px_rgba(85,112,171,.2)]">
                        Contact Support
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 },
                },
              }}
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            >
              {contactOptions.map((item) => (
                <motion.article
                  key={item.title}
                  variants={fadeUp}
                  transition={{ duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="rounded-3xl border border-white/85 bg-white/90 p-5 shadow-[0_16px_34px_rgba(81,108,169,.17)] backdrop-blur transition-shadow duration-300 hover:shadow-[0_24px_44px_rgba(80,109,170,.24)]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#ffe0ef] via-[#e7ecff] to-[#dff8ff] text-[#2c4b8b] shadow-[0_8px_22px_rgba(92,117,174,.2)]">
                    <MarketingIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-[#122a5c]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4f6795]">{item.description}</p>
                  {item.href === "whatsapp" ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2 text-xs font-bold text-white shadow-[0_10px_22px_rgba(117,109,255,.35)] transition duration-300 hover:-translate-y-0.5"
                    >
                      {item.cta}
                    </a>
                  ) : item.href.startsWith("/") ? (
                    <Link
                      href={item.href}
                      className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d5e3ff] bg-white px-4 py-2 text-xs font-bold text-[#1f3a73] transition duration-300 hover:-translate-y-0.5"
                    >
                      {item.cta}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d5e3ff] bg-white px-4 py-2 text-xs font-bold text-[#1f3a73] transition duration-300 hover:-translate-y-0.5"
                    >
                      {item.cta}
                    </a>
                  )}
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="inquiry" className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto grid w-full max-w-7xl gap-7 lg:grid-cols-[1fr_.82fr]">
            <motion.form
              action="mailto:support@socialrush.in"
              method="post"
              encType="text/plain"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-[30px] border border-white/85 bg-white/90 p-6 shadow-[0_18px_42px_rgba(86,114,175,.16)] backdrop-blur sm:p-8"
            >
              <h2 className="text-2xl font-extrabold text-[#122a5c]">Tell us what you need</h2>
              <p className="mt-2 text-sm leading-7 text-[#516996]">
                Submitting this form opens your default email app with your details so you can review before sending.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#334f85]">
                  Full Name
                  <input
                    required
                    name="name"
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                    placeholder="Your name"
                  />
                </label>
                <label className="text-xs font-bold text-[#334f85]">
                  Email Address
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="text-xs font-bold text-[#334f85]">
                  WhatsApp Number
                  <input
                    name="whatsapp"
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                    placeholder="+91XXXXXXXXXX"
                  />
                </label>
                <label className="text-xs font-bold text-[#334f85]">
                  Service Interested In
                  <select
                    required
                    name="service"
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                  >
                    <option value="">Select a service</option>
                    {agencyServices.map((service) => (
                      <option key={service.slug} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 block text-xs font-bold text-[#334f85]">
                Message
                <textarea
                  required
                  name="message"
                  rows={6}
                  className="mt-2 w-full resize-y rounded-xl border border-[#d2e1ff] bg-white px-4 py-3 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                  placeholder="Tell us about your platform, goal, and timeline."
                />
              </label>

              <button
                type="submit"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,109,255,.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(117,109,255,.42)]"
              >
                Send Message
              </button>
            </motion.form>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="space-y-4"
            >
              {supportInfo.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-white/85 bg-white/90 p-5 shadow-[0_14px_32px_rgba(86,114,175,.14)] backdrop-blur"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ffe4f1] via-[#ebefff] to-[#e1f7ff] text-[#2f4f90]">
                      <MarketingIcon name={item.icon} className="h-4.5 w-4.5" />
                    </span>
                    <h3 className="text-base font-extrabold text-[#163161]">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#4e6795]">{item.text}</p>
                </article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/85 bg-white/86 p-6 shadow-[0_20px_46px_rgba(86,114,175,.16)] backdrop-blur sm:p-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Contact FAQ</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">Questions before you start?</h2>
            </motion.div>

            <div className="mt-6 space-y-3">
              {faqs.map((faq, index) => {
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
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">Ready to start your growth journey?</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
              Choose a service, place your order securely, and track everything from your SocialRUSH dashboard.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login?next=/dashboard/new-order"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#1c356e] shadow-[0_12px_26px_rgba(17,29,61,.35)] transition duration-300 hover:-translate-y-0.5"
              >
                Start Order
              </Link>
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              >
                View Packages
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </BlogShell>
  );
}
