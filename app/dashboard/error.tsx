"use client";
import Link from "next/link";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <section className="dashboard-card p-6 sm:p-8" role="alert">
      <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">Workspace unavailable</p>
      <h1 className="mt-3 text-2xl font-semibold text-white">This page could not be loaded</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">Try loading this page again. If you were making a payment, check its status in Wallet before paying again.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-dashboard-primary px-5">Try again</button>
        <Link href="/dashboard/wallet" className="btn-dashboard-secondary inline-flex items-center px-5">Check Wallet</Link>
        <Link href="/dashboard/support" className="inline-flex min-h-11 items-center px-3 text-sm text-orange-200">Contact support</Link>
      </div>
    </section>
  </main>;
}
