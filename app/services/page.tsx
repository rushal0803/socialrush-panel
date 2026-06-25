import type { Metadata } from "next";
import Link from "next/link";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import PageHero from "@/components/marketing/PageHero";
import PublicShell from "@/components/marketing/PublicShell";
import { agencyServices } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Social Media Growth Services",
  description:
    "Explore premium social growth services for Instagram, YouTube, Facebook, LinkedIn, TikTok, and Twitter/X with secure dashboard checkout and campaign tracking.",
};

const platforms = [
  {
    name: "Instagram",
    short: "IG",
    gradient: "from-fuchsia-500 via-pink-500 to-orange-400",
    description: "Followers, likes, and video views for creators, brands, and public profiles.",
  },
  {
    name: "YouTube",
    short: "YT",
    gradient: "from-red-500 to-rose-700",
    description: "Subscriber, like, and view campaigns for channels and public videos.",
  },
  {
    name: "Facebook",
    short: "FB",
    gradient: "from-blue-500 to-blue-800",
    description: "Page followers, post likes, and video views for public business content.",
  },
  {
    name: "LinkedIn",
    short: "IN",
    gradient: "from-sky-500 to-blue-800",
    description: "Profile followers and post likes for professional visibility.",
  },
  {
    name: "TikTok",
    short: "TT",
    gradient: "from-slate-950 via-fuchsia-700 to-cyan-500",
    description: "Follower, like, and view campaigns for public creator content.",
  },
  {
    name: "Twitter/X",
    short: "X",
    gradient: "from-slate-700 to-slate-950",
    description: "Follower growth campaigns for public profiles on X.",
  },
] as const;

const serviceSteps = [
  "Login or create your account to access protected pricing.",
  "Review the service type, destination requirements, and delivery window.",
  "Add your public profile or content link in the dashboard.",
  "Confirm budget and track the campaign from order history.",
] as const;

const trustItems = [
  "Secure dashboard checkout",
  "Wallet funding and budgeting",
  "Protected public destination flow",
  "Verified campaign tracking",
] as const;

export default function ServicesPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Premium service catalog"
        title="Social growth services organized around your goal."
        description="Browse each platform, understand the service outcome, and open your protected dashboard only when you are ready to complete checkout."
      />

      <section className="px-5 pb-14 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl sm:grid-cols-[1.3fr_0.7fr] sm:items-center sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.24em] text-slate-500">Service discovery</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                High-value growth services for campaigns that need a premium launch.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                This catalog highlights platform coverage, campaign outcomes, and delivery confidence. Exact pricing and checkout are available inside the SocialRUSH dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Link href="/packages" className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:shadow-xl">
                Start Order
              </Link>
              <Link href="/packages" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:border-blue-200">
                View Packages
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <MarketingIcon name="shield" className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl space-y-20">
          {platforms.map((platform) => {
            const services = agencyServices.filter((service) => service.platform === platform.name);
            return (
              <section key={platform.name} id={platform.name.toLowerCase().replace("/", "-")} className="scroll-mt-24">
                <div className="grid gap-6 lg:grid-cols-[.62fr_1.38fr] lg:items-end">
                  <div>
                    <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-xl ${platform.gradient}`}>
                      {platform.short}
                    </span>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-blue-600">{platform.name} growth</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{platform.name} services</h2>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600">
                    {platform.description} Each service explains the outcome, destination requirement, and support process. Pricing is finalized in the authenticated dashboard.
                  </p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {services.map((service, index) => (
                    <article key={service.slug} className="group flex flex-col overflow-hidden rounded-3xl border border-white bg-white shadow-[0_16px_40px_-26px_rgba(15,23,42,.16)] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className={`h-1.5 bg-gradient-to-r ${platform.gradient}`} />
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center justify-between">
                          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                            <MarketingIcon
                              name={service.name.includes("Views") ? "eye" : service.name.includes("Likes") ? "heart" : "users"}
                              className="h-5 w-5"
                            />
                          </span>
                          <span className={`rounded-full px-3 py-1.5 text-[9px] font-bold ${index === 0 ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                            {index === 0 ? "Popular choice" : "Tracked delivery"}
                          </span>
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-slate-900">{service.name}</h3>
                        <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{service.summary}</p>

                        <div className="mt-6 space-y-3 text-sm text-slate-600">
                          {service.deliverables.slice(0, 3).map((item) => (
                            <div key={item} className="flex gap-2">
                              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          Starting from {service.price}
                          <div className="mt-2 text-xs text-slate-500">Delivery: 1–7 days</div>
                          <div className="mt-1 text-xs text-slate-500">Refill support: available</div>
                        </div>

                        <div className="mt-6 grid gap-3">
                          <Link
                            href={`/order-summary?service=${service.slug}`}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:shadow-xl"
                          >
                            Start Order
                          </Link>
                          <Link
                            href="/packages"
                            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:border-blue-200"
                          >
                            View Packages
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.24em] text-blue-600">How it works</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Order growth services in four premium steps.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Preview service outcomes here, then use your dashboard to configure quantity, submit the exact public destination, and complete secure checkout.
              </p>
            </div>

            <div className="grid gap-3">
              {serviceSteps.map((step, index) => (
                <div key={step} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[.24em] text-slate-500">Step {index + 1}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/packages" className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:shadow-xl">
              Start Order
            </Link>
            <Link href="/faq" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:border-blue-200">
              View FAQ
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
