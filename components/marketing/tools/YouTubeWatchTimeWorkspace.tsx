"use client";

import { useMemo, useState } from "react";
import { Calculator, Clock3, RotateCcw, ShieldCheck, Target } from "lucide-react";
import { calculateYouTubeWatchTime } from "@/lib/tools/youtube-watch-time";

const field =
  "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#747B89] focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10";

const initial = {
  views: "",
  minutes: "",
  seconds: "",
  targetHours: "",
};

function n(value: string) {
  return Number(value) || 0;
}

function number(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

export default function YouTubeWatchTimeWorkspace() {
  const [values, setValues] = useState(initial);

  const averageViewDurationSeconds = n(values.minutes) * 60 + n(values.seconds);
  const result = useMemo(
    () =>
      calculateYouTubeWatchTime({
        views: n(values.views),
        averageViewDurationSeconds,
        targetWatchHours: n(values.targetHours),
      }),
    [values.views, values.targetHours, averageViewDurationSeconds],
  );

  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const loadExample = () =>
    setValues({
      views: "25000",
      minutes: "4",
      seconds: "30",
      targetHours: "4000",
    });

  return (
    <section className="rounded-[1.6rem] border border-red-400/25 bg-[linear-gradient(145deg,#151923,#0b0d13)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-red-200">YouTube analytics planning</p>
          <h2 className="mt-2 text-2xl font-black text-white">Calculate YouTube watch time</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Enter your own views and average view duration. The calculation runs in your browser and does not connect to YouTube.
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-400/25 bg-red-400/[.08]">
          <Calculator className="h-5 w-5 text-red-300" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200">
          Views
          <input className={field} type="number" min="0" inputMode="numeric" value={values.views} onChange={(e) => update("views", e.target.value)} placeholder="25000" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Target watch hours <span className="font-normal text-slate-500">(optional)</span>
          <input className={field} type="number" min="0" inputMode="decimal" value={values.targetHours} onChange={(e) => update("targetHours", e.target.value)} placeholder="Enter your own target" />
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-black text-white">Average view duration</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-200">
            Minutes
            <input className={field} type="number" min="0" inputMode="numeric" value={values.minutes} onChange={(e) => update("minutes", e.target.value)} placeholder="4" />
          </label>
          <label className="text-sm font-semibold text-slate-200">
            Seconds
            <input className={field} type="number" min="0" max="59" inputMode="numeric" value={values.seconds} onChange={(e) => update("seconds", e.target.value)} placeholder="30" />
          </label>
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={loadExample} className="btn-secondary min-h-11 px-4 text-sm">Load example</button>
        <button type="button" onClick={() => setValues(initial)} className="btn-secondary min-h-11 gap-2 px-4 text-sm">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="mt-7 rounded-2xl border border-red-400/20 bg-black/25 p-5">
        {result ? (
          <>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.13em] text-red-200">
              <Clock3 className="h-4 w-4" /> Watch-time result
            </div>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">{number(result.totalWatchHours)} hours</p>
            <p className="mt-2 text-sm text-slate-400">
              Estimated from the views and average view duration you entered. Actual YouTube Analytics remains authoritative.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
                <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Total watch minutes</p>
                <p className="mt-1 text-base font-black text-white">{number(result.totalWatchMinutes)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
                <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Average view duration</p>
                <p className="mt-1 text-base font-black text-white">{number(result.averageViewDurationMinutes)} min</p>
              </div>
              {result.progressPercent !== null ? (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Progress to your target</p>
                    <p className="mt-1 text-base font-black text-white">{number(result.progressPercent)}%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Additional views at same duration</p>
                    <p className="mt-1 text-base font-black text-white">{new Intl.NumberFormat("en-IN").format(result.additionalViewsNeeded || 0)}</p>
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-emerald-300" />
            <p className="mt-3 font-black text-white">Enter views and a positive average view duration</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              You can leave target watch hours blank if you only want to calculate total watch time.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        <b className="text-slate-200">Formula:</b> watch hours = views × average view duration in seconds ÷ 3,600.
        Use figures from the same reporting period. This tool does not determine YouTube Partner Program eligibility.
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        <Target className="mr-2 inline h-4 w-4 text-red-300" />
        YouTube Studio is the source of truth for watch time and average view duration. Use this calculator for planning and scenario checks only.
      </div>
    </section>
  );
}
