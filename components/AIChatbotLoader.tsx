"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), {
  ssr: false,
});

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function AIChatbotLoader() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const allowed = pathname === "/" || pathname.startsWith("/dashboard");

  useEffect(() => {
    if (!allowed) {
      setReady(false);
      return;
    }

    const idleWindow = window as IdleWindow;
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(() => setReady(true), { timeout: 1800 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(timer);
  }, [allowed]);

  return allowed && ready ? <AIChatbot /> : null;
}
