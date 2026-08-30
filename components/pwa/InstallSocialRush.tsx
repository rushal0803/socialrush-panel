"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const dismissedKey = "socialrush-install-dismissed";
const dismissalLifetime = 7 * 24 * 60 * 60 * 1000;
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

export default function InstallSocialRush() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const refreshInstalled = () => setInstalled(isStandalone());
    const onBeforeInstall = (event: Event) => { event.preventDefault(); setDeferred(event as InstallEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); setOpen(false); localStorage.removeItem(dismissedKey); };
    const stored = Number(localStorage.getItem(dismissedKey));
    if (!Number.isFinite(stored) || Date.now() - stored > dismissalLifetime) localStorage.removeItem(dismissedKey);
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window));
    refreshInstalled(); window.addEventListener("beforeinstallprompt", onBeforeInstall); window.addEventListener("appinstalled", onInstalled); media.addEventListener("change", refreshInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onBeforeInstall); window.removeEventListener("appinstalled", onInstalled); media.removeEventListener("change", refreshInstalled); };
  }, []);
  const closeHelp = () => { localStorage.setItem(dismissedKey, String(Date.now())); setOpen(false); };
  const install = async () => { if (deferred) { await deferred.prompt(); const choice = await deferred.userChoice; if (choice.outcome === "dismissed") localStorage.setItem(dismissedKey, String(Date.now())); return; } setOpen(true); };
  if (installed) return null;
  const instruction = ios ? <>In Safari, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.</> : <>Open your browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</>;
  return <><button type="button" onClick={() => void install()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 text-sm font-bold text-orange-100"><Download className="h-4 w-4" />Install SocialRUSH</button>{open && <div className="fixed inset-0 z-[110] grid place-items-end bg-black/60 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="install-socialrush-title"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#151821] p-6 text-white"><Share className="h-6 w-6 text-orange-300"/><h2 id="install-socialrush-title" className="mt-4 text-xl font-black">Get the SocialRUSH App</h2><p className="mt-3 text-sm text-slate-300">{instruction}</p><button type="button" onClick={closeHelp} className="mt-6 min-h-11 w-full rounded-xl bg-orange-500 text-sm font-black">Got it</button></div></div>}</>;
}
