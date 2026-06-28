"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock3, Info, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { platformMeta, type SmmPlatformId } from "@/lib/smm-service-catalog";
import { customerOrderServices, growthMethod, serviceExperience } from "@/lib/order-service-experience";
import PlatformIcon from "@/components/PlatformIcon";

type PlatformId = SmmPlatformId;

const platformOrder: PlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];

export default function NewOrderPage() {
  const searchParams = useSearchParams();
  const { currency } = usePreferredCurrency("INR");
  const requestedService = customerOrderServices.find((service) => service.code === searchParams.get("service"));
  const [platform, setPlatform] = useState<PlatformId | null>(requestedService?.platform ?? null);

  const services = useMemo(
    () => (platform ? customerOrderServices.filter((service) => service.platform === platform) : []),
    [platform],
  );

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[radial-gradient(circle_at_0%_0%,#dbe8ff_0%,transparent_34%),radial-gradient(circle_at_100%_0%,#e5f8ff_0%,transparent_36%),radial-gradient(circle_at_50%_100%,#ffe9e2_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 pb-20 pt-5 sm:px-6 sm:pt-7 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-14 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute bottom-6 left-1/3 h-64 w-64 rounded-full bg-orange-100/45 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1450px]">
        <section className="relative overflow-hidden rounded-[1.6rem] border border-white/75 bg-white/65 p-5 shadow-[0_30px_80px_-38px_rgba(15,23,42,.5)] backdrop-blur-2xl sm:p-8">
          <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-pink-200/55 via-violet-200/40 to-cyan-200/55 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" /> Growth Service Selector
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2b61] sm:text-5xl">
              Start a Growth Campaign
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#536d9d] sm:text-base">
              Choose a platform, review the available growth services, and continue to a focused order summary.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/85 bg-white/68 p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.5)] backdrop-blur-xl sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5270aa]">Step 1</p>
          <h2 className="mt-2 text-xl font-black text-[#14316a] sm:text-2xl">Choose your platform</h2>
          <p className="mt-2 text-sm leading-6 text-[#6079a7]">Select where you want to launch your next growth campaign.</p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {platformOrder.map((platformId) => {
              const meta = platformMeta[platformId];
              const active = platform === platformId;
              return (
                <motion.button
                  key={platformId}
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPlatform(platformId)}
                  className={`min-w-0 rounded-2xl border p-3 text-left shadow-[0_18px_38px_-28px_rgba(15,23,42,.5)] transition sm:p-4 ${
                    active ? "border-transparent bg-white ring-2 ring-[#8ea9ff]" : "border-white/85 bg-white/72 hover:border-[#cbdcff]"
                  }`}
                >
                  <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${meta.gradient} text-white shadow-lg`}><PlatformIcon platform={meta.label} className="h-5 w-5" /></span>
                  <span className="mt-3 block truncate text-xs font-black text-[#1c3a71]">{meta.label}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {platform ? (
          <motion.section
            key={platform}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6 rounded-3xl border border-white/85 bg-white/68 p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.5)] backdrop-blur-xl sm:p-6"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5270aa]">Step 2</p>
            <h2 className="mt-2 text-xl font-black text-[#14316a] sm:text-2xl">
              Choose a {platformMeta[platform].label} service
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6079a7]">Select a service to continue to quantity, link, wallet, and checkout details.</p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {services.map((service, index) => {
                const copy = serviceExperience[service.code];
                const startingPrice = Math.round(((service.minQuantity / 1000) * service.pricePer1000) * 100) / 100;
                return (
                  <motion.article
                    key={service.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="flex min-w-0 flex-col rounded-3xl border border-white/85 bg-white/82 p-5 shadow-[0_22px_48px_-32px_rgba(15,23,42,.5)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${platformMeta[service.platform].gradient} text-xs font-black text-white shadow-lg`}>
                        <PlatformIcon platform={platformMeta[service.platform].label} className="h-6 w-6" />
                      </span>
                      <span className="rounded-full border border-[#dce7ff] bg-[#f8fbff] px-3 py-1 text-[10px] font-black uppercase text-[#5270aa]">
                        {service.qualityType}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-[#14316a]">{copy.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#526d9f]">{service.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                      <div className="rounded-xl border border-[#e1eaff] bg-[#f8fbff] p-3">
                        <p className="text-[#7890bb]">Starting price</p>
                        <p className="mt-1 font-black text-[#24457f]">{formatCurrency(startingPrice, currency)}</p>
                      </div>
                      <div className="rounded-xl border border-[#e1eaff] bg-[#f8fbff] p-3">
                        <p className="text-[#7890bb]">Delivery</p>
                        <p className="mt-1 font-black text-[#24457f]">{service.deliveryTime}</p>
                      </div>
                      <div className="col-span-2 rounded-xl border border-[#e1eaff] bg-[#f8fbff] p-3">
                        <p className="text-[#7890bb]">Refill & support</p>
                        <p className="mt-1 font-black text-[#24457f]">{service.refillPolicy}</p>
                      </div>
                    </div>

                    <details className="group mt-4 rounded-2xl border border-[#dce7ff] bg-white">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-xs font-bold text-[#426097]">
                        <span className="inline-flex items-center gap-2"><Info className="h-4 w-4" /> How it works</span>
                        <span className="text-lg transition group-open:rotate-45">+</span>
                      </summary>
                      <div className="border-t border-[#e6eeff] px-4 py-3">
                        <p className="text-xs leading-6 text-[#6079a7]">{growthMethod(service)}</p>
                        <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#426097]">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {copy.outcome}
                        </p>
                      </div>
                    </details>

                    <div className="mt-auto pt-5">
                      <Link
                        href={`/dashboard/order-summary?service=${encodeURIComponent(service.code)}`}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(117,109,255,.65)] transition hover:-translate-y-0.5"
                      >
                        Start Order <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-[#526d9f]">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/85 bg-white/78 px-3 py-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Public link only</span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/85 bg-white/78 px-3 py-2"><Clock3 className="h-4 w-4 text-blue-600" /> Track from dashboard</span>
            </div>
          </motion.section>
        ) : null}
      </div>
    </main>
  );
}
