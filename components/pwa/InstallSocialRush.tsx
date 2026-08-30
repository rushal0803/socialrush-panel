"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const dismissedKey = "socialrush-install-dismissed";
export default function InstallSocialRush() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null); const [ios, setIos] = useState(false); const [open, setOpen] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIos(Boolean(isIos && !standalone));
    const listener = (event: Event) => { event.preventDefault(); if (!localStorage.getItem(dismissedKey)) setDeferred(event as InstallEvent); };
    window.addEventListener("beforeinstallprompt", listener); return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);
  const dismiss = () => { localStorage.setItem(dismissedKey, String(Date.now())); setOpen(false); setDeferred(null); };
  if (!deferred && !ios) return null;
  return <><button type="button" onClick={async () => { if (deferred) { await deferred.prompt(); const choice = await deferred.userChoice; if (choice.outcome !== "accepted") dismiss(); } else setOpen(true); }} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 text-sm font-bold text-orange-100"><Download className="h-4 w-4" />Install SocialRUSH</button>{open && <div className="fixed inset-0 z-[110] grid place-items-end bg-black/60 p-4 sm:place-items-center" role="dialog" aria-modal="true"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#151821] p-6 text-white"><Share className="h-6 w-6 text-orange-300"/><h2 className="mt-4 text-xl font-black">Get the SocialRUSH App</h2><p className="mt-3 text-sm text-slate-300">In Safari, tap Share, then choose <strong>Add to Home Screen</strong>.</p><button type="button" onClick={dismiss} className="mt-6 min-h-11 w-full rounded-xl bg-orange-500 text-sm font-black">Got it</button></div></div>}</>;
}
