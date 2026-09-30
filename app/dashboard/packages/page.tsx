import Link from "next/link";
import PremiumDashboardPackagesPage from "./premium-page";

export default function DashboardPackagesPage() {
  return (
    <div className="min-w-0 overflow-x-clip pb-8 [&>main>footer]:hidden [&>main>header]:hidden [&>main]:min-h-[calc(100vh-5rem)]">
      <section className="mx-auto w-full max-w-7xl px-4 pb-2 pt-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-xl sm:p-7">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-100">SocialRUSH Package Hub</div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Premium packages, one shared price source</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Compare active services and package tiers using the same catalog-driven pricing experience as the public Packages page.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
              <Link href="/dashboard/new-order" className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:bg-slate-100">Custom Order</Link>
              <Link href="/dashboard/add-funds" className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-white/15">Add Funds</Link>
              <Link href="/dashboard/order-history" className="col-span-2 rounded-xl border border-white/20 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:col-auto">My Orders</Link>
            </div>
          </div>
        </div>
      </section>
      <PremiumDashboardPackagesPage />
    </div>
  );
}
