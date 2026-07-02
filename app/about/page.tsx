import Link from "next/link";
import MarketingIcon, { type MarketingIconName } from "@/components/marketing/MarketingIcon";
import PortalCTA from "@/components/marketing/PortalCTA";
import PublicShell from "@/components/marketing/PublicShell";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "About Our Social Media Growth Platform",
  description:
    "Learn how SocialRUSH helps creators, businesses and agencies in India order and track social media growth services through one secure campaign dashboard.",
  path: "/about",
  keywords: ["SocialRUSH India", "social media growth platform India"],
});

const differences: Array<{ icon: MarketingIconName; title: string; description: string }> = [
  { icon: "search", title: "Clear service discovery", description: "Compare supported platforms, campaign types, quantities and current pricing before you order." },
  { icon: "wallet", title: "Connected wallet experience", description: "Fund your account securely and keep campaign spending and wallet activity organized." },
  { icon: "trend", title: "Visible campaign progress", description: "Track order status and keep every campaign record available from one dashboard." },
  { icon: "refresh", title: "Refill clarity", description: "Eligible refill coverage and service requirements are shown before checkout." },
  { icon: "message", title: "Support with context", description: "Account support keeps the campaign and customer conversation connected." },
  { icon: "shield", title: "Public-link ordering", description: "Place campaigns with public destinations—SocialRUSH never needs your social password." },
];

const audiences: Array<{ icon: MarketingIconName; title: string; description: string }> = [
  { icon: "sparkles", title: "Creators", description: "Organize profile and content campaigns around your publishing calendar." },
  { icon: "heart", title: "Influencers", description: "Support visible social proof while keeping campaign details easy to review." },
  { icon: "dashboard", title: "Brands", description: "Manage multiple platform goals from one professional workspace." },
  { icon: "users", title: "Agencies", description: "Keep client destinations, orders and support records clearly separated." },
  { icon: "trend", title: "Resellers", description: "Use a repeatable workflow for selecting, ordering and tracking client campaigns." },
];

const trustCards: Array<{ icon: MarketingIconName; title: string; description: string; tone: string }> = [
  { icon: "shield", title: "Secure checkout", description: "Review campaign details before any wallet charge is confirmed.", tone: "from-emerald-400 to-amber-500" },
  { icon: "wallet", title: "Wallet system", description: "Keep verified funding and campaign charges visible in your account.", tone: "from-orange-500 to-amber-500" },
  { icon: "dashboard", title: "Order tracking", description: "Monitor active and completed campaigns from your dashboard.", tone: "from-amber-500 to-orange-500" },
  { icon: "refresh", title: "Refill support", description: "Eligible service coverage is presented with the campaign details.", tone: "from-amber-400 to-orange-500" },
  { icon: "message", title: "WhatsApp support", description: "Get practical help when you need guidance choosing a service.", tone: "from-emerald-500 to-green-600" },
];

