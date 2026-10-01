"use client";

import { ArrowRight, BadgeIndianRupee, CheckCircle2, Compass, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import {
  recommendServices,
  serviceFinderBudgetOptions,
  serviceFinderGoalOptions,
  type ServiceFinderBudget,
  type ServiceFinderGoal,
  type ServiceFinderPlatform,
} from "@/lib/service-finder";
import { platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";

const platforms: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

type Props = {
  catalog: readonly SmmService[];
  initialPlatform?: SmmPlatformId;
  onApplyRecommendation: (service: SmmService) => void;
};

export default function SmartServiceFinder({ catalog, initialPlatform, onApplyRecommendation }: Props) {
  const [platform, setPlatform] = useState<ServiceFinderPlatform>(initialPlatform ?? "any");
  const [goal, setGoal] = useState<ServiceFinderGoal>("audience");
  const [budget, setBudget] = useState<ServiceFinderBudget>("flexible");
  const recommendations = useMemo(
    () => recommendServices(catalog, { platform, goal, budget }, 3),
    [budget, catalog, goal, platform],
  );

  return (
    <section aria-labelledby="smart-service-finder-heading" className="relative px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.7rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,159,0,.14),transparent_28rem),linear-gradient(135deg,#14110d,#0d0d10_60%)] shadow-[0_24px_70px_-44px_rgba(255,122,0,.8)]">
        <div className="grid gap-0 xl:grid-cols-[.82fr_1.18fr]">
          <div className="border-b border-white/10 p-5 sm:p-7 xl:border-b-0 xl:border-r">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Smart Service Finder
            </div>
            <h2 id="smart-service-finder-heading" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              Tell us the outcome. We’ll narrow the catalog.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#AEB5C0]">
              Recommendations come only from the active SocialRUSH service catalog. You still review the current service, quantity, price and availability before ordering.
            </p>

            <div className="mt-6 space-y-5">
              <fieldset>
                <legend className="flex items-center gap-2 text-xs font-black text-white">
                  <Compass className="h-4 w-4 text-orange-300" aria-hidden="true" />
                  1. Platform
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2 min-[520px]:grid-cols-4 xl:grid-cols-2">
                  <button type="button" aria-pressed={platform === "any"} onClick={() => setPlatform("any")} className={`min-h-11 rounded-xl border px-3 text-left text-xs font-black transition ${platform === "any" ? "border-orange-400/70 bg-orange-500/15 text-white" : "border-white/10 bg-white/[.035] text-[#C7CBD3] hover:border-white/25"}`}>
                    Any platform
                  </button>
                  {platforms.map((id) => (
                    <button key={id} type="button" aria-pressed={platform === id} onClick={() => setPlatform(id)} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left text-xs font-black transition ${platform === id ? "border-orange-400/70 bg-orange-500/15 text-white" : "border-white/10 bg-white/[.035] text-[#C7CBD3] hover:border-white/25"}`}>
                      <PlatformIcon platform={platformMeta[id].icon} className="h-4 w-4" />
                      {platformMeta[id].label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="flex items-center gap-2 text-xs font-black text-white">
                  <Target className="h-4 w-4 text-orange-300" aria-hidden="true" />
                  2. Desired result
                </legend>
                <div className="mt-3 grid gap-2">
                  {serviceFinderGoalOptions.map((option) => (
                    <button key={option.value} type="button" aria-pressed={goal === option.value} onClick={() => setGoal(option.value)} className={`min-h-12 rounded-xl border px-3 py-2 text-left transition ${goal === option.value ? "border-orange-400/70 bg-orange-500/15" : "border-white/10 bg-white/[.035] hover:border-white/25"}`}>
                      <span className="block text-xs font-black text-white">{option.label}</span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-[#8F96A3]">{option.helper}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="flex items-center gap-2 text-xs font-black text-white">
                  <BadgeIndianRupee className="h-4 w-4 text-orange-300" aria-hidden="true" />
                  3. Budget guide
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {serviceFinderBudgetOptions.map((option) => (
                    <button key={option.value} type="button" aria-pressed={budget === option.value} onClick={() => setBudget(option.value)} className={`min-h-11 rounded-xl border px-3 text-left text-xs font-black transition ${budget === option.value ? "border-orange-400/70 bg-orange-500/15 text-white" : "border-white/10 bg-white/[.035] text-[#C7CBD3] hover:border-white/25"}`}>
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-5 text-[#77808E]">
                  Budget matching uses known minimum catalog totals only. Services with protected live pricing are marked for a live price check instead of using a placeholder.
                </p>
              </fieldset>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Best matches</p>
                <h3 className="mt-2 text-xl font-black sm:text-2xl">Recommended from the active catalog</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-black text-[#C7CBD3]">
                {recommendations.length} result{recommendations.length === 1 ? "" : "s"}
              </span>
            </div>

            {recommendations.length ? (
              <div className="mt-5 grid gap-3">
                {recommendations.map((item, index) => (
                  <article key={item.service.code} className="rounded-2xl border border-white/10 bg-[#101014]/90 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-orange-200">
                        <PlatformIcon platform={platformMeta[item.service.platform].icon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[9px] font-black uppercase tracking-[.13em] text-orange-300">#{index + 1} match · {platformMeta[item.service.platform].label}</p>
                          {item.budgetStatus === "within" ? <span className="rounded-full border border-emerald-400/20 bg-emerald-500/[.08] px-2 py-0.5 text-[9px] font-black text-emerald-200">Budget fit</span> : null}
                          {item.budgetStatus === "live" ? <span className="rounded-full border border-sky-400/20 bg-sky-500/[.08] px-2 py-0.5 text-[9px] font-black text-sky-200">Live price check</span> : null}
                        </div>
                        <h4 className="mt-1 text-base font-black text-white sm:text-lg">{item.service.name}</h4>
                        <p className="mt-1 text-xs leading-5 text-[#AEB5C0]">{item.service.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[.12em] text-[#77808E]">Why it matches</p>
                        <ul className="mt-2 space-y-1.5">
                          {item.reasons.slice(0, 3).map((reason) => (
                            <li key={reason} className="flex items-start gap-2 text-[11px] leading-5 text-[#C7CBD3]">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-[11px] font-bold text-white">
                          {item.estimatedMinimumTotal === null
                            ? "Minimum total: verify live service facts before ordering"
                            : `Known minimum total: ${formatInr(item.estimatedMinimumTotal)}`}
                        </p>
                      </div>
                      <button type="button" onClick={() => onApplyRecommendation(item.service)} className="sr-motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-xs font-black text-white shadow-[0_12px_25px_-16px_rgba(255,122,0,.9)] hover:brightness-110">
                        Show in catalog <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[.025] p-7 text-center">
                <Target className="mx-auto h-6 w-6 text-orange-300" />
                <h4 className="mt-3 font-black">No confident match yet</h4>
                <p className="mt-2 text-sm text-[#AEB5C0]">Try a flexible budget or choose another platform/result. The finder will not invent a service outside the active catalog.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
