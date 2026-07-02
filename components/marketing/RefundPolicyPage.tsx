"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CircleDollarSign,
  CreditCard,
  Headset,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import PublicShell from "./PublicShell";
import type { PolicySection } from "./PolicyPage";

type RefundPolicyPageProps = {
  title: string;
  subtitle: string;
  badge: string;
  breadcrumbLabel: string;
  sections: PolicySection[];
};

type TocItem = {
  id: string;
  label: string;
};

const trustCards = [
  {
    title: "Secure checkout",
    detail: "Protected payment and wallet workflows for every transaction.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent refund terms",
    detail: "Clear policy structure with readable eligibility details.",
    icon: CircleDollarSign,
  },
  {
    title: "Fast support",
    detail: "Prompt ticket and email support for payment and order review.",
    icon: Headset,
  },
  {
    title: "Verified payments",
    detail: "Trusted providers and trackable account billing records.",
    icon: BadgeCheck,
  },
] as const;

const heroPoints = [
  {
    title: "Secure payments",
    icon: CreditCard,
  },
  {
    title: "Wallet credit support",
    icon: WalletCards,
  },
  {
    title: "Billing review",
    icon: CircleDollarSign,
  },
] as const;

function isImportantSection(title: string) {
  return /(refund|wallet|payment|billing|cancellations|disputes|approved)/i.test(title);
}

function toTocItems(sections: PolicySection[]): TocItem[] {
  return sections.map((section, index) => ({
    id: `section-${index + 1}`,
    label: section.title,
  }));
}

