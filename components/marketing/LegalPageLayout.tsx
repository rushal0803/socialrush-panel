"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PolicySection } from "./PolicyPage";

type TocItem = {
  id: string;
  label: string;
};

type LegalPageLayoutProps = {
  title: string;
  subtitle: string;
  badge: string;
  breadcrumbLabel: string;
  tableOfContentsItems: TocItem[];
  sections: PolicySection[];
};

const trustCards = [
  { title: "Secure platform", detail: "Protected account and transaction workflows." },
  { title: "Transparent policy", detail: "Clear legal terms presented in plain structure." },
  { title: "Customer support", detail: "Fast support for billing and order questions." },
  { title: "Trusted payments", detail: "Verified payment partners and audit-ready records." },
] as const;

function isImportantSection(title: string) {
  return /(liability|refund|dispute|retention|security|billing|payment|wallet|cancellations)/i.test(title);
}

export default function LegalPageLayout({
  title,
  subtitle,
  badge,
  breadcrumbLabel,
  tableOfContentsItems,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="relative overflow-x-clip bg-[radial-gradient(circle_at_18%_18%,rgba(121,177,255,.16),transparent_38%),radial-gradient(circle_at_84%_12%,rgba(255,147,214,.17),transparent_42%),radial-gradient(circle_at_52%_84%,rgba(111,224,255,.15),transparent_45%)] pb-20 pt-8 sm:pb-24 lg:pt-10">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          aria-hidden
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-5rem] top-16 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-violet-200/35 blur-3xl"
        />
      </div>

      <section className="relative px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.nav
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-2 text-xs font-semibold text-[#5872a8]"
          >
            <Link href="/" className="transition hover:text-[#1e3c78]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#2d4f90]">{breadcrumbLabel}</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_28px_64px_-34px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,0)_42%,rgba(121,177,255,.14)_78%,rgba(255,147,214,.1))]" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
              <div>
                <span className="inline-flex rounded-full border border-white/85 bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#48649e] shadow-sm">
                  {badge}
                </span>
                <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.03em] text-[#102858] sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-[#4d6796] sm:text-base">{subtitle}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#d6e3ff] bg-white/90 px-5 py-2 text-sm font-bold text-[#1f3b75] shadow-[0_10px_24px_rgba(82,111,171,.12)] transition hover:-translate-y-0.5 sm:w-auto"
                  >
                    Back to Home
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-2 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,109,255,.35)] transition hover:-translate-y-0.5 sm:w-auto"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-[1.6rem] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,.92),rgba(240,247,255,.82))] p-5 shadow-[0_24px_56px_-32px_rgba(15,23,42,.4)]"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5b76aa]">Legal confidence</p>
                <p className="mt-3 text-lg font-black text-[#17366f]">Trusted, readable policy experience</p>
                <div className="mt-4 space-y-3 text-xs text-[#5b76aa]">
                  <p className="rounded-xl border border-[#dce7ff] bg-white/80 px-3 py-2">Effective from June 2026</p>
                  <p className="rounded-xl border border-[#dce7ff] bg-white/80 px-3 py-2">Support: support@socialrush.in</p>
                  <p className="rounded-xl border border-[#dce7ff] bg-white/80 px-3 py-2">Designed for clarity and compliance</p>
                </div>
              </motion.div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {trustCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-white/85 bg-white/86 p-4 shadow-[0_16px_34px_-26px_rgba(15,23,42,.35)]"
                >
                  <p className="text-xs font-black text-[#1f3d77]">{card.title}</p>
                  <p className="mt-1 text-xs leading-6 text-[#6079ab]">{card.detail}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative px-5 pb-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <details className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_18px_44px_-30px_rgba(15,23,42,.38)] backdrop-blur-xl lg:hidden">
              <summary className="cursor-pointer list-none text-sm font-black text-[#17366f]">On this page</summary>
              <nav className="mt-3 space-y-2">
                {tableOfContentsItems.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-lg px-2 py-1.5 text-xs leading-5 text-[#6079ab] transition hover:bg-[#f4f8ff] hover:text-[#1f3d77]"
                  >
                    {index + 1}. {item.label}
                  </a>
                ))}
              </nav>
            </details>

            <div className="hidden rounded-2xl border border-white/80 bg-white/80 p-5 shadow-[0_18px_44px_-30px_rgba(15,23,42,.38)] backdrop-blur-xl lg:block lg:sticky lg:top-28">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5b76aa]">On this page</p>
              <nav className="mt-4 space-y-2">
                {tableOfContentsItems.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-lg px-2 py-1.5 text-xs leading-5 text-[#6079ab] transition hover:bg-[#f4f8ff] hover:text-[#1f3d77]"
                  >
                    {index + 1}. {item.label}
                  </a>
                ))}
              </nav>
              <p className="mt-5 border-t border-[#e4ecff] pt-4 text-[10px] leading-5 text-[#7890bc]">
                Effective: 20 June 2026
                <br />
                Contact: support@socialrush.in
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
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(140deg,rgba(255,255,255,.36),rgba(255,255,255,0)_36%,rgba(110,205,255,.08)_73%,rgba(255,120,188,.08))]" />
            {sections.map((section, index) => {
              const important = isImportantSection(section.title);
              const sectionId = tableOfContentsItems[index]?.id || `section-${index + 1}`;
              return (
                <motion.section
                  id={sectionId}
                  key={section.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.16 }}
                  transition={{ duration: 0.35, delay: index * 0.02 }}
                  className="scroll-mt-28 border-b border-[#e8efff] py-8 first:pt-0 last:border-0 last:pb-0"
                >
                  <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#dce8ff] bg-white/85 px-3 py-1.5 shadow-[0_10px_22px_-16px_rgba(15,23,42,.3)]">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#ff67b2] to-[#46c3ff]" />
                    <h2 className="truncate text-xl font-black tracking-[-0.01em] text-[#102858] sm:text-2xl">
                      {index + 1}. {section.title}
                    </h2>
                  </div>

                  {important ? (
                    <div className="mt-4 rounded-2xl border border-[#f2d7b7] bg-[linear-gradient(145deg,rgba(255,248,236,.95),rgba(255,255,255,.95))] px-4 py-3 text-xs font-semibold leading-6 text-[#8a6130] shadow-[0_10px_24px_-18px_rgba(138,97,48,.4)]">
                      Important notice: review this section carefully before using or continuing services.
                    </div>
                  ) : null}

                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="mt-4 text-sm leading-8 text-[#4d6796] sm:text-base">
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets ? (
                    <ul className="mt-4 space-y-3">
                      {section.bullets.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-8 text-[#4d6796] sm:text-base">
                          <span className="mt-3 h-2 w-2 rounded-full bg-gradient-to-r from-[#ff67b2] to-[#46c3ff]" />
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
    </div>
  );
}
