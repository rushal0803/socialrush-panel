"use client";

import Link from "next/link";
import PlatformIcon from "@/components/PlatformIcon";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { agencyServices } from "@/lib/marketing/content";

const platforms = [
  {
    name: "Instagram",
    iconClass: "text-orange-600",
    iconBackground: "from-orange-100 via-orange-50 to-white",
    accent: "from-[#FF7A00] to-[#FFB000]",
  },
  {
    name: "YouTube",
    iconClass: "text-red-600",
    iconBackground: "from-red-100 via-red-50 to-white",
    accent: "from-red-500 to-red-500",
  },
  {
    name: "Facebook",
    iconClass: "text-orange-600",
    iconBackground: "from-orange-100 via-amber-50 to-white",
    accent: "from-orange-500 to-amber-500",
  },
  {
    name: "LinkedIn",
    iconClass: "text-orange-700",
    iconBackground: "from-orange-100 via-amber-50 to-white",
    accent: "from-orange-500 to-amber-500",
  },
  {
    name: "TikTok",
    iconClass: "text-slate-950",
    iconBackground: "from-amber-100 via-orange-50 to-white",
    accent: "from-slate-800 via-amber-500 to-orange-500",
  },
  {
    name: "Twitter/X",
    iconClass: "text-slate-950",
    iconBackground: "from-slate-200 via-slate-50 to-white",
    accent: "from-slate-700 to-slate-950",
  },
  {
    name: "Telegram",
    iconClass: "text-orange-500",
    iconBackground: "from-orange-100 via-amber-50 to-white",
    accent: "from-orange-500 to-amber-500",
  },
] as const;

function normalizePlatform(value: string) {
  const key = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (key === "x" || key.includes("twitter")) return "x";
  if (key.includes("instagram")) return "instagram";
  if (key.includes("youtube")) return "youtube";
  if (key.includes("facebook")) return "facebook";
  if (key.includes("linkedin")) return "linkedin";
  if (key.includes("telegram")) return "telegram";
  if (key.includes("tiktok")) return "tiktok";
  return key;
}

export default function PricingGrid() {
  const { currency } = usePreferredCurrency("INR");

  return (
    <>
      <div className="mt-7 flex flex-col gap-2 rounded-2xl border border-orange-400/35 bg-[#111111] px-4 py-3 text-xs text-[#D1D5DB] shadow-[0_16px_35px_-28px_rgba(255,122,0,.55)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <p>
          Public starting rates help with planning. Your dashboard remains the
          source of truth for availability and final checkout totals.
        </p>
        <p className="shrink-0 font-bold text-[#FF9F00]">{getCurrencyDisclaimer()}</p>
      </div>

      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        {platforms.map((platform) => {
          const platformKey = normalizePlatform(platform.name);
          const services = agencyServices.filter(
            (service) => normalizePlatform(service.platform) === platformKey,
          );

          return (
            <article
              key={platform.name}
              className="group relative overflow-hidden rounded-[30px] border border-orange-400/35 bg-[#111111] shadow-[0_26px_60px_-38px_rgba(255,122,0,.55)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-orange-400/60 hover:shadow-[0_34px_70px_-38px_rgba(255,122,0,.75)]"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${platform.accent}`} />
              <div className="flex items-center justify-between gap-4 border-b border-orange-400/20 px-5 py-5 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_12px_24px_-18px_rgba(255,122,0,.75)]"
                  >
                    <PlatformIcon
                      platform={platform.name}
                      className="h-6 w-6 text-white"
                    />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-white">
                      {platform.name}
                    </h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#9CA3AF]">
                      {services.length > 0
                        ? `${services.length} live ${services.length === 1 ? "service" : "services"}`
                        : "Latest pricing available"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/services#${platform.name.toLowerCase().replace("/", "-")}`}
                  className="shrink-0 rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-[10px] font-extrabold text-[#FF9F00] shadow-sm transition hover:border-orange-400/60 hover:bg-orange-500/15"
                >
                  View details
                </Link>
              </div>

              <div className="divide-y divide-white/10 px-2 pb-2">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div
                      key={service.slug}
                      className="flex flex-col gap-3 rounded-2xl px-4 py-4 transition hover:bg-white/[.06] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-extrabold text-white">
                            {service.name}
                          </h4>
                          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[.1em] text-emerald-700">
                            Live rate
                          </span>
                        </div>
                        <p className="mt-1.5 text-[10px] leading-5 text-[#D1D5DB]">
                          Tracked order · Exact total reviewed before checkout
                        </p>
                      </div>
                      <div className="flex shrink-0 items-baseline gap-1 self-start rounded-xl border border-orange-400/25 bg-[#151515] px-3 py-2 shadow-sm sm:self-auto">
                        <span className="text-base font-black text-[#FF9F00]">
                          {formatCurrency(service.pricePer1000INR, currency)}
                        </span>
                        <span className="text-[9px] font-bold uppercase text-[#D1D5DB]">
                          / 1K
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="m-3 rounded-2xl border border-orange-400/35 bg-[#151515] p-5 text-center">
                    <p className="text-sm font-black text-white">
                      Live prices available on packages page
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#D1D5DB]">
                      View the latest confirmed options for {platform.name}.
                    </p>
                    <Link
                      href={`/packages?platform=${platformKey}`}
                      className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2.5 text-xs font-black text-white shadow-[0_14px_28px_-16px_rgba(255, 196, 0, .65)]"
                    >
                      View Packages
                    </Link>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
