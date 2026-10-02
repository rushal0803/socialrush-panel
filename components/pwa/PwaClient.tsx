"use client";

import { useEffect, useState } from "react";

type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function PwaClient() {
  const [offline, setOffline] = useState(false);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const idleWindow = window as IdleWindow;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const registerServiceWorker = () => {
      if (!("serviceWorker" in navigator)) return;
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        if (registration.waiting) setUpdate(true);
        registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", () => {
          if (registration.waiting && navigator.serviceWorker.controller) setUpdate(true);
        }));
      }).catch(() => undefined);
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(registerServiceWorker, { timeout: 3000 });
    } else {
      timeoutHandle = window.setTimeout(registerServiceWorker, 1500);
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, []);

  if (!offline && !update) return null;

  return <div className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[100] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-orange-300/25 bg-[#151821]/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur" role="status"><span>{offline ? "You’re offline. Reconnect to load your latest data." : "Update available."}</span>{update && <button type="button" onClick={() => window.location.reload()} className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-black">Update</button>}</div>;
}