export default function AboutPage() {
  return (
    <PublicShell tone="light3d">
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#111827] shadow-sm backdrop-blur-xl">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-amber-400 text-white">
                <MarketingIcon name="sparkles" className="h-4 w-4" />
              </span>
              About SocialRUSH
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.045em] text-[#0B0B0F] sm:text-5xl lg:text-6xl">
              Social growth should feel{" "}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                clear, secure and manageable.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#111827] sm:text-lg">
              SocialRUSH gives creators, influencers, brands, agencies and resellers one professional place to discover services, fund campaigns, place orders and track progress.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="/packages" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white bg-white/85 px-6 py-3 text-sm font-black text-[#0B0B0F] shadow-[0_14px_30px_-20px_rgba(255, 159, 0, .5)] transition hover:-translate-y-0.5 hover:border-orange-200">
                View Packages
              </Link>
              <PortalCTA className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-black text-white shadow-[0_18px_34px_-16px_rgba(255, 196, 0, .75)] transition hover:-translate-y-0.5">
                Start Order <MarketingIcon name="arrow" className="h-4 w-4" />
              </PortalCTA>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Public link only", "Transparent checkout", "Dashboard tracking", "Customer support"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[#FFF8F1] bg-white/70 px-3 py-2 text-[11px] font-bold text-[#111827] shadow-sm">
                  <MarketingIcon name="check" className="h-3.5 w-3.5 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -left-5 top-14 z-10 hidden rounded-2xl border border-white/90 bg-white/80 p-3 shadow-[0_20px_45px_-24px_rgba(255, 159, 0, .55)] backdrop-blur-xl sm:block">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#111827]">Campaign status</p>
              <p className="mt-1 flex items-center gap-2 text-xs font-black text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Tracking active</p>
            </div>
            <div className="absolute -right-3 bottom-12 z-10 hidden rounded-2xl border border-white/90 bg-white/80 p-3 shadow-[0_20px_45px_-24px_rgba(255, 159, 0, .55)] backdrop-blur-xl sm:block">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#111827]">Account safety</p>
              <p className="mt-1 flex items-center gap-2 text-xs font-black text-[#0B0B0F]"><MarketingIcon name="lock" className="h-4 w-4 text-orange-600" />No password required</p>
            </div>

            <div className="rotate-[1deg] rounded-[2rem] border border-white/90 bg-white/72 p-4 shadow-[0_35px_80px_-38px_rgba(255, 159, 0, .6)] backdrop-blur-2xl sm:p-6">
              <div className="rounded-[1.6rem] bg-[linear-gradient(145deg,#0B0B0F,#FF9F00_55%,#FF9F00)] p-5 text-white shadow-inner sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-amber-200"><MarketingIcon name="dashboard" className="h-6 w-6" /></span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-amber-200">SocialRUSH workspace</p>
                      <h2 className="mt-1 text-lg font-black">Campaign command centre</h2>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[9px] font-black text-emerald-200">Operational</span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2.5">
                  {[["wallet", "Wallet"], ["trend", "Orders"], ["message", "Support"]].map(([icon, label]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-3">
                      <MarketingIcon name={icon as MarketingIconName} className="h-5 w-5 text-amber-200" />
                      <p className="mt-3 text-xs font-black">{label}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-orange-400 to-amber-300" /></div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="text-[9px] uppercase tracking-[0.12em] text-orange-200">Campaign workflow</p><p className="mt-1 text-sm font-black">Everything connected</p></div>
                    <MarketingIcon name="sparkles" className="h-5 w-5 text-orange-300" />
                  </div>
                  <div className="mt-4 grid gap-2">
                    {["Choose a service", "Confirm campaign details", "Track progress"].map((item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-xl bg-black/10 px-3 py-2.5 text-xs font-bold text-orange-50">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[9px] text-amber-200">0{index + 1}</span>
                        {item}
                        <MarketingIcon name="check" className="ml-auto h-3.5 w-3.5 text-emerald-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/55 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/90 bg-white/80 p-6 shadow-[0_25px_60px_-38px_rgba(255, 159, 0, .55)] backdrop-blur-xl sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"><MarketingIcon name="rocket" className="h-6 w-6" /></span>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-[#111827]">Our mission</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">Make campaign management simpler and more transparent.</h2>
            <p className="mt-5 text-sm leading-7 text-[#111827]">Our mission is to give every customer a reliable workflow for reviewing services, understanding costs and managing campaign activity without scattered messages or unclear records.</p>
          </article>
          <article className="rounded-[2rem] border border-white/90 bg-[linear-gradient(145deg,#0B0B0F,#111827_55%,#0B0B0F)] p-6 text-white shadow-[0_30px_70px_-38px_rgba(255, 159, 0, .75)] sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-amber-200"><MarketingIcon name="sparkles" className="h-6 w-6" /></span>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">Why SocialRUSH exists</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Customers deserve clarity before they confirm a campaign.</h2>
            <p className="mt-5 text-sm leading-7 text-orange-100/75">Rates, quantities, delivery guidance, public destinations, wallet charges and refill terms should be visible before checkout—not buried across conversations and disconnected receipts.</p>
          </article>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">The SocialRUSH difference</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F] sm:text-4xl">A professional workspace, not a confusing order form.</h2>
            <p className="mt-4 text-sm leading-7 text-[#111827]">The platform connects discovery, checkout, tracking and support into one consistent customer experience.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {differences.map((item) => (
              <article key={item.title} className="group rounded-[1.65rem] border border-white/90 bg-white/75 p-5 shadow-[0_20px_48px_-34px_rgba(255, 159, 0, .55)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_28px_58px_-34px_rgba(255, 159, 0, .65)] sm:p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 text-orange-600 transition group-hover:scale-105"><MarketingIcon name={item.icon} className="h-5 w-5" /></span>
                <h3 className="mt-5 text-base font-black text-[#0B0B0F]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#111827]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/55 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Who we help</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F] sm:text-4xl">Built for individual creators and growing teams.</h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {audiences.map((item, index) => (
              <article key={item.title} className="relative overflow-hidden rounded-[1.6rem] border border-white/90 bg-white/80 p-5 shadow-[0_20px_46px_-34px_rgba(255, 159, 0, .5)]">
                <span className="absolute right-4 top-3 text-4xl font-black text-orange-50">0{index + 1}</span>
                <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-100 text-amber-600"><MarketingIcon name={item.icon} className="h-5 w-5" /></span>
                <h3 className="relative mt-5 text-base font-black text-[#0B0B0F]">{item.title}</h3>
                <p className="relative mt-2 text-xs leading-6 text-[#111827]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Trust built into the workflow</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F] sm:text-4xl">The essentials stay visible at every step.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trustCards.map((item) => (
              <article key={item.title} className="rounded-[1.6rem] border border-white/90 bg-white/78 p-5 text-center shadow-[0_22px_50px_-34px_rgba(255, 159, 0, .55)] backdrop-blur-xl">
                <span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}><MarketingIcon name={item.icon} className="h-6 w-6" /></span>
                <h3 className="mt-5 text-sm font-black text-[#0B0B0F]">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#111827]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0B0B0F] via-[#FF9F00] to-[#FF9F00] p-7 text-center text-white shadow-[0_35px_80px_-38px_rgba(255, 159, 0, .8)] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -left-12 -top-16 h-52 w-52 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">Start with confidence</p>
            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Choose a campaign that fits your next growth goal.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-orange-50/75">Compare packages, review the current details and continue through the same secure SocialRUSH workflow.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 min-[420px]:flex-row">
              <Link href="/packages" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-black text-[#0B0B0F] transition hover:-translate-y-0.5">View Packages</Link>
              <PortalCTA className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15">
                Start Order <MarketingIcon name="arrow" className="h-4 w-4" />
              </PortalCTA>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
