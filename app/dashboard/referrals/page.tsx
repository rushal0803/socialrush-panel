import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Gift,
  Link2,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ReferralShareActions from "./ReferralShareActions";

const money = (value: number) =>
  value.toLocaleString("en-IN", { style: "currency", currency: "INR" });

export default async function ReferralCenter() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/referrals");

  const [
    { data: code, error: codeError },
    { data: referrals = [], error: referralError },
    { data: rules, error: rulesError },
  ] = await Promise.all([
    db.rpc("ensure_my_referral_code"),
    db
      .from("referral_attributions")
      .select("id,status,created_at,qualified_at,rewarded_at")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false }),
    db
      .from("reward_programme_rules")
      .select("enabled,minimum_order_amount,referrer_reward,referral_expiry_days")
      .eq("id", true)
      .maybeSingle(),
  ]);

  const referralCode = typeof code === "string" ? code : "";
  const referralLink = referralCode
    ? `https://www.getsocialrush.com/register?ref=${encodeURIComponent(referralCode)}&utm_source=customer_referral&utm_medium=share&utm_campaign=referral_loop`
    : "";
  const shareText =
    "I use SocialRUSH for social media growth services. You can review the current services, pricing and order details here:";

  const total = referrals.length;
  const pending = referrals.filter((item) => item.status === "pending").length;
  const successful = referrals.filter((item) =>
    ["qualified", "rewarded"].includes(item.status),
  ).length;
  const rewarded = referrals.filter((item) => item.status === "rewarded").length;
  const hasLoadError = Boolean(codeError || referralError || rulesError);

  const programmeEnabled = Boolean(rules?.enabled);
  const referrerReward = Number(rules?.referrer_reward ?? 0);
  const minimumOrder = Number(rules?.minimum_order_amount ?? 0);
  const expiryDays = Number(rules?.referral_expiry_days ?? 30);

  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden px-4 pb-28 pt-6 text-white sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-48 -z-10 h-80 w-80 rounded-full bg-amber-400/[.06] blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-orange-400/30 bg-[radial-gradient(circle_at_88%_10%,rgba(255,122,0,.20),transparent_34%),linear-gradient(145deg,#17120f_0%,#0d0e13_55%,#101116_100%)] p-6 shadow-[0_28px_80px_-45px_rgba(255,122,0,.75)] sm:p-9">
        <p className="inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-orange-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.18em] text-orange-200">
          <Sparkles className="h-3.5 w-3.5" />
          Referral Growth Loop
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.04em] text-white sm:text-6xl">
              Share your real referral link.
              <span className="block bg-gradient-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent">
                Track what happens next.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              New customers who register through your unique link are attributed to your account. Qualification is based on the live programme rules shown below.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Your referral code</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-200">
                <BadgeCheck className="h-3 w-3" />
                Account-linked
              </span>
            </div>
            <p className="mt-3 break-all rounded-xl border border-white/10 bg-[#08090d] px-4 py-3 font-mono text-sm font-black text-orange-100">
              {referralCode || "Unavailable"}
            </p>
            {referralLink ? (
              <p className="mt-3 break-all text-xs leading-5 text-slate-400">{referralLink}</p>
            ) : null}
          </div>
        </div>

        {referralLink ? (
          <div className="mt-7">
            <ReferralShareActions referralLink={referralLink} shareText={shareText} />
          </div>
        ) : null}
      </section>

      {hasLoadError ? (
        <section role="alert" className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm text-amber-100">
          Some referral details could not be loaded. Refresh before sharing your link.
        </section>
      ) : null}

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Referral funnel">
        {[
          ["Attributed signups", total, Users],
          ["Pending", pending, Clock3],
          ["Qualified", successful, CheckCircle2],
          ["Rewarded", rewarded, Gift],
        ].map(([label, value, Icon]) => {
          const MetricIcon = Icon as typeof Users;
          return (
            <article key={String(label)} className="rounded-2xl border border-white/10 bg-[#111319] p-4">
              <MetricIcon className="h-4 w-4 text-orange-300" />
              <p className="mt-3 text-[10px] font-black uppercase tracking-[.13em] text-slate-400">{String(label)}</p>
              <p className="mt-1 text-2xl font-black text-white">{String(value)}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-[2rem] border border-white/10 bg-[#0d0f15] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-orange-300" />
            <h2 className="text-xl font-black text-white">How the loop works</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["01", "Share", "Send your account-linked referral URL to someone who genuinely needs SocialRUSH."],
              ["02", "Register", "A new customer who signs up through the link is attributed to your account."],
              ["03", "Qualify", `The referral qualifies after an eligible paid order of at least ${money(minimumOrder)} within ${expiryDays} days.`],
            ].map(([step, title, body]) => (
              <div key={String(step)} className="rounded-2xl border border-white/[.08] bg-white/[.035] p-5">
                <p className="text-sm font-black text-orange-300">{step}</p>
                <h3 className="mt-3 font-black text-white">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-[#111319] p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <h2 className="text-lg font-black text-white">Current programme status</h2>
          </div>
          {programmeEnabled ? (
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <p>Referral tracking and qualification are active.</p>
              {referrerReward > 0 ? (
                <p>
                  Current referrer reward: <strong className="text-orange-100">{money(referrerReward)}</strong> promotional wallet credit after qualification.
                </p>
              ) : (
                <p className="rounded-xl border border-sky-300/15 bg-sky-400/[.06] p-3 text-xs text-sky-100">
                  No referrer reward is currently offered. Your referrals are still tracked and can become qualified.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The rewards programme is currently paused. Your referral code remains available, but no reward is promised.
            </p>
          )}
          <p className="mt-4 border-t border-white/[.08] pt-4 text-xs leading-5 text-slate-500">
            Self-referrals, existing customers, duplicate attribution, expired referrals, failed/cancelled/refunded orders, and non-qualifying orders do not earn referral status or rewards.
          </p>
          <Link href="/dashboard/rewards" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-300/25 bg-orange-400/10 px-4 text-sm font-black text-orange-100">
            View reward history <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </section>

      <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link2 className="h-5 w-5 shrink-0 text-orange-300" />
          <p className="text-xs leading-5 text-slate-400">
            Current service pricing, availability, delivery estimates and refill details shown before checkout remain authoritative.
          </p>
        </div>
        <Link href="/services" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-sm font-black text-white">
          Browse services <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
