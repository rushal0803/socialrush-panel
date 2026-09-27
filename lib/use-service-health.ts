"use client";
import { useEffect, useState } from "react";
import type { ServiceHealth } from "@/lib/service-health";
export function useServiceHealth(enabled = true) {
  const [health, setHealth] = useState<Record<string, ServiceHealth>>({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { if (!enabled) { setIsLoading(false); return; } setIsLoading(true); void fetch("/api/service-health").then((response) => response.ok ? response.json() : null).then((payload) => { if (payload?.data) setHealth(payload.data); }).catch(() => undefined).finally(() => setIsLoading(false)); }, [enabled]);
  return { health, isLoading };
}
