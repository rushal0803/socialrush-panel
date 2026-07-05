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
import { useCallback, useEffect, useMemo, useState } from "react";
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

function withTimeout<T>(request: PromiseLike<T>, timeoutMs = 7000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Wallet request timed out.")), timeoutMs);
    Promise.resolve(request).then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (reason) => {
        window.clearTimeout(timeout);
        reject(reason);
      },
    );
  });
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
  const [walletLoadError, setWalletLoadError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const refreshWalletBalance = useCallback(async () => {
    const supabase = createClient();
    setIsAuthLoading(true);
    setWalletLoadError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await withTimeout(supabase.auth.getUser());

      if (authError) {
        setIsLoggedIn(false);
        setWalletBalance(null);
        setWalletLoadError("Could not load wallet balance. Please refresh.");
        return;
      }

      setIsLoggedIn(Boolean(user));
      if (!user) {
        setWalletBalance(null);
        return;
      }

      const { data: profile, error: profileError } = await withTimeout(
        supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle(),
      );

      if (profileError) {
        setWalletBalance(null);
        setWalletLoadError("Could not load wallet balance. Please refresh.");
        return;
      }

      setWalletBalance(Number(profile?.balance ?? 0));
    } catch {
      setWalletBalance(null);
      setWalletLoadError("Could not load wallet balance. Please refresh.");
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

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
    void refreshWalletBalance();

    const handleBalanceUpdate = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(value)) {
        setWalletBalance(value);
        setWalletLoadError("");
        setIsAuthLoading(false);
      }
    };
    window.addEventListener("wallet-balance-updated", handleBalanceUpdate);

    return () => {
      window.removeEventListener("wallet-balance-updated", handleBalanceUpdate);
    };
  }, [refreshWalletBalance]);

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

            <div className="mt-3 rounded-[1.75rem] border border-orange-400/20 bg-[#111111] p-4 shadow-[0_24px_65px_-36px_rgba(255,122,0,.55)] sm:p-5">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <CheckoutStep number="1" title="Package Selected" state="complete" />
                <CheckoutStep number="2" title="Campaign Details" state={targetLink.trim() ? "complete" : "active"} />
                <CheckoutStep number="3" title="Wallet Payment" state={targetLink.trim() ? "active" : "upcoming"} />
              </div>
            </div>

            <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
              <article className="min-w-0 rounded-[2rem] border border-orange-400/20 bg-[#111111] p-5 shadow-[0_30px_70px_-38px_rgba(255,122,0,.65)] sm:p-8">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9F00]">Premium campaign checkout</p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl">Complete your campaign details</h1>
                  <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">
                    Add the public campaign destination, review your selected package, and confirm the order through your secure wallet.
                  </p>
                </div>

                <div className="mt-7 overflow-hidden rounded-[1.65rem] border border-orange-400/30 bg-[linear-gradient(145deg,#151515,#111111)] p-4 shadow-[0_20px_45px_-32px_rgba(255,122,0,.65)] sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_12px_28px_-10px_rgba(255, 196, 0, .65)]">
                        <PlatformIcon platform={platformLabel} className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.13em] text-orange-300">{platformLabel} · {serviceLabel[pkg.service]}</p>
                        <h2 className="mt-1 break-words text-xl font-black text-white sm:text-2xl">{pkg.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">{pkg.description}</p>
                      </div>
                    </div>
                    {pkg.discountBadge ? (
                      <span className="w-fit shrink-0 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-orange-200 shadow-sm">
                        {pkg.discountBadge}
                      </span>
                    ) : null}
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <PackageMetric icon={WalletCards} label="Price" value={formatCurrency(pkg.basePriceINR, currency)} />
                    <PackageMetric icon={PackageCheck} label="Quantity" value={pkg.quantityLabel} />
                    <PackageMetric icon={Clock3} label="Delivery" value={pkg.deliveryTime} wide />
                  </dl>

                  <div className="mt-4 grid gap-2 text-[11px] font-bold text-[#D1D5DB] sm:grid-cols-3">
                    <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0B0F] px-3 py-2.5"><Clock3 className="h-4 w-4 text-orange-400" />Fast delivery</span>
                    <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0B0F] px-3 py-2.5"><RefreshCw className="h-4 w-4 text-amber-400" />Refill support</span>
                    <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0B0F] px-3 py-2.5"><ShieldCheck className="h-4 w-4 text-emerald-400" />Secure wallet checkout</span>
                  </div>
                </div>

                <div className="mt-7 rounded-[1.65rem] border border-orange-400/20 bg-[#151515] p-4 shadow-[0_18px_45px_-34px_rgba(255,122,0,.55)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15 text-orange-300"><Link2 className="h-5 w-5" /></span>
                    <div>
                      <h2 className="text-lg font-black text-white">Campaign details</h2>
                      <p className="mt-0.5 text-xs text-[#D1D5DB]">Tell us where this campaign should be delivered.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5">
                    <label className="text-xs font-black text-white">
                      Campaign Link / Username
                      <span className="mt-2 flex rounded-2xl border border-orange-400/25 bg-[#0B0B0F] shadow-[0_12px_28px_-24px_rgba(255,122,0,.7)] transition-all duration-200 ease-out focus-within:border-[#FF7A00] focus-within:ring-4 focus-within:ring-orange-500/15">
                        <span className="grid w-12 shrink-0 place-items-center text-[#FF9F00]"><Link2 className="h-5 w-5" /></span>
                        <input
                          value={targetLink}
                          onChange={(event) => setTargetLink(event.target.value)}
                          aria-invalid={Boolean(error && !targetLink.trim())}
                          aria-describedby="campaign-link-help"
                          className="min-h-14 min-w-0 flex-1 rounded-r-2xl bg-transparent pr-4 text-base font-medium text-white outline-none placeholder:text-[#6B7280]"
                          placeholder="Paste public profile, post, video, channel or page link"
                        />
                      </span>
                      <span id="campaign-link-help" className="mt-2 block text-[11px] font-medium leading-5 text-[#D1D5DB]">
                        Only public links are required. Never share passwords.
                      </span>
                    </label>

                    <label className="text-xs font-black text-white">
                      <span className="flex items-center gap-2"><NotebookPen className="h-4 w-4 text-amber-600" />Notes (Optional)</span>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={3}
                        className="mt-2 w-full resize-y rounded-2xl border border-orange-400/25 bg-[#0B0B0F] px-4 py-3.5 text-base font-medium text-white shadow-[0_12px_28px_-24px_rgba(255,122,0,.7)] outline-none transition-all duration-200 ease-out placeholder:text-[#6B7280] focus:border-[#FF7A00] focus:ring-4 focus:ring-orange-500/15"
                        placeholder="Add delivery instructions if needed"
                      />
                    </label>
                  </div>
                </div>

                {error ? (
                  <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold leading-6 text-red-200 shadow-sm">
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
                    walletLoadError={walletLoadError}
                    onRefresh={() => void refreshWalletBalance()}
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                  {isAuthLoading ? (
                    <button type="button" disabled className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-orange-400/20 bg-white/10 px-7 py-3.5 text-sm font-black text-[#D1D5DB] sm:w-auto">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Checking wallet balance...
                    </button>
                  ) : walletLoadError && isLoggedIn ? (
                    <button type="button" onClick={() => void refreshWalletBalance()} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255,196,0,.7)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[.98] sm:w-auto">
                      <RefreshCw className="h-4 w-4" />
                      Refresh Balance
                    </button>
                  ) : isLoggedIn && !hasEnoughBalance ? (
                    <>
                    <Link href="/dashboard/wallet" className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255,196,0,.7)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[.98] sm:w-auto">
                      <WalletCards className="h-4 w-4" />
                      Add Funds
                    </Link>
                    <button type="button" onClick={() => void refreshWalletBalance()} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-orange-400/30 bg-[#151515] px-6 py-3.5 text-sm font-black text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-orange-400 active:scale-[.98] sm:w-auto">
                      <RefreshCw className="h-4 w-4" />
                      Refresh Balance
                    </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={placingOrder || !targetLink.trim()}
                      onClick={placeOrder}
                      className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255,196,0,.7)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_38px_-14px_rgba(255,196,0,.8)] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto"
                    >
                      {placingOrder ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                      {placingOrder ? "Placing order..." : isLoggedIn ? "Place Order Securely" : "Login to Continue"}
                    </button>
                  )}
                </div>
                <p className="mt-4 text-xs font-semibold leading-6 text-[#9CA3AF]">{getCurrencyDisclaimer()}</p>
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
                    walletLoadError={walletLoadError}
                    onRefresh={() => void refreshWalletBalance()}
                  />
                </div>
              </aside>
            </div>

            <section className="mt-6 rounded-[1.75rem] border border-orange-400/20 bg-[#111111] p-5 shadow-[0_22px_55px_-38px_rgba(255,122,0,.6)] backdrop-blur-xl sm:p-6">
              <h2 className="text-center text-sm font-black text-white">Checkout with confidence</h2>
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
    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
    : state === "active"
      ? "border-orange-400/55 bg-orange-500/15 text-white shadow-[0_10px_24px_-18px_rgba(255,122,0,.75)]"
      : "border-white/10 bg-[#0B0B0F] text-[#9CA3AF]";

  return (
    <div className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 py-3 ${stateClass}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${state === "complete" ? "bg-emerald-600 text-white" : state === "active" ? "bg-orange-600 text-white" : "bg-white/10 text-[#9CA3AF]"}`}>
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
    <div className={`rounded-2xl border border-white/10 bg-[#0B0B0F] p-3.5 shadow-[0_10px_24px_-20px_rgba(0,0,0,.7)] ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <dt className="flex items-center gap-1.5 text-[#9CA3AF]"><Icon className="h-3.5 w-3.5 text-orange-400" />{label}</dt>
      <dd className="mt-1.5 break-words text-base font-black text-white">{value}</dd>
    </div>
  );
}

function TrustItem({ icon: Icon, title }: { icon: typeof ShieldCheck; title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-orange-400/20 bg-[#151515] p-3 text-xs font-black text-white">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-orange-300"><Icon className="h-4 w-4" /></span>
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
  walletLoadError,
  onRefresh,
}: {
  pkg: BigPackage;
  currency: Parameters<typeof formatCurrency>[1];
  walletBalance: number | null;
  isAuthLoading: boolean;
  isLoggedIn: boolean;
  hasEnoughBalance: boolean;
  walletLoadError: string;
  onRefresh: () => void;
}) {
  const platformLabel = pkg.platform === "X" ? "X / Twitter" : pkg.platform;
  const walletValue = isAuthLoading
    ? "Checking..."
    : walletLoadError
      ? "Unavailable"
      : !isLoggedIn
        ? "Login required"
        : formatCurrency(walletBalance ?? 0, currency);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-orange-400/25 bg-[#111111] shadow-[0_30px_70px_-38px_rgba(255,122,0,.7)] backdrop-blur-2xl">
      <div className="border-b border-white/10 bg-[#151515] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-lg">
            <PlatformIcon platform={platformLabel} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-300">Premium invoice</p>
            <h2 className="mt-0.5 text-lg font-black text-white">Order summary</h2>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <p className="break-words text-base font-black text-white">{pkg.title}</p>
        <div className="mt-5 space-y-3.5 text-sm">
          <SummaryRow label="Package" value={pkg.title} />
          <SummaryRow label="Platform" value={platformLabel} />
          <SummaryRow label="Service" value={serviceLabel[pkg.service]} />
          <SummaryRow label="Quantity" value={pkg.quantityLabel} />
          <SummaryRow label="Delivery" value={pkg.deliveryTime} />
          <SummaryRow label="Price" value={formatCurrency(pkg.basePriceINR, currency)} />
          <SummaryRow label="Wallet balance" value={walletValue} />
          <div className="border-t border-dashed border-orange-400/25 pt-4">
            <SummaryRow label="Final payable" value={formatCurrency(pkg.basePriceINR, currency)} strong />
          </div>
        </div>

        {isAuthLoading ? (
          <div className="mt-6 rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4">
            <div className="flex items-center gap-2 text-xs font-black text-orange-100">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Checking wallet balance...
            </div>
            <p className="mt-2 text-xs leading-5 text-[#D1D5DB]">This will not block the rest of your campaign details.</p>
          </div>
        ) : walletLoadError ? (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
            <p className="text-xs font-bold leading-5 text-red-100">{walletLoadError}</p>
            <button type="button" onClick={onRefresh} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-[#151515] px-4 py-2.5 text-xs font-black text-white transition-all duration-200 ease-out hover:border-orange-400 hover:bg-orange-500/10 active:scale-[.98]">
              <RefreshCw className="h-4 w-4" />
              Refresh Balance
            </button>
          </div>
        ) : !isLoggedIn ? (
          <div className="mt-6 rounded-2xl border border-orange-400/30 bg-orange-500/10 p-4">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-orange-300"><LockKeyhole className="h-4 w-4" />Secure account required</p>
            <p className="mt-2 text-sm font-black text-white">Login required to check wallet balance.</p>
            <p className="mt-1 text-xs leading-5 text-[#D1D5DB]">Your campaign details will be kept when you continue to login.</p>
          </div>
        ) : hasEnoughBalance ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/35 bg-[#0B1F18] p-4 shadow-sm">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300"><CheckCircle2 className="h-4 w-4" />Wallet ready</p>
            <p className="mt-2 break-words text-xl font-black text-white">Wallet Balance: {formatCurrency(walletBalance ?? 0, currency)}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#D1D5DB]">Wallet balance available. You can place this order securely.</p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-4 shadow-sm">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-300"><WalletCards className="h-4 w-4" />Balance required</p>
            <p className="mt-2 break-words text-xl font-black text-white">Wallet Balance: {formatCurrency(walletBalance ?? 0, currency)}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#D1D5DB]">Insufficient wallet balance. Please add funds to continue.</p>
            <Link href="/dashboard/wallet" className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2.5 text-xs font-black text-white transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[.98]">
              Add Funds
            </Link>
            <button type="button" onClick={onRefresh} className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-[#151515] px-4 py-2.5 text-xs font-black text-white transition-all duration-200 ease-out hover:border-orange-400 active:scale-[.98]">
              <RefreshCw className="h-4 w-4" />
              Refresh Balance
            </button>
          </div>
        )}

        <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-[#9CA3AF]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Wallet charged only after order confirmation
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-[#9CA3AF]">{label}</span>
      <span className={`max-w-[62%] break-words text-right ${strong ? "text-xl font-black text-white" : "font-bold text-white"}`}>{value}</span>
    </div>
  );
}
