"use client";
import { useEffect, useState } from "react";
import type { ServiceHealth } from "@/lib/service-health";
export function useServiceHealth() {
  const [health, setHealth] = useState<Record<string, ServiceHealth>>({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { void fetch("/api/service-health").then((response) => response.ok ? response.json() : null).then((payload) => { if (payload?.data) setHealth(payload.data); }).catch(() => undefined).finally(() => setIsLoading(false)); }, []);
  return { health, isLoading };
}
