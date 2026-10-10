import Link from "next/link";
import MarketingIcon, { type MarketingIconName } from "@/components/marketing/MarketingIcon";
import PortalCTA from "@/components/marketing/PortalCTA";
import PublicShell from "@/components/marketing/PublicShell";
import SupportJourney from "@/components/support/SupportJourney";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "SocialRUSH Help Centre & Customer Support",
  description: "Find guidance for SocialRUSH orders, payments, refill requests, account access and customer support.",
  path: "/support",
});

const topics: Array<{ icon: MarketingIconName; title: string; text: string; href: string }> = [
  { icon: "dashboard", title: "Orders & tracking", text: "Understand order stages and where to check campaign progress.", href: "/faq#delivery" },
  { icon: "wallet", title: "Payments & wallet", text: "Get clear answers about funding, checkout and order totals.", href: "/faq#payments" },
  { icon: "refresh", title: "Refill guidance", text: "Review eligibility and the information needed for a support request.", href: "/refund-policy" },
  { icon: "shield", title: "Account safety", text: "Learn why SocialRUSH uses public links and never requests passwords.", href: "/trust" },
  { icon: "search", title: "Choosing a service", text: "Compare platforms, service details, delivery estimates and prices.", href: "/services" },
  { icon: "message", title: "Contact support", text: "Reach out when you need help before or after an order.", href: "/contact" },
];

export default function SupportPage() {
  return (
    <PublicShell>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Support", path: "/support" }]} />
      <section className="relative overflow-hidden px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_at_top,rgba(255,118,0,.10),transparent_67%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/[.09] px-4 py-2 text-[10px] font-black uppercase tracking-[.16em] text-orange-200"><MarketingIcon name="message" className="h-4 w-4" />SocialRUSH help centre</span>
          <h1 className="mt-5 text-4xl font-black tracking-[-.05em] text-white sm:text-5xl">Clear help, whenever you need it.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#A8AFBD]">Find the right guidance for your order, account, payment or service question—then contact our team with the context they need to help.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 min-[400px]:flex-row"><Link href="/faq" className="btn-secondary">Browse FAQs</Link><PortalCTA className="btn-primary">Start an order</PortalCTA></div>
        </div>
      </section>

      <SupportJourney variant="public" />

      <section className="border-y border-white/[.07] bg-[#0C0E14] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Find your answer</p><h2 className="mt-3 text-3xl font-black text-white">Support built around the customer journey.</h2></div>
          <div className="mt-8 grid gap-3 lg:grid-cols-2">{topics.map((topic, index) => <Link key={topic.title} href={topic.href} className="group flex min-w-0 items-start gap-4 rounded-2xl border border-white/10 bg-[#101219] p-5 transition-colors hover:border-orange-400/45 hover:bg-[#151821] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7600] sm:p-6"><span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/[.08] text-orange-300"><MarketingIcon name={topic.icon} className="h-5 w-5" /></span><div className="min-w-0 flex-1"><span className="text-xs font-bold tracking-[.12em] text-[#FF9A2E]">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-1 text-lg font-bold text-white">{topic.title}</h3><p className="mt-2 text-sm leading-7 text-[#C4CBD5]">{topic.text}</p><span className="mt-3 inline-flex min-h-9 items-center text-sm font-bold text-[#FF9A2E]">Explore help →</span></div></Link>)}</div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.15fr_.85fr]"><article className="rounded-3xl border border-orange-400/25 bg-[radial-gradient(circle_at_top_right,rgba(255,118,0,.18),transparent_48%),#101219] p-6 sm:p-8"><MarketingIcon name="shield" className="h-7 w-7 text-orange-300" /><h2 className="mt-5 text-2xl font-black text-white">Keep your account safe.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#A8AFBD]">We only need the public destination relevant to your service. Never share a password, OTP or recovery code with anyone.</p><Link href="/trust" className="mt-6 inline-flex min-h-11 items-center font-bold text-orange-300">Read customer safety guidance →</Link></article><article className="rounded-3xl border border-white/[.09] bg-[#101219] p-6 sm:p-8"><MarketingIcon name="message" className="h-7 w-7 text-emerald-300" /><h2 className="mt-5 text-2xl font-black text-white">Need personal help?</h2><p className="mt-3 text-sm leading-7 text-[#A8AFBD]">For an existing order, include your order ID so our team can review the correct details quickly.</p><Link href="/dashboard/support" className="btn-primary mt-6">Open dashboard support</Link></article></div></section>
    </PublicShell>
  );
}
