"use client";

import { Eye, Pause, Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function InstagramViewsInteractivePreview() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(18);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setProgress(value => value >= 100 ? 0 : value + 1), 90);
    return () => window.clearInterval(timer);
  }, [playing]);
  const bars = [36, 54, 42, 70, 57, 84, 66, 96];
  return <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2.25rem] border border-orange-400/25 bg-[radial-gradient(circle_at_75%_14%,rgba(255,176,0,.3),transparent_20%),linear-gradient(145deg,#1e1812,#101113_63%,#08090b)] p-5 shadow-[0_30px_80px_-36px_rgba(255,122,0,.75)]">
    <div className="absolute -right-12 top-24 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
    <div className="relative flex justify-between text-[10px] font-black uppercase tracking-[.15em] text-white/80"><span>Interactive preview</span><Sparkles className="h-4 w-4 text-orange-300" /></div>
    <div className="absolute left-5 right-5 top-12 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300 transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
    <div className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2"><button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? "Pause interactive Reel performance preview" : "Play interactive Reel performance preview"} aria-pressed={playing} className="grid h-20 w-20 place-items-center rounded-full border border-orange-200/50 bg-black/35 text-white shadow-[0_0_42px_rgba(255,153,0,.35)] backdrop-blur transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300">{playing ? <Pause className="h-8 w-8 fill-white" /> : <Play className="ml-1 h-9 w-9 fill-white" />}</button><p className="mt-3 whitespace-nowrap text-center text-[10px] font-black uppercase tracking-[.14em] text-orange-100">{playing ? "Pause preview" : "Play preview"}</p></div>
    <div className="absolute left-5 top-20 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-[10px] text-white/70 backdrop-blur"><Eye className="mr-1 inline h-3.5 w-3.5 text-orange-300" />View activity</div>
    <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-widest text-white/60">Performance interface</p><p className="mt-1 text-xl font-black text-white">Reel preview</p></div><span className={`inline-flex items-center gap-1.5 text-xs font-bold ${playing ? "text-amber-200" : "text-white/60"}`}><i className={`h-2 w-2 rounded-full bg-orange-300 ${playing ? "animate-pulse" : ""}`} />{playing ? "Active" : "Paused"}</span></div><div className="mt-4 flex h-10 items-end gap-1.5">{bars.map((height, index) => <i key={index} className="flex-1 rounded-t bg-gradient-to-t from-orange-600 to-amber-300 transition-transform duration-500" style={{ height: `${height}%`, transform: playing ? `scaleY(${.7 + ((progress + index * 11) % 30) / 100})` : "scaleY(.68)", transformOrigin: "bottom" }} />)}</div></div>
  </div>;
}
