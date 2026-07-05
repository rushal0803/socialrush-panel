import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  ClipboardCheck,
  Link2,
  LockKeyhole,
  UserPlus,
  WalletCards,
} from "lucide-react";

const defaultSteps = [
  {
    title: "Create Your Account",
    text: "Sign up or log in to your SocialRUSH account.",
    icon: UserPlus,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Choose Your Service",
    text: "Select Instagram, YouTube, LinkedIn, Facebook, Twitter/X, Telegram, or another service.",
    icon: BadgeCheck,
    gradient: "from-amber-500 to-amber-600",
  },
  {
    title: "Submit Your Public Link",
    text: "Paste your profile, post, video, channel, or page link. No password is required.",
    icon: Link2,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Add Funds or Pay Securely",
    text: "Add funds to your wallet or complete payment using available payment options.",
    icon: WalletCards,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    title: "Place Your Order",
    text: "Review your order summary and confirm your order.",
    icon: ClipboardCheck,
    gradient: "from-[#FF7A00] to-[#FFB000]",
  },
  {
    title: "Track Your Order",
    text: "Track order status and progress from your dashboard.",
    icon: Activity,
    gradient: "from-emerald-500 to-teal-500",
  },
] as const;

const homepageSteps = [
  defaultSteps[0],
  {
    title: "Choose Your Platform",
    text: "Select Instagram, YouTube, LinkedIn, Facebook, Twitter/X, Telegram, or another platform.",
    icon: BadgeCheck,
    gradient: "from-amber-500 to-amber-600",
  },
  {
    title: "Choose Your Service",
    text: "Compare the available options and choose the service that fits your goal.",
    icon: ClipboardCheck,
    gradient: "from-[#FF7A00] to-[#FFB000]",
  },
  {
    title: "Submit Your Public Link",
    text: "Paste your profile, post, video, channel, or page link. No password is required.",
    icon: Link2,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Add Funds or Pay Securely",
    text: "Add funds to your wallet or complete payment using available payment options.",
    icon: WalletCards,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    title: "Track Your Order",
    text: "Track order status and progress from your dashboard.",
    icon: Activity,
    gradient: "from-emerald-500 to-teal-500",
  },
] as const;

const whatsappUrl =
  "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20service";

export default function HowToOrderSection({ id, homepage = false }: { id?: string; homepage?: boolean }) {
  const steps = homepage ? homepageSteps : defaultSteps;

  return (
    <section id={id} className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-600">
            Simple ordering
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            How to Place an Order on SocialRUSH
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ title, text, icon: Icon, gradient }, index) => (
            <article
              key={title}
              className="rounded-2xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_14px_38px_-18px_rgba(0,0,0,.55)] backdrop-blur transition hover:-translate-y-1 hover:border-orange-400/50"
            >
              <div className="flex items-start gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg ${gradient}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-500">Step {index + 1}</p>
                  <h3 className="mt-1 text-base font-extrabold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">{text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="safety-note mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/45 bg-[#0B1F18] p-4 text-left shadow-[0_16px_38px_rgba(0,0,0,0.22)] sm:items-center">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-black text-white">No password required.</p>
            <p className="mt-1 text-sm leading-6 text-[#D1D5DB]">
              Only your public profile, post, video, channel, or page link is needed.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard/new-order" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-300/30 transition hover:-translate-y-0.5">
            Start Order
          </Link>
          <Link href="/packages" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-orange-400/30 bg-[#111111] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:border-orange-400 hover:text-orange-300">
            View Packages
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-400/35 bg-[#111111] px-6 py-3 text-sm font-bold text-emerald-300 shadow-sm transition hover:border-emerald-400 hover:bg-[#0B1F18]">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
