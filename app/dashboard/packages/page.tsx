import Link from "next/link";
import PremiumDashboardPackagesPage from "./premium-page";

export default function DashboardPackagesPage() {
  return (
    <div className="min-w-0 overflow-x-clip pb-8 [&>main>footer]:hidden [&>main>header]:hidden [&>main]:min-h-[calc(100vh-5rem)]">
      <section className="mx-auto w-full max-w-7xl px-4 pb-1 pt-3 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-orange-400/20 bg-[#111111] p-4 text-white shadow-lg sm:p-5">
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 max-w-2xl">
              <div className="mb-2 inline-flex items-center rounded-full border border-orange-400/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-orange-300">SocialRUSH Package Hub</div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">Premium packages, one shared price source</h1>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-400 sm:text-sm">Compare active services and package tiers using the same catalog-driven pricing experience as the public Packages page.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <Link href="/dashboard/new-order" className="rounded-xl bg-orange-500 px-3 py-2.5 text-center text-xs font-black text-black transition hover:bg-orange-400 sm:text-sm">Custom Order</Link>
              <Link href="/dashboard/add-funds" className="rounded-xl border border-white/15 bg-white/[.05] px-3 py-2.5 text-center text-xs font-bold text-white transition hover:bg-white/10 sm:text-sm">Add Funds</Link>
              <Link href="/dashboard/order-history" className="rounded-xl border border-white/15 px-3 py-2.5 text-center text-xs font-bold text-zinc-300 transition hover:bg-white/10 sm:text-sm">My Orders</Link>
            </div>
          </div>
        </div>
      </section>
      <PremiumDashboardPackagesPage />
    </div>
  );
}
