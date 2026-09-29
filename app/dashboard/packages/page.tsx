import Link from "next/link";
import PackagesPageContent from "@/components/marketing/packages/PackagesPageContent";

type DashboardPackagesPageProps = {
  searchParams?: Promise<{
    platform?: string;
    service?: string;
    package?: string;
    packageId?: string;
  }>;
};

export default async function DashboardPackagesPage({ searchParams: searchParamsPromise }: DashboardPackagesPageProps) {
  const searchParams = searchParamsPromise ? await searchParamsPromise : undefined;

  return (
    <div className="min-w-0 overflow-x-clip pb-8 [&>main>footer]:hidden [&>main>header]:hidden [&>main]:min-h-[calc(100vh-5rem)]">
      <section className="mx-auto w-full max-w-7xl px-4 pb-2 pt-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-xl sm:p-7">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-100">
                SocialRUSH Package Hub
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Choose a growth package that fits your goal</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Compare platform packages, switch services instantly and place your order from one premium dashboard experience.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
              <Link href="/dashboard/new-order" className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100">
                Custom Order
              </Link>
              <Link href="/dashboard/add-funds" className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-white/15">
                Add Funds
              </Link>
              <Link href="/dashboard/orders" className="col-span-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:col-auto">
                My Orders
              </Link>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center sm:max-w-xl sm:text-left">
            <div><div className="text-lg font-black">7</div><div className="text-[11px] text-slate-400 sm:text-xs">Platforms</div></div>
            <div><div className="text-lg font-black">Live</div><div className="text-[11px] text-slate-400 sm:text-xs">Service pricing</div></div>
            <div><div className="text-lg font-black">Fast</div><div className="text-[11px] text-slate-400 sm:text-xs">Order flow</div></div>
          </div>
        </div>
      </section>

      <PackagesPageContent
        initialPlatformParam={searchParams?.platform}
        initialServiceParam={searchParams?.service}
        initialPackageIdParam={searchParams?.package ?? searchParams?.packageId}
      />
    </div>
  );
}
