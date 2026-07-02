"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Headphones,
  Link2,
  LoaderCircle,
  LockKeyhole,
  NotebookPen,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import PlatformIcon from "@/components/PlatformIcon";
import { getPackageById, type BigPackage } from "@/lib/big-packages";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { createClient } from "@/lib/supabase/client";

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
  duplicate?: boolean;
};

const platformCode: Record<BigPackage["platform"], string> = {
  Instagram: "instagram",
  YouTube: "youtube",
  Facebook: "facebook",
  LinkedIn: "linkedin",
  Telegram: "telegram",
  TikTok: "tiktok",
  X: "x",
};

const serviceLabel: Record<BigPackage["service"], string> = {
  followers: "Followers",
  subscribers: "Subscribers",
  likes: "Likes",
  views: "Views",
  members: "Members",
};

const PENDING_CHECKOUT_KEY = "socialrush.package-checkout.pending.v1";

function getServiceCode(pkg: BigPackage) {
  return `${platformCode[pkg.platform]}-${pkg.service}`;
}

export default function PackageCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId") || "";
  const pkg = useMemo(() => getPackageById(packageId), [packageId]);
  const { currency } = usePreferredCurrency("INR");

  const [targetLink, setTargetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as { packageId?: string; targetLink?: string; notes?: string };
      if (pending.packageId === packageId) {
        setTargetLink(pending.targetLink || "");
        setNotes(pending.notes || "");
      }
    } catch {
      // Ignore malformed local checkout state.
    }
    window.localStorage.removeItem(PENDING_CHECKOUT_KEY);
  }, [packageId]);

  useEffect(() => {
    const supabase = createClient();

    async function loadSessionAndBalance() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(Boolean(user));
      if (!user) {
        setWalletBalance(null);
        setIsAuthLoading(false);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle();
      setWalletBalance(Number(profile?.balance ?? 0));
      setIsAuthLoading(false);
    }

    void loadSessionAndBalance();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      if (!session?.user) {
        setWalletBalance(null);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", session.user.id).maybeSingle();
      setWalletBalance(Number(profile?.balance ?? 0));
    });

    const handleBalanceUpdate = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(value)) setWalletBalance(value);
    };
    window.addEventListener("wallet-balance-updated", handleBalanceUpdate);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("wallet-balance-updated", handleBalanceUpdate);
    };
  }, []);

  if (!pkg) {
    return (
      <BlogShell>
        <section className="grid min-h-[60vh] place-items-center px-4 py-16 text-center">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/90 bg-white/85 p-6 shadow-[0_28px_65px_-36px_rgba(255, 159, 0, .55)] backdrop-blur-2xl sm:p-8">
            <h1 className="text-2xl font-black text-[#0B0B0F]">Package not found</h1>
            <p className="mt-3 text-sm leading-7 text-[#111827]">Choose an available package before continuing to checkout.</p>
            <Link href="/packages" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white sm:w-auto">
              Back to Packages
            </Link>
          </div>
        </section>
      </BlogShell>
    );
  }

  const hasEnoughBalance = isLoggedIn && walletBalance !== null && walletBalance + 0.0001 >= pkg.basePriceINR;
  const platformLabel = pkg.platform === "X" ? "X / Twitter" : pkg.platform;
  const checkoutPath = `/packages/checkout?packageId=${encodeURIComponent(pkg.packageId)}`;

  function savePendingCheckout() {
    window.localStorage.setItem(
      PENDING_CHECKOUT_KEY,
      JSON.stringify({
        packageId: pkg.packageId,
        targetLink: targetLink.trim(),
        notes: notes.trim(),
      }),
    );
  }

  async function placeOrder() {
    setError("");
    if (!targetLink.trim()) {
      setError("Campaign link or username is required.");
      return;
    }

    if (!isLoggedIn) {
      savePendingCheckout();
      router.push(`/login?next=${encodeURIComponent(checkoutPath)}`);
      return;
    }

    if (!hasEnoughBalance) {
      setError("Insufficient wallet balance. Add funds to place this order.");
      return;
    }

    const fallbackPrice = Math.round((pkg.basePriceINR / (pkg.quantity / 1000)) * 10000) / 10000;
    const payload = {
      serviceCode: getServiceCode(pkg),
      serviceId: 0,
      quantity: pkg.quantity,
      link: targetLink.trim(),
      requestId: crypto.randomUUID(),
      notes: notes.trim() || null,
      fallbackPrice,
      fallbackName: `${platformLabel} ${serviceLabel[pkg.service]}`,
      fallbackPlatform: platformCode[pkg.platform],
      fallbackMin: pkg.quantity,
      fallbackMax: pkg.quantity,
    };

    try {
      setPlacingOrder(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { data?: ApiOrderData; error?: string };
      if (!response.ok || !result.data) {
        setError(result.error || "Unable to place order right now.");
        setPlacingOrder(false);
        return;
      }

      const updatedBalance = Number(result.data.balance);
      setWalletBalance(updatedBalance);
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
      router.push("/dashboard/orders");
      router.refresh();
    } catch {
      setError("Unable to place order right now.");
      setPlacingOrder(false);
    }
  }

  return (
    <BlogShell>
      <div className="relative overflow-x-clip pb-10 sm:pb-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-4 h-80 w-80 rounded-full bg-orange-200/45 blur-3xl" />
          <div className="absolute right-[-6rem] top-24 h-96 w-96 rounded-full bg-amber-200/45 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
        </div>

        <section className="relative px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Link href="/packages" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#FF9F00] transition hover:-translate-x-0.5 hover:text-[#0B0B0F]">
              <ArrowLeft className="h-4 w-4" />
              Back to packages
            </Link>

            <div className="mt-3 rounded-[1.75rem] border border-white/90 bg-white/68 p-4 shadow-[0_24px_65px_-36px_rgba(255, 159, 0, .45)] backdrop-blur-2xl sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <CheckoutStep number="1" title="Package Selected" state="complete" />
                <CheckoutStep number="2" title="Campaign Details" state="active" />
                <CheckoutStep number="3" title="Wallet Payment" state="upcoming" />
              </div>
            </div>

            <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
              <article className="min-w-0 rounded-[2rem] border border-white/90 bg-white/80 p-5 shadow-[0_30px_70px_-38px_rgba(255, 159, 0, .5)] backdrop-blur-2xl sm:p-8">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9F00]">Premium campaign checkout</p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0B0B0F] sm:text-4xl">Complete your campaign details</h1>
                  <p className="mt-3 text-sm leading-7 text-[#111827]">
                    Add the public campaign destination, review your selected package, and confirm the order through your secure wallet.
                  </p>
                </div>

                <div className="mt-7 overflow-hidden rounded-[1.65rem] border border-[#FFF3E0] bg-[linear-gradient(145deg,rgba(255,255,255,.95),rgba(255, 159, 0, .88))] p-4 shadow-[0_20px_45px_-32px_rgba(255, 159, 0, .55)] sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_12px_28px_-10px_rgba(255, 196, 0, .65)]">
                        <PlatformIcon platform={platformLabel} className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#111827]">{platformLabel} · {serviceLabel[pkg.service]}</p>
                        <h2 className="mt-1 break-words text-xl font-black text-[#0B0B0F] sm:text-2xl">{pkg.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-[#111827]">{pkg.description}</p>
                      </div>
                    </div>
                    {pkg.discountBadge ? (
                      <span className="w-fit shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-amber-700 shadow-sm">
                        {pkg.discountBadge}
                      </span>
                    ) : null}
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <PackageMetric icon={WalletCards} label="Price" value={formatCurrency(pkg.basePriceINR, currency)} />
                    <PackageMetric icon={PackageCheck} label="Quantity" value={pkg.quantityLabel} />
                    <PackageMetric icon={Clock3} label="Delivery" value={pkg.deliveryTime} wide />
                  </dl>

                  <div className="mt-4 grid gap-2 text-[11px] font-bold text-[#111827] sm:grid-cols-3">
                    <span className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2.5"><Clock3 className="h-4 w-4 text-orange-600" />Fast delivery</span>
                    <span className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2.5"><RefreshCw className="h-4 w-4 text-amber-600" />Refill support</span>
                    <span className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2.5"><ShieldCheck className="h-4 w-4 text-emerald-600" />Secure wallet checkout</span>
                  </div>
                </div>

                <div className="mt-7 rounded-[1.65rem] border border-white/90 bg-white/72 p-4 shadow-[0_18px_45px_-34px_rgba(255, 159, 0, .5)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600"><Link2 className="h-5 w-5" /></span>
                    <div>
                      <h2 className="text-lg font-black text-[#0B0B0F]">Campaign destination</h2>
                      <p className="mt-0.5 text-xs text-[#111827]">Tell us where this campaign should be delivered.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5">
                    <label className="text-xs font-black text-[#0B0B0F]">
                      Campaign Link / Username
                      <span className="mt-2 flex rounded-2xl border border-[#FFF3E0] bg-white shadow-[0_12px_28px_-24px_rgba(255, 159, 0, .55)] transition focus-within:border-[#FF9F00] focus-within:ring-4 focus-within:ring-orange-100/70">
                        <span className="grid w-12 shrink-0 place-items-center text-[#FF9F00]"><Link2 className="h-5 w-5" /></span>
                        <input
                          value={targetLink}
                          onChange={(event) => setTargetLink(event.target.value)}
                          aria-invalid={Boolean(error && !targetLink.trim())}
                          aria-describedby="campaign-link-help"
                          className="min-h-14 min-w-0 flex-1 rounded-r-2xl bg-transparent pr-4 text-base font-medium text-[#0B0B0F] outline-none placeholder:text-[#FF9F00]"
                          placeholder="Paste a public campaign link"
                        />
                      </span>
                      <span id="campaign-link-help" className="mt-2 block text-[11px] font-medium leading-5 text-[#111827]">
                        Enter a public profile, post, reel, video, channel, or page link.
                      </span>
                    </label>

                    <label className="text-xs font-black text-[#0B0B0F]">
                      <span className="flex items-center gap-2"><NotebookPen className="h-4 w-4 text-amber-600" />Notes (Optional)</span>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={4}
                        className="mt-2 w-full resize-y rounded-2xl border border-[#FFF3E0] bg-white px-4 py-3.5 text-base font-medium text-[#0B0B0F] shadow-[0_12px_28px_-24px_rgba(255, 159, 0, .55)] outline-none transition placeholder:text-[#FF9F00] focus:border-[#FF9F00] focus:ring-4 focus:ring-orange-100/70"
                        placeholder="Share any relevant delivery instructions..."
                      />
                    </label>
                  </div>
                </div>

                {error ? (
                  <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm font-semibold leading-6 text-[#FF7A00] shadow-sm">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-100 text-xs">!</span>
                    {error}
                  </div>
                ) : null}

                <div className="mt-6 lg:hidden">
                  <CheckoutSummary
                    pkg={pkg}
                    currency={currency}
                    walletBalance={walletBalance}
                    isAuthLoading={isAuthLoading}
                    isLoggedIn={isLoggedIn}
                    hasEnoughBalance={hasEnoughBalance}
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                  <button
                    type="button"
                    disabled={placingOrder || isAuthLoading || !targetLink.trim()}
                    onClick={placeOrder}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255, 196, 0, .7)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_38px_-14px_rgba(255, 196, 0, .8)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
                  >
                    {placingOrder ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                    {placingOrder ? "Placing Order..." : isLoggedIn ? "Place Order Securely" : "Login to Continue"}
                  </button>
                  {!hasEnoughBalance && isLoggedIn && !isAuthLoading ? (
                    <Link href="/dashboard/wallet" className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#FFF3E0] bg-white px-6 py-3.5 text-sm font-black text-[#0B0B0F] shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF9F00] hover:bg-[#FFF8F1] sm:w-auto">
                      <WalletCards className="h-4 w-4" />
                      Add Funds
                    </Link>
                  ) : null}
                </div>
                <p className="mt-4 text-xs font-semibold leading-6 text-[#111827]">{getCurrencyDisclaimer()}</p>
              </article>

              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <CheckoutSummary
                    pkg={pkg}
                    currency={currency}
                    walletBalance={walletBalance}
                    isAuthLoading={isAuthLoading}
                    isLoggedIn={isLoggedIn}
                    hasEnoughBalance={hasEnoughBalance}
                  />
                </div>
              </aside>
            </div>

            <section className="mt-6 rounded-[1.75rem] border border-white/90 bg-white/68 p-5 shadow-[0_22px_55px_-38px_rgba(255, 159, 0, .5)] backdrop-blur-xl sm:p-6">
              <h2 className="text-center text-sm font-black text-[#0B0B0F]">Checkout with confidence</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <TrustItem icon={ShieldCheck} title="Secure checkout" />
                <TrustItem icon={RefreshCw} title="Refill support available" />
                <TrustItem icon={PackageCheck} title="Order tracking" />
                <TrustItem icon={Headphones} title="WhatsApp support" />
              </div>
            </section>
          </div>
        </section>
      </div>
    </BlogShell>
  );
}

function CheckoutStep({
  number,
  title,
  state,
}: {
  number: string;
  title: string;
  state: "complete" | "active" | "upcoming";
}) {
  const stateClass = state === "complete"
    ? "border-emerald-200 bg-emerald-50/90 text-emerald-700"
    : state === "active"
      ? "border-orange-200 bg-orange-50/90 text-orange-700 shadow-[0_10px_24px_-18px_rgba(255, 159, 0, .55)]"
      : "border-[#FFF8F1] bg-white/75 text-[#111827]";

  return (
    <div className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 py-3 ${stateClass}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${state === "complete" ? "bg-emerald-600 text-white" : state === "active" ? "bg-orange-600 text-white" : "bg-[#FFF8F1] text-[#111827]"}`}>
        {state === "complete" ? <CheckCircle2 className="h-4 w-4" /> : number}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] opacity-65">Step {number}</p>
        <p className="truncate text-xs font-black">{title}</p>
      </div>
    </div>
  );
}

function PackageMetric({
  icon: Icon,
  label,
  value,
  wide = false,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-white bg-white/90 p-3.5 shadow-[0_10px_24px_-20px_rgba(255, 159, 0, .5)] ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <dt className="flex items-center gap-1.5 text-[#111827]"><Icon className="h-3.5 w-3.5" />{label}</dt>
      <dd className="mt-1.5 break-words text-base font-black text-[#0B0B0F]">{value}</dd>
    </div>
  );
}

function TrustItem({ icon: Icon, title }: { icon: typeof ShieldCheck; title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-[#FFF8F1] bg-white/80 p-3 text-xs font-black text-[#0B0B0F]">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600"><Icon className="h-4 w-4" /></span>
      <span className="leading-5">{title}</span>
    </div>
  );
}

function CheckoutSummary({
  pkg,
  currency,
  walletBalance,
  isAuthLoading,
  isLoggedIn,
  hasEnoughBalance,
}: {
  pkg: BigPackage;
  currency: Parameters<typeof formatCurrency>[1];
  walletBalance: number | null;
  isAuthLoading: boolean;
  isLoggedIn: boolean;
  hasEnoughBalance: boolean;
}) {
  const platformLabel = pkg.platform === "X" ? "X / Twitter" : pkg.platform;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/88 shadow-[0_30px_70px_-38px_rgba(255, 159, 0, .55)] backdrop-blur-2xl">
      <div className="border-b border-[#FFF8F1] bg-[linear-gradient(145deg,#FFF8F1,#FFF8F1)] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-lg">
            <PlatformIcon platform={platformLabel} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#111827]">Premium invoice</p>
            <h2 className="mt-0.5 text-lg font-black text-[#0B0B0F]">Order summary</h2>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <p className="break-words text-base font-black text-[#0B0B0F]">{pkg.title}</p>
        <div className="mt-5 space-y-3.5 text-sm">
          <SummaryRow label="Package" value={pkg.title} />
          <SummaryRow label="Platform" value={platformLabel} />
          <SummaryRow label="Service" value={serviceLabel[pkg.service]} />
          <SummaryRow label="Quantity" value={pkg.quantityLabel} />
          <SummaryRow label="Delivery" value={pkg.deliveryTime} />
          <div className="border-t border-dashed border-[#FFF3E0] pt-4">
            <SummaryRow label="Total payable" value={formatCurrency(pkg.basePriceINR, currency)} strong />
          </div>
        </div>

        {isAuthLoading ? (
          <div className="mt-6 rounded-2xl border border-[#FFF8F1] bg-[#FFF8F1] p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#111827]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Checking wallet balance
            </div>
            <div className="mt-3 h-7 w-32 animate-pulse rounded-lg bg-[#FFF8F1]" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#FFF8F1]" />
          </div>
        ) : !isLoggedIn ? (
          <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50/85 p-4">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-orange-700"><LockKeyhole className="h-4 w-4" />Secure account required</p>
            <p className="mt-2 text-sm font-black text-[#0B0B0F]">Login to check your wallet</p>
            <p className="mt-1 text-xs leading-5 text-[#111827]">Your campaign details will be kept when you continue to login.</p>
          </div>
        ) : hasEnoughBalance ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700"><CheckCircle2 className="h-4 w-4" />Wallet ready</p>
            <p className="mt-2 break-words text-xl font-black text-emerald-800">{formatCurrency(walletBalance ?? 0, currency)}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-emerald-700">Your balance is sufficient for this package.</p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-700"><WalletCards className="h-4 w-4" />Balance required</p>
            <p className="mt-2 break-words text-xl font-black text-amber-900">{formatCurrency(walletBalance ?? 0, currency)}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-amber-800">Your wallet balance is lower than the package total.</p>
            <Link href="/dashboard/wallet" className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-amber-700">
              Add Funds
            </Link>
          </div>
        )}

        <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-[#111827]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Wallet charged only after order confirmation
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-[#111827]">{label}</span>
      <span className={`max-w-[62%] break-words text-right ${strong ? "text-xl font-black text-[#0B0B0F]" : "font-bold text-[#0B0B0F]"}`}>{value}</span>
    </div>
  );
}
