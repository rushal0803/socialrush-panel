"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Bot, CircleHelp, Handshake, LifeBuoy, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import FaqAccordion3D, { type FaqItem } from "./FaqAccordion3D";

type FaqCategory = {
  key: string;
  label: string;
  items: FaqItem[];
};

export type { FaqCategory };

const trustPoints = [
  {
    title: "Fast Support",
    text: "Get quick guidance before, during, and after your order with human-first assistance.",
    icon: LifeBuoy,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Secure Payments",
    text: "Protected wallet funding and payment processing with reliable transaction safety.",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Transparent Process",
    text: "Clear pricing, visible timelines, and real-time order tracking at every stage.",
    icon: Handshake,
    color: "from-violet-500 to-fuchsia-600",
  },
  {
    title: "Business Growth Focused",
    text: "Automation and campaign options tailored for creators, startups, and growing brands.",
    icon: Rocket,
    color: "from-pink-500 to-rose-600",
  },
] as const;

const sectionFade: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function FaqPageContent({ categories }: { categories: FaqCategory[] }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.key ?? "general");
  const selectedCategory = categories.find((category) => category.key === activeCategory) ?? categories[0];

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f9ff_0%,#fdf4ff_30%,#fff1f8_55%,#f5f3ff_80%,#ecfeff_100%)] text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 top-10 h-96 w-96 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="absolute right-0 top-20 h-[30rem] w-[30rem] rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute -bottom-16 right-1/4 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <section className="relative px-5 pb-10 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <motion.div
          variants={sectionFade}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-8 shadow-[0_26px_65px_-28px_rgba(15,23,42,.35)] backdrop-blur-xl sm:p-10 lg:p-14"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-gradient-to-br from-pink-300/40 to-sky-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-gradient-to-br from-violet-300/40 to-cyan-300/40 blur-3xl" />

          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-600 shadow-sm">
              <CircleHelp className="h-3.5 w-3.5" /> FAQ
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Everything you need to know about SocialRUSH AI services, automation, pricing, payments, and support.
            </p>
          </div>

          <div className="pointer-events-none absolute left-8 top-8 hidden h-20 w-20 rounded-2xl border border-white/80 bg-white/60 shadow-[0_16px_30px_-16px_rgba(14,165,233,.55)] backdrop-blur-md md:block" />
          <div className="pointer-events-none absolute bottom-10 right-10 hidden h-16 w-16 rounded-full border border-white/80 bg-gradient-to-br from-pink-400/25 to-cyan-400/25 shadow-[0_18px_32px_-18px_rgba(236,72,153,.6)] backdrop-blur-md md:block" />
        </motion.div>
      </section>

      <section className="relative px-5 pb-8 sm:px-6 lg:px-8">
        <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/80 bg-white/70 p-2 shadow-[0_16px_40px_-24px_rgba(15,23,42,.3)] backdrop-blur-xl">
            {categories.map((category) => {
              const active = category.key === activeCategory;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategory(category.key)}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition sm:text-sm ${
                    active
                      ? "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-sky-500 text-white shadow-[0_12px_30px_rgba(236,72,153,.38)]"
                      : "bg-white/85 text-slate-600 shadow-sm hover:-translate-y-0.5 hover:text-sky-600"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="relative px-5 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-center gap-3 text-slate-700">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-sky-500 text-white shadow-[0_12px_24px_rgba(236,72,153,.3)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold sm:text-xl">{selectedCategory.label} FAQs</h2>
              <p className="text-xs text-slate-500 sm:text-sm">Clear answers to help you choose the right SocialRUSH AI solution.</p>
            </div>
          </div>

          <FaqAccordion3D items={selectedCategory.items} />
        </motion.div>
      </section>

      <section className="relative px-5 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mx-auto max-w-6xl rounded-[1.7rem] border border-white/80 bg-white/75 p-6 shadow-[0_20px_55px_-24px_rgba(15,23,42,.35)] backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-700">
              <Bot className="h-3.5 w-3.5" /> Trust Signals
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Built for reliable growth and long-term partnerships</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <motion.article
                  key={point.title}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-[0_14px_38px_-20px_rgba(15,23,42,.34)]"
                >
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${point.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-slate-900">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{point.text}</p>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="relative px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <motion.div
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/82 via-white/70 to-white/82 p-7 shadow-[0_22px_60px_-24px_rgba(15,23,42,.36)] backdrop-blur-xl sm:p-10"
        >
          <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-pink-300/25 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Still have questions?</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Talk to our team and get the right automation or marketing solution for your business.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center rounded-xl border border-white bg-white/90 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-600"
              >
                Contact Us
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-12 items-center rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(236,72,153,.35)] transition hover:brightness-105"
              >
                View Services
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