export default function RefundPolicyPage({
  title,
  subtitle,
  badge,
  breadcrumbLabel,
  sections,
}: RefundPolicyPageProps) {
  const tableOfContentsItems = toTocItems(sections);

  return (
    <PublicShell tone="light3d">
      <div className="relative overflow-x-clip bg-[radial-gradient(circle_at_16%_16%,rgba(255, 159, 0, .2),transparent_38%),radial-gradient(circle_at_84%_10%,rgba(255, 122, 0, .2),transparent_40%),radial-gradient(circle_at_52%_86%,rgba(255, 159, 0, .16),transparent_44%),linear-gradient(180deg,#FFF8F1_0%,#FFF8F1_100%)] pb-20 pt-8 sm:pb-24 lg:pt-10">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            aria-hidden
            animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-5rem] top-14 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/3 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl"
          />
        </div>

        <section className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.nav
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              aria-label="Breadcrumb"
              className="mb-5 flex items-center gap-2 text-xs font-semibold text-[#111827]"
            >
              <Link href="/" className="transition hover:text-[#0B0B0F]">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#0B0B0F]">{breadcrumbLabel}</span>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_28px_64px_-34px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,0)_42%,rgba(255, 159, 0, .14)_78%,rgba(255, 122, 0, .1))]" />
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
                <div>
                  <span className="inline-flex rounded-full border border-white/85 bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9F00] shadow-sm">
                    {badge}
                  </span>
                  <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.03em] text-[#0B0B0F] sm:text-5xl">
                    {title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-8 text-[#111827] sm:text-base">{subtitle}</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-[1.6rem] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,.92),rgba(255, 159, 0, .82))] p-5 shadow-[0_24px_56px_-32px_rgba(15,23,42,.4)]"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#111827]">Refund flow highlights</p>
                  <p className="mt-3 text-lg font-black text-[#0B0B0F]">Policy confidence for every campaign</p>
                  <div className="mt-4 space-y-3">
                    {heroPoints.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex items-center gap-3 rounded-xl border border-[#FFF8F1] bg-white/80 px-3 py-2">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white">
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="text-xs font-bold text-[#FF9F00]">{item.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {trustCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="rounded-2xl border border-white/85 bg-white/86 p-4 shadow-[0_16px_34px_-26px_rgba(15,23,42,.35)]"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_10px_20px_-12px_rgba(255, 196, 0, .7)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-3 text-xs font-black text-[#0B0B0F]">{card.title}</p>
                    <p className="mt-1 text-xs leading-6 text-[#111827]">{card.detail}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative px-4 pb-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <details className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_18px_44px_-30px_rgba(15,23,42,.38)] backdrop-blur-xl lg:hidden">
                <summary className="cursor-pointer list-none text-sm font-black text-[#0B0B0F]">On this page</summary>
                <nav className="mt-3 space-y-2">
                  {tableOfContentsItems.map((item, index) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-lg px-2 py-1.5 text-xs leading-5 text-[#111827] transition hover:bg-[#FFF8F1] hover:text-[#0B0B0F]"
                    >
                      {index + 1}. {item.label}
                    </a>
                  ))}
                </nav>
              </details>

              <div className="hidden rounded-2xl border border-white/80 bg-white/80 p-5 shadow-[0_18px_44px_-30px_rgba(15,23,42,.38)] backdrop-blur-xl lg:block lg:sticky lg:top-28">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111827]">On this page</p>
                <nav className="mt-4 space-y-2">
                  {tableOfContentsItems.map((item, index) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-lg px-2 py-1.5 text-xs leading-5 text-[#111827] transition hover:bg-[#FFF8F1] hover:text-[#0B0B0F]"
                    >
                      {index + 1}. {item.label}
                    </a>
                  ))}
                </nav>
                <p className="mt-5 border-t border-[#FFF8F1] pt-4 text-[10px] leading-5 text-[#111827]">
                  Review policy details before placing campaigns.
                </p>
              </div>
            </aside>

            <motion.article
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/85 bg-white/90 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,.42)] backdrop-blur-xl sm:p-8 lg:p-10"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(140deg,rgba(255,255,255,.36),rgba(255,255,255,0)_36%,rgba(255, 159, 0, .08)_73%,rgba(255, 122, 0, .08))]" />
              {sections.map((section, index) => {
                const sectionId = tableOfContentsItems[index]?.id || `section-${index + 1}`;
                const important = isImportantSection(section.title);

                return (
                  <motion.section
                    id={sectionId}
                    key={section.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.16 }}
                    transition={{ duration: 0.35, delay: index * 0.02 }}
                    className="scroll-mt-28 border-b border-[#FFF8F1] py-8 first:pt-0 last:border-0 last:pb-0"
                  >
                    <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#FFF8F1] bg-white/85 px-3 py-1.5 shadow-[0_10px_22px_-16px_rgba(15,23,42,.3)]">
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF9F00]" />
                      <h2 className="truncate text-xl font-black tracking-[-0.01em] text-[#0B0B0F] sm:text-2xl">
                        {index + 1}. {section.title}
                      </h2>
                    </div>

                    {important ? (
                      <div className="mt-4 rounded-2xl border border-[#f2d7b7] bg-[linear-gradient(145deg,rgba(255,248,236,.95),rgba(255,255,255,.95))] px-4 py-3 text-xs font-semibold leading-6 text-[#8a6130] shadow-[0_10px_24px_-18px_rgba(138,97,48,.4)]">
                        Important note: Refund and payment outcomes depend on verification status, delivery state, and policy eligibility.
                      </div>
                    ) : null}

                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="mt-4 text-sm leading-8 text-[#111827] sm:text-base">
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets ? (
                      <ul className="mt-4 space-y-3">
                        {section.bullets.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm leading-8 text-[#111827] sm:text-base">
                            <span className="mt-3 h-2 w-2 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF9F00]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </motion.section>
                );
              })}
            </motion.article>
          </div>
        </section>

        <section className="relative px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-3 rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_20px_44px_-30px_rgba(15,23,42,.36)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-black text-[#0B0B0F]">Need help with a refund or wallet review?</p>
              <p className="mt-1 text-xs text-[#111827]">Our support team can review payment records, campaign status, and account details.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#FFF3E0] bg-white/90 px-5 py-2 text-sm font-bold text-[#0B0B0F] shadow-[0_10px_24px_rgba(255, 159, 0, .12)] transition hover:-translate-y-0.5 sm:w-auto"
              >
                Back to Home
              </Link>
              <Link
                href="/support"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-2 text-sm font-bold text-white shadow-[0_14px_30px_rgba(255, 196, 0, .35)] transition hover:-translate-y-0.5 sm:w-auto"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
