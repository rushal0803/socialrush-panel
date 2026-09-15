import Link from "next/link";
import { BadgeHelp, CircleDollarSign, ListChecks, ShieldCheck, TicketCheck } from "lucide-react";

const helpPaths = [
  {
    title: "Quick answers",
    copy: "Search common questions about services, pricing, delivery, refill support and payments.",
    href: "/faq",
    action: "Browse FAQs",
    icon: BadgeHelp,
  },
  {
    title: "Track an order",
    copy: "Check the latest recorded delivery stage, progress, refill state and order details.",
    href: "/dashboard/orders",
    action: "View orders",
    icon: ListChecks,
  },
  {
    title: "Payment or wallet",
    copy: "Review wallet activity, payment status and the current funding flow before paying again.",
    href: "/dashboard/wallet",
    action: "Open wallet",
    icon: CircleDollarSign,
  },
  {
    title: "Account & payment safety",
    copy: "Use official SocialRUSH channels and never share passwords, OTPs, UPI PINs or recovery codes.",
    href: "/trust",
    action: "Open Trust Center",
    icon: ShieldCheck,
  },
] as const;

export default function SupportJourney({ variant = "public" }: { variant?: "public" | "dashboard" }) {
  const dashboard = variant === "dashboard";

  return (
    <section
      aria-labelledby={`support-journey-${variant}`}
      className={dashboard ? "px-4 pt-5 sm:px-6 lg:px-8" : "border-y border-white/[.07] bg-[#090b11] px-4 py-12 sm:px-6 lg:px-8 lg:py-16"}
    >
      <div className={`mx-auto ${dashboard ? "max-w-[1550px]" : "max-w-7xl"}`}>
        <div className="overflow-hidden rounded-[1.75rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,.14),transparent_36%),#101219] p-5 shadow-[0_24px_60px_-40px_rgba(255,122,0,.6)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Help Center</p>
              <h2 id={`support-journey-${variant}`} className="mt-2 text-2xl font-black tracking-[-.03em] text-white sm:text-3xl">
                {dashboard ? "Choose the fastest support path first." : "Start with the right support path."}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#A8AFBD]">
                {dashboard
                  ? "Check the relevant account area first. If you still need help, create a tracked ticket below and include the related order or payment reference when available."
                  : "Use self-service guidance for common questions, then open a tracked support ticket when your issue needs account-specific review."}
              </p>
            </div>
            <Link
              href="/dashboard/support"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7200] to-[#FFAA00] px-5 text-sm font-black text-white shadow-[0_14px_30px_-20px_rgba(255,122,0,.8)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
            >
              <TicketCheck className="h-4 w-4" />
              {dashboard ? "Support tickets" : "Open dashboard support"}
            </Link>
          </div>

          <nav aria-label="Support help paths" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {helpPaths.map(({ title, copy, href, action, icon: Icon }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-white/[.08] bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-orange-400/35 hover:bg-orange-500/[.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-black text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">{copy}</p>
                <span className="mt-4 inline-flex text-xs font-black text-orange-300 transition group-hover:translate-x-0.5">{action} →</span>
              </Link>
            ))}
          </nav>

          <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[.06] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <p className="text-xs leading-6 text-emerald-50/80">
              <strong className="text-emerald-100">Support safety:</strong> SocialRUSH may need an order ID, public destination link or payment reference to review an issue. Never send a social-media password, OTP, UPI PIN, CVV or recovery code.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
