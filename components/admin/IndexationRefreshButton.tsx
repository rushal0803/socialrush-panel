"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";

export default function IndexationRefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button
    type="button"
    onClick={() => startTransition(() => router.refresh())}
    disabled={pending}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-400/35 bg-orange-500/10 px-4 text-xs font-bold text-orange-100 transition hover:bg-orange-500/15 disabled:opacity-60"
  >
    <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
    {pending ? "Refreshing…" : "Refresh live checks"}
  </button>;
}
