import Link from "next/link";
import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CreditCard,
  Eye,
  Headphones,
  Link2,
  LockKeyhole,
  MousePointerClick,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import PortalCTA from "@/components/marketing/PortalCTA";

const platforms = [
  ["Instagram", "instagram", "Profile, post and Reel growth options."],
  ["YouTube", "youtube", "Channel, subscriber and video services."],
  ["Facebook", "facebook", "Page, profile and content campaigns."],
  ["LinkedIn", "linkedin", "Professional profile and post services."],
  ["TikTok", "tiktok", "Profile and public video campaigns."],
  ["Telegram", "telegram", "Public channel and community services."],
  ["X", "twitter", "Public profile and audience campaigns."],
] as const;

const trustPoints = [
  [LockKeyhole, "No Password Required"],
  [BadgeCheck, "Clear Pricing"],
  [CreditCard, "Secure Checkout"],
  [BarChart3, "Live Order Tracking"],
] as const;

const steps = [
  [MousePointerClick, "Choose Your Platform", "Select the social platform you want to grow."],
  [Search, "Select Your Growth Service", "Choose followers, likes, views, subscribers or another available service."],
  [Link2, "Submit Your Public Link", "Enter only the relevant public profile, post, Reel or video link."],
  [BarChart3, "Track Your Campaign", "Follow the order status from your secure dashboard."],
] as const;

const reasons = [
  [CreditCard, "Clear Before You Pay", "See the price, quantity, delivery details and support eligibility before confirming."],
  [ShieldCheck, "Your Account Stays Private", "We only require the relevant public profile or content link. No password is needed."],
  [Eye, "Track Every Order", "Follow your campaign status directly from your dashboard."],
  [Headphones, "Human Support When Needed", "Get assistance through WhatsApp and customer support."],
] as const;

export default function HomepageContent() {
  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden border-b border-white/[0.06] px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.06fr_.94fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/[0.08] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-orange-200 sm:text-xs">
              <Sparkles className="h-4 w-4" /> Social growth, made simple
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.04] tracking-[-0.045em] text-[#F8FAFC] sm:text-5xl lg:text-[4.25rem]">
              Build Social Proof. Reach More People.{" "}
              <span className="bg-gradient-to-r from-[#FF6200] to-[#FF9A00] bg-clip-text text-transparent">
                Grow With Confidence.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#A8AFBD] sm:text-lg">
              Choose your platform, compare transparent packages, and track every order from one secure dashboard. No passwords and no confusing process.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="/packages" className="btn-primary min-h-12 gap-2 px-6">
                Explore Growth Packages <ArrowRight className="h-4 w-4" />
              </Link>
              <PortalCTA className="btn-secondary min-h-12 px-6">Start Your First Order</PortalCTA>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {trustPoints.map(([Icon, label]) => (
                <div key={label} className="flex min-h-12 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-[11px] font-bold text-[#D7DBE3]">
                  <Icon className="h-4 w-4 shrink-0 text-[#FF9A2E]" /> {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-orange-500/[0.08] blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-[#101219] p-4 shadow-[0_32px_80px_rgba(0,0,0,.35)] sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9A2E]">Growth dashboard</p>
                  <p className="mt-1 text-lg font-black text-white">Everything in one place</p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-[10px] font-bold text-emerald-300">Secure</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["Platform", "Instagram"],
                  ["Service", "Followers"],
                  ["Quantity", "5,000"],
                  ["Delivery", "Estimated"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#151821] p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#747B89]">{label}</p>
                    <p className="mt-2 text-sm font-black text-[#F8FAFC]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-2xl border border-orange-400/25 bg-orange-500/[0.07] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#FF9A2E]">Campaign status</p>
                    <p className="mt-1 text-sm font-black text-white">Order tracking enabled</p>
                  </div>
                  <PackageCheck className="h-7 w-7 text-[#FF9A2E]" />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#FF6200] to-[#FF9A00]" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="Everything You Need to Grow—In One Place" description="Explore focused growth solutions for Instagram, YouTube, Facebook, LinkedIn, TikTok, Telegram and X." />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {platforms.map(([label, platform, description]) => (
              <Link key={label} href={`/services?platform=${platform}`} className="group rounded-[1.15rem] border border-white/[0.09] bg-[#101219] p-4 transition hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-[0_18px_42px_rgba(0,0,0,.25)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-[#151821]">
                  <PlatformIcon platform={platform} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-sm font-black text-white">{label}</h3>
                <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">{description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF9A2E]">View services <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-y border-white/[0.06] bg-[#0C0E14] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Simple process" title="From Selection to Results in Four Simple Steps" description="A clear ordering flow from platform selection to dashboard tracking." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(([Icon, title, text], index) => (
              <article key={title} className="relative rounded-[1.25rem] border border-white/[0.09] bg-[#101219] p-6">
                <span className="absolute right-5 top-4 text-4xl font-black text-white/[0.035]">0{index + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#FF6200] to-[#FF9A00] text-white shadow-[0_12px_26px_rgba(255,118,0,.16)]"><Icon className="h-5 w-5" /></span>
                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9A2E]">Step {index + 1}</p>
                <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#A8AFBD]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="Why Creators and Brands Choose SocialRUSH" description="Clear information, private account access and practical support throughout your campaign." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(([Icon, title, text]) => (
              <article key={title} className="rounded-[1.25rem] border border-white/[0.09] bg-[#101219] p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/[0.07] text-[#FF9A2E]"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#A8AFBD]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PublicReviewsSection limit={3} />
      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] border border-orange-400/25 bg-[#101219] px-6 py-12 text-center shadow-[0_28px_70px_rgba(0,0,0,.28)] sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 bg-orange-500/[0.1] blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Ready to Turn Attention Into Growth?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#A8AFBD]">Select your platform and start your next growth campaign with clarity and control.</p>
            <PortalCTA className="btn-primary mt-7 min-h-12 gap-2 px-7">Start Growing Today <ArrowRight className="h-4 w-4" /></PortalCTA>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#FF9A2E]">{eyebrow}</p> : null}
      <h2 className={`${eyebrow ? "mt-3" : ""} text-3xl font-black tracking-[-0.035em] text-[#F8FAFC] sm:text-4xl`}>{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#A8AFBD] sm:text-base">{description}</p>
    </div>
  );
}
