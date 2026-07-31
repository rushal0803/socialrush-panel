"use client";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { serviceHealthLabels, serviceHealthTone, type ServiceHealth } from "@/lib/service-health";

export default function ServiceHealthBadge({ health, showMessage = false }: { health?: ServiceHealth; showMessage?: boolean }) {
  if (!health) return null;
  const Icon = health.status === "stable" ? CheckCircle2 : health.status === "paused" || health.status === "maintenance" ? AlertTriangle : Clock3;
  return <div className="min-w-0"><span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${serviceHealthTone[health.status]}`}><Icon className="h-3 w-3 shrink-0" /><span className="truncate">{serviceHealthLabels[health.status]}</span></span>{showMessage && health.message ? <p className="mt-2 break-words text-xs leading-5 text-[#D1D5DB]">{health.message}</p> : null}</div>;
}
