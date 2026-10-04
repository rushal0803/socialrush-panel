"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SmmService } from "@/lib/smm-service-catalog";

const PersonalizationShelf = dynamic(() => import("./PersonalizationShelf"), {
  ssr: false,
  loading: () => null,
});

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function DeferredPersonalizationShelf({
  catalog,
}: {
  catalog: readonly SmmService[];
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const reveal = () => setReady(true);

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(reveal, { timeout: 2200 });
    } else {
      timeoutId = window.setTimeout(reveal, 1200);
    }

    return () => {
      if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  return ready ? <PersonalizationShelf catalog={catalog} /> : null;
}
