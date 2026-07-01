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

const steps = [
  {
    title: "Create Your Account",
    text: "Sign up or log in to your SocialRUSH account.",
    icon: UserPlus,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Choose Your Service",
    text: "Select Instagram, YouTube, LinkedIn, Facebook, Twitter/X, Telegram, or another service.",
    icon: BadgeCheck,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Submit Your Public Link",
    text: "Paste your profile, post, video, channel, or page link. No password is required.",
    icon: Link2,
    gradient: "from-cyan-500 to-blue-500",
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
    gradient: "from-fuchsia-500 to-pink-500",
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

export default function HowToOrderSection({ id }: { id?: string }) {
  return (
    <section id={id} className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-600">
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
              className="rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_14px_38px_-18px_rgba(15,23,42,.22)] backdrop-blur transition hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg ${gradient}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-500">Step {index + 1}</p>
                  <h3 className="mt-1 text-base font-extrabold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-center shadow-sm">
          <p className="inline-flex items-center justify-center gap-2 text-sm font-bold text-emerald-800">
            <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
            No password required. Only your public profile, post, video, channel, or page link is needed.
          </p>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard/new-order" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 via-violet-500 to-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/30 transition hover:-translate-y-0.5">
            Start Order
          </Link>
          <Link href="/packages" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600">
            View Packages
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
