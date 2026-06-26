"use client";

import { motion } from "framer-motion";
import BlogShell from "@/components/marketing/blog/BlogShell";
import OrderNowButton from "@/components/marketing/OrderNowButton";
import { activeSmmServices, platformMeta, type SmmPlatformId } from "@/lib/smm-service-catalog";

const platformOrder: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];

export default function ServicesPageContent() {
  return (
    <BlogShell>
      <main className="relative overflow-x-clip pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute right-[-10%] top-36 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute left-[30%] bottom-20 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
        </div>

        <section className="relative px-5 pb-10 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-[0_24px_58px_-28px_rgba(15,23,42,.35)] backdrop-blur-xl sm:p-10">
            <p className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              Premium Service Catalog
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em] text-[#10234f] sm:text-5xl">
              Professional SMM Services for Scalable Growth
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[#4b628e] sm:text-base sm:leading-8">
              Browse platforms, compare starting prices, delivery windows, and refill policy, then continue directly to
              secure dashboard ordering. No cart. No checkout box. Just clean service selection.
            </p>
          </div>
        </section>

        <section className="relative px-5 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
            {platformOrder.map((platformId, blockIndex) => {
              const blockServices = activeSmmServices.filter((service) => service.platform === platformId);
              const block = platformMeta[platformId];
              return (
              <motion.article
                key={platformId}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: blockIndex * 0.04 }}
                className="rounded-[1.6rem] border border-white/80 bg-white/82 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,.3)] backdrop-blur-xl sm:p-6"
              >
                <header className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white shadow-[0_10px_20px_rgba(76,108,168,.3)] ${block.gradient}`}
                  >
                    {block.short}
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-[#163165]">{block.label}</h2>
                    <p className="text-xs text-[#5f76a7]">Services with transparent pricing and delivery details</p>
                  </div>
                </header>

                <div className="space-y-4">
                  {!blockServices.length && (
                    <div className="rounded-2xl border border-dashed border-[#dce7ff] bg-[#f8fbff] p-4 text-sm font-semibold text-[#4f6795]">
                      No services are active in this platform right now.
                    </div>
                  )}
                  {blockServices.map((service) => {
                    const nextPath = `/dashboard/new-order?service=${encodeURIComponent(service.code)}`;

                    return (
                      <div
                        key={service.code}
                        className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff] p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,.28)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black text-[#163165] sm:text-base">{service.name}</h3>
                            <p className="mt-1 text-xs leading-6 text-[#5b719f] sm:text-sm">{service.description}</p>
                          </div>
                          <p className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#204083] shadow-sm">₹{service.pricePer1000.toLocaleString("en-IN")} / 1000</p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] font-bold">
                          <span className="rounded-full bg-white px-3 py-1.5 text-[#47639a] shadow-sm">Delivery: {service.deliveryTime}</span>
                          <span
                            className={`rounded-full px-3 py-1.5 shadow-sm ${
                              service.refillPolicy.toLowerCase().includes("non-drop")
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-violet-50 text-violet-700"
                            }`}
                          >
                            {service.refillPolicy}
                          </span>
                        </div>

                        <OrderNowButton
                          nextPath={nextPath}
                          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-[0_12px_26px_rgba(122,113,241,.35)] transition hover:-translate-y-0.5 sm:text-sm"
                        >
                          Order Now
                        </OrderNowButton>
                      </div>
                    );
                  })}
                </div>
              </motion.article>
              );
            })}
          </div>
        </section>
      </main>
    </BlogShell>
  );
}
