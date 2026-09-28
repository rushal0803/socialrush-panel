"use client";

import { useMemo, useState } from "react";
import { BarChart3, MessageCircleReply, MousePointerClick, RotateCcw, ShieldCheck } from "lucide-react";
import { calculateInstagramStoryEngagement } from "@/lib/tools/instagram-story-engagement";

const field =
  "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#747B89] focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-400/10";

const initial = { views: "", replies: "", stickerTaps: "", linkClicks: "", profileVisits: "" };
const n = (value: string) => Number(value) || 0;
const fmt = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);

export default function InstagramStoryEngagementWorkspace() {
  const [values, setValues] = useState(initial);
  const result = useMemo(
    () =>
      calculateInstagramStoryEngagement({
        views: n(values.views),
        replies: n(values.replies),
        stickerTaps: n(values.stickerTaps),
        linkClicks: n(values.linkClicks),
        profileVisits: n(values.profileVisits),
      }),
    [values],
  );

  const update = (key: keyof typeof values, value: string) =>
    setValues(current => ({ ...current, [key]: value }));

  return (
    <section className="rounded-[1.6rem] border border-fuchsia-400/25 bg-[linear-gradient(145deg,#18121d,#0b0d13)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-fuchsia-200">Instagram Story analytics</p>
          <h2 className="mt-2 text-2xl font-black text-white">Calculate Story interaction rate</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use Story views and the interactions reported in Instagram Insights. No Instagram account connection is required.
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/[.08]">
          <BarChart3 className="h-5 w-5 text-fuchsia-300" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200">
          Story views
          <input className={field} type="number" min="1" inputMode="numeric" value={values.views} onChange={e=>update("views",e.target.value)} placeholder="5000" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Replies
          <input className={field} type="number" min="0" inputMode="numeric" value={values.replies} onChange={e=>update("replies",e.target.value)} placeholder="25" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Sticker taps
          <input className={field} type="number" min="0" inputMode="numeric" value={values.stickerTaps} onChange={e=>update("stickerTaps",e.target.value)} placeholder="80" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Link clicks
          <input className={field} type="number" min="0" inputMode="numeric" value={values.linkClicks} onChange={e=>update("linkClicks",e.target.value)} placeholder="60" />
        </label>
        <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
          Profile visits
          <input className={field} type="number" min="0" inputMode="numeric" value={values.profileVisits} onChange={e=>update("profileVisits",e.target.value)} placeholder="40" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={()=>setValues({views:"5000",replies:"25",stickerTaps:"80",linkClicks:"60",profileVisits:"40"})} className="btn-secondary min-h-11 px-4 text-sm">Load example</button>
        <button type="button" onClick={()=>setValues(initial)} className="btn-secondary min-h-11 gap-2 px-4 text-sm">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="mt-7 rounded-2xl border border-fuchsia-400/20 bg-black/25 p-5">
        {result ? <>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.13em] text-fuchsia-200">
            <MousePointerClick className="h-4 w-4" /> Story engagement result
          </div>
          <p className="mt-2 text-5xl font-black tracking-tight text-white">{fmt(result.interactionRatePercent)}%</p>
          <p className="mt-2 text-sm text-slate-400">Total Story interactions divided by the Story views you entered.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Total interactions</p>
              <p className="mt-1 text-base font-black text-white">{fmt(result.totalInteractions)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Reply rate</p>
              <p className="mt-1 text-base font-black text-white">{fmt(result.replyRatePercent)}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Sticker tap rate</p>
              <p className="mt-1 text-base font-black text-white">{fmt(result.stickerTapRatePercent)}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Link click rate</p>
              <p className="mt-1 text-base font-black text-white">{fmt(result.linkClickRatePercent)}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3 sm:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Profile visit rate</p>
              <p className="mt-1 text-base font-black text-white">{fmt(result.profileVisitRatePercent)}%</p>
            </div>
          </div>
        </> : <div className="py-4 text-center">
          <ShieldCheck className="mx-auto h-6 w-6 text-emerald-300" />
          <p className="mt-3 font-black text-white">Enter Story views to calculate</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">Add only the interaction types you want to include in your Story analysis.</p>
        </div>}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        <MessageCircleReply className="mr-2 inline h-4 w-4 text-fuchsia-300" />
        <b className="text-slate-200">Formula:</b> Story interaction rate = total entered interactions ÷ Story views × 100.
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        Instagram Insights remains the source of truth. This calculator does not define a “good” Story engagement rate, forecast future Story performance, or infer interactions that you did not enter.
      </div>
    </section>
  );
}
